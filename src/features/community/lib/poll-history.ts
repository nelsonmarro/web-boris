/**
 * Historial de la encuesta semanal deducido de `PollVote` (spec 2026-10-27 §4): resultado de la semana pasada,
 * palmarés de los duelos y expedientes más pedidos. Puro (lo prueban los tests con node:test): solo imports
 * relativos con extensión .ts.
 */
import { WEEK_KEY_REGEX, type CuratedPoll, type PollTipo } from '../../../core/content/schemas.ts';
import { computeTally, type PollTally } from './poll-results.ts';

/** Entradas como mucho en el palmarés y en «más pedidos». */
export const HISTORY_LIMIT = 5;

/** Separa las dos opciones en el id (`pollIdFor`). `check:content` impide que un slug lo contenga. */
const SEPARATOR = '-vs-';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ParsedPollId {
  week: string;
  a: string;
  b: string;
}

/** Una fila de `prisma.pollVote.groupBy({ by: ['pollId', 'option'] })`. */
export interface HistoryRow {
  pollId: string;
  option: string;
  count: number;
}

export type LastWeekResult = PollTally & {
  id: string;
  week: string;
  tipo: PollTipo;
  a: string;
  b: string;
  /** Opción con más votos; `null` si empataron. */
  winner: string | null;
};

export interface PalmaresEntry {
  slug: string;
  /** Duelos ganados (los empates no cuentan). */
  wins: number;
  /** Duelos con al menos un voto en los que participó. */
  duels: number;
}

export interface PedidoEntry {
  slug: string;
  votes: number;
}

export interface PollHistory {
  lastWeek: LastWeekResult | null;
  palmares: PalmaresEntry[];
  masPedidos: PedidoEntry[];
}

export interface SummarizeOptions {
  /** Encuesta vigente: ni ella ni otra de su semana (o posterior) entran en el historial. */
  currentPollId: string | null;
  curated: readonly CuratedPoll[];
  /** Fichas con `status: proximamente`: las únicas que pueden salir en «más pedidos». */
  sealedSlugs: ReadonlySet<string>;
  /** Semana ISO inmediatamente anterior a la actual (`YYYY-Www`): la única que puede ser «la semana pasada». */
  previousWeek: string;
  /** Slugs de todas las fichas existentes: el palmarés descarta los demás antes de recortar al límite. */
  knownSlugs: ReadonlySet<string>;
  limit?: number;
}

export function emptyHistory(): PollHistory {
  return { lastWeek: null, palmares: [], masPedidos: [] };
}

/** `<semana>-<a>-vs-<b>` → sus partes, o `null` si no encaja. Parte por el **primer** `-vs-`. */
export function parsePollId(id: string): ParsedPollId | null {
  const week = id.slice(0, 8);
  if (!WEEK_KEY_REGEX.test(week) || id[8] !== '-') return null;
  const rest = id.slice(9);
  const cut = rest.indexOf(SEPARATOR);
  if (cut < 0) return null;
  const a = rest.slice(0, cut);
  const b = rest.slice(cut + SEPARATOR.length);
  if (!SLUG.test(a) || !SLUG.test(b) || a === b) return null;
  return { week, a, b };
}

interface PastPoll extends ParsedPollId {
  id: string;
  tipo: PollTipo;
  tally: PollTally;
  winner: string | null;
}

const bySlug = (x: { slug: string }, y: { slug: string }) => (x.slug < y.slug ? -1 : x.slug > y.slug ? 1 : 0);

/** Encuestas ya cerradas con su recuento; solo se suman los votos a `a` o a `b`. */
function pastPolls(rows: readonly HistoryRow[], { currentPollId, curated }: SummarizeOptions): PastPoll[] {
  const currentWeek = currentPollId ? parsePollId(currentPollId)?.week : undefined;
  const counts = new Map<string, { parsed: ParsedPollId; votes: Record<string, number> }>();
  for (const row of rows) {
    if (row.pollId === currentPollId) continue;
    const parsed = parsePollId(row.pollId);
    if (!parsed || (currentWeek !== undefined && parsed.week >= currentWeek)) continue;
    if (row.option !== parsed.a && row.option !== parsed.b) continue;
    const entry = counts.get(row.pollId) ?? { parsed, votes: { [parsed.a]: 0, [parsed.b]: 0 } };
    entry.votes[row.option] += row.count;
    counts.set(row.pollId, entry);
  }

  return [...counts].map(([id, { parsed, votes }]) => {
    const tally = computeTally([parsed.a, parsed.b], votes);
    const va = tally.totals[parsed.a];
    const vb = tally.totals[parsed.b];
    const tipo =
      curated.find((c) => c.semana === parsed.week && c.a === parsed.a && c.b === parsed.b)?.tipo ?? 'duelo';
    return { id, ...parsed, tipo, tally, winner: va > vb ? parsed.a : vb > va ? parsed.b : null };
  });
}

/** La encuesta de la semana ISO anterior con votos; si hay varias, la de más votos (y a igualdad, la de id menor). */
function lastWeekOf(polls: readonly PastPoll[], previousWeek: string): LastWeekResult | null {
  const voted = polls.filter((p) => p.week === previousWeek && p.tally.total > 0);
  if (voted.length === 0) return null;
  const [p] = [...voted].sort((x, y) => y.tally.total - x.tally.total || (x.id < y.id ? -1 : 1));
  return { id: p.id, week: p.week, tipo: p.tipo, a: p.a, b: p.b, winner: p.winner, ...p.tally };
}

function palmaresOf(polls: readonly PastPoll[], known: ReadonlySet<string>, limit: number): PalmaresEntry[] {
  const stats = new Map<string, PalmaresEntry>();
  const entry = (slug: string) => {
    let e = stats.get(slug);
    if (!e) {
      e = { slug, wins: 0, duels: 0 };
      stats.set(slug, e);
    }
    return e;
  };
  for (const p of polls) {
    if (p.tipo !== 'duelo' || p.tally.total === 0) continue;
    entry(p.a).duels += 1;
    entry(p.b).duels += 1;
    if (p.winner) entry(p.winner).wins += 1;
  }
  return [...stats.values()]
    .filter((e) => e.wins >= 1 && known.has(e.slug))
    .sort((x, y) => y.wins - x.wins || y.wins / y.duels - x.wins / x.duels || bySlug(x, y))
    .slice(0, limit);
}

function masPedidosOf(polls: readonly PastPoll[], sealed: ReadonlySet<string>, limit: number): PedidoEntry[] {
  const votes = new Map<string, number>();
  for (const p of polls) {
    if (p.tipo !== 'desclasificar') continue;
    for (const slug of [p.a, p.b]) {
      if (sealed.has(slug)) votes.set(slug, (votes.get(slug) ?? 0) + p.tally.totals[slug]);
    }
  }
  return [...votes]
    .map(([slug, v]) => ({ slug, votes: v }))
    .filter((e) => e.votes > 0)
    .sort((x, y) => y.votes - x.votes || bySlug(x, y))
    .slice(0, limit);
}

/** Resume el `groupBy` de `PollVote` (todas las encuestas) en lo que pinta `/comunidad`. */
export function summarizeHistory(rows: readonly HistoryRow[], options: SummarizeOptions): PollHistory {
  const limit = options.limit ?? HISTORY_LIMIT;
  const polls = pastPolls(rows, options);
  return {
    lastWeek: lastWeekOf(polls, options.previousWeek),
    palmares: palmaresOf(polls, options.knownSlugs, limit),
    masPedidos: masPedidosOf(polls, options.sealedSlugs, limit),
  };
}

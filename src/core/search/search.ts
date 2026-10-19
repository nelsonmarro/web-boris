/** Búsqueda única del archivo (spec Ola B §4). Pura. */
import { normalize, wordsOf, type EntityEntry } from './entity-index.ts';
import { compareDiscovery } from './discovery-order.ts';

export interface SearchHit { entry: EntityEntry; score: number; matchedAlias?: string }

const STOP = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'y', 'the']);

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

type Hit = 'exact' | 'typo' | null;

/** El token coincide con alguna palabra: como prefijo (exacto) o a distancia 1 si tiene ≥ 5 letras (errata). */
function matchToken(token: string, words: readonly string[]): Hit {
  if (words.some((w) => w.startsWith(token))) return 'exact';
  if (token.length >= 5 && words.some((w) => levenshtein(token, w) <= 1)) return 'typo';
  return null;
}

const toks = (s?: string) => (s ? wordsOf(s).map((w) => w.norm) : []);

function queryTokens(q: string): string[] {
  const all = q.split(' ').filter(Boolean);
  const useful = all.filter((t) => !STOP.has(t));
  return useful.length > 0 ? useful : all;
}

function scoreEntry(entry: EntityEntry, qn: string, tokens: string[]): SearchHit | null {
  const title = normalize(entry.title);
  if (title === qn) return { entry, score: 100 };
  if (title.startsWith(qn)) return { entry, score: 80 };

  const titleWords = toks(entry.title);
  const aliasWords = entry.aliases.map((a) => ({ alias: a, words: toks(a), norm: normalize(a) }));
  const otherWords = [...toks(entry.description), ...toks(entry.category), ...toks(entry.universe)];

  const typos = (hits: Hit[]) => hits.filter((h) => h === 'typo').length;

  const inTitle = tokens.map((t) => matchToken(t, titleWords));
  if (inTitle.every(Boolean)) return { entry, score: 60 - 5 * typos(inTitle) };

  const aliasHit = aliasWords.find((a) => a.norm === qn || a.norm.startsWith(qn));
  if (aliasHit) return { entry, score: 50, matchedAlias: aliasHit.alias };

  for (const a of aliasWords) {
    const both = tokens.map((t) => matchToken(t, [...titleWords, ...a.words]));
    if (both.every(Boolean)) return { entry, score: 40 - 5 * typos(both), matchedAlias: a.alias };
  }

  const anyField = [...titleWords, ...aliasWords.flatMap((a) => a.words), ...otherWords];
  const any = tokens.map((t) => matchToken(t, anyField));
  if (any.every(Boolean)) return { entry, score: 10 - 5 * typos(any) };
  return null;
}

export function search(query: string, entries: readonly EntityEntry[], opts: { limit?: number } = {}): SearchHit[] {
  const qn = normalize(query);
  const byDiscovery = (a: EntityEntry, b: EntityEntry) => compareDiscovery(a, b);
  let hits: SearchHit[];
  if (!qn) {
    hits = [...entries].sort(byDiscovery).map((entry) => ({ entry, score: 0 }));
  } else {
    const tokens = queryTokens(qn);
    hits = entries
      .map((e) => scoreEntry(e, qn, tokens))
      .filter((h): h is SearchHit => h !== null)
      .sort((a, b) => b.score - a.score || byDiscovery(a.entry, b.entry));
  }
  return opts.limit ? hits.slice(0, opts.limit) : hits;
}

export function suggest(query: string, entries: readonly EntityEntry[]): { slug: string; title: string } | null {
  const qn = normalize(query);
  if (qn.length < 3) return null;
  let best: { entry: EntityEntry; d: number } | null = null;
  for (const entry of entries) {
    const candidates = [normalize(entry.title), ...toks(entry.title), ...entry.aliases.map(normalize)];
    const d = Math.min(...candidates.map((c) => levenshtein(qn, c)));
    if (d <= 2 && (!best || d < best.d || (d === best.d && entry.richness > best.entry.richness))) {
      best = { entry, d };
    }
  }
  return best ? { slug: best.entry.slug, title: best.entry.title } : null;
}

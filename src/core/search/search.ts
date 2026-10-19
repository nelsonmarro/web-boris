/** Búsqueda única del archivo (spec Ola B §4). Pura. */
import { normalize, wordsOf, type EntityEntry } from './entity-index.ts';
import { compareDiscovery } from './discovery-order.ts';

export interface SearchHit { entry: EntityEntry; score: number; matchedAlias?: string }

const STOP = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'y', 'the']);

/**
 * Distancia de Levenshtein. Con `max`, si las longitudes ya difieren en más de `max` devuelve `max + 1`
 * sin recorrer la matriz (cualquier valor > `max` solo significa «demasiado lejos»).
 */
export function levenshtein(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
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
  if (token.length >= 5 && words.some((w) => levenshtein(token, w, 1) <= 1)) return 'typo';
  return null;
}

/**
 * Palabras normalizadas para casar. Una palabra con apóstrofo emite además sus partes:
 * `Le'Mug` -> `lemug`, `le`, `mug`, para que "mug" y "le mug" encuentren la ficha.
 */
function toks(s?: string): string[] {
  if (!s) return [];
  const out: string[] = [];
  for (const w of wordsOf(s)) {
    out.push(w.norm);
    if (/['’]/.test(w.raw)) {
      for (const part of w.raw.split(/['’]/)) {
        const norm = normalize(part);
        if (norm) out.push(norm);
      }
    }
  }
  return out;
}

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

  // Todos los tokens entre el título y los apodos juntos; matchedAlias es el primer apodo que
  // aporta un token que el título no cubre.
  if (aliasWords.length > 0) {
    const allAliasWords = aliasWords.flatMap((a) => a.words);
    const both = tokens.map((t) => matchToken(t, [...titleWords, ...allAliasWords]));
    if (both.every(Boolean)) {
      const missingInTitle = tokens.filter((_, k) => inTitle[k] === null);
      const contributor = aliasWords.find((a) => missingInTitle.some((t) => matchToken(t, a.words)));
      return { entry, score: 40 - 5 * typos(both), matchedAlias: contributor?.alias };
    }
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
  return opts.limit !== undefined ? hits.slice(0, Math.max(0, opts.limit)) : hits;
}

export function suggest(query: string, entries: readonly EntityEntry[]): { slug: string; title: string } | null {
  const qn = normalize(query);
  if (qn.length < 3) return null;
  // Distancia máxima proporcional a la consulta: 1 para 3 letras, 2 a partir de 4.
  const maxDistance = Math.min(2, Math.ceil(qn.length / 3));
  let best: { entry: EntityEntry; d: number } | null = null;
  for (const entry of entries) {
    // Títulos y apodos enteros, y solo las palabras sueltas con cuerpo (≥ 4 letras y no vacías).
    const words = toks(entry.title).filter((w) => w.length >= 4 && !STOP.has(w));
    const candidates = [normalize(entry.title), ...words, ...entry.aliases.map(normalize)];
    const d = Math.min(...candidates.map((c) => levenshtein(qn, c, maxDistance)));
    if (d <= maxDistance && (!best || d < best.d || (d === best.d && entry.richness > best.entry.richness))) {
      best = { entry, d };
    }
  }
  return best ? { slug: best.entry.slug, title: best.entry.title } : null;
}

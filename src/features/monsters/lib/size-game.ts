/**
 * Lógica pura del juego «¿Quién mide más?» (`/wiki/tamanos`, spec UX fase 2 §4): qué parejas tienen respuesta segura,
 * emparejar sin repetir, comprobar, la frase del resultado, el reto compartido (`?reto=N`), el texto para compartir y
 * la mejor racha guardada. Sin React ni navegador; el azar entra por parámetro para probarlo.
 */
import { formatMeters, type SizeEntry } from './size-references.ts';

/** Clave de `localStorage` de la mejor racha. */
export const TAMANOS_STORAGE_KEY = 'wb-tamanos';

/** Ruta del juego (la misma que `TAMANOS_ROUTE` de `wiki-routes`; aquí sin imports de alias). */
const GAME_PATH = '/wiki/tamanos';

/** Diferencia relativa mínima para comparar con un valor aproximado («~300 m»): por debajo, la respuesta no es segura. */
export const APPROX_MARGIN = 0.15;

/** Rachas en las que se ofrece «Compartir racha» sin interrumpir la partida. */
export const SHARE_MILESTONES: readonly number[] = [5, 10, 20];

/** Reto máximo admitido en `?reto=`. */
export const MAX_RETO = 999;

export type Pair = readonly [SizeEntry, SizeEntry];

/** Generador uniforme en [0, 1). Por defecto `Math.random`. */
export type Rng = () => number;

/** Clave de una pareja sin orden: «a|b» con los ids ordenados. */
export const pairKey = (a: SizeEntry, b: SizeEntry) => (a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`);

/** Cota superior de una entrada para compararla con una cota inferior: la aproximada puede pasarse un `APPROX_MARGIN`. */
const upperBound = (e: SizeEntry) => (e.precision === 'approx' ? e.meters * (1 + APPROX_MARGIN) : e.meters);

/**
 * ¿Tiene la pareja una respuesta segura con los datos tal como están escritos?
 * - nunca la misma entrada ni un empate;
 * - una cota inferior («más de 500 m») solo frente a algo que seguro es más corto que esa cota (y nunca frente a otra
 *   cota inferior);
 * - un valor aproximado («≈ 300 m») solo si la diferencia relativa es de al menos `APPROX_MARGIN` (15 %).
 */
export function isCertainPair(a: SizeEntry, b: SizeEntry): boolean {
  if (a.id === b.id) return false;
  if (a.precision === 'atLeast' || b.precision === 'atLeast') {
    if (a.precision === 'atLeast' && b.precision === 'atLeast') return false;
    const [bound, other] = a.precision === 'atLeast' ? [a, b] : [b, a];
    return upperBound(other) < bound.meters;
  }
  if (a.meters === b.meters) return false;
  if (a.precision === 'approx' || b.precision === 'approx') {
    return Math.abs(a.meters - b.meters) / Math.min(a.meters, b.meters) >= APPROX_MARGIN;
  }
  return true;
}

/**
 * Todas las parejas jugables del pool: con respuesta segura y, si el pool tiene criaturas, con al menos una (dos
 * referencias reales no enseñan nada del archivo). Es el total de una partida perfecta.
 */
export function validPairs(pool: readonly SizeEntry[]): [SizeEntry, SizeEntry][] {
  const hasCreature = pool.some((e) => e.kind === 'criatura');
  const pairs: [SizeEntry, SizeEntry][] = [];
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i];
      const b = pool[j];
      if (hasCreature && a.kind !== 'criatura' && b.kind !== 'criatura') continue;
      if (isCertainPair(a, b)) pairs.push([a, b]);
    }
  }
  return pairs;
}

/**
 * Pareja nueva al azar entre las jugables que aún no han salido en la partida (`used`, claves de `pairKey`): no se
 * repite ninguna, así que tampoco la anterior. `null` cuando ya han salido todas (partida perfecta: «¡Has acertado
 * todas!») o si el pool no da ninguna. El lado (izquierda/derecha) también es al azar.
 */
export function nextPair(pool: readonly SizeEntry[], used: ReadonlySet<string> = new Set(), rng: Rng = Math.random): Pair | null {
  const candidates = validPairs(pool).filter(([a, b]) => !used.has(pairKey(a, b)));
  if (candidates.length === 0) return null;
  const [a, b] = candidates[pickIndex(candidates.length, rng)];
  return rng() < 0.5 ? [a, b] : [b, a];
}

function pickIndex(length: number, rng: Rng): number {
  const r = rng();
  const i = Math.floor((Number.isFinite(r) ? r : 0) * length);
  return Math.min(Math.max(i, 0), length - 1);
}

/** La entrada que mide más de la pareja (en una pareja segura, la cota inferior siempre es la mayor). */
export function biggerOf(pair: Pair): SizeEntry {
  const [a, b] = pair;
  if (a.precision === 'atLeast' && b.precision !== 'atLeast') return a;
  if (b.precision === 'atLeast' && a.precision !== 'atLeast') return b;
  return a.meters >= b.meters ? a : b;
}

/** ¿Es `chosenId` la que mide más? */
export function isCorrect(pair: Pair, chosenId: string): boolean {
  return biggerOf(pair).id === chosenId;
}

/**
 * La frase del resultado: «X mide N m más que Y.» Con un valor aproximado, «unos N m» (redondeado a la decena); con
 * una cota inferior, «más de N m» (o «al menos unos N m» si la otra es aproximada).
 */
export function differenceText(pair: Pair): string {
  const big = biggerOf(pair);
  const small = big === pair[0] ? pair[1] : pair[0];
  const diff = big.meters - small.meters;
  const approx = big.precision === 'approx' || small.precision === 'approx';
  const n = approx ? Math.max(10, Math.round(diff / 10) * 10) : diff;
  const amount = `${n.toLocaleString('es-ES')} m`;
  let phrase: string;
  if (big.precision === 'atLeast') phrase = approx ? `al menos unos ${amount}` : `más de ${amount}`;
  else phrase = approx ? `unos ${amount}` : amount;
  return `${big.name} mide ${phrase} más que ${small.name}.`;
}

/** Las dos medidas, para el resultado: «El Gran Majá: 675 m · Bogbo: 382 m». */
export function measuresText(pair: Pair): string {
  return pair.map((e) => `${e.name}: ${formatMeters(e)}`).join(' · ');
}

/* ---------- Reto compartido ---------- */

/** `?reto=N`: un entero de 1 a 999 escrito tal cual (sin signos, decimales ni espacios). Cualquier otra cosa, `null`. */
export function parseReto(raw: string | null | undefined): number | null {
  if (typeof raw !== 'string' || !/^\d{1,3}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= MAX_RETO ? n : null;
}

export type RetoOutcome =
  | { kind: 'beaten' }
  /** Le faltaron `missing` aciertos para superarlo (superar = hacer más que el reto). */
  | { kind: 'short'; missing: number }
  /** Acertó todas las parejas posibles y aun así no llega al reto (el reto era imposible con este pool). */
  | { kind: 'maxed' };

/** Resultado frente al reto: superarlo es hacer MÁS aciertos que `reto`. */
export function retoOutcome(streak: number, reto: number, completedAll = false): RetoOutcome {
  if (streak > reto) return { kind: 'beaten' };
  if (completedAll) return { kind: 'maxed' };
  return { kind: 'short', missing: reto + 1 - streak };
}

/* ---------- Compartir ---------- */

/** Cuadrados que se muestran como mucho; el resto va como «+N». */
export const MAX_SHARE_SQUARES = 20;

/** URL del reto: `<origin>/wiki/tamanos?reto=N` (N acotado a 1–999). */
export function shareUrl(origin: string, streak: number): string {
  const n = Math.min(MAX_RETO, Math.max(1, Math.floor(streak)));
  return `${origin.replace(/\/+$/, '')}${GAME_PATH}?reto=${n}`;
}

export interface ShareMessage {
  /** Para `navigator.share` (la URL va aparte). */
  text: string;
  url: string;
  /** Texto + URL, para copiar al portapapeles. */
  full: string;
}

/**
 * Texto para compartir, al estilo Wordle y sin destripes (ni nombres ni respuestas):
 * «¿Quién mide más? — racha de 7 🐋» / «✅✅✅✅✅✅✅❌» / «¿Me superas?» + la URL del reto.
 * `answers` son los aciertos (`true`) y el fallo (`false`) en orden; más de 20 se resumen con «+N».
 */
export function shareMessage(streak: number, answers: readonly boolean[], origin: string): ShareMessage {
  const squares = answers.slice(0, MAX_SHARE_SQUARES).map((ok) => (ok ? '✅' : '❌')).join('');
  const extra = answers.length > MAX_SHARE_SQUARES ? ` +${answers.length - MAX_SHARE_SQUARES}` : '';
  const text = `¿Quién mide más? — racha de ${streak} 🐋\n${squares}${extra}\n¿Me superas?`;
  const url = shareUrl(origin, streak);
  return { text, url, full: `${text} ${url}` };
}

/* ---------- Mejor racha ---------- */

/** Mejor racha a partir de lo guardado (un número o `{ "best": n }`). Cualquier otra cosa cuenta como 0. */
export function parseBest(raw: string | null | undefined): number {
  if (!raw) return 0;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return 0;
  }
  const best = typeof value === 'number' ? value : (value as { best?: unknown } | null)?.best;
  return typeof best === 'number' && Number.isInteger(best) && best > 0 ? best : 0;
}

/** Lo que se guarda en `localStorage`. */
export function serializeBest(best: number): string {
  return JSON.stringify({ best: Math.max(0, Math.floor(best)) });
}

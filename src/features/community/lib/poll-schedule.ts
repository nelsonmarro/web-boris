/**
 * Calendario de la encuesta "¿Quién gana?". Puro (lo prueban los tests con node:test):
 * solo imports relativos con extensión .ts.
 */
import type { CuratedPoll, PollTipo } from '../../../core/content/schemas.ts';
import { DAY_MS, isoWeekKey, mondayUtc } from '../../../core/content/iso-week.ts';

export { isoWeekKey };

export const DEFAULT_QUESTION = '¿Quién gana?';
export const DEFAULT_QUESTION_DESCLASIFICAR = '¿Qué expediente quieres que Boris desclasifique primero?';

export interface PollDef {
  /** `<semana>-<a>-vs-<b>`: estable toda la semana; los votos se cuentan por este id. */
  id: string;
  week: string;
  /** `duelo` (Arena) o `desclasificar` (expedientes sellados). La rotación automática solo genera duelos. */
  tipo: PollTipo;
  a: string;
  b: string;
  question: string;
}

/** Lunes 1970-01-05 00:00 UTC: origen para contar semanas completas. */
const EPOCH_MONDAY_MS = Date.UTC(1970, 0, 5);

/** Semanas completas desde el lunes 1970-01-05 hasta el lunes de la semana de `date`. */
export function weeksSinceEpoch(date: Date): number {
  return Math.round((mondayUtc(date) - EPOCH_MONDAY_MS) / (7 * DAY_MS));
}

export function pollIdFor(week: string, a: string, b: string): string {
  return `${week}-${a}-vs-${b}`;
}

/**
 * Encuesta vigente: la encuesta curada de la semana si existe (duelo o desclasificar); si no, un emparejamiento
 * determinista entre luchadores (artículos con stats). `null` con menos de dos luchadores.
 */
export function getCurrentPoll(
  curated: readonly CuratedPoll[],
  fighterSlugs: readonly string[],
  date: Date = new Date(),
): PollDef | null {
  const week = isoWeekKey(date);
  const pick = curated.find((p) => p.semana === week);
  if (pick) {
    const fallback = pick.tipo === 'desclasificar' ? DEFAULT_QUESTION_DESCLASIFICAR : DEFAULT_QUESTION;
    return {
      id: pollIdFor(week, pick.a, pick.b),
      week,
      tipo: pick.tipo,
      a: pick.a,
      b: pick.b,
      question: pick.pregunta ?? fallback,
    };
  }

  const fighters = [...new Set(fighterSlugs)].sort();
  const n = fighters.length;
  if (n < 2) return null;

  const w = weeksSinceEpoch(date);
  const i = w % n;
  const j = (i + 1 + (w % (n - 1))) % n; // desplazamiento en [1, n-1] → nunca i = j
  const a = fighters[i];
  const b = fighters[j];
  return { id: pollIdFor(week, a, b), week, tipo: 'duelo', a, b, question: DEFAULT_QUESTION };
}

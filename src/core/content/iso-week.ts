/** Semanas ISO (UTC). Puro: lo usan la validación del contenido y el calendario de la encuesta. */

export const DAY_MS = 86_400_000;

/** Lunes 00:00 UTC de la semana ISO que contiene `date`. */
export function mondayUtc(date: Date): number {
  const day = date.getUTCDay() || 7; // 1 = lunes … 7 = domingo
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - (day - 1));
}

/** Clave de semana ISO, p. ej. `2026-W42`. El jueves de la semana decide el año. */
export function isoWeekKey(date: Date): string {
  const thursday = new Date(mondayUtc(date) + 3 * DAY_MS);
  const year = thursday.getUTCFullYear();
  const week = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / DAY_MS / 7) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

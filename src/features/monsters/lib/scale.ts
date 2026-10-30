/** Longitud de referencia de una ballena azul adulta, en metros (spec UX fase 1 §B3). */
export const BLUE_WHALE_M = 30;

/** Por debajo de esta longitud la comparación no ayuda (menos de dos ballenas): no se muestra. */
const MIN_LENGTH_M = 60;

/**
 * Cuántas ballenas azules mide una criatura de `lengthM` metros, redondeado al entero más cercano.
 * `null` si la longitud no es un número finito o es menor de 60 m.
 */
export function blueWhales(lengthM: number | undefined): number | null {
  if (typeof lengthM !== 'number' || !Number.isFinite(lengthM) || lengthM < MIN_LENGTH_M) return null;
  return Math.round(lengthM / BLUE_WHALE_M);
}

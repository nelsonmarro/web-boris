/** Elige un elemento al azar (spec Ola C §5). Puro: el `rng` (0 ≤ r < 1) se inyecta para poder probarlo. */
export function pickRandom<T>(items: readonly T[], rng: () => number): T | undefined {
  if (items.length === 0) return undefined;
  // Un rng fuera de contrato (≥ 1) no se sale de la lista.
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
}

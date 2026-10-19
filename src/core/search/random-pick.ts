/** Elige un elemento al azar (spec Ola C §5). Puro: el `rng` (0 ≤ r < 1) se inyecta para poder probarlo. */
export function pickRandom<T>(items: readonly T[], rng: () => number): T | undefined {
  if (items.length === 0) return undefined;
  // Un rng fuera de contrato (≥ 1) no se sale de la lista.
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
}

/**
 * Como `pickRandom`, pero sin `exclude` (la ficha desde la que se pulsó «Expediente aleatorio»). Si al excluirla no
 * queda ninguna, elige de la lista completa: preferible a no llevar a ninguna parte.
 */
export function pickRandomExcluding<T>(items: readonly T[], exclude: T | undefined, rng: () => number): T | undefined {
  const rest = exclude === undefined ? items : items.filter((item) => item !== exclude);
  return pickRandom(rest.length > 0 ? rest : items, rng);
}

/**
 * Slug de la ficha que aparece en la cabecera `Referer`, solo si su pathname es exactamente `/wiki/<slug>`.
 * Sirve únicamente para excluir esa ficha del sorteo; nunca es un destino (no se confía en él).
 */
export function wikiSlugFromReferer(referer: string | null | undefined): string | undefined {
  if (!referer) return undefined;
  let pathname: string;
  try {
    pathname = new URL(referer).pathname;
  } catch {
    return undefined;
  }
  return pathname.match(/^\/wiki\/([^/]+)\/?$/)?.[1];
}

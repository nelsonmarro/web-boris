/**
 * Resuelve el par A/B de la Arena a partir de los `?a=` / `?b=` crudos.
 * Lo comparten el cliente (ArenaSimulator) y `generateMetadata`, para que la URL,
 * el título y lo que se ve coincidan. Módulo puro, sin dependencias.
 */

/** Slugs antiguos que aún circulan en enlaces compartidos (?a=/?b=) → slug canónico actual. */
export const LEGACY_SLUGS: Record<string, string> = {
  'slowdown-criyote': 'slowdown-criyonte',
  'supperbial-anguilla': 'cranioplanus-risus',
};

export function resolvePair(
  slugs: readonly string[],
  rawA: string | null | undefined,
  rawB: string | null | undefined,
): { slugA: string; slugB: string } {
  const set = new Set(slugs);
  const paramA = rawA ? (LEGACY_SLUGS[rawA] ?? rawA) : rawA;
  const paramB = rawB ? (LEGACY_SLUGS[rawB] ?? rawB) : rawB;
  const slugA = paramA && set.has(paramA) ? paramA : (slugs[0] ?? '');
  const defaultB = paramB && set.has(paramB) ? paramB : (slugs[1] ?? slugs[0] ?? '');
  // B nunca coincide con A: se toma el primer combatiente distinto.
  const slugB = defaultB === slugA ? (slugs.find((s) => s !== slugA) ?? defaultB) : defaultB;
  return { slugA, slugB };
}

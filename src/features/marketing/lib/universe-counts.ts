/**
 * Expedientes por universo para la sección «Explora los universos» (spec 2026-10-27 §6). Puro (imports relativos `.ts`).
 * Cuenta lo mismo que el registro (`registro.ts`): ni índices (Directorio/Categoría) ni sellados (`proximamente`).
 */
import { isIndexCategory } from '../../../core/search/catalog.ts';

export type UniverseCountItem = { frontmatter: { universe: string; category?: string; status?: string } };

/** Devuelve una consulta `universo → nº de expedientes`; un universo sin fichas que cuenten da 0. */
export function countByUniverse(articles: readonly UniverseCountItem[]): (universe: string) => number {
  const counts = new Map<string, number>();
  for (const { frontmatter: fm } of articles) {
    if (fm.status === 'proximamente' || isIndexCategory(fm.category)) continue;
    counts.set(fm.universe, (counts.get(fm.universe) ?? 0) + 1);
  }
  return (universe) => counts.get(universe) ?? 0;
}

/** «1 expediente», «N expedientes». */
export const expedientesLabel = (n: number): string => (n === 1 ? '1 expediente' : `${n} expedientes`);

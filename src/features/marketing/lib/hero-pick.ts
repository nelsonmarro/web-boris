/**
 * Expediente que abre la landing (spec 2026-10-27 §4). Puro (imports relativos `.ts`): el azar (`rand`) y el criterio
 * de portada (`hasCover`; en la app, `coverOf`, que vive en un componente con React) llegan por parámetro.
 */
import { pickRandom } from '../../../core/search/random-pick.ts';
import type { WikiArticleSummary } from '../../../core/types/wiki.ts';

/**
 * Candidatos: los slugs de `pool` (en su orden y sin repetir) que existen en `articles`, tienen portada y no están
 * sellados (sin `status`). Con `rand` ∈ [0, 1) devuelve el candidato `floor(rand · n)`; un `rand` fuera de rango se
 * acota (negativo o NaN → el primero; 1 o más → el último). `null` si no queda ningún candidato.
 */
export function pickHeroCreature(
  pool: readonly string[],
  articles: readonly WikiArticleSummary[],
  rand: number,
  hasCover: (image: string | undefined) => boolean,
): WikiArticleSummary | null {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const candidates = [...new Set(pool)]
    .map((slug) => bySlug.get(slug))
    .filter((a): a is WikiArticleSummary => !!a && !a.frontmatter.status && hasCover(a.frontmatter.image));
  // `pickRandom` ya acota por arriba (≥ 1 → el último); aquí se acota por abajo.
  const r = Number.isNaN(rand) ? 0 : Math.max(0, rand);
  const pick = pickRandom(candidates, () => r);
  return pick ? { slug: pick.slug, frontmatter: pick.frontmatter } : null;
}

/** `HERO_FORCE_SLUG` (solo QA): el slug sin espacios, y solo si está en el pool; si no, se ignora y se sortea. */
export function resolveHeroSlug(pool: readonly string[], forced: string | undefined): string | undefined {
  const slug = forced?.trim();
  return slug && pool.includes(slug) ? slug : undefined;
}

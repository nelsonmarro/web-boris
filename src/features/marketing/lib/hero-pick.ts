/**
 * Expediente que abre la landing (spec 2026-10-27 §4). Puro (imports relativos `.ts`): el azar (`rand`) y el criterio
 * de portada (`hasCover`; en la app, `coverOf`, que vive en un componente con React) llegan por parámetro.
 */
import { pickRandom } from '../../../core/search/random-pick.ts';
import type { WikiArticleSummary } from '../../../core/types/wiki.ts';
import type { HeroPoolEntry } from '../config/hero-pool.ts';

/** Lo que pinta el hero: la ficha (para el chip) y la toma con su encuadre. */
export interface HeroPick {
  creature: WikiArticleSummary;
  image: string;
  imagePosition: string;
}

/** La primera entrada del pool con ese slug, o `undefined`. */
export const heroEntry = (pool: readonly HeroPoolEntry[], slug: string): HeroPoolEntry | undefined =>
  pool.find((e) => e.slug === slug);

/**
 * Candidatos: las entradas de `pool` (en su orden; un slug repetido cuenta una vez, la primera) cuya ficha existe en
 * `articles`, no está sellada (sin `status`) y tiene portada: la toma propia (`entry.image`) o, si falta, la `image`
 * de la ficha, siempre que pase `hasCover`. El encuadre es el de la entrada, o el `imagePosition` de la ficha, o el
 * centro. Con `rand` ∈ [0, 1) devuelve el candidato `floor(rand · n)`; un `rand` fuera de rango se acota (negativo o
 * NaN → el primero; 1 o más → el último). `null` si no queda ningún candidato.
 */
export function pickHeroCreature(
  pool: readonly HeroPoolEntry[],
  articles: readonly WikiArticleSummary[],
  rand: number,
  hasCover: (image: string | undefined) => boolean,
): HeroPick | null {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const seen = new Set<string>();
  const candidates: HeroPick[] = [];
  for (const entry of pool) {
    if (seen.has(entry.slug)) continue;
    seen.add(entry.slug);
    const article = bySlug.get(entry.slug);
    if (!article || article.frontmatter.status) continue;
    const image = entry.image ?? article.frontmatter.image;
    if (!image || !hasCover(image)) continue;
    candidates.push({
      creature: { slug: article.slug, frontmatter: article.frontmatter },
      image,
      imagePosition: entry.imagePosition ?? article.frontmatter.imagePosition ?? '50% 50%',
    });
  }
  // `pickRandom` ya acota por arriba (≥ 1 → el último); aquí se acota por abajo.
  const r = Number.isNaN(rand) ? 0 : Math.max(0, rand);
  return pickRandom(candidates, () => r) ?? null;
}

/** `HERO_FORCE_SLUG` (solo QA): el slug sin espacios, y solo si está en el pool; si no, se ignora y se sortea. */
export function resolveHeroSlug(pool: readonly HeroPoolEntry[], forced: string | undefined): string | undefined {
  const slug = forced?.trim();
  return slug && heroEntry(pool, slug) ? slug : undefined;
}

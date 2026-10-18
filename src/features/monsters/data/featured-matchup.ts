import type { WikiArticle } from '@/core/types/wiki';
import { getAllArticles, getArticleBySlug } from '@/utils/mdx';
import { hasStats } from '@/features/monsters/lib/stats';
import { computeMatchup, scoreFighter, type Fighter, type Matchup } from '@/features/monsters/lib/arena';

/** Enfrentamiento canónico del lore: la batalla del Atlántico. */
const CANON_PAIR = ['el-gran-maja', 'the-bloop'] as const;

export interface FeaturedMatchup {
  a: Fighter;
  b: Fighter;
  matchup: Matchup;
}

const toFighter = (article: WikiArticle | null): Fighter | null =>
  article && hasStats(article.frontmatter) ? { slug: article.slug, frontmatter: article.frontmatter } : null;

/** Pareja canónica; si alguna ficha falta, los dos combatientes de mayor puntaje del archivo. */
export async function getFeaturedMatchup(): Promise<FeaturedMatchup | null> {
  const [a, b] = (await Promise.all(CANON_PAIR.map((slug) => getArticleBySlug(slug)))).map(toFighter);
  let pair: [Fighter, Fighter] | null = a && b ? [a, b] : null;
  if (!pair) {
    const ranked = (await getAllArticles())
      .map(toFighter)
      .filter((f): f is Fighter => f !== null)
      .sort((x, y) => scoreFighter(y.frontmatter.stats) - scoreFighter(x.frontmatter.stats));
    pair = ranked.length >= 2 ? [ranked[0], ranked[1]] : null;
  }
  if (!pair) return null;
  return { a: pair[0], b: pair[1], matchup: computeMatchup(pair[0].frontmatter.stats, pair[1].frontmatter.stats) };
}

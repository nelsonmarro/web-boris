import { WIKI_NAVIGATION, type NavItem } from '@/features/monsters/config/wiki-navigation';
import { toSummary, type WikiArticle, type WikiArticleSummary } from '@/core/types/wiki';

export type { WikiArticleSummary };

const slugFromUrl = (url: string): string | null =>
  url.startsWith('/wiki/') ? url.slice('/wiki/'.length) : null;

/** Devuelve las urls hermanas (mismo padre en la navegación) del slug dado. */
function findNavSiblings(slug: string): string[] {
  const target = `/wiki/${slug}`;

  const walk = (items: NavItem[]): string[] | null => {
    if (items.some((item) => item.url === target)) {
      return items.map((item) => item.url).filter((url) => url !== target);
    }
    for (const item of items) {
      if (item.items) {
        const found = walk(item.items);
        if (found) return found;
      }
    }
    return null;
  };

  for (const group of WIKI_NAVIGATION) {
    const found = walk(group.items);
    if (found) return found;
  }
  return [];
}

/**
 * Artículos relacionados: hermanos en el sidebar → misma categoría → mismo universo.
 * Patrón "navbox" de Wookieepedia/Wikipedia, calculado desde la navegación manual.
 */
export function getRelatedArticles(
  slug: string,
  all: WikiArticle[],
  max = 4,
): WikiArticleSummary[] {
  const bySlug = new Map(all.map((article) => [article.slug, article]));
  const current = bySlug.get(slug);
  const picked: WikiArticleSummary[] = [];
  const seen = new Set<string>([slug]);

  const push = (article: WikiArticle | undefined) => {
    if (!article || seen.has(article.slug) || picked.length >= max) return;
    seen.add(article.slug);
    picked.push(toSummary(article));
  };

  for (const url of findNavSiblings(slug)) {
    const siblingSlug = slugFromUrl(url);
    if (siblingSlug) push(bySlug.get(siblingSlug));
  }

  if (current && picked.length < max) {
    const { category, universe } = current.frontmatter;
    if (category) {
      all.filter((a) => a.frontmatter.category === category).forEach(push);
    }
    if (picked.length < max) {
      all.filter((a) => a.frontmatter.universe === universe).forEach(push);
    }
  }

  return picked;
}

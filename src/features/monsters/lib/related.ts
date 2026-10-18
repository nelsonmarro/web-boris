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
  const candidates: WikiArticle[] = [];
  const seen = new Set<string>([slug]);

  // Los directorios nunca son "relacionados": son índices, no fichas.
  const push = (article: WikiArticle | undefined) => {
    if (!article || seen.has(article.slug)) return;
    seen.add(article.slug);
    if (article.frontmatter.category === 'Directorio') return;
    candidates.push(article);
  };

  for (const url of findNavSiblings(slug)) {
    const siblingSlug = slugFromUrl(url);
    if (siblingSlug) push(bySlug.get(siblingSlug));
  }

  if (current) {
    const { category, universe } = current.frontmatter;
    if (category) {
      all.filter((a) => a.frontmatter.category === category).forEach(push);
    }
    all.filter((a) => a.frontmatter.universe === universe).forEach(push);
  }

  // Los "próximamente" van al final (orden estable), y solo entonces se corta a `max`.
  const isStub = (a: WikiArticle) => a.frontmatter.status === 'proximamente';
  return [...candidates.filter((a) => !isStub(a)), ...candidates.filter(isStub)]
    .slice(0, max)
    .map(toSummary);
}

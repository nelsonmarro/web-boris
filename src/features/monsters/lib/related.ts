import { WIKI_NAVIGATION, type NavItem } from '@/features/monsters/config/wiki-navigation';
import { toSummary, type WikiArticle, type WikiArticleSummary } from '@/core/types/wiki';
import { buildEntityIndex } from '@/core/search/entity-index';
import { buildMentionGraph, type MentionGraph } from '@/core/search/mention-graph';
import { rankRelated } from '@/core/search/related-rank';
import { richness } from '@/core/search/discovery-order';

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

/** El grafo solo depende de la lista de artículos: en producción es el mismo array memoizado, así que se calcula una vez. */
const graphCache = new WeakMap<readonly WikiArticle[], MentionGraph>();

/**
 * Artículos relacionados (spec Ola B §7): `related` del frontmatter → menciones mutuas →
 * salientes → entrantes → hermanos del menú → misma categoría → mismo universo.
 * El orden vive en `rankRelated` (puro); aquí solo se le dan los datos reales.
 */
export function getRelatedArticles(
  slug: string,
  all: WikiArticle[],
  max = 4,
): WikiArticleSummary[] {
  const bySlug = new Map(all.map((article) => [article.slug, article]));
  const current = bySlug.get(slug);
  if (!current) return [];

  let graph = graphCache.get(all);
  if (!graph) {
    graph = buildMentionGraph(all, buildEntityIndex(all));
    graphCache.set(all, graph);
  }

  const { category, universe } = current.frontmatter;
  const slugs = rankRelated({
    slug,
    curated: current.frontmatter.related,
    graph,
    siblings: findNavSiblings(slug)
      .map(slugFromUrl)
      .filter((s): s is string => !!s),
    sameCategory: category
      ? all.filter((a) => a.frontmatter.category === category).map((a) => a.slug)
      : [],
    sameUniverse: all.filter((a) => a.frontmatter.universe === universe).map((a) => a.slug),
    isDirectory: (s) => bySlug.get(s)?.frontmatter.category === 'Directorio',
    isStub: (s) => bySlug.get(s)?.frontmatter.status === 'proximamente',
    weight: (s) => {
      const fm = bySlug.get(s)?.frontmatter;
      return fm ? richness(fm) : 0;
    },
    max,
  });

  return slugs
    .map((s) => bySlug.get(s))
    .filter((a): a is WikiArticle => !!a)
    .map(toSummary);
}

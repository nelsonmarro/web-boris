/**
 * Búsqueda de fichas en el panel con el mismo motor que la wiki (`search`): palabras en cualquier orden, apodos,
 * erratas y la dirección de la ficha. Pura: imports relativos con `.ts`.
 */
import { search } from '../../../core/search/search.ts';
import type { EntityEntry } from '../../../core/search/entity-index.ts';

export interface SearchableArticle {
  slug: string;
  title: string;
  universe?: string;
  category?: string;
  aliases?: string[];
}

/** Las fichas que casan con `query`, de la más parecida a la menos. Sin consulta, todas en su orden. */
export function searchArticles<T extends SearchableArticle>(items: readonly T[], query: string): T[] {
  if (!query.trim()) return [...items];
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  const entries: EntityEntry[] = items.map((item) => ({
    slug: item.slug,
    title: item.title,
    aliases: item.aliases ?? [],
    category: item.category,
    universe: item.universe ?? '',
    // La dirección cuenta como texto secundario: «the-bloop» o «bloop» encuentran la ficha.
    description: item.slug.replace(/-/g, ' '),
    richness: 0,
    linkable: false,
  }));
  return search(query, entries).map((hit) => bySlug.get(hit.entry.slug)!);
}

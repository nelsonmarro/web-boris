'use server';

import { getAllArticles } from '@/utils/mdx';
import { getEntityIndex } from '@/core/content/entities';
import { compareDiscovery } from '@/features/monsters/lib/discovery-order';
import { toSummary, type WikiArticle, type WikiArticleSummary } from '@/core/types/wiki';
import { catalogFilter, tipoCounts } from '@/core/search/catalog';
import type { EntityEntry } from '@/core/search/entity-index';
import { search as searchEntities, suggest } from '@/core/search/search';
import { isTipoId, type TipoId } from '@/core/search/tipos';

export interface GetWikiArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  universe?: string;
  /** Id de un grupo de `TIPOS` (`criaturas`, `personajes`…). Un valor desconocido se ignora. */
  tipo?: string;
}

/** Número de fichas por pestaña: «Todo» y cada grupo de `TIPOS` con contenido. */
export interface WikiTabCounts {
  total: number;
  tipos: { id: TipoId; label: string; count: number }[];
}

export interface GetWikiArticlesResult {
  articles: WikiArticleSummary[];
  total: number;
  totalPages: number;
  /** Números de las pestañas con la búsqueda y el universo activos, sin aplicar `tipo` (cada pestaña cuenta lo que mostraría). */
  counts: WikiTabCounts;
  /** Solo si no hay resultados: el «¿Quisiste decir…?» del motor de búsqueda (`null` si nada se parece). */
  suggestion?: { slug: string; title: string } | null;
  /** Solo si no hay resultados: las 6 fichas más completas del catálogo. */
  popular?: WikiArticleSummary[];
}

export interface WikiFilterOptions {
  universes: string[];
  /** Grupos con contenido y su número de fichas (sin directorios, con las Próximamente). */
  tipos: { id: TipoId; label: string; count: number }[];
  /** Fichas del catálogo: todas menos los directorios. */
  total: number;
}

/** Entrada del índice de la paleta (⌘K): la del índice de entidades, con `aliases` y `richness` (sin `stats` ni `infobox`). */
export type WikiIndexEntry = EntityEntry;

/** Tope de la consulta: el motor compara cada palabra con distancia de edición, y un cliente puede enviar lo que quiera. */
const MAX_QUERY_LENGTH = 80;

/** Ficha de cada hit, en el orden de los hits (los slugs sin ficha se descartan). */
function articlesOf(hits: readonly { entry: { slug: string } }[], all: readonly WikiArticle[]): WikiArticle[] {
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  return hits.flatMap((hit) => bySlug.get(hit.entry.slug) ?? []);
}

export async function getWikiArticles({
  page = 1,
  pageSize = 12,
  search = '',
  universe = 'all',
  tipo,
}: GetWikiArticlesParams): Promise<GetWikiArticlesResult> {
  const [all, { entries }] = await Promise.all([getAllArticles(), getEntityIndex()]);
  const query = search.trim().slice(0, MAX_QUERY_LENGTH);

  // Con búsqueda manda el motor del archivo (palabras en cualquier orden, apodos, erratas) y su ranking;
  // sin ella, el orden de descubrimiento. Los filtros se aplican después, sobre ese orden.
  let articles = query ? articlesOf(searchEntities(query, entries), all) : all;
  const matchedCatalog = query ? catalogFilter(articles, {}).length > 0 : true;

  // Excluye siempre los directorios y filtra por universo; los números de las pestañas se calculan sobre
  // este conjunto (búsqueda + universo), antes de aplicar `tipo` (lógica pura en core/search/catalog).
  const scoped = catalogFilter(articles, {
    universe: universe && universe !== 'all' ? universe : undefined,
  });
  const counts: WikiTabCounts = { total: catalogFilter(scoped, {}).length, tipos: tipoCounts(scoped) };

  articles = catalogFilter(scoped, { tipo: tipo && isTipoId(tipo) ? tipo : undefined });

  if (!query) articles = [...articles].sort((a, b) => compareDiscovery(a.frontmatter, b.frontmatter));

  const total = articles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const skip = (page - 1) * pageSize;

  const result: GetWikiArticlesResult = {
    articles: articles.slice(skip, skip + pageSize).map(toSummary),
    total,
    totalPages,
    counts,
  };

  if (total === 0) {
    // «¿Quisiste decir…?» solo si la búsqueda no encontró nada en el catálogo (si encontró y los filtros
    // lo ocultan, sugerir otra cosa no ayuda). Los populares: las fichas más completas, sin directorios.
    result.suggestion = query && !matchedCatalog ? suggest(query, entries) : null;
    result.popular = catalogFilter(articlesOf(searchEntities('', entries), all), {}).slice(0, 6).map(toSummary);
  }
  return result;
}

/** Universos del catálogo, pestañas por tipo con su número y total de fichas (para los filtros). */
export async function getFilterOptions(): Promise<WikiFilterOptions> {
  const articles = await getAllArticles();
  const catalog = catalogFilter(articles, {});
  const universes = [...new Set(catalog.map((a) => a.frontmatter.universe))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
  return { universes, tipos: tipoCounts(articles), total: catalog.length };
}

/** Índice ligero para la paleta de búsqueda global: las entradas del índice de entidades (~11 KB en JSON). */
export async function getWikiIndex(): Promise<WikiIndexEntry[]> {
  return (await getEntityIndex()).entries;
}

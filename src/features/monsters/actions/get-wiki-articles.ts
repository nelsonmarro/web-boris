'use server';

import { getAllArticles } from '@/utils/mdx';
import { compareDiscovery } from '@/features/monsters/lib/discovery-order';
import { toSummary, type WikiArticleSummary } from '@/core/types/wiki';
import { catalogFilter, tipoCounts } from '@/core/search/catalog';
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
}

export interface WikiFilterOptions {
  universes: string[];
  /** Grupos con contenido y su número de fichas (sin directorios, con las Próximamente). */
  tipos: { id: TipoId; label: string; count: number }[];
  /** Fichas del catálogo: todas menos los directorios. */
  total: number;
}

export interface WikiIndexEntry {
  slug: string;
  title: string;
  universe: string;
  category?: string;
  description?: string;
  image?: string;
  status?: string;
  stats?: unknown;
  infobox?: Record<string, unknown>;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export async function getWikiArticles({
  page = 1,
  pageSize = 12,
  search = '',
  universe = 'all',
  tipo,
}: GetWikiArticlesParams): Promise<GetWikiArticlesResult> {
  let articles = await getAllArticles();

  if (search) {
    const q = normalize(search);
    articles = articles.filter(({ frontmatter: fm }) =>
      normalize(fm.title).includes(q) ||
      normalize(fm.universe).includes(q) ||
      (fm.category ? normalize(fm.category).includes(q) : false) ||
      (fm.description ? normalize(fm.description).includes(q) : false),
    );
  }

  // Excluye siempre los directorios y filtra por universo; los números de las pestañas se calculan sobre
  // este conjunto (búsqueda + universo), antes de aplicar `tipo` (lógica pura en core/search/catalog).
  const scoped = catalogFilter(articles, {
    universe: universe && universe !== 'all' ? universe : undefined,
  });
  const counts: WikiTabCounts = { total: catalogFilter(scoped, {}).length, tipos: tipoCounts(scoped) };

  articles = catalogFilter(scoped, { tipo: tipo && isTipoId(tipo) ? tipo : undefined });

  articles = [...articles].sort((a, b) => compareDiscovery(a.frontmatter, b.frontmatter));

  const total = articles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const skip = (page - 1) * pageSize;

  return {
    articles: articles.slice(skip, skip + pageSize).map(toSummary),
    total,
    totalPages,
    counts,
  };
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

/** Índice ligero para la paleta de búsqueda (⌘K). */
export async function getWikiIndex(): Promise<WikiIndexEntry[]> {
  const articles = await getAllArticles();
  return articles.map(({ slug, frontmatter }) => ({
    slug,
    title: frontmatter.title,
    universe: frontmatter.universe,
    category: frontmatter.category,
    description: frontmatter.description,
    image: frontmatter.image,
    status: frontmatter.status,
    stats: frontmatter.stats,
    infobox: frontmatter.infobox,
  }));
}

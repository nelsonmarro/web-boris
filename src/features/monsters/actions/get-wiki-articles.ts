'use server';

import { getAllArticles } from '@/utils/mdx';
import { toSummary, type WikiArticleSummary } from '@/core/types/wiki';

export interface GetWikiArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  universe?: string;
  category?: string;
}

export interface GetWikiArticlesResult {
  articles: WikiArticleSummary[];
  total: number;
  totalPages: number;
}

export interface WikiFilterOptions {
  universes: string[];
  categories: string[];
}

export interface WikiIndexEntry {
  slug: string;
  title: string;
  universe: string;
  category?: string;
  description?: string;
  image?: string;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export async function getWikiArticles({
  page = 1,
  pageSize = 9,
  search = '',
  universe = 'all',
  category = 'all',
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

  if (universe && universe !== 'all') {
    articles = articles.filter((a) => a.frontmatter.universe === universe);
  }

  if (category && category !== 'all') {
    articles = articles.filter((a) => a.frontmatter.category === category);
  }

  const total = articles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const skip = (page - 1) * pageSize;

  return {
    articles: articles.slice(skip, skip + pageSize).map(toSummary),
    total,
    totalPages,
  };
}

/** Universos y categorías reales presentes en el contenido (para los filtros). */
export async function getFilterOptions(): Promise<WikiFilterOptions> {
  const articles = await getAllArticles();
  const universes = new Set<string>();
  const categories = new Set<string>();
  for (const { frontmatter } of articles) {
    universes.add(frontmatter.universe);
    if (frontmatter.category) categories.add(frontmatter.category);
  }
  const sort = (set: Set<string>) => [...set].sort((a, b) => a.localeCompare(b, 'es'));
  return { universes: sort(universes), categories: sort(categories) };
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
  }));
}

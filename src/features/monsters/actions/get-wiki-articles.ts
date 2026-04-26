'use server';

import { getAllArticles } from '@/utils/mdx';
import { WikiArticle } from '@/core/types/wiki';

export interface GetWikiArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  universe?: string;
  category?: string;
}

export interface GetWikiArticlesResult {
  articles: WikiArticle[];
  total: number;
  totalPages: number;
}

export async function getWikiArticles({
  page = 1,
  pageSize = 6,
  search = "",
  universe = "all",
  category = "all"
}: GetWikiArticlesParams): Promise<GetWikiArticlesResult> {
  // In a real DB, we would use skip/take and where
  // Here we fetch all and filter/slice since it's MDX files
  let articles = await getAllArticles();

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    articles = articles.filter(article => 
      article.frontmatter.title.toLowerCase().includes(searchLower) ||
      article.frontmatter.universe.toLowerCase().includes(searchLower) ||
      article.frontmatter.description?.toLowerCase().includes(searchLower)
    );
  }

  if (universe && universe !== "all") {
    articles = articles.filter(article => 
      article.frontmatter.universe === universe
    );
  }

  if (category && category !== "all") {
    articles = articles.filter(article => 
      article.frontmatter.category === category
    );
  }

  const total = articles.length;
  const totalPages = Math.ceil(total / pageSize);
  
  // Apply pagination
  const skip = (page - 1) * pageSize;
  const paginatedArticles = articles.slice(skip, skip + pageSize);

  return {
    articles: paginatedArticles,
    total,
    totalPages
  };
}

import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import matter from 'gray-matter';
import { WikiFrontmatterSchema, WikiArticle } from '@/core/types/wiki';

const CONTENT_PATH = path.join(process.cwd(), 'src/content');
const IS_PROD = process.env.NODE_ENV === 'production';

/** Memo de proceso: en producción el contenido es inmutable tras el build. */
let allArticlesMemo: WikiArticle[] | null = null;

async function readArticle(slug: string): Promise<WikiArticle | null> {
  try {
    const fullPath = path.join(CONTENT_PATH, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const frontmatter = WikiFrontmatterSchema.parse(data);

    return { slug, frontmatter, content };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

/** Lee todos los MDX. Deduplicado por request (React cache) y memoizado en producción.
 * Fuera de aquí, los artículos se leen con `getContentRepository()`. */
export const getAllArticles = cache(async (): Promise<WikiArticle[]> => {
  if (IS_PROD && allArticlesMemo) return allArticlesMemo;
  if (!fs.existsSync(CONTENT_PATH)) return [];

  const files = fs.readdirSync(CONTENT_PATH).filter((file) => file.endsWith('.mdx'));
  const articles: WikiArticle[] = [];

  for (const file of files) {
    const article = await readArticle(file.replace(/\.mdx$/, ''));
    if (article) articles.push(article);
  }

  articles.sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title, 'es'));
  if (IS_PROD) allArticlesMemo = articles;
  return articles;
});

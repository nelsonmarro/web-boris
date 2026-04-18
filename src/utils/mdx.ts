import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { WikiFrontmatterSchema, WikiArticle } from '@/core/types/wiki';

const CONTENT_PATH = path.join(process.cwd(), 'src/content');

export async function getArticleBySlug(
  slug: string,
): Promise<WikiArticle | null> {
  try {
    const fullPath = path.join(CONTENT_PATH, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const frontmatter = WikiFrontmatterSchema.parse(data);

    return {
      slug,
      frontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

export async function getAllArticles(): Promise<WikiArticle[]> {
  if (!fs.existsSync(CONTENT_PATH)) {
    return [];
  }
  const files = fs.readdirSync(CONTENT_PATH);
  const articles: WikiArticle[] = [];

  for (const file of files) {
    if (file.endsWith('.mdx')) {
      const slug = file.replace(/\.mdx$/, '');
      const article = await getArticleBySlug(slug);
      if (article) {
        articles.push(article);
      }
    }
  }

  return articles;
}

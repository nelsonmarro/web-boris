/**
 * Superposición del contenido del panel sobre los archivos (spec CMS §3). Puro: imports relativos con `.ts`.
 * Los archivos de `src/content` son la base; lo publicado en la base de datos gana, y `deleted` oculta el archivo.
 */
import { z } from 'zod';
import { WikiFrontmatterSchema, type WikiArticle } from '../types/wiki.ts';
import { RESERVED_SLUGS } from '../search/wiki-routes.ts';

/** `kind` de los `CmsDocument` que son fichas (las listas son `LIST_KIND`, en `lists.ts`). */
export const ARTICLE_KIND = 'article';

/** Tamaño máximo del cuerpo de una ficha (la más larga del repositorio ronda los 20 000 caracteres). */
export const ARTICLE_CONTENT_MAX = 200_000;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 80;

/** Lo que guarda un `CmsDocument` de tipo `article` en `draft` y en `published`. */
export const ArticleDataSchema = z.object({
  frontmatter: WikiFrontmatterSchema,
  content: z.string().max(ARTICLE_CONTENT_MAX),
});
export type ArticleData = z.infer<typeof ArticleDataSchema>;

/** ¿Puede `slug` ser la dirección de una ficha? (minúsculas, cifras y guiones; sin rutas reservadas ni `-vs-`). */
export const isValidSlug = (slug: string): boolean =>
  slug.length <= SLUG_MAX && SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.includes(slug) && !slug.includes('-vs-') && !slug.endsWith('-vs');

export interface ArticleDoc {
  key: string;
  published: unknown;
  deleted: boolean;
}

/**
 * Fichas que ve la web: las de los archivos, con las publicadas en el panel por encima. Un documento publicado que
 * no pasa el esquema se ignora (queda el archivo, si lo hay) y se avisa por `onError`: un dato roto en la base nunca
 * tumba una página.
 */
export function overlayArticles(fileArticles: WikiArticle[], docs: ArticleDoc[], onError: (message: string) => void = () => {}): WikiArticle[] {
  const bySlug = new Map(fileArticles.map((article) => [article.slug, article]));
  for (const doc of docs) {
    if (doc.deleted) {
      bySlug.delete(doc.key);
      continue;
    }
    if (doc.published === null || doc.published === undefined) continue; // solo borrador: aún no se ve
    if (!isValidSlug(doc.key)) {
      onError(`${doc.key}: slug no válido`);
      continue;
    }
    const parsed = ArticleDataSchema.safeParse(doc.published);
    if (!parsed.success) {
      onError(`${doc.key}: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
      continue;
    }
    bySlug.set(doc.key, { slug: doc.key, frontmatter: parsed.data.frontmatter, content: parsed.data.content });
  }
  return [...bySlug.values()].sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title, 'es'));
}

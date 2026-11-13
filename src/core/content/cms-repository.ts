import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { fileContentRepository } from './file-repository';
import { overlayArticles, type ArticleDoc } from './overlay';
import type { ContentRepository } from './types';

/** Lo publicado en el panel se relee como mucho cada `TTL_MS`; publicar lo vacía al momento (`invalidateCmsCache`). */
const TTL_MS = 30_000;
// En `globalThis` y no en una variable del módulo: Next empaqueta las páginas y los route handlers por separado, cada
// uno con su copia de este módulo, y `invalidateCmsCache` (desde una acción o una ruta) debe vaciar la de todos.
const store = globalThis as unknown as { __wbCmsDocs?: { at: number; docs: ArticleDoc[] } | null };

/** Olvida lo leído de la base: la siguiente lectura va a por lo recién publicado. */
export function invalidateCmsCache(): void {
  store.__wbCmsDocs = null;
}

/**
 * Documentos de fichas tocados en el panel. Si la base no responde devuelve una lista vacía (la web sigue con los
 * archivos) y no reintenta hasta pasado `TTL_MS`, para no esperar el tiempo límite de conexión en cada página.
 */
async function articleDocs(): Promise<ArticleDoc[]> {
  const memo = store.__wbCmsDocs;
  if (memo && Date.now() - memo.at < TTL_MS) return memo.docs;
  let docs: ArticleDoc[] = [];
  try {
    docs = await prisma.cmsDocument.findMany({
      where: { kind: 'article', OR: [{ deleted: true }, { publishedAt: { not: null } }] },
      select: { key: true, published: true, deleted: true },
    });
  } catch (error) {
    console.error('[content:cms] la base no responde; se sirven los archivos:', error instanceof Error ? error.message.split('\n')[0] : error);
  }
  store.__wbCmsDocs = { at: Date.now(), docs };
  return docs;
}

const getArticles = cache(async () => {
  const [files, docs] = await Promise.all([fileContentRepository.getArticles(), articleDocs()]);
  if (docs.length === 0) return files;
  return overlayArticles(files, docs, (message) => console.error(`[content:cms] ${message}`));
});

/** Contenido de los archivos con lo publicado en el panel por encima (spec CMS §3). Hoy solo las fichas. */
export const cmsContentRepository: ContentRepository = {
  ...fileContentRepository,
  getArticles,
  async getArticle(slug) {
    return (await getArticles()).find((article) => article.slug === slug) ?? null;
  },
};

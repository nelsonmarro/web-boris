import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { fileContentRepository } from './file-repository';
import { overlayArticles, type ArticleDoc } from './overlay';
import { LIST_KIND, isListKey, overlayList, type ListKey } from './lists';
import type { ContentRepository } from './types';

/** Lo publicado en el panel se relee como mucho cada `TTL_MS`; publicar lo vacía al momento (`invalidateCmsCache`). */
const TTL_MS = 30_000;

interface CmsSnapshot {
  articles: ArticleDoc[];
  lists: Partial<Record<ListKey, unknown>>;
}

// En `globalThis` y no en una variable del módulo: Next empaqueta las páginas y los route handlers por separado, cada
// uno con su copia de este módulo, y `invalidateCmsCache` (desde una acción o una ruta) debe vaciar la de todos.
const store = globalThis as unknown as { __wbCms?: { at: number; snapshot: CmsSnapshot } | null };

/** Olvida lo leído de la base: la siguiente lectura va a por lo recién publicado. */
export function invalidateCmsCache(): void {
  store.__wbCms = null;
}

const EMPTY: CmsSnapshot = { articles: [], lists: {} };

/**
 * Lo publicado en el panel (fichas y listas), en una sola consulta. Si la base no responde devuelve vacío (la web sigue
 * con los archivos) y no reintenta hasta pasado `TTL_MS`, para no esperar el tiempo límite de conexión en cada página.
 */
async function snapshot(): Promise<CmsSnapshot> {
  const memo = store.__wbCms;
  if (memo && Date.now() - memo.at < TTL_MS) return memo.snapshot;
  let result = EMPTY;
  try {
    const docs = await prisma.cmsDocument.findMany({
      where: { kind: { in: ['article', LIST_KIND] }, OR: [{ deleted: true }, { publishedAt: { not: null } }] },
      select: { kind: true, key: true, published: true, deleted: true },
    });
    const lists: CmsSnapshot['lists'] = {};
    for (const doc of docs) if (doc.kind === LIST_KIND && isListKey(doc.key) && !doc.deleted) lists[doc.key] = doc.published;
    result = { articles: docs.filter((doc) => doc.kind === 'article'), lists };
  } catch (error) {
    console.error('[content:cms] la base no responde; se sirven los archivos:', error instanceof Error ? error.message.split('\n')[0] : error);
  }
  store.__wbCms = { at: Date.now(), snapshot: result };
  return result;
}

const logError = (message: string) => console.error(`[content:cms] ${message}`);

const getArticles = cache(async () => {
  const [files, { articles }] = await Promise.all([fileContentRepository.getArticles(), snapshot()]);
  if (articles.length === 0) return files;
  return overlayArticles(files, articles, logError);
});

/** Una lista con lo publicado en el panel por encima de la de los archivos. */
async function list<T>(key: ListKey, fromFiles: () => Promise<T[]>): Promise<T[]> {
  const [files, { lists }] = await Promise.all([fromFiles(), snapshot()]);
  return overlayList(key, files, lists[key], logError);
}

/** Contenido de los archivos con lo publicado en el panel por encima (spec CMS §3). */
export const cmsContentRepository: ContentRepository = {
  getArticles,
  async getArticle(slug) {
    return (await getArticles()).find((article) => article.slug === slug) ?? null;
  },
  async getNews(limit) {
    const items = (await list('news', () => fileContentRepository.getNews())).toSorted((x, y) => y.fecha.localeCompare(x.fecha) || x.id.localeCompare(y.id));
    return limit === undefined ? items : items.slice(0, limit);
  },
  getCuratedPolls: () => list('polls', () => fileContentRepository.getCuratedPolls()),
  getVideoLinks: () => list('videos', () => fileContentRepository.getVideoLinks()),
  getStoryOrder: () => list('storyOrder', () => fileContentRepository.getStoryOrder()),
  getStartHere: () => list('startHere', () => fileContentRepository.getStartHere()),
};

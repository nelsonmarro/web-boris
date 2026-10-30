import path from 'node:path';
import { getAllArticles } from '@/utils/mdx';
import { readCuratedPolls, readNews, readStoryOrder, readVideoLinks } from './readers';
import type { ContentRepository } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

function logErrors(source: string, errors: string[]): void {
  for (const e of errors) console.error(`[content:${source}] ${e}`);
}

/** Contenido desde archivos. Las entradas inválidas se omiten y se registran (como los MDX). */
export const fileContentRepository: ContentRepository = {
  getArticles: () => getAllArticles(),

  // Busca en la lista (en caché por petición) en lugar de leer `<slug>.mdx`: no construye rutas con la URL.
  async getArticle(slug) {
    return (await getAllArticles()).find((article) => article.slug === slug) ?? null;
  },

  async getNews(limit) {
    const { items, errors } = readNews(path.join(CONTENT_DIR, 'novedades'));
    logErrors('novedades', errors);
    return limit === undefined ? items : items.slice(0, limit);
  },

  async getCuratedPolls() {
    const { items, errors } = readCuratedPolls(path.join(CONTENT_DIR, 'encuestas.json'));
    logErrors('encuestas', errors);
    return items;
  },

  async getVideoLinks() {
    const { items, errors } = readVideoLinks(path.join(CONTENT_DIR, 'videos.json'));
    logErrors('videos', errors);
    return items;
  },

  async getStoryOrder() {
    const { items, errors } = readStoryOrder(path.join(CONTENT_DIR, 'orden-historia.json'));
    logErrors('orden-historia', errors);
    return items;
  },
};

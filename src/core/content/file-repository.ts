import path from 'node:path';
import { getAllArticles } from '@/utils/mdx';
import { readCuratedPolls, readNews } from './readers';
import type { ContentRepository } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

function logErrors(source: string, errors: string[]): void {
  for (const e of errors) console.error(`[content:${source}] ${e}`);
}

/** Contenido desde archivos. Las entradas inválidas se omiten y se registran (como los MDX). */
export const fileContentRepository: ContentRepository = {
  getArticles: () => getAllArticles(),

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
};

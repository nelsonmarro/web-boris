import { cache } from 'react';
import { buildEntityIndex, type EntityIndex } from '@/core/search/entity-index';
import { getContentRepository } from '@/core/content';

/** Índice de entidades del archivo, una vez por petición/build (spec Ola B §1). */
export const getEntityIndex = cache(async (): Promise<EntityIndex> => {
  const articles = await getContentRepository().getArticles();
  return buildEntityIndex(articles);
});

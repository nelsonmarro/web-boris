import { cache } from 'react';
import { buildEntityIndex, type EntityIndex } from '@/core/search/entity-index';
import { buildMentionGraph, type MentionGraph } from '@/core/search/mention-graph';
import { getContentRepository } from '@/core/content';

/** Índice de entidades del archivo, una vez por petición/build (spec Ola B §1). */
export const getEntityIndex = cache(async (): Promise<EntityIndex> => {
  const articles = await getContentRepository().getArticles();
  return buildEntityIndex(articles);
});

/** Grafo de menciones (quién nombra a quién), una vez por petición/build (spec Ola B §7). Lo consume la ficha para los relacionados (`getRelatedArticles`). */
export const getMentionGraph = cache(async (): Promise<MentionGraph> => {
  const articles = await getContentRepository().getArticles();
  return buildMentionGraph(articles, await getEntityIndex());
});

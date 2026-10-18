import { fileContentRepository } from './file-repository';
import type { ContentRepository } from './types';

/** Punto único de cambio: cuando exista un CMS, elegir aquí su implementación (p. ej. por variable de entorno). */
export function getContentRepository(): ContentRepository {
  return fileContentRepository;
}

export type { ContentRepository } from './types';
export type { CuratedPoll, NewsEntry } from './schemas';

import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { cmsContentRepository } from './cms-repository';
import { fileContentRepository } from './file-repository';
import type { ContentRepository } from './types';

/**
 * Punto único de cambio de la fuente de contenido. Con base de datos, los archivos con lo publicado en el panel por
 * encima; sin ella, o durante el build (que no se conecta a la base), solo los archivos.
 */
export function getContentRepository(): ContentRepository {
  if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return fileContentRepository;
  return cmsContentRepository;
}

export type { ContentRepository } from './types';
export type { CuratedPoll, NewsEntry, StoryOrderEntry, VideoLink } from './schemas';

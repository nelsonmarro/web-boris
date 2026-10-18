import type { WikiArticle } from '@/core/types/wiki';
import type { CuratedPoll, NewsEntry } from './schemas';

/**
 * Fuente de contenido de la web. Hoy la implementa `fileContentRepository` (archivos en src/content);
 * un CMS futuro implementará esta misma interfaz y la UI no cambiará.
 */
export interface ContentRepository {
  getArticles(): Promise<WikiArticle[]>;
  /** Novedades ordenadas por fecha descendente. */
  getNews(limit?: number): Promise<NewsEntry[]>;
  getCuratedPolls(): Promise<CuratedPoll[]>;
}

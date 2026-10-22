import type { WikiArticle } from '@/core/types/wiki';
import type { CuratedPoll, NewsEntry, VideoLink } from './schemas';

/**
 * Fuente de contenido de la web. Hoy la implementa `fileContentRepository` (archivos en src/content);
 * un CMS futuro implementará esta misma interfaz y la UI no cambiará.
 */
export interface ContentRepository {
  /** Artículos válidos de la wiki, ordenados por título. */
  getArticles(): Promise<WikiArticle[]>;
  /** El artículo `slug`, o `null` si no existe o su frontmatter no es válido. */
  getArticle(slug: string): Promise<WikiArticle | null>;
  /** Novedades ordenadas por fecha descendente. */
  getNews(limit?: number): Promise<NewsEntry[]>;
  getCuratedPolls(): Promise<CuratedPoll[]>;
  /** Relaciones manuales vídeo ↔ ficha (`videos.json`); las del título se calculan aparte (`linkVideos`). */
  getVideoLinks(): Promise<VideoLink[]>;
}

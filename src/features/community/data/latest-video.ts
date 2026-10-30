import { FEATURED_VIDEOS } from '@/features/marketing/config/videos';
import { newestCanalVideo } from '../lib/canal';
import { getCanal } from './channel-videos';
import { fetchChannelFeed } from './youtube-rss';

export interface LatestVideo {
  id: string;
  title: string;
  published?: string;
  /**
   * `rss`: el último del feed. `canal`: el vídeo más reciente de `canal.json` (el de mayor `orden`), al día de la
   * última `npm run sync:canal`. `fallback`: el primero de la lista del PDF de Boris, que no es el último.
   */
  source: 'rss' | 'canal' | 'fallback';
}

/**
 * Último vídeo del canal (RSS, caché 1 h). Si el feed falla, el más reciente de `canal.json`; sin instantánea, el
 * primero de la lista del PDF de Boris.
 */
export async function getLatestVideo(): Promise<LatestVideo> {
  try {
    const [latest] = await fetchChannelFeed();
    if (latest) return { ...latest, source: 'rss' };
  } catch {
    // El fallo ya lo registra `youtube-rss.ts`, una vez por ventana de memoización.
  }
  const newest = newestCanalVideo(getCanal());
  if (newest) {
    return newest.fecha
      ? { id: newest.id, title: newest.titulo, published: newest.fecha, source: 'canal' }
      : { id: newest.id, title: newest.titulo, source: 'canal' };
  }
  const fallback = FEATURED_VIDEOS[0];
  return { id: fallback.id, title: fallback.title, source: 'fallback' };
}

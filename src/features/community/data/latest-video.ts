import { FEATURED_VIDEOS } from '@/features/marketing/config/videos';
import { fetchChannelFeed } from './youtube-rss';

export interface LatestVideo {
  id: string;
  title: string;
  published?: string;
  source: 'rss' | 'fallback';
}

/** Último vídeo del canal (RSS, caché 1 h). Si el feed falla, el primero de la lista del PDF de Boris. */
export async function getLatestVideo(): Promise<LatestVideo> {
  try {
    const [latest] = await fetchChannelFeed();
    return { ...latest, source: 'rss' };
  } catch (error) {
    console.error('[comunidad] feed de YouTube no disponible, uso el respaldo:', error);
  }
  const fallback = FEATURED_VIDEOS[0];
  return { id: fallback.id, title: fallback.title, source: 'fallback' };
}

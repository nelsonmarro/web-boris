import { FEATURED_VIDEOS } from '@/features/marketing/config/videos';
import { YOUTUBE_CHANNEL_ID } from '@/features/marketing/config/social';
import { parseYoutubeFeed } from '../lib/youtube-feed';

export interface LatestVideo {
  id: string;
  title: string;
  published?: string;
  source: 'rss' | 'fallback';
}

const DEFAULT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

/** Último vídeo del canal (RSS, caché 1 h). Si el feed falla, el primero de la lista del PDF de Boris. */
export async function getLatestVideo(): Promise<LatestVideo> {
  const feedUrl = process.env.YOUTUBE_FEED_URL || DEFAULT_FEED_URL;
  try {
    const res = await fetch(feedUrl, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const [latest] = parseYoutubeFeed(await res.text());
    if (latest) return { ...latest, source: 'rss' };
    throw new Error('feed sin vídeos');
  } catch (error) {
    console.error('[comunidad] feed de YouTube no disponible, uso el respaldo:', error);
  }
  const fallback = FEATURED_VIDEOS[0];
  return { id: fallback.id, title: fallback.title, source: 'fallback' };
}

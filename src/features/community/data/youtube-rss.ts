import { YOUTUBE_CHANNEL_ID } from '@/features/marketing/config/social';
import { memoizeFailure } from '../lib/failure-memo';
import { parseYoutubeFeed, type FeedVideo } from '../lib/youtube-feed';

const DEFAULT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

/** Cuánto se recuerda que el feed falló antes de volver a intentarlo. */
const FAILURE_TTL_MS = 60_000;

async function fetchFeed(): Promise<FeedVideo[]> {
  const feedUrl = process.env.YOUTUBE_FEED_URL || DEFAULT_FEED_URL;
  const res = await fetch(feedUrl, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const videos = parseYoutubeFeed(await res.text());
  if (videos.length === 0) throw new Error('feed sin vídeos');
  return videos;
}

/**
 * Vídeos del feed RSS del canal, el más reciente primero (caché 1 h). Lanza si el feed falla o viene sin vídeos:
 * cada consumidor decide su respaldo. Mismas opciones de `fetch` para todos, así Next reutiliza la respuesta.
 *
 * Si el feed falla, el fallo se recuerda `FAILURE_TTL_MS` en el módulo: durante el build y el ISR, las páginas que
 * lo piden después reciben el mismo error al instante, sin repetir el 404 ni esperar los 4 s del tiempo límite.
 */
export const fetchChannelFeed: () => Promise<FeedVideo[]> = memoizeFailure(fetchFeed, FAILURE_TTL_MS);

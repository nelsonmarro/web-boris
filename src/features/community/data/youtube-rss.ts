import { YOUTUBE_CHANNEL_ID } from '@/features/marketing/config/social';
import { memoizeFailure } from '../lib/failure-memo';
import { abortable, HttpError, isTransientFetchError, withRetry } from '../lib/retry';
import { parseYoutubeFeed, type FeedVideo } from '../lib/youtube-feed';

const DEFAULT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

/** Cuánto se recuerda que el feed falló antes de volver a intentarlo. */
const FAILURE_TTL_MS = 60_000;
/**
 * Tiempo límite de cada intento y de toda la lectura, reintentos incluidos. Se cumple aunque Next revalide su caché de
 * `fetch` (entonces quita el `signal`): por eso cada espera va envuelta en `abortable`. Las pausas no se interrumpen: en
 * el peor caso el build espera el total más la última pausa (6,75 s).
 */
const ATTEMPT_TIMEOUT_MS = 4000;
const TOTAL_TIMEOUT_MS = 6000;
/** Pausas antes de cada reintento: el feed responde 404/500 al azar (#61). */
const RETRY_DELAYS_MS = [250, 750] as const;

async function fetchFeed(): Promise<FeedVideo[]> {
  const feedUrl = process.env.YOUTUBE_FEED_URL || DEFAULT_FEED_URL;
  const budget = AbortSignal.timeout(TOTAL_TIMEOUT_MS);
  const res = await withRetry(
    async () => {
      const signal = AbortSignal.any([budget, AbortSignal.timeout(ATTEMPT_TIMEOUT_MS)]);
      const response = await abortable(fetch(feedUrl, { next: { revalidate: 3600 }, signal }), signal);
      if (!response.ok) {
        // Se descarta el cuerpo para liberar la conexión antes del siguiente intento.
        await response.body?.cancel().catch(() => {});
        throw new HttpError(response.status);
      }
      return response;
    },
    // Agotado el tiempo total, no se reintenta aunque el error sea transitorio.
    { delaysMs: RETRY_DELAYS_MS, shouldRetry: (error) => !budget.aborted && isTransientFetchError(error) },
  );
  const videos = parseYoutubeFeed(await abortable(res.text(), budget));
  if (videos.length === 0) throw new Error('feed sin vídeos');
  return videos;
}

/**
 * Vídeos del feed RSS del canal, el más reciente primero (caché 1 h). Lanza si el feed falla o viene sin vídeos:
 * cada consumidor decide su respaldo. Mismas opciones de `fetch` para todos, así Next reutiliza la respuesta.
 *
 * Si el feed falla, se reintenta hasta 2 veces (404, 5xx, red o tiempo límite; unos 6 s en total). El fallo final se
 * recuerda `FAILURE_TTL_MS` en el módulo: durante el build y el ISR, las páginas que lo piden después reciben el
 * mismo error al instante, sin repetir los intentos.
 */
export const fetchChannelFeed: () => Promise<FeedVideo[]> = memoizeFailure(fetchFeed, FAILURE_TTL_MS);

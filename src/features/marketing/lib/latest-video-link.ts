/**
 * Destino del botón «Ver el último vídeo» del hero. Solo enlaza a un vídeo concreto cuando viene del feed RSS: el
 * respaldo de `getLatestVideo` es uno de la lista de Boris (no el último), así que entonces, y mientras el feed no
 * ha llegado, se abre la pestaña «Vídeos» del canal, que YouTube ordena del más reciente al más antiguo.
 * Puro (sin imports de `@/`): lo prueba `tests/marketing/latest-video-link.test.ts`.
 */
export function latestVideoHref(
  latest: { id: string; source: 'rss' | 'fallback' } | null | undefined,
  channelUrl: string,
): string {
  if (latest?.source === 'rss') return `https://www.youtube.com/watch?v=${latest.id}`;
  return channelVideosUrl(channelUrl);
}

/** Pestaña «Vídeos» del canal (sin barra final duplicada). */
export const channelVideosUrl = (channelUrl: string) => `${channelUrl.replace(/\/+$/, '')}/videos`;

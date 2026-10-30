/**
 * Destino del botón «Ver el último vídeo» del hero. Enlaza al vídeo cuando es de verdad el último: el del feed RSS o,
 * con el feed caído, el más reciente de `canal.json` (`source: 'canal'`). El respaldo final de `getLatestVideo` es uno
 * de la lista de Boris (no el último), así que entonces, y mientras el dato no ha llegado, se abre la pestaña «Vídeos»
 * del canal, que YouTube ordena del más reciente al más antiguo.
 * Puro (sin imports de `@/`): lo prueba `tests/marketing/latest-video-link.test.ts`.
 */
export function latestVideoHref(
  latest: { id: string; source: 'rss' | 'canal' | 'fallback' } | null | undefined,
  channelUrl: string,
): string {
  if (isLatest(latest)) return `https://www.youtube.com/watch?v=${latest.id}`;
  return channelVideosUrl(channelUrl);
}

/** `true` si el vídeo es el último del canal (RSS o `canal.json`), no el respaldo de la lista de Boris. */
export const isLatest = <T extends { source: 'rss' | 'canal' | 'fallback' }>(latest: T | null | undefined): latest is T =>
  latest?.source === 'rss' || latest?.source === 'canal';

/** Pestaña «Vídeos» del canal (sin barra final duplicada). */
export const channelVideosUrl = (channelUrl: string) => `${channelUrl.replace(/\/+$/, '')}/videos`;

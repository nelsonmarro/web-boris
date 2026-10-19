import type { FeedVideo } from './youtube-feed.ts';

/**
 * Lista de vídeos del canal para «Aparece en»: primero los destacados (los que indicó Boris), luego los del
 * feed en su orden (más reciente primero), sin repetir ids. Si un destacado también viene en el feed, conserva
 * su título y toma la fecha del feed. Con el feed vacío (RSS caído), quedan solo los destacados. Puro.
 */
export function mergeChannelVideos(featured: readonly FeedVideo[], feed: readonly FeedVideo[]): FeedVideo[] {
  const byId = new Map<string, FeedVideo>();
  for (const video of featured) {
    if (!byId.has(video.id)) byId.set(video.id, { ...video });
  }
  for (const video of feed) {
    const existing = byId.get(video.id);
    if (!existing) byId.set(video.id, { ...video });
    else if (!existing.published && video.published) existing.published = video.published;
  }
  return [...byId.values()];
}

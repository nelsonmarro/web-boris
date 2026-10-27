import { cache } from 'react';
import { getContentRepository } from '@/core/content';
import { getEntityIndex } from '@/core/content/entities';
import { linkVideos, type VideoRef } from '@/core/search/video-links';
import { FEATURED_VIDEOS } from '@/features/marketing/config/videos';
import { mergeChannelVideos } from '../lib/merge-videos';
import type { FeedVideo } from '../lib/youtube-feed';
import { fetchChannelFeed } from './youtube-rss';

export type ChannelVideo = FeedVideo;

/**
 * Vídeos del canal: los destacados de Boris más los del RSS (caché 1 h), sin repetir ids.
 * Si el RSS falla, solo los destacados.
 */
export const getChannelVideos = cache(async (): Promise<ChannelVideo[]> => {
  let feed: FeedVideo[] = [];
  try {
    feed = await fetchChannelFeed();
  } catch {
    // El fallo ya lo registra `youtube-rss.ts`, una vez por ventana de memoización.
  }
  return mergeChannelVideos(FEATURED_VIDEOS, feed);
});

/** Vídeos del canal agrupados por ficha (título del vídeo + `videos.json`), una vez por petición. */
const getVideosBySlug = cache(async () => {
  const [videos, manual, index] = await Promise.all([
    getChannelVideos(),
    getContentRepository().getVideoLinks(),
    getEntityIndex(),
  ]);
  return linkVideos(videos, index, manual);
});

/** Vídeos del canal donde aparece la ficha `slug`, en el orden de `getChannelVideos`. Vacío si en ninguno. */
export async function getVideosForSlug(slug: string): Promise<VideoRef[]> {
  return (await getVideosBySlug()).get(slug) ?? [];
}

import path from 'node:path';
import { cache } from 'react';
import { getContentRepository } from '@/core/content';
import { getEntityIndex } from '@/core/content/entities';
import { linkVideos, type VideoRef } from '@/core/search/video-links';
import { FEATURED_VIDEOS } from '@/features/marketing/config/videos';
import { channelVideoList, readCanal, type CanalEntry, type ChannelVideo } from '../lib/canal';
import type { FeedVideo } from '../lib/youtube-feed';
import { fetchChannelFeed } from './youtube-rss';

export type { ChannelVideo };

const CANAL_FILE = path.join(process.cwd(), 'src', 'content', 'canal.json');

/** `canal.json` validado, una vez por petición; los errores se registran y la lista queda vacía. */
export const getCanal = cache((): CanalEntry[] => {
  const canal = readCanal(CANAL_FILE);
  for (const error of canal.errors) console.error(`[content:canal] ${error}`);
  return canal.items;
});

/**
 * Vídeos del canal: los destacados de Boris, los del RSS (caché 1 h; lo más nuevo) y la instantánea completa de
 * `canal.json` (`npm run sync:canal`), sin repetir ids. Si el RSS falla, basta la instantánea; sin ella, los destacados.
 */
export const getChannelVideos = cache(async (): Promise<ChannelVideo[]> => {
  let feed: FeedVideo[] = [];
  try {
    feed = await fetchChannelFeed();
  } catch {
    // El fallo ya lo registra `youtube-rss.ts`, una vez por ventana de memoización.
  }
  return channelVideoList(FEATURED_VIDEOS, feed, getCanal());
});

/** Vídeos del canal agrupados por ficha (título del vídeo + `videos.json`), una vez por petición. También lo usa `/videos`. */
export const getVideosBySlug = cache(async () => {
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

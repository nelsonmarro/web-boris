/** «Últimos vídeos» de /comunidad (spec 2026-10-27 §6). Puro (lo prueban los tests con node:test). */
import type { FeedVideo } from './youtube-feed.ts';

/** Fecha en ms, o `null` si falta o no es válida. */
const timeOf = (video: FeedVideo) => {
  const t = video.published ? Date.parse(video.published) : Number.NaN;
  return Number.isNaN(t) ? null : t;
};

/**
 * Los `n` vídeos más recientes: primero los fechados (de más nuevo a más viejo), luego los sin fecha en su orden
 * (los destacados de Boris no traen fecha). A igualdad, el orden de entrada. No muta `videos`.
 */
export function latestVideos<T extends FeedVideo>(videos: readonly T[], n: number): T[] {
  return videos
    .map((video, index) => ({ video, index, time: timeOf(video) }))
    .sort((x, y) => {
      if (x.time !== null && y.time !== null) return y.time - x.time || x.index - y.index;
      if (x.time !== null) return -1;
      if (y.time !== null) return 1;
      return x.index - y.index;
    })
    .slice(0, Math.max(0, n))
    .map((e) => e.video);
}

/** «Últimos vídeos» de /comunidad (spec 2026-10-27 §6). Puro (lo prueban los tests con node:test). */
import { sortVideosByDate, type DatedVideo } from './videos-by-universe.ts';

/**
 * Los `n` vídeos más recientes, con el orden de publicación de `sortVideosByDate` («recientes»): por fecha cuando la
 * hay y, en `canal.json`, por `orden` dentro de cada tipo; los que no tienen nada que los ubique (los destacados de
 * Boris sin fecha) van al final en su orden. No muta `videos`.
 */
export function latestVideos<T extends DatedVideo>(videos: readonly T[], n: number): T[] {
  return sortVideosByDate(videos, 'recientes').slice(0, Math.max(0, n));
}

/**
 * Vídeos ↔ fichas (spec Ola C, «Aparece en»). Puro: solo imports relativos con extensión .ts.
 * Una ficha «aparece en» un vídeo si el título del vídeo la nombra (mismas reglas que los enlaces
 * automáticos: `findMentions`) o si `videos.json` lo declara a mano.
 */
import { findMentions, type EntityIndex } from './entity-index.ts';

export interface VideoRef {
  id: string;
  title: string;
}

/** Relación manual de `videos.json`: un vídeo y las fichas en las que sale. */
export interface ManualVideoLink {
  id: string;
  fichas: readonly string[];
}

/**
 * Agrupa los vídeos por ficha: `slug` → vídeos en los que aparece, sin repetidos y en el orden de `videos`.
 * Un vídeo sin ninguna relación no figura en ningún grupo. Las relaciones manuales sobre un vídeo que no
 * está en `videos` se ignoran (sin título no hay qué mostrar).
 */
export function linkVideos(
  videos: readonly VideoRef[],
  index: EntityIndex,
  manual: readonly ManualVideoLink[],
): Map<string, VideoRef[]> {
  const manualById = new Map<string, Set<string>>();
  for (const link of manual) {
    const set = manualById.get(link.id) ?? new Set<string>();
    for (const slug of link.fichas) set.add(slug);
    manualById.set(link.id, set);
  }

  const bySlug = new Map<string, VideoRef[]>();
  const seen = new Set<string>();
  for (const video of videos) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    const slugs = new Set<string>([
      ...findMentions(video.title, index).map((m) => m.slug),
      ...(manualById.get(video.id) ?? []),
    ]);
    for (const slug of slugs) {
      const list = bySlug.get(slug);
      if (list) list.push(video);
      else bySlug.set(slug, [video]);
    }
  }
  return bySlug;
}

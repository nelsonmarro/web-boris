/**
 * `/videos` — todos los vídeos del canal por universo, «Ver en orden» (spec UX fase 2 §2). Puro: imports relativos `.ts`,
 * probado con node:test. Las relaciones vídeo ↔ ficha son las de `linkVideos` (título del vídeo + `videos.json`).
 */
import type { VideoRef } from '../../../core/search/video-links.ts';

export interface DatedVideo {
  id: string;
  title: string;
  /** ISO 8601 o YYYY-MM-DD (RSS o `canal.json`); muchos no la traen (los destacados y casi todo `canal.json`). */
  published?: string;
  /** De `canal.json`: los Shorts llevan la etiqueta «Short». */
  tipo?: 'video' | 'short';
  /** De `canal.json`: puesto de publicación dentro de su `tipo` (1 = el más antiguo). */
  orden?: number;
}

/**
 * «Ver en orden» (los más antiguos primero, por defecto), «Más recientes primero» u «Orden de la historia» (el de
 * `orden-historia.json`; solo existe si Boris lo ha mandado para algún universo).
 */
export type VideoOrder = 'antiguos' | 'recientes' | 'historia';

/** Parámetro de la URL del selector de orden: `/videos?orden=recientes`. */
export const ORDER_PARAM = 'orden';

/**
 * Cualquier valor desconocido (o ninguno) es el orden por defecto. `historia` solo vale si algún universo tiene orden
 * de la historia (`hasStory`); si no, un enlace viejo a `?orden=historia` cae en el orden por defecto.
 */
export const parseVideoOrder = (value: string | null | undefined, hasStory = false): VideoOrder =>
  value === 'recientes' ? 'recientes' : value === 'historia' && hasStory ? 'historia' : 'antiguos';

/**
 * «Orden de la historia» de un universo: primero los vídeos de `ids` en ese orden (de `lookup`, el índice de todos los
 * vídeos de la página, porque uno de la lista puede haber caído en otro grupo; los que no estén se saltan), y después
 * el resto del grupo en su orden actual, sin repetir. No muta nada.
 */
export function storyOrderVideos<T extends { id: string }>(
  group: readonly T[],
  ids: readonly string[],
  lookup: ReadonlyMap<string, T>,
): T[] {
  const story = ids.flatMap((id) => {
    const video = lookup.get(id);
    return video ? [video] : [];
  });
  const inStory = new Set(story.map((v) => v.id));
  return [...story, ...group.filter((v) => !inStory.has(v.id))];
}

/** Lo que `/empieza-aqui` necesita de cada entrada de `orden-historia.json`. */
export interface StoryStart {
  universo: string;
  /** El primer vídeo de la lista: «Empieza por este vídeo». */
  id: string;
  nota?: string;
}

/**
 * El primer vídeo de cada universo con orden de la historia, en el orden de `universeOrder` (los universos que no
 * figuran van detrás, en el orden del archivo). Vacío si nadie ha mandado ninguno.
 */
export function storyStarts(
  entries: readonly { universo: string; ids: readonly string[]; nota?: string }[],
  universeOrder: readonly string[],
): StoryStart[] {
  const rank = (universe: string) => {
    const i = universeOrder.indexOf(universe);
    return i === -1 ? universeOrder.length : i;
  };
  return entries
    .filter((e) => e.ids.length > 0)
    .map((e) => ({ universo: e.universo, id: e.ids[0], ...(e.nota ? { nota: e.nota } : {}) }))
    .sort((a, b) => rank(a.universo) - rank(b.universo));
}

/** Fecha en ms, o `null` si falta o no es válida. */
const timeOf = (video: DatedVideo) => {
  const t = video.published ? Date.parse(video.published) : Number.NaN;
  return Number.isNaN(t) ? null : t;
};

/** Vídeos, Shorts y, al final, los que no vienen de `canal.json`. */
const tipoRank = (video: DatedVideo) => (video.tipo === 'video' ? 0 : video.tipo === 'short' ? 1 : 2);

/**
 * Ordena por publicación. Las fechas salen del RSS (los últimos vídeos) y de `canal.json` cuando la trae; el `orden` de
 * `canal.json` da además el orden exacto dentro de cada tipo (vídeos por un lado, Shorts por otro), así que:
 * - con fecha en los dos, manda la fecha;
 * - uno sin fecha pero con `orden` se coloca como mínimo en la fecha del anterior de su tipo (en `orden`) que sí la
 *   tiene, y detrás de él: el orden dentro de cada tipo se respeta siempre;
 * - uno sin fecha y sin nada que la acote (un destacado, uno de `videos.json` que nadie lista, o todo el canal si no
 *   hay ninguna fecha) se toma por anterior a todos los fechados: va delante en «antiguos» y detrás en «recientes».
 * Entre los que empatan: vídeos, luego Shorts, luego los demás; dentro de un tipo, por `orden`; si no, el orden de
 * entrada. Es una ordenación por clave (transitiva). No muta `videos`.
 */
export function sortVideosByDate<T extends DatedVideo>(videos: readonly T[], order: VideoOrder): T[] {
  const sign = order === 'antiguos' ? 1 : -1;
  const entries = videos.map((video, index) => {
    const time = timeOf(video);
    return { video, index, time, key: time, rank: tipoRank(video) };
  });
  // Cota inferior de los que no tienen fecha: la del anterior fechado de su tipo según `orden`.
  for (const rank of [0, 1]) {
    const ofTipo = entries.filter((e) => e.rank === rank && e.video.orden !== undefined);
    ofTipo.sort((x, y) => (x.video.orden ?? 0) - (y.video.orden ?? 0));
    let last: number | null = null;
    for (const e of ofTipo) {
      if (e.time !== null) last = last === null ? e.time : Math.max(last, e.time);
      else e.key = last;
    }
  }
  return entries
    .sort((x, y) => {
      const kx = x.key ?? Number.NEGATIVE_INFINITY;
      const ky = y.key ?? Number.NEGATIVE_INFINITY;
      if (kx !== ky) return kx < ky ? -sign : sign;
      if (x.rank !== y.rank) return x.rank - y.rank;
      const ox = x.video.orden;
      const oy = y.video.orden;
      if (ox !== undefined && oy !== undefined) {
        if (ox !== oy) return sign * (ox - oy);
      } else if (ox !== undefined || oy !== undefined) {
        return ox !== undefined ? -1 : 1;
      }
      return x.index - y.index;
    })
    .map((e) => e.video);
}

/**
 * `true` si la lista son solo los destacados: ningún vídeo trae fecha (RSS) ni viene de `canal.json` (`tipo`), es decir,
 * no hay instantánea del canal y el RSS falló o vino vacío.
 */
export const isFeedMissing = (videos: readonly DatedVideo[]) => !videos.some((v) => timeOf(v) !== null || v.tipo !== undefined);

/**
 * Universo de un vídeo a partir de los de sus fichas: el más repetido; a igualdad, el de la primera ficha que lo tiene.
 * Las fichas sin universo conocido no cuentan. `undefined` si no queda ninguna.
 */
export function universeOfVideo(
  slugs: readonly string[],
  universeOf: (slug: string) => string | undefined,
): string | undefined {
  const counts = new Map<string, number>();
  for (const slug of slugs) {
    const universe = universeOf(slug);
    if (universe) counts.set(universe, (counts.get(universe) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  // `Map` conserva el orden de inserción: con `>` estricto, el empate lo gana el que apareció antes.
  for (const [universe, count] of counts) {
    if (count > bestCount) {
      best = universe;
      bestCount = count;
    }
  }
  return best;
}

/** Minúsculas, sin tildes ni signos (`#colosos` → `colosos`), con espacios simples alrededor para casar palabras enteras. */
const normalizeTitle = (s: string) =>
  ` ${s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;

/** Palabras clave del título que identifican un universo (p. ej. «Ellos llegaron» → Ellos Llegaron). */
export interface UniverseKeywords {
  universe: string;
  keywords: readonly string[];
}

/**
 * Universo de un vídeo por su título: el de la primera regla con alguna palabra clave en el título, como palabras
 * enteras y sin distinguir mayúsculas, tildes ni `#`. `undefined` si ninguna casa.
 */
export function universeFromTitle(title: string, rules: readonly UniverseKeywords[]): string | undefined {
  const haystack = normalizeTitle(title);
  const matches = (keyword: string) => {
    const needle = normalizeTitle(keyword);
    return needle.trim() !== '' && haystack.includes(needle);
  };
  return rules.find((rule) => rule.keywords.some(matches))?.universe;
}

export interface ArchiveVideo extends DatedVideo {
  /** Fichas en las que aparece (solo las conocidas), en el orden de `linkVideos`. */
  fichas: string[];
}

export interface VideoGroup {
  /** Valor de `universe:` del frontmatter; `null` es «Otros vídeos» (ni fichas ni palabras clave). */
  universe: string | null;
  /** Ordenados «Ver en orden» (los más antiguos primero). */
  videos: ArchiveVideo[];
}

/**
 * Agrupa los vídeos por universo para `/videos`.
 * - `channel`: los vídeos del canal (`getChannelVideos`). Se añaden detrás los de `bySlug` que el canal no trae (los de
 *   `videos.json` con `titulo` propio), sin fecha.
 * - `bySlug`: `linkVideos` (ficha → vídeos); aquí se invierte (vídeo → fichas).
 * - `universeOf`: universo de una ficha, o `undefined` si no existe (esa ficha no sale como chip ni cuenta).
 * - `universeOrder`: orden de los grupos; los universos que no figuran van después, por orden de aparición, y
 *   «Otros vídeos» (`universe: null`) siempre al final. Solo hay grupos con vídeos.
 * - `keywords`: si el vídeo no tiene fichas con universo, el del título (`universeFromTitle`).
 */
export function groupVideosByUniverse(
  channel: readonly DatedVideo[],
  bySlug: ReadonlyMap<string, readonly VideoRef[]>,
  universeOf: (slug: string) => string | undefined,
  universeOrder: readonly string[],
  keywords: readonly UniverseKeywords[] = [],
): VideoGroup[] {
  const fichasById = new Map<string, string[]>();
  const extras: DatedVideo[] = [];
  const channelIds = new Set(channel.map((v) => v.id));
  for (const [slug, videos] of bySlug) {
    if (!universeOf(slug)) continue;
    for (const video of videos) {
      const fichas = fichasById.get(video.id);
      if (fichas) {
        if (!fichas.includes(slug)) fichas.push(slug);
      } else {
        fichasById.set(video.id, [slug]);
        if (!channelIds.has(video.id)) extras.push({ id: video.id, title: video.title });
      }
    }
  }

  const groups = new Map<string | null, ArchiveVideo[]>();
  const seen = new Set<string>();
  for (const video of [...channel, ...extras]) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    const fichas = fichasById.get(video.id) ?? [];
    const universe = universeOfVideo(fichas, universeOf) ?? universeFromTitle(video.title, keywords) ?? null;
    const entry: ArchiveVideo = { ...video, fichas };
    const list = groups.get(universe);
    if (list) list.push(entry);
    else groups.set(universe, [entry]);
  }

  const rank = (universe: string | null) => {
    if (universe === null) return Number.POSITIVE_INFINITY;
    const i = universeOrder.indexOf(universe);
    return i === -1 ? universeOrder.length : i;
  };
  // `sort` es estable: los universos fuera de `universeOrder` quedan en su orden de aparición.
  return [...groups]
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([universe, videos]) => ({ universe, videos: sortVideosByDate(videos, 'antiguos') }));
}

/**
 * Título para mostrar: sin los hashtags que YouTube usa para los Shorts (`#shorts`, `#cgi`…) ni los separadores que
 * dejan colgando. Si no queda nada, el título tal cual. Las palabras clave (`universeFromTitle`) leen el original.
 */
export function displayVideoTitle(title: string): string {
  const clean = title
    .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s\-–—|·:,]+$/u, '')
    .trim();
  return clean || title;
}

/**
 * `src/content/canal.json`: la lista completa del canal (vídeos y shorts), una instantánea que genera
 * `npm run sync:canal` sin clave de API. Es la base de `getChannelVideos`: el RSS de YouTube solo trae los últimos
 * 15 vídeos y a menudo responde 404. Puro: imports relativos `.ts` (lo usan check:content, el script y los tests).
 *
 * Cada entrada lleva `orden`, su puesto de publicación dentro de su `tipo` (1 = el más antiguo), que sale del listado
 * de las pestañas del canal. La `fecha` es opcional: YouTube solo la da en la página de cada vídeo y la limita (HTTP 429),
 * así que el listado basta y las fechas se añaden cuando se pueden leer (`npm run sync:canal -- --con-fechas`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { YOUTUBE_ID_REGEX } from '../../../core/content/schemas.ts';
import { mergeChannelVideos } from './merge-videos.ts';
import { sortVideosByDate } from './videos-by-universe.ts';
import type { FeedVideo } from './youtube-feed.ts';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const CanalEntrySchema = z.object({
  id: z.string().regex(YOUTUBE_ID_REGEX, { message: 'id de YouTube inválido (11 caracteres [A-Za-z0-9_-])' }),
  titulo: z.string().trim().min(1).max(200),
  tipo: z.enum(['video', 'short']),
  /** Puesto de publicación dentro de su `tipo`: 1 = el más antiguo. */
  orden: z.number().int({ message: 'orden debe ser un entero' }).positive({ message: 'orden debe ser positivo' }),
  fecha: z
    .string()
    .regex(FECHA, { message: 'fecha en formato YYYY-MM-DD' })
    .refine((f) => !Number.isNaN(Date.parse(f)) && new Date(f).toISOString().slice(0, 10) === f, {
      message: 'fecha inexistente',
    })
    .optional(),
});

export const CanalSchema = z.array(CanalEntrySchema).superRefine((entries, ctx) => {
  const seen = new Set<string>();
  const ordenes = new Set<string>();
  entries.forEach((e, i) => {
    if (seen.has(e.id)) ctx.addIssue({ code: 'custom', message: `vídeo repetido: ${e.id}`, path: [i, 'id'] });
    seen.add(e.id);
    const key = `${e.tipo}:${e.orden}`;
    if (ordenes.has(key)) ctx.addIssue({ code: 'custom', message: `orden repetido en ${e.tipo}: ${e.orden}`, path: [i, 'orden'] });
    ordenes.add(key);
  });
});

export type CanalEntry = z.infer<typeof CanalEntrySchema>;

/** Valida el contenido ya parseado de `canal.json`. Con errores no devuelve ninguna entrada. */
export function parseCanal(json: unknown, name = 'canal.json'): { items: CanalEntry[]; errors: string[] } {
  const parsed = CanalSchema.safeParse(json);
  if (!parsed.success) {
    return { items: [], errors: parsed.error.issues.map((i) => `${name}: ${i.path.join('.') || '(raíz)'} — ${i.message}`) };
  }
  return { items: parsed.data, errors: [] };
}

/** Lee y valida `canal.json`. Si no existe, lista vacía y sin errores. */
export function readCanal(file: string): { items: CanalEntry[]; errors: string[] } {
  if (!fs.existsSync(file)) return { items: [], errors: [] };
  const name = path.basename(file);
  let json: unknown;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { items: [], errors: [`${name}: JSON inválido — ${(error as Error).message}`] };
  }
  return parseCanal(json, name);
}

const TIPO_RANK: Record<CanalEntry['tipo'], number> = { video: 0, short: 1 };

/** Orden del archivo: primero los vídeos y luego los shorts, cada bloque del más antiguo al más nuevo (`orden`). */
export const sortCanal = (entries: readonly CanalEntry[]): CanalEntry[] =>
  [...entries].sort((a, b) => TIPO_RANK[a.tipo] - TIPO_RANK[b.tipo] || a.orden - b.orden);

/** Una entrada por línea, en el orden de `sortCanal`: los cambios de `sync:canal` se leen bien en un diff. */
export const serializeCanal = (entries: readonly CanalEntry[]) =>
  `[\n${sortCanal(entries)
    .map((e) => `  ${JSON.stringify({ id: e.id, titulo: e.titulo, tipo: e.tipo, orden: e.orden, fecha: e.fecha })}`)
    .join(',\n')}\n]\n`;

/** El vídeo (no Short) más reciente de la instantánea: el de mayor `orden`. `undefined` si no hay ninguno. */
export function newestCanalVideo(canal: readonly CanalEntry[]): CanalEntry | undefined {
  let newest: CanalEntry | undefined;
  for (const entry of canal) {
    if (entry.tipo === 'video' && (!newest || entry.orden > newest.orden)) newest = entry;
  }
  return newest;
}

export interface ChannelVideo extends FeedVideo {
  /** Solo los que vienen de `canal.json`: `short` para los Shorts. */
  tipo?: CanalEntry['tipo'];
  /** Solo los que vienen de `canal.json`: su puesto de publicación dentro de su `tipo` (1 = el más antiguo). */
  orden?: number;
}

/**
 * Vídeos del canal: primero los destacados de Boris (mandan sus títulos), luego los del RSS (lo más nuevo, con hora
 * exacta) y después los de `canal.json` del más nuevo al más viejo (`sortVideosByDate`), sin repetir ids. Un vídeo
 * toma la primera fecha que encuentre (RSS antes que `canal.json`) y el tipo y el orden de `canal.json`. Con el RSS
 * caído, la instantánea basta.
 */
export function channelVideoList(
  featured: readonly FeedVideo[],
  feed: readonly FeedVideo[],
  canal: readonly CanalEntry[],
): ChannelVideo[] {
  const snapshot: FeedVideo[] = sortVideosByDate(
    canal.map((e) => ({ id: e.id, title: e.titulo, published: e.fecha, tipo: e.tipo, orden: e.orden })),
    'recientes',
  ).map(({ id, title, published }) => (published ? { id, title, published } : { id, title }));
  const byId = new Map(canal.map((e) => [e.id, e]));
  return mergeChannelVideos(featured, [...feed, ...snapshot]).map((video) => {
    const entry = byId.get(video.id);
    return entry ? { ...video, tipo: entry.tipo, orden: entry.orden } : video;
  });
}

/**
 * Listas del contenido que se editan en el panel (spec CMS §7, fase 5): novedades, votaciones, vídeos ↔ fichas, orden
 * de la historia, «Empieza por aquí» y el menú lateral. Cada una es un `CmsDocument` con `kind: 'list'` y su clave; lo publicado
 * sustituye entera a la lista de los archivos. Puro: imports relativos con `.ts`.
 */
import { z } from 'zod';
import { CuratedPollsSchema, NewsEntrySchema, StoryOrderSchema, VideoLinksSchema } from './schemas.ts';
import { NavigationSchema, type NavGroup } from './navigation.ts';
import type { CuratedPoll, NewsEntry, StoryOrderEntry, VideoLink } from './schemas.ts';

export const LIST_KIND = 'list';
export const LIST_KEYS = ['news', 'polls', 'videos', 'storyOrder', 'startHere', 'navigation'] as const;
export type ListKey = (typeof LIST_KEYS)[number];
export const isListKey = (value: unknown): value is ListKey => typeof value === 'string' && (LIST_KEYS as readonly string[]).includes(value);

/** Lo que contiene cada lista una vez comprobada con su `LIST_SCHEMAS`. */
export interface ListValues {
  news: NewsEntry[];
  polls: CuratedPoll[];
  videos: VideoLink[];
  storyOrder: StoryOrderEntry[];
  startHere: string[];
  navigation: NavGroup[];
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Id de una novedad: `<yyyy-mm-dd>-<slug>` (como el nombre de su archivo). */
export const NEWS_ID = /^(\d{4}-\d{2}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Tope de entradas de cada lista: holgado, pero acota lo que se guarda. */
const MAX_ITEMS = 500;

const unique = <T>(key: (item: T) => string, label: string) => (items: T[], ctx: z.RefinementCtx) => {
  const seen = new Set<string>();
  items.forEach((item, i) => {
    const k = key(item);
    if (seen.has(k)) ctx.addIssue({ code: 'custom', message: `${label} repetido: ${k}`, path: [i] });
    seen.add(k);
  });
};

export const NewsListSchema = z
  .array(NewsEntrySchema.extend({ id: z.string().regex(NEWS_ID, { message: 'id de novedad inválido' }) }))
  .max(MAX_ITEMS)
  .superRefine(unique((n) => n.id, 'id'))
  .superRefine((items, ctx) => {
    items.forEach((n, i) => {
      if (NEWS_ID.exec(n.id)?.[1] !== n.fecha) ctx.addIssue({ code: 'custom', message: 'la fecha no coincide con la del id', path: [i, 'fecha'] });
    });
  });

export const StartHereSchema = z.array(z.string().regex(SLUG, { message: 'slug inválido' })).max(12).superRefine(unique((s) => s, 'ficha'));

export const LIST_SCHEMAS = {
  news: NewsListSchema,
  polls: CuratedPollsSchema.pipe(z.array(z.any()).max(MAX_ITEMS)),
  videos: VideoLinksSchema.pipe(z.array(z.any()).max(MAX_ITEMS)),
  storyOrder: StoryOrderSchema.pipe(z.array(z.any()).max(MAX_ITEMS)),
  startHere: StartHereSchema,
  navigation: NavigationSchema,
} satisfies Record<ListKey, z.ZodType>;

/** Comprueba `value` con el esquema de la lista `key`. El único sitio donde lo validado pasa a su tipo. */
export function parseList<K extends ListKey>(key: K, value: unknown): { success: true; data: ListValues[K] } | { success: false; error: z.ZodError } {
  const parsed = LIST_SCHEMAS[key].safeParse(value);
  return parsed.success ? { success: true, data: parsed.data as ListValues[K] } : { success: false, error: parsed.error };
}

/**
 * La lista que ve la web: lo publicado en el panel si lo hay y es válido; si no, la de los archivos. Un documento
 * roto se ignora y se avisa por `onError`.
 */
export function overlayList<K extends ListKey>(key: K, fileValue: ListValues[K], published: unknown, onError: (message: string) => void = () => {}): ListValues[K] {
  if (published === null || published === undefined) return fileValue;
  const parsed = parseList(key, published);
  if (!parsed.success) {
    onError(`${key}: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
    return fileValue;
  }
  return parsed.data;
}

/** Id para una novedad nueva: su fecha y el título en minúsculas sin tildes. */
export function newsId(fecha: string, titulo: string): string {
  const slug = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return `${fecha}-${slug || 'novedad'}`;
}

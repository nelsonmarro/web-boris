/**
 * Esquemas del contenido del hub /comunidad (novedades y duelos curados) y de las relaciones vídeo ↔ ficha (`videos.json`).
 * Puro: solo imports relativos con extensión .ts (lo usan check:content y los tests con node:test).
 */
import { z } from 'zod';

/** Semana ISO `YYYY-Www` (W01–W53). */
export const WEEK_KEY_REGEX = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/;

/** Hosts externos de una novedad: solo YouTube, la única red que Boris ha confirmado (`SOCIAL_LINKS`). */
export const NEWS_HOSTS: readonly string[] = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];

const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug inválido' });

/** `duelo`: luchadores con stats (la Arena); `desclasificar`: expedientes sellados que la comunidad quiere ver primero. */
export const POLL_TIPOS = ['duelo', 'desclasificar'] as const;

export const CuratedPollSchema = z
  .object({
    semana: z.string().regex(WEEK_KEY_REGEX, { message: 'semana ISO inválida (YYYY-Www)' }),
    tipo: z.enum(POLL_TIPOS).default('duelo'),
    a: Slug,
    b: Slug,
    pregunta: z.string().min(3).max(80).optional(),
  })
  .refine((p) => p.a !== p.b, { message: 'a y b deben ser criaturas distintas' });

export const CuratedPollsSchema = z.array(CuratedPollSchema).superRefine((polls, ctx) => {
  const seen = new Set<string>();
  polls.forEach((p, i) => {
    if (seen.has(p.semana)) {
      ctx.addIssue({ code: 'custom', message: `semana repetida: ${p.semana}`, path: [i, 'semana'] });
    }
    seen.add(p.semana);
  });
});

export type CuratedPoll = z.infer<typeof CuratedPollSchema>;
export type PollTipo = CuratedPoll['tipo'];

/** gray-matter convierte `fecha: 2026-10-18` en Date: se normaliza a `YYYY-MM-DD`. */
const IsoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.iso.date(),
);

function isAllowedExternal(value: string): boolean {
  if (!value.startsWith('https://')) return false;
  try {
    const url = new URL(value);
    return !url.username && !url.password && NEWS_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

const NewsLink = z
  .string()
  .refine((v) => isAllowedExternal(v) || (v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\')), {
    message: 'el enlace debe ser interno (/…) o https:// de YouTube',
  });

export const NewsEntrySchema = z.object({
  fecha: IsoDate,
  titulo: z.string().min(3).max(90),
  resumen: z.string().min(3).max(160),
  enlace: NewsLink,
});

/** `id` = nombre del archivo sin extensión. */
export type NewsEntry = z.infer<typeof NewsEntrySchema> & { id: string };

/** Id de un vídeo de YouTube: 11 caracteres. */
export const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

/**
 * Relaciones manuales vídeo ↔ ficha («Aparece en»). Solo hechos: el vídeo nombra o muestra a esas fichas.
 * Las que salen del título del vídeo se calculan solas (`linkVideos`) y no hay que repetirlas aquí.
 * `titulo` es el título real del vídeo en YouTube: hace falta si el id no está en `FEATURED_VIDEOS` (el feed del
 * canal solo trae los últimos vídeos, así que un id fuera de ambos no tendría título que mostrar).
 */
export const VideoLinkSchema = z.object({
  id: z.string().regex(YOUTUBE_ID_REGEX, { message: 'id de YouTube inválido (11 caracteres [A-Za-z0-9_-])' }),
  fichas: z
    .array(Slug)
    .min(1, { message: 'indica al menos una ficha' })
    .superRefine((fichas, ctx) => {
      const seen = new Set<string>();
      fichas.forEach((slug, i) => {
        if (seen.has(slug)) ctx.addIssue({ code: 'custom', message: `ficha repetida: ${slug}`, path: [i] });
        seen.add(slug);
      });
    }),
  titulo: z.string().trim().min(1).max(200).optional(),
});

export const VideoLinksSchema = z.array(VideoLinkSchema).superRefine((links, ctx) => {
  const seen = new Set<string>();
  links.forEach((l, i) => {
    if (seen.has(l.id)) ctx.addIssue({ code: 'custom', message: `vídeo repetido: ${l.id}`, path: [i, 'id'] });
    seen.add(l.id);
  });
});

export type VideoLink = z.infer<typeof VideoLinkSchema>;

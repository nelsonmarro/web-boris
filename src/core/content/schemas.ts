/**
 * Esquemas del contenido del hub /comunidad (novedades y duelos curados).
 * Puro: solo imports relativos con extensión .ts (lo usan check:content y los tests con node:test).
 */
import { z } from 'zod';

/** Semana ISO `YYYY-Www` (W01–W53). */
export const WEEK_KEY_REGEX = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/;

const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug inválido' });

export const CuratedPollSchema = z
  .object({
    semana: z.string().regex(WEEK_KEY_REGEX, { message: 'semana ISO inválida (YYYY-Www)' }),
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

/** gray-matter convierte `fecha: 2026-10-18` en Date: se normaliza a `YYYY-MM-DD`. */
const IsoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.iso.date(),
);

const NewsLink = z
  .string()
  .refine((v) => v.startsWith('https://') || (v.startsWith('/') && !v.startsWith('//')), {
    message: 'el enlace debe ser interno (/…) o https://',
  });

export const NewsEntrySchema = z.object({
  fecha: IsoDate,
  titulo: z.string().min(3).max(90),
  resumen: z.string().min(3).max(160),
  enlace: NewsLink,
});

/** `id` = nombre del archivo sin extensión. */
export type NewsEntry = z.infer<typeof NewsEntrySchema> & { id: string };

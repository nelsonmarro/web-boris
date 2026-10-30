import { z } from "zod";

/** Máximo de preguntas frecuentes por ficha. */
export const FAQ_MAX = 10;

/**
 * Preguntas frecuentes de una ficha (`faq` del frontmatter): solo las que Boris haya respondido (canon), nunca
 * inventadas. Cada una, con `pregunta` y `respuesta` no vacías; como mucho `FAQ_MAX` y sin preguntas repetidas. Van al
 * final del cuerpo («Preguntas frecuentes») y en el JSON-LD `FAQPage`; no cuentan como apartados de la ficha.
 */
export const FaqSchema = z
  .array(
    z.object({
      pregunta: z.string().trim().min(1, { message: 'la pregunta está vacía' }),
      respuesta: z.string().trim().min(1, { message: 'la respuesta está vacía' }),
    }),
  )
  .max(FAQ_MAX, { message: `como mucho ${FAQ_MAX} preguntas por ficha` })
  .superRefine((faq, ctx) => {
    const seen = new Set<string>();
    faq.forEach((item, i) => {
      const key = item.pregunta.toLowerCase();
      if (seen.has(key)) ctx.addIssue({ code: 'custom', message: `pregunta repetida: ${item.pregunta}`, path: [i, 'pregunta'] });
      seen.add(key);
    });
  });

export type FaqItem = z.infer<typeof FaqSchema>[number];

// Zod v4: Use top-level format validators
export const WikiFrontmatterSchema = z.object({
  title: z.string(),
  universe: z.string(),
  image: z.url().or(z.string()).optional(), // Use z.url() if it's a full URL, otherwise string
  imageCaption: z.string().optional(),
  /** Valor CSS de `object-position` para el recorte de portada (p. ej. "50% 20%"). */
  imagePosition: z.string().optional(),
  category: z.string().optional(),
  /** `proximamente`: artículo sin lore canónico aún (chip + bloque en la ficha). */
  status: z.enum(['proximamente']).optional(),
  description: z.string().optional(),
  aliases: z.array(z.string().min(1)).optional(), // apodos canónicos (spec Ola B §6)
  related: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).optional(), // orden fijado a mano
  infobox: z.record(z.string(), z.record(z.string(), z.string())).optional(), // E.g. { "Información Biológica": { "Especie": "Labodotype macrostoma" } }
  faq: FaqSchema.optional(),
  stats: z.object({
    length: z.number().optional(), // in meters
    weight: z.string().optional(), // "20,000 toneladas"
    intelligence: z.number().min(1).max(10).optional(),
    hostility: z.number().min(1).max(10).optional(),
    power: z.number().min(0).max(100).optional(),
    defense: z.number().min(0).max(100).optional(),
    biteType: z.string().optional(),
    specialAbilities: z.array(z.string()).optional(),
  }).optional(),
});

export type WikiFrontmatter = z.infer<typeof WikiFrontmatterSchema>;

export interface WikiArticle {
  slug: string;
  frontmatter: WikiFrontmatter;
  content: string;
}

/** Versión ligera para listados, búsqueda y arena (sin `content`). */
export interface WikiArticleSummary {
  slug: string;
  frontmatter: WikiFrontmatter;
}

export const toSummary = (article: WikiArticle): WikiArticleSummary => ({
  slug: article.slug,
  frontmatter: article.frontmatter,
});

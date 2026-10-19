import { z } from "zod";

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

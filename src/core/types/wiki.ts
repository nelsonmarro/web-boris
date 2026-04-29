import { z } from "zod";

// Zod v4: Use top-level format validators
export const WikiFrontmatterSchema = z.object({
  title: z.string(),
  universe: z.string(),
  image: z.url().or(z.string()).optional(), // Use z.url() if it's a full URL, otherwise string
  imageCaption: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
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

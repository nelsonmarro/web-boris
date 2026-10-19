/**
 * Índice de entidades del archivo (spec Ola B §3). Puro: lo usan los enlaces
 * automáticos, el grafo de menciones y la búsqueda. Sin imports con alias `@/`.
 */
import { richness } from './discovery-order.ts';

export interface Word { raw: string; norm: string; start: number; end: number }

export interface IndexableArticle {
  slug: string;
  frontmatter: {
    title: string;
    universe: string;
    category?: string;
    status?: 'proximamente';
    image?: string;
    imagePosition?: string;
    description?: string;
    aliases?: string[];
    stats?: unknown;
    infobox?: Record<string, unknown>;
  };
}

export interface EntityEntry {
  slug: string;
  title: string;
  aliases: string[];
  category?: string;
  universe: string;
  status?: 'proximamente';
  image?: string;
  imagePosition?: string;
  description?: string;
  richness: number;
  linkable: boolean;
}

export interface NameEntry { slug: string; name: string; tokens: string[] }

export interface EntityIndex {
  entries: EntityEntry[];
  bySlug: Map<string, EntityEntry>;
  names: NameEntry[];
}

export interface Mention { slug: string; start: number; end: number; name: string }

/** Categorías con nombre propio: se enlazan. Directorios, categorías e historias, no. */
export const LINKABLE_CATEGORIES = new Set([
  'Coloso', 'Titán', 'Animal', 'Especie', 'Humano', 'Organización', 'Vehículo', 'Entidad', 'Libro',
]);

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export function wordsOf(text: string): Word[] {
  const words: Word[] = [];
  for (const m of text.matchAll(WORD_RE)) {
    const start = m.index ?? 0;
    words.push({ raw: m[0], norm: normalize(m[0]), start, end: start + m[0].length });
  }
  return words;
}

const tokensOf = (name: string) => wordsOf(name).map((w) => w.norm).filter(Boolean);

export function buildEntityIndex(articles: readonly IndexableArticle[]): EntityIndex {
  const entries: EntityEntry[] = articles.map(({ slug, frontmatter: fm }) => ({
    slug,
    title: fm.title,
    aliases: fm.aliases ?? [],
    category: fm.category,
    universe: fm.universe,
    status: fm.status,
    image: fm.image,
    imagePosition: fm.imagePosition,
    description: fm.description,
    richness: richness(fm),
    linkable: !!fm.category && LINKABLE_CATEGORIES.has(fm.category),
  }));
  const names: NameEntry[] = entries
    .filter((e) => e.linkable)
    .flatMap((e) => [e.title, ...e.aliases].map((name) => ({ slug: e.slug, name, tokens: tokensOf(name) })))
    .filter((n) => n.tokens.length > 0)
    .sort((a, b) => b.tokens.length - a.tokens.length || b.name.length - a.name.length);
  return { entries, bySlug: new Map(entries.map((e) => [e.slug, e])), names };
}

const startsUpper = (s: string) => /^\p{Lu}/u.test(s);

export function findMentions(text: string, index: EntityIndex, opts: { self?: string } = {}): Mention[] {
  const words = wordsOf(text);
  const mentions: Mention[] = [];
  let i = 0;
  while (i < words.length) {
    let matched: NameEntry | undefined;
    for (const n of index.names) {
      if (i + n.tokens.length > words.length) continue;
      let ok = true;
      for (let k = 0; k < n.tokens.length; k++) {
        if (words[i + k].norm !== n.tokens[k]) { ok = false; break; }
      }
      if (!ok) continue;
      if (n.tokens.length === 1 && !startsUpper(words[i].raw)) continue;
      matched = n;
      break;
    }
    if (matched) {
      // La propia ficha también gana y consume sus palabras (así "Vlad" no roba "Vlad Julia"); solo no se emite.
      if (matched.slug !== opts.self) {
        const last = words[i + matched.tokens.length - 1];
        mentions.push({ slug: matched.slug, start: words[i].start, end: last.end, name: matched.name });
      }
      i += matched.tokens.length;
    } else {
      i += 1;
    }
  }
  return mentions;
}

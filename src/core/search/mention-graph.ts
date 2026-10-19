import { findMentions, type EntityIndex } from './entity-index.ts';
import { extractBodyText, extractWikiLinks } from './extract-body-text.ts';

export interface MentionGraph { out: Map<string, Set<string>>; in: Map<string, Set<string>> }

/** Grafo dirigido "A menciona a B" (spec Ola B §7). Puro. */
export function buildMentionGraph(
  articles: readonly { slug: string; content: string }[],
  index: EntityIndex,
): MentionGraph {
  const out = new Map<string, Set<string>>();
  const inn = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    if (from === to || !index.bySlug.has(to)) return;
    if (!out.has(from)) out.set(from, new Set());
    if (!inn.has(to)) inn.set(to, new Set());
    out.get(from)!.add(to);
    inn.get(to)!.add(from);
  };
  for (const a of articles) {
    for (const m of findMentions(extractBodyText(a.content), index, { self: a.slug })) add(a.slug, m.slug);
    for (const s of extractWikiLinks(a.content)) add(a.slug, s);
  }
  return { out, in: inn };
}

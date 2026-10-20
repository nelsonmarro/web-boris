/**
 * Enlaza la 1.ª mención en prosa de cada entidad (spec Ola B §5).
 * Puro: imports relativos con `.ts` para que `node:test` lo cargue sin el alias `@/`.
 */
import { findMentions, type EntityIndex } from '../core/search/entity-index.ts';
import { WIKI_LINK } from '../core/search/wiki-routes.ts';

interface Node { type: string; value?: string; url?: string; name?: string; children?: Node[]; data?: { hProperties?: Record<string, string> } }

const SKIP_TYPES = new Set(['heading', 'link', 'linkReference', 'code', 'inlineCode', 'image', 'imageReference']);
const SKIP_JSX = new Set([
  'WikiImage', 'WikiGallery', 'WikiTOC', 'Proximamente', 'WikiInfobox', 'InfoField',
  // HTML escrito a mano en el MDX: enlaces (anidar un <a> es HTML inválido), código y títulos.
  'a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

/** Slugs a los que el autor ya enlazó a mano en cualquier punto de la ficha. */
function manualLinks(node: Node, into: Set<string>): Set<string> {
  if (node.type === 'link' && node.url) {
    const slug = WIKI_LINK.exec(node.url)?.[1];
    if (slug) into.add(slug);
  }
  node.children?.forEach((c) => manualLinks(c, into));
  return into;
}

export function remarkEntityLinks({ index, self }: { index: EntityIndex; self?: string }) {
  return (tree: Node) => {
    // La intención del autor gana a la automatización: lo que ya está enlazado a mano no se vuelve a enlazar.
    const linked = manualLinks(tree, new Set<string>());
    const visit = (node: Node) => {
      if (SKIP_TYPES.has(node.type)) return;
      if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name && SKIP_JSX.has(node.name)) return;
      if (!node.children) return;
      const next: Node[] = [];
      for (const child of node.children) {
        if (child.type !== 'text' || !child.value) {
          visit(child);
          next.push(child);
          continue;
        }
        const value = child.value;
        let cursor = 0;
        for (const m of findMentions(value, index, { self })) {
          if (linked.has(m.slug)) continue;
          linked.add(m.slug);
          if (m.start > cursor) next.push({ type: 'text', value: value.slice(cursor, m.start) });
          const entry = index.bySlug.get(m.slug)!;
          const hProperties: Record<string, string> = { 'data-entity': m.slug };
          if (entry.status === 'proximamente') hProperties['data-entity-pending'] = 'true';
          next.push({ type: 'link', url: `/wiki/${m.slug}`, children: [{ type: 'text', value: value.slice(m.start, m.end) }], data: { hProperties } });
          cursor = m.end;
        }
        if (cursor === 0) next.push(child);
        else if (cursor < value.length) next.push({ type: 'text', value: value.slice(cursor) });
      }
      node.children = next;
    };
    visit(tree);
  };
}

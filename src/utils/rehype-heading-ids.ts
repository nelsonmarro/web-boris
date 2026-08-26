import { createSlugger } from '@/utils/slugify';

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const HEADINGS = new Set(['h2', 'h3']);

function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

/**
 * Asigna `id` a h2/h3 en el árbol HAST para que las anclas y el scroll-spy
 * funcionen en el primer render (sin mutar el DOM en cliente).
 */
export function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const slug = createSlugger();
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName && HEADINGS.has(node.tagName)) {
        node.properties = node.properties ?? {};
        if (!node.properties.id) node.properties.id = slug(textOf(node));
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

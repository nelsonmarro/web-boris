/**
 * Fichas vecinas en el menú de la wiki, para «Anterior» / «Siguiente» (spec Ola C §5).
 * Puro: sin imports con alias `@/`; `NavGroupLike` es estructural y `WIKI_NAVIGATION` lo cumple tal cual.
 */
import { STATIC_WIKI_ROUTES } from './wiki-routes.ts';

export interface NavGroupLike {
  title: string;
  /** Los grupos de universo no tienen `url`; los grupos del menú que no son página llevan `#`. */
  url?: string;
  items?: readonly NavGroupLike[];
}

export interface NavLink { title: string; url: string }

export interface NavNeighbors {
  /** Título del grupo padre inmediato (`Animales`, `ELLOS LLEGARON`…), tal como está en el menú. */
  group: string;
  /** Ausente en un grupo de una sola ficha y en uno de dos (ahí solo hay `next`). */
  prev?: NavLink;
  /** Ausente solo en un grupo de una sola ficha. */
  next?: NavLink;
}

const STATIC_ROUTES: ReadonlySet<string> = new Set(STATIC_WIKI_ROUTES);

/**
 * Solo las fichas (`/wiki/<slug>`) son vecinas: ni `#` (grupos plegables), ni `/wiki` (la portada), ni las rutas
 * estáticas (`/wiki/arena`, `/wiki/registro`, `/wiki/aleatorio`), que no son una ficha.
 */
const isArticleLink = (item: NavGroupLike): item is NavGroupLike & { url: string } =>
  typeof item.url === 'string' && item.url.startsWith('/wiki/') && !STATIC_ROUTES.has(item.url);

function find(slug: string, nodes: readonly NavGroupLike[], group: string): NavNeighbors | null {
  const target = `/wiki/${slug}`;
  const siblings = nodes.filter(isArticleLink);
  const at = siblings.findIndex((s) => s.url === target);
  if (at !== -1) {
    // Un grupo con una sola ficha no tiene a dónde ir; con dos, anterior y siguiente serían la misma: solo «siguiente».
    if (siblings.length < 2) return { group };
    const link = (s: NavLink): NavLink => ({ title: s.title, url: s.url });
    if (siblings.length === 2) return { group, next: link(siblings[(at + 1) % 2]) };
    return {
      group,
      prev: link(siblings[(at - 1 + siblings.length) % siblings.length]),
      next: link(siblings[(at + 1) % siblings.length]),
    };
  }
  for (const node of nodes) {
    if (!node.items) continue;
    const found = find(slug, node.items, node.title);
    if (found) return found;
  }
  return null;
}

/**
 * Vecinos de `/wiki/<slug>` dentro de su grupo padre inmediato, con vuelta circular (en un grupo de dos, solo `next`).
 * `null` si la ficha no está en el menú. Si el slug aparece más de una vez, manda la primera aparición.
 */
export function navNeighbors(slug: string, nav: readonly NavGroupLike[]): NavNeighbors | null {
  if (!slug) return null;
  // Los grupos de primer nivel (universos) son ellos mismos el «padre» de sus elementos directos.
  for (const root of nav) {
    if (!root.items) continue;
    const found = find(slug, root.items, root.title);
    if (found) return found;
  }
  return null;
}

/** Minúsculas que se quedan así en un título en español («Capitán de Galeón»). */
const SMALL_WORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'o']);

/**
 * Nombre legible de un grupo: los universos del menú están en MAYÚSCULAS (`CAPITÁN DE GALEÓN`) y en una frase
 * serían un grito; se pasan a mayúscula inicial. Los títulos que ya vienen en minúsculas se dejan como están.
 */
export function groupLabel(title: string): string {
  if (title !== title.toLocaleUpperCase('es') || title === title.toLocaleLowerCase('es')) return title;
  return title
    .toLocaleLowerCase('es')
    .split(' ')
    .map((word, i) => (i > 0 && SMALL_WORDS.has(word) ? word : word.charAt(0).toLocaleUpperCase('es') + word.slice(1)))
    .join(' ');
}

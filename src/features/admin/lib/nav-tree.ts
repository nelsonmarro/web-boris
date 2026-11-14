/**
 * Operaciones del editor del menú sobre el árbol, sin mutarlo. Un camino es `[universo, entrada, subentrada…]`
 * (índices). Puro.
 */
import { flattenNav, NAV_MAX_DEPTH, type NavGroup, type NavItem } from '../../../core/content/navigation.ts';

export type NavPath = number[];

const children = (nav: NavGroup[], parent: NavPath): NavItem[] => {
  let items = nav[parent[0]].items;
  for (const index of parent.slice(1)) items = items[index].items ?? [];
  return items;
};

/** Sustituye la lista de entradas bajo `parent` (un universo o una entrada). */
function withChildren(nav: NavGroup[], parent: NavPath, next: NavItem[]): NavGroup[] {
  const replace = (items: NavItem[], rest: NavPath): NavItem[] =>
    rest.length === 0 ? next : items.map((item, i) => (i === rest[0] ? { ...item, items: replace(item.items ?? [], rest.slice(1)) } : item));
  return nav.map((group, g) => (g === parent[0] ? { ...group, items: replace(group.items, parent.slice(1)) } : group));
}

export const itemAt = (nav: NavGroup[], path: NavPath): NavItem => children(nav, path.slice(0, -1))[path.at(-1)!];

export function updateItem(nav: NavGroup[], path: NavPath, patch: Partial<NavItem>): NavGroup[] {
  const parent = path.slice(0, -1);
  return withChildren(nav, parent, children(nav, parent).map((item, i) => (i === path.at(-1) ? { ...item, ...patch } : item)));
}

export function removeItem(nav: NavGroup[], path: NavPath): NavGroup[] {
  const parent = path.slice(0, -1);
  const next = withChildren(nav, parent, children(nav, parent).filter((_, i) => i !== path.at(-1)));
  // Una entrada que se queda sin subentradas pierde la lista vacía.
  if (parent.length > 1 && children(next, parent).length === 0) return updateItem(next, parent, { items: undefined });
  return next;
}

export function moveItem(nav: NavGroup[], path: NavPath, delta: number): NavGroup[] {
  const parent = path.slice(0, -1);
  const items = [...children(nav, parent)];
  const from = path.at(-1)!;
  const to = from + delta;
  if (to < 0 || to >= items.length) return nav;
  const [item] = items.splice(from, 1);
  items.splice(to, 0, item);
  return withChildren(nav, parent, items);
}

/** Añade `item` al final de `parent` (un universo `[g]` o una entrada). */
export const addItem = (nav: NavGroup[], parent: NavPath, item: NavItem): NavGroup[] => withChildren(nav, parent, [...children(nav, parent), item]);

/** ¿Puede `path` tener subentradas sin pasar de `NAV_MAX_DEPTH`? (`[g]` es un universo: sí). */
export const canHaveChildren = (path: NavPath): boolean => path.length <= NAV_MAX_DEPTH;

/** Sitios donde se puede añadir una ficha: cada universo y cada entrada que admite subentradas, con su nombre. */
export function destinations(nav: NavGroup[]): { path: NavPath; label: string }[] {
  const out: { path: NavPath; label: string }[] = [];
  const walk = (items: NavItem[], path: NavPath, label: string[]) =>
    items.forEach((item, i) => {
      const here = [...path, i];
      if (canHaveChildren(here) && (item.url === '#' || item.items?.length)) {
        out.push({ path: here, label: [...label, item.title].join(' › ') });
        walk(item.items ?? [], here, [...label, item.title]);
      }
    });
  nav.forEach((group, g) => {
    out.push({ path: [g], label: group.title });
    walk(group.items, [g], [group.title]);
  });
  return out;
}

export const pathKey = (path: NavPath) => path.join('.');

const samePath = (a: NavPath, b: NavPath) => a.length === b.length && a.every((value, i) => value === b[i]);
const isPrefix = (prefix: NavPath, path: NavPath) => prefix.length <= path.length && prefix.every((value, i) => value === path[i]);
/** Niveles que cuelgan de una entrada: 0 si no tiene subentradas. */
const height = (item: NavItem): number => (item.items?.length ? 1 + Math.max(...item.items.map(height)) : 0);

/**
 * Sitios a los que se puede mover la entrada `from` con todo lo que lleva dentro: los destinos que no están dentro de
 * ella ni son su sitio actual, y en los que no pasa de `NAV_MAX_DEPTH`.
 */
export function moveTargets(nav: NavGroup[], from: NavPath): { path: NavPath; label: string }[] {
  const levels = height(itemAt(nav, from));
  const parent = from.slice(0, -1);
  return destinations(nav).filter((target) => !isPrefix(from, target.path) && !samePath(target.path, parent) && target.path.length + levels <= NAV_MAX_DEPTH);
}

/** Mueve la entrada `from` al final de `to` (uno de `moveTargets`). Si `to` no vale, devuelve el menú igual. */
export function moveItemTo(nav: NavGroup[], from: NavPath, to: NavPath): NavGroup[] {
  if (!moveTargets(nav, from).some((target) => samePath(target.path, to))) return nav;
  const item = itemAt(nav, from);
  const parent = from.slice(0, -1);
  // Al quitar `from`, sus hermanos de detrás suben un puesto: si `to` cuelga de uno de ellos, su índice baja en uno.
  const target = [...to];
  if (isPrefix(parent, to) && to.length > parent.length && to[parent.length] > from.at(-1)!) target[parent.length] -= 1;
  return addItem(removeItem(nav, from), target, item);
}

export interface ArticlePlace {
  slug: string;
  universe: string;
  category?: string;
}

const slugOf = (url: string) => (url.startsWith('/wiki/') ? url.slice('/wiki/'.length) : null);

/**
 * Dónde sugerir una ficha nueva en el menú: el destino con más fichas de su misma categoría y universo colgando
 * directamente de él; si no hay ninguno, el universo del menú con más fichas de su universo. `null` si no hay pista.
 */
export function suggestDestination(nav: NavGroup[], article: Omit<ArticlePlace, 'slug'>, articles: readonly ArticlePlace[]): NavPath | null {
  const bySlug = new Map(articles.map((place) => [place.slug, place]));
  const placeOf = (item: NavItem) => {
    const slug = slugOf(item.url);
    return slug ? bySlug.get(slug) : undefined;
  };
  let best: { path: NavPath; score: number } | null = null;
  if (article.category) {
    for (const { path } of destinations(nav)) {
      const score = children(nav, path).filter((item) => {
        const place = placeOf(item);
        return place?.universe === article.universe && place.category === article.category;
      }).length;
      if (score > (best?.score ?? 0)) best = { path, score };
    }
  }
  if (best) return best.path;
  nav.forEach((group, g) => {
    const score = flattenNav([group]).filter(({ item }) => placeOf(item)?.universe === article.universe).length;
    if (score > (best?.score ?? 0)) best = { path: [g], score };
  });
  return (best as { path: NavPath } | null)?.path ?? null;
}

/** Entrada del editor con una clave estable (para plegar y editar sin depender de su posición). No se publica. */
export interface KeyedItem extends NavItem {
  key: string;
  items?: KeyedItem[];
}
export interface KeyedGroup extends NavGroup {
  key: string;
  items: KeyedItem[];
}

export function withKeys(nav: readonly NavGroup[], nextKey: () => string): KeyedGroup[] {
  const keyItem = ({ items, ...rest }: NavItem): KeyedItem => ({ ...rest, key: nextKey(), ...(items ? { items: items.map(keyItem) } : {}) });
  return nav.map((group) => ({ ...group, key: nextKey(), items: group.items.map(keyItem) }));
}

/** El menú tal como se publica: sin las claves del editor. */
export function withoutKeys(nav: readonly NavGroup[]): NavGroup[] {
  const strip = (item: NavItem): NavItem => {
    const { title, url, icon, items } = item;
    return { title, url, ...(icon ? { icon } : {}), ...(items ? { items: items.map(strip) } : {}) };
  };
  return nav.map((group) => ({ title: group.title, items: group.items.map(strip) }));
}

/** Claves del universo y de las entradas que hay que desplegar para ver `path`. */
export function keysAlong(nav: readonly KeyedGroup[], path: NavPath): string[] {
  const keys = [nav[path[0]].key];
  let items: KeyedItem[] = nav[path[0]].items;
  for (const index of path.slice(1)) {
    const item = items[index];
    if (!item) break;
    keys.push(item.key);
    items = item.items ?? [];
  }
  return keys;
}

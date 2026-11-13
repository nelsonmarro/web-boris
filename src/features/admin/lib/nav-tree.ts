/**
 * Operaciones del editor del menú sobre el árbol, sin mutarlo. Un camino es `[universo, entrada, subentrada…]`
 * (índices). Puro.
 */
import { NAV_MAX_DEPTH, type NavGroup, type NavItem } from '../../../core/content/navigation.ts';

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

/**
 * Menú lateral de la wiki como datos (spec CMS fase 5b): lo edita el panel y lo leen el menú, «Anterior / Siguiente»
 * y los relacionados. Los iconos van por nombre (el cliente los convierte en componentes con `NAV_ICON_COMPONENTS`).
 * Puro: imports relativos con `.ts`.
 */
import { z } from 'zod';
import { STATIC_WIKI_ROUTES } from '../search/wiki-routes.ts';

/** Iconos que puede llevar una entrada del menú (nombres de lucide en minúsculas). */
export const NAV_ICON_NAMES = ['monitor', 'book-open', 'book', 'skull', 'microscope', 'ghost', 'car-front', 'shield', 'swords', 'ship'] as const;
export type NavIconName = (typeof NAV_ICON_NAMES)[number];

export interface NavItem {
  title: string;
  /** `/wiki`, `/wiki/<slug>`, una ruta propia de la wiki o `#` (grupo que solo despliega). */
  url: string;
  icon?: NavIconName;
  items?: NavItem[];
}

export interface NavGroup {
  /** Universo (en mayúsculas en el menú, p. ej. «UNIVERSO COLOSOS»). */
  title: string;
  items: NavItem[];
}

/** Profundidad máxima bajo un universo: entrada → subentrada → ficha (como «Personajes › Animales › The Bloop»). */
export const NAV_MAX_DEPTH = 3;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STATIC_ROUTES: ReadonlySet<string> = new Set(['/wiki', ...STATIC_WIKI_ROUTES]);

export const isNavUrl = (url: string): boolean =>
  url === '#' || STATIC_ROUTES.has(url) || (url.startsWith('/wiki/') && SLUG.test(url.slice('/wiki/'.length)));

const itemSchema = (depth: number): z.ZodType<NavItem> =>
  z.object({
    title: z.string().trim().min(1, { message: 'falta el nombre' }).max(80),
    url: z.string().refine(isNavUrl, { message: 'el enlace debe ser una ficha (/wiki/…), /wiki o # para un grupo' }),
    icon: z.enum(NAV_ICON_NAMES).optional(),
    items:
      depth < NAV_MAX_DEPTH
        ? z.lazy(() => z.array(itemSchema(depth + 1)).max(60)).optional()
        : z.undefined({ message: `como mucho ${NAV_MAX_DEPTH} niveles` }).optional(),
  }) as z.ZodType<NavItem>;

export const NavigationSchema = z
  .array(z.object({ title: z.string().trim().min(1, { message: 'falta el nombre del universo' }).max(60), items: z.array(itemSchema(1)).max(60) }))
  .max(20);

/** Todas las entradas del menú, en orden, con su camino («Personajes › Animales»). */
export function flattenNav(nav: readonly NavGroup[]): { item: NavItem; path: string[] }[] {
  const out: { item: NavItem; path: string[] }[] = [];
  const walk = (items: readonly NavItem[], path: string[]) => {
    for (const item of items) {
      out.push({ item, path });
      if (item.items) walk(item.items, [...path, item.title]);
    }
  };
  for (const group of nav) walk(group.items, [group.title]);
  return out;
}

/** Slugs de las fichas que salen en el menú. */
export const navSlugs = (nav: readonly NavGroup[]): Set<string> =>
  new Set(flattenNav(nav).map(({ item }) => item.url).filter((url) => url.startsWith('/wiki/') && !STATIC_ROUTES.has(url)).map((url) => url.slice('/wiki/'.length)));

/** Enlaces a fichas que no existen y fichas repetidas en el menú (Anterior/Siguiente se liaría). */
export function navigationProblems(nav: readonly NavGroup[], articleSlugs: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const { item, path } of flattenNav(nav)) {
    const where = [...path, item.title].join(' › ');
    if (item.url === '#' && !item.items?.length) problems.push(`«${where}» es un grupo sin entradas: añade alguna o enlázalo a una ficha.`);
    if (!item.url.startsWith('/wiki/') || STATIC_ROUTES.has(item.url)) continue;
    const slug = item.url.slice('/wiki/'.length);
    if (!articleSlugs.has(slug)) problems.push(`«${where}» enlaza a una ficha que no existe (${slug}).`);
    if (seen.has(slug)) problems.push(`La ficha ${slug} está dos veces en el menú («${where}»).`);
    seen.add(slug);
  }
  return problems;
}

/** Fichas publicadas que todavía no salen en el menú. */
export const unlistedSlugs = (nav: readonly NavGroup[], articleSlugs: Iterable<string>): string[] => {
  const listed = navSlugs(nav);
  return [...articleSlugs].filter((slug) => !listed.has(slug));
};

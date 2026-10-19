/** Filtro puro del catálogo de la wiki (spec #55 §4). */
import { TIPOS, tipoOf, type TipoId } from './tipos.ts';

type Item = { frontmatter: { category?: string; universe: string } };

/** Páginas índice (directorios y páginas de categoría): viven en el menú lateral, no en el catálogo. */
const isHub = (i: Item) => i.frontmatter.category === 'Directorio' || i.frontmatter.category === 'Categoría';

export function catalogFilter<T extends Item>(items: readonly T[], f: { tipo?: TipoId; universe?: string }): T[] {
  return items.filter(
    (i) =>
      !isHub(i) &&
      (!f.tipo || tipoOf(i.frontmatter.category) === f.tipo) &&
      (!f.universe || i.frontmatter.universe === f.universe),
  );
}

export function tipoCounts(items: readonly Item[]): { id: TipoId; label: string; count: number }[] {
  return TIPOS.map((t) => ({
    id: t.id,
    label: t.label,
    count: items.filter((i) => !isHub(i) && tipoOf(i.frontmatter.category) === t.id).length,
  })).filter((t) => t.count > 0);
}

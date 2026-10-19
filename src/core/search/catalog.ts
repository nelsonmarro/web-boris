/** Filtro puro del catálogo de la wiki (spec #55 §4). */
import { TIPOS, tipoOf, type TipoId } from './tipos.ts';

type Item = { frontmatter: { category?: string; universe: string } };

const isDirectory = (i: Item) => i.frontmatter.category === 'Directorio';

export function catalogFilter<T extends Item>(items: readonly T[], f: { tipo?: TipoId; universe?: string }): T[] {
  return items.filter(
    (i) =>
      !isDirectory(i) &&
      (!f.tipo || tipoOf(i.frontmatter.category) === f.tipo) &&
      (!f.universe || i.frontmatter.universe === f.universe),
  );
}

export function tipoCounts(items: readonly Item[]): { id: TipoId; label: string; count: number }[] {
  return TIPOS.map((t) => ({
    id: t.id,
    label: t.label,
    count: items.filter((i) => !isDirectory(i) && tipoOf(i.frontmatter.category) === t.id).length,
  })).filter((t) => t.count > 0);
}

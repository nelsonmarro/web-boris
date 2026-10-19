/**
 * Registro del archivo (spec Ola C §5): qué expedientes ve el fan y cuántos ha abierto.
 * Puro (imports relativos, sin `@/`): el estado de «vistos» vive en el navegador y llega por parámetro.
 */
import { isIndexCategory } from './catalog.ts';
import type { EntityEntry } from './entity-index.ts';
import { TIPOS, tipoOf, type TipoId } from './tipos.ts';

/** Lo mínimo que necesita el recuento: el cliente recibe solo los slugs, no las fichas enteras. */
export type RegistroEntry = Pick<EntityEntry, 'slug'> & Partial<Pick<EntityEntry, 'status' | 'category'>>;

export interface RegistroGroup {
  tipo: TipoId;
  label: string;
  items: EntityEntry[];
}

/** Un expediente cuenta para el progreso si no es un índice (Directorio/Categoría) ni está sellado (`proximamente`). */
const counts = (e: RegistroEntry) => e.status !== 'proximamente' && !isIndexCategory(e.category);

/**
 * Todas las fichas del registro agrupadas por tipo (en el orden de `TIPOS`, sin grupos vacíos) y, dentro
 * de cada grupo, de más a menos ricas (a igualdad, por título). Los índices quedan fuera; los sellados
 * salen (al final por su `richness`) aunque no cuenten para el progreso.
 */
export function registroEntries(entries: readonly EntityEntry[]): RegistroGroup[] {
  return TIPOS.map((t) => ({
    tipo: t.id,
    label: t.label,
    items: entries
      .filter((e) => !isIndexCategory(e.category) && tipoOf(e.category) === t.id)
      .sort((a, b) => b.richness - a.richness || a.title.localeCompare(b.title, 'es')),
  })).filter((g) => g.items.length > 0);
}

/** Slugs de los expedientes que cuentan para el progreso; es lo único que necesita el cliente para contar. */
export function registroSlugs(entries: readonly RegistroEntry[]): string[] {
  return entries.filter(counts).map((e) => e.slug);
}

/** Cuántos expedientes cuentan para el progreso: los que no son `proximamente` ni índice. */
export function registroTotal(entries: readonly RegistroEntry[]): number {
  return registroSlugs(entries).length;
}

/**
 * Progreso del fan. `seen` mapea slug → fecha ISO de la primera apertura. Solo cuentan los vistos que
 * existen en el archivo y no están sellados ni son índices, así que `opened` nunca supera a `total`.
 */
export function progress(
  entries: readonly RegistroEntry[],
  seen: Readonly<Record<string, string>>,
): { opened: number; total: number } {
  const slugs = new Set(registroSlugs(entries));
  const opened = Object.keys(seen).filter((slug) => slugs.has(slug)).length;
  return { opened, total: slugs.size };
}

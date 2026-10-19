/**
 * Orden de descubrimiento: las fichas con más contenido primero, los stubs
 * ("próximamente") y los directorios al final. Módulo puro (sin imports en
 * tiempo de ejecución) para poder probarlo con node:test.
 */
export interface DiscoveryFields {
  title: string;
  status?: string;
  category?: string;
  image?: string;
  stats?: unknown;
  infobox?: Record<string, unknown>;
  description?: string;
  /** Riqueza ya calculada (p. ej. las entradas del índice de entidades); evita recalcularla. */
  richness?: number;
}

const BRAND_IMAGE_PREFIX = '/assets/Branding/';

export function richness(fm: Omit<DiscoveryFields, 'title'>): number {
  let score = 0;
  if (fm.status === 'proximamente') score -= 100;
  if (fm.category === 'Directorio' || fm.category === 'Categoría') score -= 2;
  if (fm.stats) score += 2;
  if (fm.image && !fm.image.startsWith(BRAND_IMAGE_PREFIX)) score += 1;
  if (fm.infobox && Object.keys(fm.infobox).length > 0) score += 1;
  return score;
}

export function compareDiscovery(a: DiscoveryFields, b: DiscoveryFields): number {
  const ra = a.richness ?? richness(a);
  const rb = b.richness ?? richness(b);
  return rb - ra || a.title.localeCompare(b.title, 'es');
}

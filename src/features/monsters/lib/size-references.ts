/**
 * Longitudes para la escala (`/wiki/escala`) y el juego «¿Quién mide más?» (`/wiki/tamanos`), spec UX fase 2 §3–§4.
 * Puro (sin imports de alias): lo prueban los tests de node:test.
 *
 * Dos clases de entrada que nunca se mezclan en el texto: las criaturas del archivo (lore: `stats.length` de cada ficha,
 * contrastado con la `Longitud` de su infobox) y las referencias del mundo real, que NO son lore y se rotulan siempre
 * como «Referencia real».
 *
 * Se compara LONGITUD (lo que mide de punta a punta), no «tamaño»: el canon distingue «el animal más largo» (El Gran Majá)
 * de «el animal más grande» (Vlad Julia, más corto pero más corpulento).
 */

/** Qué mide el número: las criaturas y la ballena, de largo; el barco, de proa a popa; los edificios, de alto. */
export type SizeDimension = 'longitud' | 'eslora' | 'altura';

/**
 * Cómo de seguro es el número, tal como lo escribe la fuente:
 * - `exact`: «675 metros»;
 * - `approx`: «~300 metros», «alrededor de 300», «aproximadamente 200» (y la ballena azul, «≈ 30 m»);
 * - `atLeast`: cota inferior, «500+ metros», «más de 500 metros».
 */
export type SizePrecision = 'exact' | 'approx' | 'atLeast';

export interface SizeEntry {
  /** Slug de la ficha (criaturas) o id de la referencia real (`ref-…`). Único en el conjunto. */
  id: string;
  name: string;
  /** El número de la fuente: el valor exacto, el aproximado o la cota inferior. */
  meters: number;
  precision: SizePrecision;
  dimension: SizeDimension;
  kind: 'criatura' | 'real';
  /** Solo criaturas: `/wiki/<slug>`. */
  href?: string;
  /** Solo criaturas: `image` del frontmatter tal cual (la portada utilizable se decide con `coverOf` al pintar). */
  image?: string;
  imagePosition?: string;
  category?: string;
}

export interface RealReference extends SizeEntry {
  kind: 'real';
}

/**
 * Referencias reales (datos comunes del mundo real, no del lore), de la spec UX fase 2 §3. Los ids llevan el prefijo
 * `ref-` para no chocar con un slug de ficha. La ballena azul es aproximada (adulta grande, unos 30 m).
 */
export const SIZE_REFERENCES: readonly RealReference[] = [
  { id: 'ref-ballena-azul', name: 'Ballena azul', meters: 30, precision: 'approx', dimension: 'longitud', kind: 'real' },
  { id: 'ref-titanic', name: 'RMS Titanic', meters: 269, precision: 'exact', dimension: 'eslora', kind: 'real' },
  { id: 'ref-torre-eiffel', name: 'Torre Eiffel', meters: 330, precision: 'exact', dimension: 'altura', kind: 'real' },
  { id: 'ref-empire-state', name: 'Empire State Building', meters: 443, precision: 'exact', dimension: 'altura', kind: 'real' },
  { id: 'ref-burj-khalifa', name: 'Burj Khalifa', meters: 828, precision: 'exact', dimension: 'altura', kind: 'real' },
];

/** Lo que hace falta de una ficha (forma estructural de `WikiArticle`/`WikiArticleSummary`). */
export interface SizeSource {
  slug: string;
  frontmatter: {
    title: string;
    status?: string;
    category?: string;
    image?: string;
    imagePosition?: string;
    infobox?: Record<string, Record<string, string>>;
    stats?: { length?: number };
  };
}

const validLength = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const AT_LEAST = /\+|\bmás de\b|\bmayor (?:a|de)\b|\bal menos\b|\bcomo mínimo\b/i;
const APPROX = /~|≈|\balrededor de\b|\baproximadamente\b|\baprox\.?|\bunos\b|\bcerca de\b|\bcasi\b/i;

/**
 * Lee una longitud escrita en el canon («675 metros», «~300 metros», «500+ metros», «más de 500 metros»…): el número
 * (admite separador de miles «1.200» y decimales «12,5») y su precisión. `null` si no hay número.
 */
export function parseCanonicalLength(text: string): { meters: number; precision: SizePrecision } | null {
  const match = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/.exec(text);
  if (!match) return null;
  const meters = Number(match[0].replace(/\./g, '').replace(',', '.'));
  if (!validLength(meters)) return null;
  const precision: SizePrecision = AT_LEAST.test(text) ? 'atLeast' : APPROX.test(text) ? 'approx' : 'exact';
  return { meters, precision };
}

/** El campo `Longitud` del infobox, en la sección que sea. */
export function infoboxLength(infobox: SizeSource['frontmatter']['infobox']): string | undefined {
  for (const section of Object.values(infobox ?? {})) {
    for (const [key, value] of Object.entries(section)) {
      if (key.trim().toLowerCase() === 'longitud') return value;
    }
  }
  return undefined;
}

/**
 * Criaturas con longitud canónica, de mayor a menor (a igual número, por título). Entran las fichas no selladas
 * (`status: proximamente` aún no tienen lore) con `stats.length` > 0. La precisión sale de la `Longitud` del infobox
 * (el texto canónico: «~300 metros», «500+ metros»); si el infobox da OTRO número, la ficha se queda fuera (dato
 * contradictorio: mejor no jugar con él). Sin `Longitud` en el infobox, `stats.length` cuenta como exacta.
 */
export function creatureSizeEntries(articles: readonly SizeSource[]): SizeEntry[] {
  const out: SizeEntry[] = [];
  for (const a of articles) {
    const fm = a.frontmatter;
    const length = fm.stats?.length;
    if (fm.status === 'proximamente' || !validLength(length)) continue;
    const text = infoboxLength(fm.infobox);
    const canon = text === undefined ? { meters: length, precision: 'exact' as const } : parseCanonicalLength(text);
    if (!canon || canon.meters !== length) continue;
    out.push({
      id: a.slug,
      name: fm.title,
      meters: length,
      precision: canon.precision,
      dimension: 'longitud',
      kind: 'criatura',
      href: `/wiki/${a.slug}`,
      image: fm.image,
      imagePosition: fm.imagePosition,
      category: fm.category,
    });
  }
  return out.sort(bySizeDesc);
}

/** De mayor a menor; a igual número, las criaturas antes que las referencias y luego por nombre (orden estable). */
export function bySizeDesc(a: SizeEntry, b: SizeEntry): number {
  if (b.meters !== a.meters) return b.meters - a.meters;
  if (a.kind !== b.kind) return a.kind === 'criatura' ? -1 : 1;
  return a.name.localeCompare(b.name, 'es');
}

/** Criaturas y referencias reales en una sola lista, de mayor a menor. */
export function withReferences(
  creatures: readonly SizeEntry[],
  references: readonly SizeEntry[] = SIZE_REFERENCES,
): SizeEntry[] {
  return [...creatures, ...references].sort(bySizeDesc);
}

/** Ancho de la barra (0-100 %) respecto a la entrada más grande. Nunca menos de `min` para que se vea. */
export function barPercent(meters: number, maxMeters: number, min = 1): number {
  if (!(maxMeters > 0) || !Number.isFinite(meters) || meters <= 0) return 0;
  return Math.max(min, Math.min(100, (meters / maxMeters) * 100));
}

/** Como lo escribe la fuente: «675 m», «≈ 300 m», «más de 500 m». */
export function formatMeters(entry: Pick<SizeEntry, 'meters' | 'precision'>): string {
  const n = `${entry.meters.toLocaleString('es-ES')} m`;
  if (entry.precision === 'approx') return `≈ ${n}`;
  if (entry.precision === 'atLeast') return `más de ${n}`;
  return n;
}

/** «675 m de longitud», «≈ 300 m de longitud», «más de 500 m de longitud», «828 m de altura». */
export function formatSize(entry: Pick<SizeEntry, 'meters' | 'precision' | 'dimension'>): string {
  return `${formatMeters(entry)} de ${entry.dimension}`;
}

import type { MentionGraph } from './mention-graph.ts';

export interface RankInput {
  slug: string;
  curated?: readonly string[];
  graph: MentionGraph;
  siblings: readonly string[];
  sameCategory: readonly string[];
  sameUniverse: readonly string[];
  isDirectory: (s: string) => boolean;
  isStub: (s: string) => boolean;
  /** Peso dentro de cada grupo de menciones (p. ej. riqueza de la ficha): mayor primero, orden estable. */
  weight?: (s: string) => number;
  max?: number;
}

/**
 * Orden de los relacionados (spec Ola B §7): curados → menciones mutuas → salientes →
 * entrantes → hermanos del menú → misma categoría → mismo universo. Sin duplicados,
 * sin directorios ni la propia ficha; los Próximamente al final y el corte a `max` después. Puro.
 */
export function rankRelated({
  slug,
  curated = [],
  graph,
  siblings,
  sameCategory,
  sameUniverse,
  isDirectory,
  isStub,
  weight,
  max = 6,
}: RankInput): string[] {
  const out = graph.out.get(slug) ?? new Set<string>();
  const inn = graph.in.get(slug) ?? new Set<string>();
  // Dentro de cada grupo de menciones, las fichas más completas primero (sort estable).
  const byWeight = (list: string[]) => (weight ? [...list].sort((a, b) => weight(b) - weight(a)) : list);
  const mutual = byWeight([...out].filter((s) => inn.has(s)));
  const onlyOut = byWeight([...out].filter((s) => !inn.has(s)));
  const onlyIn = byWeight([...inn].filter((s) => !out.has(s)));
  const seen = new Set<string>([slug]);
  const ordered: string[] = [];
  for (const s of [...curated, ...mutual, ...onlyOut, ...onlyIn, ...siblings, ...sameCategory, ...sameUniverse]) {
    if (seen.has(s) || isDirectory(s)) continue;
    seen.add(s);
    ordered.push(s);
  }
  return [...ordered.filter((s) => !isStub(s)), ...ordered.filter(isStub)].slice(0, max);
}

import type { WikiArticleSummary } from '@/core/types/wiki';
import type { WikiStats } from '@/features/monsters/lib/stats';

export interface Fighter extends WikiArticleSummary {
  frontmatter: WikiArticleSummary['frontmatter'] & { stats: WikiStats };
}

export const MAX_LENGTH_M = 700;

/** Puntaje determinista 0-100 (pesos: poder .35, defensa .25, hostilidad .15, escala .15, inteligencia .10). */
export function scoreFighter(stats: WikiStats): number {
  const power = stats.power ?? 0;
  const defense = stats.defense ?? 0;
  const hostility = (stats.hostility ?? 0) * 10;
  const scale = Math.min((stats.length ?? 0) / MAX_LENGTH_M, 1) * 100;
  const intelligence = (stats.intelligence ?? 0) * 10;
  return 0.35 * power + 0.25 * defense + 0.15 * hostility + 0.15 * scale + 0.1 * intelligence;
}

export interface Matchup {
  scoreA: number;
  scoreB: number;
  /** Probabilidad de victoria de A (0-1). */
  probA: number;
  /** Eje donde A supera más a B (o viceversa). */
  decisiveAxis: { label: string; delta: number };
}

const AXES: Array<{ key: keyof WikiStats; label: string; scale: (v: number) => number }> = [
  { key: 'power', label: 'Poder', scale: (v) => v },
  { key: 'defense', label: 'Defensa', scale: (v) => v },
  { key: 'hostility', label: 'Hostilidad', scale: (v) => v * 10 },
  { key: 'intelligence', label: 'Inteligencia', scale: (v) => v * 10 },
  { key: 'length', label: 'Escala', scale: (v) => Math.min(v / MAX_LENGTH_M, 1) * 100 },
];

export function radarValues(stats: WikiStats): Array<{ label: string; value: number }> {
  return AXES.map(({ key, label, scale }) => {
    const raw = stats[key];
    return { label, value: typeof raw === 'number' ? scale(raw) : 0 };
  });
}

export function computeMatchup(a: WikiStats, b: WikiStats): Matchup {
  const scoreA = scoreFighter(a);
  const scoreB = scoreFighter(b);
  const total = scoreA + scoreB;
  const probA = total === 0 ? 0.5 : scoreA / total;

  const va = radarValues(a);
  const vb = radarValues(b);
  let decisive = { label: va[0].label, delta: 0 };
  va.forEach((axis, i) => {
    const delta = axis.value - vb[i].value;
    if (Math.abs(delta) > Math.abs(decisive.delta)) decisive = { label: axis.label, delta };
  });

  return { scoreA, scoreB, probA, decisiveAxis: decisive };
}

export type SilhouetteKind = 'anguila' | 'cetaceo' | 'acorazado' | 'pez';

/** Forma genérica por criatura para el comparador de escala (sin arte por ejemplar). */
export const SILHOUETTE_BY_SLUG: Record<string, SilhouetteKind> = {
  'el-gran-maja': 'anguila',
  'the-bloop': 'cetaceo',
  bogbo: 'cetaceo',
  'slowdown-criyote': 'pez',
  'vlad-julia': 'acorazado',
  'le-mug': 'pez',
};

export const silhouetteFor = (slug: string): SilhouetteKind => SILHOUETTE_BY_SLUG[slug] ?? 'pez';

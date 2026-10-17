import type { WikiFrontmatter } from '@/core/types/wiki';

export type WikiStats = NonNullable<WikiFrontmatter['stats']>;

export type ThreatTone = 'green' | 'amber' | 'red';

export interface ThreatLevel {
  label: 'Bajo' | 'Moderado' | 'Extremo';
  tone: ThreatTone;
  text: string;
}

/** Nivel de amenaza derivado de la hostilidad (1-10). */
export function getThreatLevel(hostility: number | undefined): ThreatLevel | null {
  if (hostility === undefined || Number.isNaN(hostility)) return null;
  if (hostility <= 3) {
    return { label: 'Bajo', tone: 'green', text: 'Sin registro de agresión hacia humanos.' };
  }
  if (hostility <= 6) {
    return { label: 'Moderado', tone: 'amber', text: 'Reacciona ante estímulos; mantener distancia.' };
  }
  return { label: 'Extremo', tone: 'red', text: 'Evitar todo contacto. Protocolo de evacuación activo.' };
}

/** Escala 1-10 → 0-100 para las barras. */
export function scaleTen(value: number | undefined): number {
  if (value === undefined) return 0;
  return Math.max(0, Math.min(100, value * 10));
}

export function hasStats(
  frontmatter: WikiFrontmatter,
): frontmatter is WikiFrontmatter & { stats: WikiStats } {
  return !!frontmatter.stats && Object.keys(frontmatter.stats).length > 0;
}

export const THREAT_TONE_CLASSES: Record<ThreatTone, { badge: string; dot: string }> = {
  green: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
  },
  amber: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]',
  },
  red: {
    badge: 'bg-red-500/15 text-red-300 border-red-500/40',
    dot: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]',
  },
};

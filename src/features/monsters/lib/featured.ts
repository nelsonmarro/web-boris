import type { WikiArticle, WikiArticleSummary } from '@/core/types/wiki';
import { toSummary } from '@/core/types/wiki';
import { hasStats } from './stats';

/** Semana ISO (1–53) para rotar contenido sin rebuild. */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Criatura destacada de la semana: misma elección en landing y hub. */
export function pickFeatured(articles: WikiArticle[], date = new Date()): WikiArticleSummary | null {
  const candidates = articles.filter((a) => hasStats(a.frontmatter));
  if (candidates.length === 0) return null;
  return toSummary(candidates[isoWeek(date) % candidates.length]);
}

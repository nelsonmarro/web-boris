import type { WikiArticle, WikiArticleSummary } from '@/core/types/wiki';
import { toSummary } from '@/core/types/wiki';
import { isoWeekNumber } from '@/core/content/iso-week';
import { hasStats } from './stats';

/** Criatura destacada de la semana: misma elección en landing y hub. Cambia el lunes a las 00:00 UTC, como la encuesta. */
export function pickFeatured(articles: WikiArticle[], date = new Date()): WikiArticleSummary | null {
  const candidates = articles.filter((a) => hasStats(a.frontmatter));
  if (candidates.length === 0) return null;
  return toSummary(candidates[isoWeekNumber(date) % candidates.length]);
}

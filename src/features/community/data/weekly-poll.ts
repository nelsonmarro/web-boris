import type { WikiArticle } from '@/core/types/wiki';
import { getContentRepository } from '@/core/content';
import { hasStats } from '@/features/monsters/lib/stats';
import { getCurrentPoll, type PollDef } from '../lib/poll-schedule';

export interface WeeklyPoll {
  poll: PollDef | null;
  /** Artículos con stats (posibles luchadores). */
  fighters: WikiArticle[];
}

/** Encuesta de la semana y luchadores disponibles. Solo contenido: no toca la base de datos. */
export async function getWeeklyPoll(date: Date = new Date()): Promise<WeeklyPoll> {
  const repo = getContentRepository();
  const [curated, articles] = await Promise.all([repo.getCuratedPolls(), repo.getArticles()]);
  const fighters = articles.filter((a) => hasStats(a.frontmatter));
  return { poll: getCurrentPoll(curated, fighters.map((a) => a.slug), date), fighters };
}

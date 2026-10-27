import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContentRepository } from '@/core/content';
import { getActivePoll } from '@/features/community/server/poll-state';
import { DAY_MS, isoWeekKey } from '@/core/content/iso-week';
import { describeError } from '@/features/community/lib/describe-error';
import { emptyHistory, summarizeHistory, type PollHistory } from '@/features/community/lib/poll-history';

/**
 * Historial de la encuesta semanal para /comunidad (spec 2026-10-27 §4): una sola consulta agrupada sobre `PollVote`.
 * Es opcional: ante cualquier fallo se registra una línea y se responde vacío con 200, y la página no se rompe.
 * Los Route Handlers no se cachean por defecto.
 */
export async function GET() {
  let history: PollHistory = emptyHistory();
  try {
    const repo = getContentRepository();
    const now = new Date();
    const [groups, current, curated, articles] = await Promise.all([
      prisma.pollVote.groupBy({ by: ['pollId', 'option'], _count: { _all: true } }),
      getActivePoll(now),
      repo.getCuratedPolls(),
      repo.getArticles(),
    ]);
    history = summarizeHistory(
      groups.map((g) => ({ pollId: g.pollId, option: g.option, count: g._count._all })),
      {
        currentPollId: current?.id ?? null,
        curated,
        previousWeek: isoWeekKey(new Date(now.getTime() - 7 * DAY_MS)),
        knownSlugs: new Set(articles.map((a) => a.slug)),
        sealedSlugs: new Set(articles.filter((a) => a.frontmatter.status === 'proximamente').map((a) => a.slug)),
      },
    );
  } catch (error) {
    console.error(`[comunidad] no se pudo leer el historial: ${describeError(error)}`);
  }
  return NextResponse.json(history, { headers: { 'Cache-Control': 'no-store' } });
}

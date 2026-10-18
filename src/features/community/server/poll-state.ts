import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContentRepository } from '@/core/content';
import { hasStats } from '@/features/monsters/lib/stats';
import { getCurrentPoll, type PollDef } from '../lib/poll-schedule';
import { computeTally } from '../lib/poll-results';
import type { PollState } from '../types';

/** Encuesta vigente calculada en el servidor (curada o automática). El cliente nunca la decide. */
export async function getActivePoll(date: Date = new Date()): Promise<PollDef | null> {
  const repo = getContentRepository();
  const [curated, articles] = await Promise.all([repo.getCuratedPolls(), repo.getArticles()]);
  const fighters = articles.filter((a) => hasStats(a.frontmatter)).map((a) => a.slug);
  return getCurrentPoll(curated, fighters, date);
}

/** Recuento de la encuesta y voto propio. Lanza si la base de datos falla: decide el llamador. */
export async function loadOpenState(poll: PollDef, voterKey: string | null): Promise<PollState> {
  const [groups, mine] = await Promise.all([
    prisma.pollVote.groupBy({ by: ['option'], where: { pollId: poll.id }, _count: { _all: true } }),
    voterKey
      ? prisma.pollVote.findUnique({
          where: { pollId_voterKey: { pollId: poll.id, voterKey } },
          select: { option: true },
        })
      : Promise.resolve(null),
  ]);
  const counts = Object.fromEntries(groups.map((g) => [g.option, g._count._all]));
  return { status: 'open', poll, myOption: mine?.option ?? null, ...computeTally([poll.a, poll.b], counts) };
}

export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

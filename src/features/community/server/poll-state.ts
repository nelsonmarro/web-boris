import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { PollDef } from '../lib/poll-schedule';
import { getWeeklyPoll } from '../data/weekly-poll';
import { computeTally } from '../lib/poll-results';
import type { PollState } from '../types';

/** Encuesta vigente calculada en el servidor (curada o automática). El cliente nunca la decide. */
export async function getActivePoll(date: Date = new Date()): Promise<PollDef | null> {
  return (await getWeeklyPoll(date)).poll;
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

/**
 * Anonimiza los votos de las encuestas cerradas: borra el hash de red (solo sirve para el tope de la encuesta vigente)
 * y cambia la clave del votante por el id de la fila (único, así que la restricción `(pollId, voterKey)` se mantiene).
 * El recuento por opción, que es lo que usa el historial, no cambia. Con la base y `VOTE_SECRET` a la vez, un hash de
 * IPv4 se podía revertir probando las 2^32 direcciones; vaciado, ya no hay nada que revertir.
 */
export async function anonymizeClosedPolls(currentPollId: string): Promise<number> {
  return prisma.$executeRaw`UPDATE "PollVote" SET "ipHash" = '', "voterKey" = "id" WHERE "pollId" <> ${currentPollId} AND "ipHash" <> ''`;
}

export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

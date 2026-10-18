'use server';

import { randomUUID } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getActivePoll, isUniqueViolation, loadOpenState } from '../server/poll-state';
import {
  MAX_VOTES_PER_IP,
  VOTER_COOKIE,
  VOTER_COOKIE_MAX_AGE,
  clientIp,
  ipHashFor,
  voteSecret,
  voterKeyFor,
} from '../lib/voter';
import type { PollState } from '../types';

const VoteInput = z.object({
  pollId: z.string().min(1).max(160),
  option: z.string().min(1).max(80),
});

export type CastVoteError = 'cerrada' | 'opcion' | 'limite' | 'no-disponible' | 'invalido';

export type CastVoteResult =
  | { ok: true; state: PollState }
  | { ok: false; error: CastVoteError; state?: PollState };

export async function castVote(input: { pollId: string; option: string }): Promise<CastVoteResult> {
  const parsed = VoteInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalido' };
  const { pollId, option } = parsed.data;

  const poll = await getActivePoll();
  if (!poll || poll.id !== pollId) return { ok: false, error: 'cerrada' };
  if (option !== poll.a && option !== poll.b) return { ok: false, error: 'opcion' };

  const secret = voteSecret();
  if (!secret) return { ok: false, error: 'no-disponible', state: { status: 'unavailable', poll } };

  const cookieStore = await cookies();
  let voterId = cookieStore.get(VOTER_COOKIE)?.value;
  if (!voterId) {
    voterId = randomUUID();
    cookieStore.set(VOTER_COOKIE, voterId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: VOTER_COOKIE_MAX_AGE,
      path: '/',
    });
  }
  const voterKey = voterKeyFor(secret, voterId);
  const requestHeaders = await headers();
  const ipHash = ipHashFor(secret, clientIp((name) => requestHeaders.get(name)), poll.id);

  try {
    const already = await prisma.pollVote.findUnique({
      where: { pollId_voterKey: { pollId: poll.id, voterKey } },
      select: { id: true },
    });
    if (!already) {
      const fromNetwork = await prisma.pollVote.count({ where: { pollId: poll.id, ipHash } });
      if (fromNetwork >= MAX_VOTES_PER_IP) {
        return { ok: false, error: 'limite', state: await loadOpenState(poll, voterKey) };
      }
      try {
        await prisma.pollVote.create({ data: { pollId: poll.id, option, voterKey, ipHash } });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error; // doble clic: el primer voto ya entró
      }
    }
    return { ok: true, state: await loadOpenState(poll, voterKey) };
  } catch (error) {
    console.error('[comunidad] voto no registrado:', error);
    return { ok: false, error: 'no-disponible', state: { status: 'unavailable', poll } };
  }
}

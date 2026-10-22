'use server';

import { randomUUID } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getActivePoll, isUniqueViolation, loadOpenState } from '../server/poll-state';
import {
  MAX_VOTES_PER_IP,
  VOTER_COOKIE,
  VOTER_COOKIE_MAX_AGE,
  clientIp,
  ipHashFor,
  networkOf,
  voteSecret,
  voterKeyFor,
} from '../lib/voter';
import { checkVote } from '../lib/vote-input';
import type { PollDef } from '../lib/poll-schedule';
import type { PollState } from '../types';

export type CastVoteError = 'cerrada' | 'opcion' | 'limite' | 'no-disponible' | 'invalido';

export type CastVoteResult =
  | { ok: true; state: PollState }
  | { ok: false; error: CastVoteError; state?: PollState };

export async function castVote(input: { pollId: string; option: string }): Promise<CastVoteResult> {
  let poll: PollDef | null = null;
  try {
    poll = await getActivePoll();
    // Orden de los códigos: `invalido` (forma), `cerrada` (no es la vigente), `opcion` (no es suya).
    const check = checkVote(input, poll);
    if (!check.ok || !poll) return { ok: false, error: check.ok ? 'cerrada' : check.error };
    const { option } = check;

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
    const ipHash = ipHashFor(secret, networkOf(clientIp((name) => requestHeaders.get(name))), poll.id);

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
    return poll
      ? { ok: false, error: 'no-disponible', state: { status: 'unavailable', poll } }
      : { ok: false, error: 'no-disponible' };
  }
}

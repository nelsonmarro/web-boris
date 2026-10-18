import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getActivePoll, loadOpenState } from '@/features/community/server/poll-state';
import { VOTER_COOKIE, voteSecret, voterKeyFor } from '@/features/community/lib/voter';
import type { PollState } from '@/features/community/types';

/** Estado de la encuesta vigente para la isla de cliente. Los Route Handlers no se cachean por defecto. */
export async function GET() {
  let state: PollState = { status: 'unavailable', poll: null };
  try {
    const poll = await getActivePoll();
    state = { status: 'unavailable', poll };
    const secret = voteSecret();
    if (poll && secret) {
      const voterId = (await cookies()).get(VOTER_COOKIE)?.value;
      state = await loadOpenState(poll, voterId ? voterKeyFor(secret, voterId) : null);
    }
  } catch (error) {
    console.error('[comunidad] no se pudo leer la encuesta:', error);
  }
  return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } });
}

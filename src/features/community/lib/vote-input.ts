/** Validación del voto antes de tocar la base de datos. Puro (lo prueban los tests con node:test). */
import { z } from 'zod';
import type { PollDef } from './poll-schedule.ts';

const VoteInput = z.object({
  pollId: z.string().min(1).max(160),
  option: z.string().min(1).max(80),
});

export type VoteCheck =
  | { ok: true; pollId: string; option: string }
  | { ok: false; error: 'invalido' | 'cerrada' | 'opcion' };

/** `invalido` si la entrada no tiene forma de voto; `cerrada` si no es la encuesta vigente; `opcion` si la opción no es suya. */
export function checkVote(input: unknown, poll: PollDef | null): VoteCheck {
  const parsed = VoteInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalido' };
  const { pollId, option } = parsed.data;
  if (!poll || poll.id !== pollId) return { ok: false, error: 'cerrada' };
  if (option !== poll.a && option !== poll.b) return { ok: false, error: 'opcion' };
  return { ok: true, pollId, option };
}

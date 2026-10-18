import type { PollDef } from './lib/poll-schedule';
import type { PollTally } from './lib/poll-results';

/** Estado de la encuesta que reciben el route handler y la isla de cliente. */
export type PollState =
  | ({ status: 'open'; poll: PollDef; myOption: string | null } & PollTally)
  | { status: 'unavailable'; poll: PollDef | null };

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkVote } from '../../src/features/community/lib/vote-input.ts';
import type { PollDef } from '../../src/features/community/lib/poll-schedule.ts';

const POLL: PollDef = {
  id: '2026-W43-the-bloop-vs-el-gran-maja',
  week: '2026-W43',
  tipo: 'duelo',
  a: 'the-bloop',
  b: 'el-gran-maja',
  question: '¿Quién gana?',
};

test('voto válido para la encuesta vigente', () => {
  assert.deepEqual(checkVote({ pollId: POLL.id, option: 'el-gran-maja' }, POLL), {
    ok: true,
    pollId: POLL.id,
    option: 'el-gran-maja',
  });
});

test('entrada inválida → invalido, aunque no haya encuesta', () => {
  for (const input of [null, 'x', {}, { pollId: '', option: 'a' }, { pollId: POLL.id, option: 'x'.repeat(81) }, { pollId: 'p'.repeat(161), option: 'a' }]) {
    assert.deepEqual(checkVote(input, POLL), { ok: false, error: 'invalido' });
    assert.deepEqual(checkVote(input, null), { ok: false, error: 'invalido' });
  }
});

test('otra encuesta o ninguna vigente → cerrada', () => {
  assert.deepEqual(checkVote({ pollId: '2026-W42-a-vs-b', option: 'the-bloop' }, POLL), { ok: false, error: 'cerrada' });
  assert.deepEqual(checkVote({ pollId: POLL.id, option: 'the-bloop' }, null), { ok: false, error: 'cerrada' });
});

test('opción ajena a la encuesta → opcion', () => {
  assert.deepEqual(checkVote({ pollId: POLL.id, option: 'vlad-julia' }, POLL), { ok: false, error: 'opcion' });
});

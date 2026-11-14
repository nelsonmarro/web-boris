import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandoff, HANDOFF_SECONDS, readHandoff } from '../../src/features/admin/lib/setup-handoff.ts';

const SECRET = 'x'.repeat(40);
const NOW = Date.UTC(2026, 10, 13, 20, 0, 0);

test('readHandoff: acepta el pase recién creado', () => {
  assert.deepEqual(readHandoff(SECRET, createHandoff(SECRET, 'user1', 4, NOW), NOW + 1000), { userId: 'user1', sessionVersion: 4 });
});

test('readHandoff: rechaza caducado, otra clave, alterado o mal formado', () => {
  const token = createHandoff(SECRET, 'user1', 4, NOW);
  assert.equal(readHandoff(SECRET, token, NOW + (HANDOFF_SECONDS + 1) * 1000), null);
  assert.equal(readHandoff('y'.repeat(40), token, NOW), null);
  assert.equal(readHandoff(SECRET, token.replace('user1.4', 'user1.5'), NOW), null);
  assert.equal(readHandoff(SECRET, token.replace('user1', 'user2'), NOW), null);
  assert.equal(readHandoff(SECRET, 'a.b.c', NOW), null);
  assert.equal(readHandoff(SECRET, '', NOW), null);
});

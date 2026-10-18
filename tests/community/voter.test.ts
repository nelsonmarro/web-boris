import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientIp, hmac, ipHashFor, voteSecret, voterKeyFor } from '../../src/features/community/lib/voter.ts';

const SECRET = 'x'.repeat(32);

test('hmac es determinista, en hex y depende del secreto', () => {
  assert.equal(hmac(SECRET, 'a'), hmac(SECRET, 'a'));
  assert.match(hmac(SECRET, 'a'), /^[0-9a-f]{64}$/);
  assert.notEqual(hmac(SECRET, 'a'), hmac('y'.repeat(32), 'a'));
});

test('el hash de IP cambia por encuesta y nunca contiene la IP', () => {
  const h1 = ipHashFor(SECRET, '203.0.113.7', 'poll-1');
  assert.notEqual(h1, ipHashFor(SECRET, '203.0.113.7', 'poll-2'));
  assert.equal(h1.includes('203.0.113.7'), false);
  assert.notEqual(voterKeyFor(SECRET, 'abc'), voterKeyFor(SECRET, 'abd'));
});

test('clientIp: primer X-Forwarded-For, luego X-Real-IP, luego "desconocida"', () => {
  const headers = (h: Record<string, string>) => (name: string) => h[name] ?? null;
  assert.equal(clientIp(headers({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1' })), '203.0.113.7');
  assert.equal(clientIp(headers({ 'x-real-ip': '198.51.100.2' })), '198.51.100.2');
  assert.equal(clientIp(headers({})), 'desconocida');
});

test('voteSecret exige secreto ≥ 32 caracteres y DATABASE_URL', () => {
  assert.equal(voteSecret({ VOTE_SECRET: SECRET, DATABASE_URL: 'postgresql://x' }), SECRET);
  assert.equal(voteSecret({ VOTE_SECRET: 'corto', DATABASE_URL: 'postgresql://x' }), null);
  assert.equal(voteSecret({ VOTE_SECRET: SECRET }), null);
  assert.equal(voteSecret({}), null);
});

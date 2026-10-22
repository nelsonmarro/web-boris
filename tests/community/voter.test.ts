import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientIp, hmac, ipHashFor, networkOf, voteSecret, voterKeyFor } from '../../src/features/community/lib/voter.ts';

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

test('clientIp: X-Real-IP, luego el último salto de X-Forwarded-For, luego "desconocida"', () => {
  const headers = (h: Record<string, string>) => (name: string) => h[name] ?? null;
  assert.equal(clientIp(headers({ 'x-real-ip': '198.51.100.2', 'x-forwarded-for': '6.6.6.6, 203.0.113.7' })), '198.51.100.2');
  assert.equal(clientIp(headers({ 'x-forwarded-for': ' 6.6.6.6 , 203.0.113.7 ' })), '203.0.113.7');
  assert.equal(clientIp(headers({ 'x-forwarded-for': '203.0.113.7, ' })), '203.0.113.7');
  assert.equal(clientIp(headers({})), 'desconocida');
});

test('voteSecret exige secreto ≥ 32 caracteres y DATABASE_URL', () => {
  assert.equal(voteSecret({ VOTE_SECRET: SECRET, DATABASE_URL: 'postgresql://x' }), SECRET);
  assert.equal(voteSecret({ VOTE_SECRET: 'corto', DATABASE_URL: 'postgresql://x' }), null);
  assert.equal(voteSecret({ VOTE_SECRET: SECRET }), null);
  assert.equal(voteSecret({}), null);
});

test('networkOf: IPv4 tal cual, IPv4 mapeada a IPv4 e IPv6 por su /64', () => {
  assert.equal(networkOf('203.0.113.7'), '203.0.113.7');
  assert.equal(networkOf('::ffff:203.0.113.7'), '203.0.113.7');
  assert.equal(networkOf('::FFFF:203.0.113.7'), '203.0.113.7');
  // Dos direcciones de privacidad de la misma red cuentan como una.
  assert.equal(networkOf('2001:db8:1:2:aaaa::1'), '2001:db8:1:2::/64');
  assert.equal(networkOf('2001:db8:1:2:bbbb:cccc:dddd:eeee'), '2001:db8:1:2::/64');
  assert.equal(networkOf('2001:0DB8:0001:0002::1'), '2001:db8:1:2::/64');
  assert.equal(networkOf('2001:db8::1'), '2001:db8:0:0::/64');
  assert.equal(networkOf('::1'), '0:0:0:0::/64');
  assert.equal(networkOf('fe80::1%eth0'), 'fe80:0:0:0::/64');
  assert.equal(networkOf('2001:db8:1:2:3:4:198.51.100.2'), '2001:db8:1:2::/64');
  assert.equal(networkOf('desconocida'), 'desconocida');
  assert.notEqual(networkOf('2001:db8:1:2::1'), networkOf('2001:db8:1:3::1'));
});

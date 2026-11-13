import { test } from 'node:test';
import assert from 'node:assert/strict';
import { base32Decode, base32Encode, generateTotpSecret, otpauthUri, totpCode, totpStep, verifyTotp } from '../../src/features/admin/lib/totp.ts';

// Secreto de los vectores del RFC 6238 (ASCII "12345678901234567890").
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'));

test('totpCode: vectores SHA-1 del RFC 6238 (8 dígitos)', () => {
  const vectors: Array<[number, string]> = [
    [59, '94287082'],
    [1111111109, '07081804'],
    [1111111111, '14050471'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
    [20000000000, '65353130'],
  ];
  for (const [seconds, expected] of vectors) assert.equal(totpCode(RFC_SECRET, totpStep(seconds * 1000), 8), expected);
});

test('base32: ida y vuelta, tolera espacios y minúsculas, rechaza caracteres ajenos', () => {
  const secret = generateTotpSecret();
  assert.equal(secret.length, 32);
  assert.equal(base32Encode(base32Decode(secret)), secret);
  assert.deepEqual(base32Decode('jbsw y3dp'), base32Decode('JBSWY3DP'));
  assert.throws(() => base32Decode('JBSW1'));
});

test('verifyTotp: acepta el paso actual y los vecinos, y nada más', () => {
  const now = 1_700_000_000_000;
  const step = totpStep(now);
  assert.equal(verifyTotp(RFC_SECRET, totpCode(RFC_SECRET, step), now), step);
  assert.equal(verifyTotp(RFC_SECRET, totpCode(RFC_SECRET, step - 1), now), step - 1);
  assert.equal(verifyTotp(RFC_SECRET, totpCode(RFC_SECRET, step + 1), now), step + 1);
  assert.equal(verifyTotp(RFC_SECRET, totpCode(RFC_SECRET, step - 2), now), null);
  assert.equal(verifyTotp(RFC_SECRET, '12345', now), null);
  assert.equal(verifyTotp(RFC_SECRET, 'abcdef', now), null);
});

test('verifyTotp: un código ya usado no vale otra vez', () => {
  const now = 1_700_000_000_000;
  const step = totpStep(now);
  const code = totpCode(RFC_SECRET, step);
  assert.equal(verifyTotp(RFC_SECRET, code, now, step), null);
  assert.equal(verifyTotp(RFC_SECRET, code, now, step - 1), step);
});

test('otpauthUri: lleva emisor, cuenta y secreto', () => {
  const uri = otpauthUri('JBSWY3DP', 'boris@example.com', 'Wiki BorisaoBlois');
  assert.ok(uri.startsWith('otpauth://totp/Wiki%20BorisaoBlois:boris%40example.com?'));
  assert.match(uri, /secret=JBSWY3DP/);
  assert.match(uri, /issuer=Wiki\+BorisaoBlois/);
});

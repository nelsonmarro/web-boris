import { test } from 'node:test';
import assert from 'node:assert/strict';
import { open, seal } from '../../src/features/admin/lib/secret-box.ts';
import { generateRecoveryCodes, hashRecoveryCode, looksLikeRecoveryCode } from '../../src/features/admin/lib/recovery-codes.ts';
import { isThrottled } from '../../src/features/admin/lib/lockout.ts';
import { createSlots } from '../../src/features/admin/lib/slots.ts';

const SECRET = 'x'.repeat(40);

test('seal/open: ida y vuelta, y cada sobre es distinto', () => {
  const a = seal('JBSWY3DP', SECRET, 'totp');
  assert.notEqual(a, seal('JBSWY3DP', SECRET, 'totp'));
  assert.equal(open(a, SECRET, 'totp'), 'JBSWY3DP');
});

test('open: rechaza otra clave, otro uso y un sobre manipulado', () => {
  const sealed = seal('secreto', SECRET, 'totp');
  assert.equal(open(sealed, 'y'.repeat(40), 'totp'), null);
  assert.equal(open(sealed, SECRET, 'otro'), null);
  const parts = sealed.split('.');
  parts[3] = Buffer.from('falso').toString('base64url');
  assert.equal(open(parts.join('.'), SECRET, 'totp'), null);
  assert.equal(open('basura', SECRET, 'totp'), null);
  assert.throws(() => seal('x', 'corto', 'totp'));
});

test('códigos de recuperación: formato, unicidad y hash insensible a guiones y mayúsculas', () => {
  const codes = generateRecoveryCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  for (const code of codes) {
    assert.match(code, /^[A-Z2-7]{5}-[A-Z2-7]{5}$/);
    assert.ok(looksLikeRecoveryCode(code));
  }
  assert.equal(looksLikeRecoveryCode('123456'), false);
  assert.equal(hashRecoveryCode('ABCDE-FGHIJ', SECRET), hashRecoveryCode(' abcdefghij ', SECRET));
  assert.notEqual(hashRecoveryCode('ABCDE-FGHIJ', SECRET), hashRecoveryCode('ABCDE-FGHIK', SECRET));
});

test('freno: por red, por cuenta y red, y por cuenta', () => {
  assert.equal(isThrottled({ network: 0, accountAndNetwork: 0, account: 0 }), false);
  assert.equal(isThrottled({ network: 19, accountAndNetwork: 7, account: 39 }), false);
  assert.equal(isThrottled({ network: 20, accountAndNetwork: 0, account: 0 }), true);
  assert.equal(isThrottled({ network: 8, accountAndNetwork: 8, account: 8 }), true);
  // Otra red ha fallado mucho contra la cuenta: esta red todavía puede entrar (no se deja fuera al dueño)…
  assert.equal(isThrottled({ network: 0, accountAndNetwork: 0, account: 39 }), false);
  // …hasta el tope global de la cuenta.
  assert.equal(isThrottled({ network: 0, accountAndNetwork: 0, account: 40 }), true);
});

test('turnos: respeta la concurrencia y rechaza con la cola llena', async () => {
  const run = createSlots(2, 1);
  let active = 0;
  let peak = 0;
  const job = async () => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 20));
    active -= 1;
    return 'ok';
  };
  const results = await Promise.all([run(job), run(job), run(job), run(job)]);
  assert.equal(peak, 2);
  assert.deepEqual(results.filter((r) => r === 'ok').length, 3); // 2 en marcha + 1 en cola
  assert.deepEqual(results.filter((r) => r === null).length, 1); // el cuarto no cabe
  assert.equal(await run(job), 'ok'); // y los turnos quedan libres
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, passwordProblem, verifyPassword } from '../../src/features/admin/lib/password.ts';

test('hashPassword: verifica la contraseña correcta y rechaza otra', async () => {
  const frase = ['correcta', 'caballo', 'batería', 'grapa'].join(' ');
  const hash = await hashPassword(frase);
  assert.match(hash, /^scrypt\$131072\$8\$1\$/);
  assert.equal(await verifyPassword(frase, hash), true);
  assert.equal(await verifyPassword(frase.replace('í', 'i'), hash), false);
});

test('hashPassword: dos hashes de la misma contraseña difieren (sal aleatoria)', async () => {
  const frase = ['una', 'frase', 'larga'].join('-');
  assert.notEqual(await hashPassword(frase), await hashPassword(frase));
});

test('verifyPassword: un hash con formato o coste no admitido nunca coincide', async () => {
  assert.equal(await verifyPassword('x', ''), false);
  assert.equal(await verifyPassword('x', 'bcrypt$10$abc$def'), false);
  assert.equal(await verifyPassword('x', 'scrypt$1073741824$8$1$c2Fs$' + 'A'.repeat(43)), false); // N desorbitado
  assert.equal(await verifyPassword('x', 'scrypt$1000$8$1$c2Fs$' + 'A'.repeat(43)), false); // N no es potencia de 2
});

test('passwordProblem: longitud, variedad y correo', () => {
  // Textos de ejemplo para la regla de formato; ninguno es una credencial.
  const breve = 'corta';
  const repetida = 'a'.repeat(14);
  const local = 'ejemplo';
  const valida = ['tres', 'tristes', 'tigres', '77'].join(' ');
  assert.match(passwordProblem(breve) ?? '', /al menos 12/);
  assert.match(passwordProblem(repetida) ?? '', /repite/);
  assert.match(passwordProblem(`${local} y catorce letras`, `${local}@example.com`) ?? '', /correo/);
  assert.equal(passwordProblem(valida, `${local}@example.com`), null);
});

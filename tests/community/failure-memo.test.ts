import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoizeFailure } from '../../src/features/community/lib/failure-memo.ts';

const TTL = 60_000;

/** Reloj falso: `clock.t` avanza a mano. */
const makeClock = () => {
  const clock = { t: 1_000_000, now: () => clock.t };
  return clock;
};

test('un éxito pasa tal cual y no se guarda: cada llamada vuelve a pedir', async () => {
  const clock = makeClock();
  let calls = 0;
  const get = memoizeFailure(async () => ++calls, TTL, clock.now);
  assert.equal(await get(), 1);
  assert.equal(await get(), 2);
  assert.equal(calls, 2);
});

test('un fallo se memoiza durante el TTL: no se vuelve a llamar y se rechaza con el mismo error', async () => {
  const clock = makeClock();
  let calls = 0;
  const boom = new Error('HTTP 404');
  const get = memoizeFailure(async () => (calls++, Promise.reject(boom)), TTL, clock.now);

  await assert.rejects(get(), (e) => e === boom);
  clock.t += TTL - 1;
  await assert.rejects(get(), (e) => e === boom);
  await assert.rejects(get(), (e) => e === boom);
  assert.equal(calls, 1);
});

test('pasado el TTL vuelve a intentarlo, y si ahora funciona deja de memoizar', async () => {
  const clock = makeClock();
  let calls = 0;
  const get = memoizeFailure(
    async () => {
      calls++;
      if (calls === 1) throw new Error('caído');
      return 'ok';
    },
    TTL,
    clock.now,
  );
  await assert.rejects(get(), /caído/);
  clock.t += TTL; // justo en el límite ya no cuenta
  assert.equal(await get(), 'ok');
  assert.equal(await get(), 'ok');
  assert.equal(calls, 3);
});

test('un segundo fallo abre otra ventana desde el momento del nuevo fallo', async () => {
  const clock = makeClock();
  let calls = 0;
  const get = memoizeFailure(async () => (calls++, Promise.reject(new Error(`fallo ${calls}`))), TTL, clock.now);
  await assert.rejects(get(), /fallo 1/);
  clock.t += TTL;
  await assert.rejects(get(), /fallo 2/);
  clock.t += TTL - 1;
  await assert.rejects(get(), /fallo 2/); // sigue memoizado el segundo
  assert.equal(calls, 2);
});

test('las llamadas simultáneas comparten una sola petición (éxito y fallo)', async () => {
  const clock = makeClock();
  let calls = 0;
  const ok = memoizeFailure(async () => (calls++, 'dato'), TTL, clock.now);
  assert.deepEqual(await Promise.all([ok(), ok(), ok()]), ['dato', 'dato', 'dato']);
  assert.equal(calls, 1);

  let failCalls = 0;
  const bad = memoizeFailure(async () => (failCalls++, Promise.reject(new Error('x'))), TTL, clock.now);
  const results = await Promise.allSettled([bad(), bad(), bad()]);
  assert.deepEqual(results.map((r) => r.status), ['rejected', 'rejected', 'rejected']);
  assert.equal(failCalls, 1);
});

test('si la función lanza de forma síncrona también se convierte en rechazo y se memoiza', async () => {
  const clock = makeClock();
  let calls = 0;
  const get = memoizeFailure(
    (() => {
      calls++;
      throw new Error('síncrono');
    }) as () => Promise<never>,
    TTL,
    clock.now,
  );
  await assert.rejects(get(), /síncrono/);
  await assert.rejects(get(), /síncrono/);
  assert.equal(calls, 1);
});

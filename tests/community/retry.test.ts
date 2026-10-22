import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abortable, HttpError, isTransientFetchError, withRetry } from '../../src/features/community/lib/retry.ts';

const noSleep = async () => {};

test('un fallo transitorio y luego un acierto: devuelve el acierto tras una pausa', async () => {
  const pauses: number[] = [];
  let calls = 0;
  const value = await withRetry(
    async (attempt) => {
      calls++;
      if (attempt === 0) throw new HttpError(404);
      return 'ok';
    },
    { delaysMs: [250, 750], shouldRetry: isTransientFetchError, sleep: async (ms) => void pauses.push(ms) },
  );
  assert.equal(value, 'ok');
  assert.equal(calls, 2);
  assert.deepEqual(pauses, [250]);
});

test('agota los reintentos y lanza el último error', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new HttpError(500 + calls);
      },
      { delaysMs: [1, 1], shouldRetry: isTransientFetchError, sleep: noSleep },
    ),
    (error: unknown) => error instanceof HttpError && error.status === 503,
  );
  assert.equal(calls, 3);
});

test('un error no transitorio no se reintenta', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new HttpError(403);
      },
      { delaysMs: [1, 1], shouldRetry: isTransientFetchError, sleep: noSleep },
    ),
    /HTTP 403/,
  );
  assert.equal(calls, 1);
});

test('sin pausas configuradas es un único intento', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new HttpError(500);
      },
      { delaysMs: [], shouldRetry: () => true, sleep: noSleep },
    ),
  );
  assert.equal(calls, 1);
});

test('isTransientFetchError: 404, 408, 429, 5xx, red y tiempo límite sí; 400, 403 y errores de parseo no', () => {
  for (const status of [404, 408, 429, 500, 502, 503]) assert.equal(isTransientFetchError(new HttpError(status)), true, String(status));
  for (const status of [400, 401, 403, 410]) assert.equal(isTransientFetchError(new HttpError(status)), false, String(status));
  assert.equal(isTransientFetchError(new TypeError('fetch failed')), true);
  assert.equal(isTransientFetchError(new DOMException('The operation timed out.', 'TimeoutError')), true);
  assert.equal(isTransientFetchError(new Error('feed sin vídeos')), false);
  assert.equal(isTransientFetchError('texto'), false);
});

test('abortable: resuelve con el valor si la promesa acaba antes que la señal', async () => {
  const controller = new AbortController();
  assert.equal(await abortable(Promise.resolve('ok'), controller.signal), 'ok');
});

test('abortable: rechaza con el error de la promesa', async () => {
  const controller = new AbortController();
  await assert.rejects(abortable(Promise.reject(new HttpError(500)), controller.signal), { name: 'HttpError' });
});

test('abortable: rechaza con el motivo de la señal si aborta antes, aunque la promesa siga pendiente', async () => {
  const controller = new AbortController();
  const reason = new Error('tiempo agotado');
  const pending = abortable(new Promise<string>(() => {}), controller.signal);
  controller.abort(reason);
  await assert.rejects(pending, (error) => error === reason);
});

test('abortable: rechaza al instante si la señal ya estaba abortada', async () => {
  const reason = new Error('ya abortada');
  await assert.rejects(abortable(new Promise<string>(() => {}), AbortSignal.abort(reason)), (error) => error === reason);
});

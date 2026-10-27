import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeError } from '../../src/features/community/lib/describe-error.ts';
import { HttpError } from '../../src/features/community/lib/retry.ts';

test('un error HTTP se resume con su código', () => {
  assert.equal(describeError(new HttpError(404)), 'HTTP 404');
});

test('un fallo de red añade el código de la causa', () => {
  const error = new TypeError('fetch failed', { cause: { code: 'EAI_AGAIN' } });
  assert.equal(describeError(error), 'fetch failed: EAI_AGAIN');
});

test('un tiempo límite o un aborto se dicen en español', () => {
  assert.equal(describeError(new DOMException('x', 'TimeoutError')), 'tiempo límite');
  assert.equal(describeError(new DOMException('x', 'AbortError')), 'tiempo límite');
});

test('un valor que no es Error se convierte en texto', () => {
  assert.equal(describeError('boom'), 'boom');
});

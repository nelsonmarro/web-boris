import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickRandom } from '../../src/core/search/random-pick.ts';

const ITEMS = ['a', 'b', 'c', 'd'];

test('con un rng fijo devuelve el elemento esperado', () => {
  assert.equal(pickRandom(ITEMS, () => 0), 'a');
  assert.equal(pickRandom(ITEMS, () => 0.24), 'a');
  assert.equal(pickRandom(ITEMS, () => 0.25), 'b');
  assert.equal(pickRandom(ITEMS, () => 0.5), 'c');
  assert.equal(pickRandom(ITEMS, () => 0.999999), 'd');
});

test('un rng fuera de contrato (1 o más) nunca se sale de la lista', () => {
  assert.equal(pickRandom(ITEMS, () => 1), 'd');
  assert.equal(pickRandom(ITEMS, () => 7), 'd');
});

test('con la lista vacía devuelve undefined y no llama al rng', () => {
  let calls = 0;
  assert.equal(pickRandom([], () => (calls++, 0.5)), undefined);
  assert.equal(calls, 0);
});

test('con un solo elemento siempre es ese', () => {
  assert.equal(pickRandom(['solo'], () => 0.73), 'solo');
});

test('el rng se usa una sola vez por elección y el original no se muta', () => {
  const copy = [...ITEMS];
  let calls = 0;
  pickRandom(copy, () => (calls++, 0.1));
  assert.equal(calls, 1);
  assert.deepEqual(copy, ITEMS);
});

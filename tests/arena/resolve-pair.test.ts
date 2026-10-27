import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePair } from '../../src/features/monsters/components/arena/resolve-pair.ts';

const slugs = ['the-bloop', 'slowdown-criyonte', 'bogbo'];

test('sin parámetros: los dos primeros combatientes', () => {
  assert.deepEqual(resolvePair(slugs, null, null), { slugA: 'the-bloop', slugB: 'slowdown-criyonte' });
});

test('solo ?a=: B toma el segundo por defecto, o el primero si A ya es el segundo', () => {
  assert.deepEqual(resolvePair(slugs, 'bogbo', null), { slugA: 'bogbo', slugB: 'slowdown-criyonte' });
  assert.deepEqual(resolvePair(slugs, 'slowdown-criyonte', null), { slugA: 'slowdown-criyonte', slugB: 'the-bloop' });
});

test('a == b: B pasa al primer combatiente distinto', () => {
  assert.deepEqual(resolvePair(slugs, 'bogbo', 'bogbo'), { slugA: 'bogbo', slugB: 'the-bloop' });
});

test('slug inválido: cae al valor por defecto', () => {
  assert.deepEqual(resolvePair(slugs, 'nada', 'tampoco'), { slugA: 'the-bloop', slugB: 'slowdown-criyonte' });
  assert.deepEqual(resolvePair(slugs, 'bogbo', 'nada'), { slugA: 'bogbo', slugB: 'slowdown-criyonte' });
});

test('slug antiguo slowdown-criyote: se traduce al canónico', () => {
  assert.deepEqual(resolvePair(slugs, 'slowdown-criyote', 'bogbo'), { slugA: 'slowdown-criyonte', slugB: 'bogbo' });
  assert.deepEqual(resolvePair(slugs, 'bogbo', 'slowdown-criyote'), { slugA: 'bogbo', slugB: 'slowdown-criyonte' });
});

test('lista de un solo luchador: no revienta y ambos lados coinciden', () => {
  assert.deepEqual(resolvePair(['the-bloop'], null, null), { slugA: 'the-bloop', slugB: 'the-bloop' });
  assert.deepEqual(resolvePair(['the-bloop'], 'the-bloop', 'the-bloop'), { slugA: 'the-bloop', slugB: 'the-bloop' });
});

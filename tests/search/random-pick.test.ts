import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickRandom, pickRandomExcluding, wikiSlugFromReferer } from '../../src/core/search/random-pick.ts';

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

test('pickRandomExcluding: nunca devuelve la excluida, con cualquier rng', () => {
  for (const r of [0, 0.1, 0.25, 0.26, 0.5, 0.74, 0.75, 0.9999, 1, 7]) {
    assert.notEqual(pickRandomExcluding(ITEMS, 'b', () => r), 'b', `rng ${r}`);
    assert.notEqual(pickRandomExcluding(ITEMS, 'a', () => r), 'a', `rng ${r}`);
    assert.notEqual(pickRandomExcluding(ITEMS, 'd', () => r), 'd', `rng ${r}`);
  }
});

test('pickRandomExcluding: reparte entre las que quedan, en su orden', () => {
  assert.equal(pickRandomExcluding(ITEMS, 'a', () => 0), 'b');
  assert.equal(pickRandomExcluding(ITEMS, 'a', () => 0.5), 'c');
  assert.equal(pickRandomExcluding(ITEMS, 'a', () => 0.999), 'd');
});

test('pickRandomExcluding: sin excluida (o que no está en la lista) es pickRandom', () => {
  assert.equal(pickRandomExcluding(ITEMS, undefined, () => 0.5), 'c');
  assert.equal(pickRandomExcluding(ITEMS, 'zzz', () => 0.5), 'c');
  assert.equal(pickRandomExcluding(ITEMS, '', () => 0.5), 'c');
});

test('pickRandomExcluding: si al excluir no queda ninguna, usa la lista sin excluir', () => {
  assert.equal(pickRandomExcluding(['solo'], 'solo', () => 0.3), 'solo');
  assert.equal(pickRandomExcluding(['x', 'x'], 'x', () => 0.9), 'x');
});

test('pickRandomExcluding: lista vacía devuelve undefined sin llamar al rng; el rng se usa una vez y la lista no se muta', () => {
  let calls = 0;
  assert.equal(pickRandomExcluding([], 'a', () => (calls++, 0.5)), undefined);
  assert.equal(calls, 0);
  const copy = [...ITEMS];
  pickRandomExcluding(copy, 'b', () => (calls++, 0.1));
  assert.equal(calls, 1);
  assert.deepEqual(copy, ITEMS);
});

test('wikiSlugFromReferer: solo cuenta si el pathname es /wiki/<slug>', () => {
  assert.equal(wikiSlugFromReferer('https://boris.example/wiki/the-bloop'), 'the-bloop');
  assert.equal(wikiSlugFromReferer('http://localhost:3000/wiki/el-gran-maja?x=1#top'), 'el-gran-maja');
  assert.equal(wikiSlugFromReferer('https://boris.example/wiki/the-bloop/'), 'the-bloop');
});

test('wikiSlugFromReferer: otras rutas, ausentes o malformadas no excluyen nada', () => {
  assert.equal(wikiSlugFromReferer(null), undefined);
  assert.equal(wikiSlugFromReferer(undefined), undefined);
  assert.equal(wikiSlugFromReferer(''), undefined);
  assert.equal(wikiSlugFromReferer('no es una url'), undefined);
  assert.equal(wikiSlugFromReferer('/wiki/the-bloop'), undefined); // un referer siempre es absoluto
  assert.equal(wikiSlugFromReferer('https://boris.example/'), undefined);
  assert.equal(wikiSlugFromReferer('https://boris.example/wiki'), undefined);
  assert.equal(wikiSlugFromReferer('https://boris.example/wiki/'), undefined);
  assert.equal(wikiSlugFromReferer('https://boris.example/wiki/a/b'), undefined);
  assert.equal(wikiSlugFromReferer('https://boris.example/comunidad'), undefined);
  assert.equal(wikiSlugFromReferer('https://boris.example/otra/wiki/the-bloop'), undefined);
  assert.equal(wikiSlugFromReferer('javascript:alert(1)'), undefined);
});

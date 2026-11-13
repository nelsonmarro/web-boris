import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addItem, canHaveChildren, destinations, itemAt, moveItem, removeItem, updateItem } from '../../src/features/admin/lib/nav-tree.ts';
import type { NavGroup } from '../../src/core/content/navigation.ts';

const nav: NavGroup[] = [
  {
    title: 'COLOSOS',
    items: [
      { title: 'Wiki', url: '/wiki' },
      { title: 'Personajes', url: '#', items: [{ title: 'Animales', url: '/wiki/animales', items: [{ title: 'A', url: '/wiki/a' }, { title: 'B', url: '/wiki/b' }] }] },
    ],
  },
  { title: 'GALEÓN', items: [{ title: 'Historia', url: '/wiki/galeon' }] },
];
const frozen = JSON.stringify(nav);

test('updateItem, moveItem y removeItem cambian solo su sitio y no tocan el original', () => {
  assert.equal(itemAt(updateItem(nav, [0, 1, 0, 1], { title: 'Bé' }), [0, 1, 0, 1]).title, 'Bé');
  assert.deepEqual(itemAt(moveItem(nav, [0, 1, 0, 1], -1), [0, 1, 0]).items?.map((i) => i.title), ['B', 'A']);
  assert.equal(moveItem(nav, [0, 0], -1), nav); // fuera de rango: igual
  assert.deepEqual(removeItem(nav, [1, 0])[1].items, []);
  assert.equal(JSON.stringify(nav), frozen);
});

test('removeItem: una entrada que se queda sin subentradas pierde la lista', () => {
  const once = removeItem(nav, [0, 1, 0, 0]);
  const twice = removeItem(once, [0, 1, 0, 0]);
  assert.equal(itemAt(twice, [0, 1, 0]).items, undefined);
});

test('addItem: al final de un universo o de una entrada', () => {
  assert.equal(addItem(nav, [1], { title: 'Navíos', url: '/wiki/navios' })[1].items.at(-1)?.title, 'Navíos');
  assert.deepEqual(itemAt(addItem(nav, [0, 1, 0], { title: 'C', url: '/wiki/c' }), [0, 1, 0]).items?.map((i) => i.title), ['A', 'B', 'C']);
});

test('destinations: universos y grupos con hueco para más fichas, con su camino', () => {
  assert.deepEqual(destinations(nav).map((d) => d.label), ['COLOSOS', 'COLOSOS › Personajes', 'COLOSOS › Personajes › Animales', 'GALEÓN']);
  assert.equal(canHaveChildren([0, 1, 0]), true);
  assert.equal(canHaveChildren([0, 1, 0, 0]), false);
});

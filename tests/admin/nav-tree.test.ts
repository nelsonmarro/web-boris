import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addItem, canHaveChildren, destinations, itemAt, keysAlong, moveItem, moveItemTo, moveTargets, removeItem, suggestDestination, updateItem, withKeys, withoutKeys } from '../../src/features/admin/lib/nav-tree.ts';
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

test('moveTargets: ni dentro de sí misma, ni su sitio actual, ni más hondo que NAV_MAX_DEPTH', () => {
  // «Personajes» lleva dos niveles dentro: solo cabe directamente bajo un universo (que no sea el suyo).
  assert.deepEqual(moveTargets(nav, [0, 1]).map((d) => d.label), ['GALEÓN']);
  // Una ficha suelta cabe en cualquier grupo salvo el suyo.
  assert.deepEqual(moveTargets(nav, [0, 1, 0, 0]).map((d) => d.label), ['COLOSOS', 'COLOSOS › Personajes', 'GALEÓN']);
});

test('moveItemTo: lleva la entrada con lo que tiene dentro al final del destino', () => {
  const moved = moveItemTo(nav, [0, 1, 0, 1], [1]);
  assert.deepEqual(moved[1].items.map((i) => i.title), ['Historia', 'B']);
  assert.deepEqual(itemAt(moved, [0, 1, 0]).items?.map((i) => i.title), ['A']);
  const group = moveItemTo(nav, [0, 1], [1]);
  assert.deepEqual(group[1].items.at(-1)?.items?.[0].items?.map((i) => i.title), ['A', 'B']);
  assert.equal(moveItemTo(nav, [0, 1], [0, 1, 0]), nav); // dentro de sí misma: no
  assert.equal(JSON.stringify(nav), frozen);
});

test('moveItemTo: corrige el destino cuando cuelga de un hermano posterior', () => {
  const flat: NavGroup[] = [{ title: 'U', items: [{ title: 'Suelta', url: '/wiki/s' }, { title: 'Grupo', url: '#', items: [{ title: 'X', url: '/wiki/x' }] }] }];
  const moved = moveItemTo(flat, [0, 0], [0, 1]);
  assert.deepEqual(moved[0].items.map((i) => i.title), ['Grupo']);
  assert.deepEqual(moved[0].items[0].items?.map((i) => i.title), ['X', 'Suelta']);
});

test('suggestDestination: el grupo con fichas de su categoría y universo; si no, su universo', () => {
  const places = [
    { slug: 'a', universe: 'Colosos', category: 'Coloso' },
    { slug: 'b', universe: 'Colosos', category: 'Coloso' },
    { slug: 'galeon', universe: 'Capitán de Galeón', category: 'Historia' },
  ];
  assert.deepEqual(suggestDestination(nav, { universe: 'Colosos', category: 'Coloso' }, places), [0, 1, 0]);
  assert.deepEqual(suggestDestination(nav, { universe: 'Capitán de Galeón', category: 'Vehículo' }, places), [1]);
  assert.equal(suggestDestination(nav, { universe: 'Otro', category: 'Coloso' }, places), null);
});

test('withKeys / withoutKeys: las claves no llegan a lo que se publica', () => {
  let n = 0;
  const keyed = withKeys(nav, () => `k${n++}`);
  assert.equal(keyed[0].items[1].items?.[0].items?.[1].key, 'k5');
  assert.deepEqual(withoutKeys(keyed), nav);
  assert.deepEqual(keysAlong(keyed, [0, 1, 0, 1]), ['k0', 'k2', 'k3', 'k5']);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupLabel, navNeighbors, type NavGroupLike } from '../../src/core/search/nav-neighbors.ts';
import { STATIC_WIKI_ROUTES } from '../../src/core/search/wiki-routes.ts';

// Misma forma que `WIKI_NAVIGATION`: grupos de universo (sin `url`) con elementos, grupos «#» y anidados.
const NAV: NavGroupLike[] = [
  {
    title: 'UNIVERSO COLOSOS',
    items: [
      { title: 'Wiki', url: '/wiki' },
      {
        title: 'Personajes',
        url: '#',
        items: [
          {
            title: 'Animales',
            url: '/wiki/animales-colosos',
            items: [
              { title: 'El Gran Majá', url: '/wiki/el-gran-maja' },
              { title: 'The Bloop', url: '/wiki/the-bloop' },
              { title: 'Bogbo', url: '/wiki/bogbo' },
            ],
          },
          {
            title: 'Humanos',
            url: '/wiki/humanos-colosos',
            items: [
              { title: 'Phillip Forte', url: '/wiki/phillip-forte' },
              { title: 'Cael Cortés', url: '/wiki/cael-cortes' },
            ],
          },
        ],
      },
      { title: 'Versus', url: '/wiki/arena' },
    ],
  },
  {
    title: 'ELLOS LLEGARON',
    items: [
      { title: 'El Ángel', url: '/wiki/el-angel' },
      { title: 'Cronología WWII', url: '/wiki/cronologia-wwii' },
    ],
  },
  { title: 'LA HECATOMBE DEL LAPEÓN', items: [{ title: 'Historia', url: '/wiki/la-hecatombe-del-lapeon' }] },
];

const link = (title: string, url: string) => ({ title, url });

test('vecinos dentro del grupo anidado Personajes › Animales (el grupo es el padre inmediato)', () => {
  assert.deepEqual(navNeighbors('the-bloop', NAV), {
    group: 'Animales',
    prev: link('El Gran Majá', '/wiki/el-gran-maja'),
    next: link('Bogbo', '/wiki/bogbo'),
  });
});

test('vuelta circular: el primero tiene de anterior al último, el último de siguiente al primero', () => {
  assert.deepEqual(navNeighbors('el-gran-maja', NAV), {
    group: 'Animales',
    prev: link('Bogbo', '/wiki/bogbo'),
    next: link('The Bloop', '/wiki/the-bloop'),
  });
  assert.deepEqual(navNeighbors('bogbo', NAV), {
    group: 'Animales',
    prev: link('The Bloop', '/wiki/the-bloop'),
    next: link('El Gran Majá', '/wiki/el-gran-maja'),
  });
});

test('un grupo de dos: solo «siguiente» (la otra ficha); nunca anterior y siguiente iguales', () => {
  assert.deepEqual(navNeighbors('el-angel', NAV), {
    group: 'ELLOS LLEGARON',
    next: link('Cronología WWII', '/wiki/cronologia-wwii'),
  });
  assert.deepEqual(navNeighbors('cronologia-wwii', NAV), {
    group: 'ELLOS LLEGARON',
    next: link('El Ángel', '/wiki/el-angel'),
  });
});

test('la ficha de un subgrupo (Animales) tiene a su hermano de Personajes como siguiente', () => {
  assert.deepEqual(navNeighbors('animales-colosos', NAV), {
    group: 'Personajes',
    next: link('Humanos', '/wiki/humanos-colosos'),
  });
});

test('un grupo de un solo elemento devuelve el grupo sin anterior ni siguiente', () => {
  assert.deepEqual(navNeighbors('la-hecatombe-del-lapeon', NAV), { group: 'LA HECATOMBE DEL LAPEÓN' });
});

test('los hermanos sin ficha propia («#» o /wiki) no cuentan como vecinos', () => {
  // «Wiki» (/wiki) y «Personajes» (#) se saltan: solo `/wiki/<slug>` de una ficha es vecino.
  const nav: NavGroupLike[] = [
    {
      title: 'A',
      items: [
        { title: 'Wiki', url: '/wiki' },
        { title: 'Personajes', url: '#' },
        link('Uno', '/wiki/uno'),
        link('Dos', '/wiki/dos'),
        link('Tres', '/wiki/tres'),
      ],
    },
  ];
  assert.deepEqual(navNeighbors('dos', nav), { group: 'A', prev: link('Uno', '/wiki/uno'), next: link('Tres', '/wiki/tres') });
});

test('las rutas estáticas (Arena, Registro, Aleatorio) no son fichas: ni vecinas ni con vecinos', () => {
  const nav: NavGroupLike[] = [
    {
      title: 'A',
      items: [
        link('Uno', '/wiki/uno'),
        link('Versus', '/wiki/arena'),
        link('Registro', '/wiki/registro'),
        link('Aleatorio', '/wiki/aleatorio'),
        link('Dos', '/wiki/dos'),
      ],
    },
  ];
  // Solo Uno y Dos son fichas: son vecinas entre sí y las rutas estáticas se saltan.
  assert.deepEqual(navNeighbors('uno', nav), { group: 'A', next: link('Dos', '/wiki/dos') });
  assert.deepEqual(navNeighbors('dos', nav), { group: 'A', next: link('Uno', '/wiki/uno') });
  // Y ellas mismas no son fichas con vecinos.
  for (const slug of STATIC_WIKI_ROUTES.map((r) => r.slice('/wiki/'.length))) {
    assert.equal(navNeighbors(slug, nav), null, slug);
  }
});

test('un slug que no está en el menú devuelve null', () => {
  assert.equal(navNeighbors('no-existe', NAV), null);
  assert.equal(navNeighbors('', NAV), null);
  assert.equal(navNeighbors('the-bloop', []), null);
});

test('un slug no coincide por prefijo ni por subcadena', () => {
  assert.equal(navNeighbors('the', NAV), null);
  assert.equal(navNeighbors('bloop', NAV), null);
});

test('si el slug aparece dos veces, manda la primera aparición', () => {
  const dup: NavGroupLike[] = [
    { title: 'A', items: [link('Uno', '/wiki/uno'), link('Dos', '/wiki/dos')] },
    { title: 'B', items: [link('Dos', '/wiki/dos'), link('Tres', '/wiki/tres')] },
  ];
  assert.equal(navNeighbors('dos', dup)?.group, 'A');
});

test('groupLabel: los títulos de universo en mayúsculas se leen como nombre propio', () => {
  assert.equal(groupLabel('UNIVERSO COLOSOS'), 'Universo Colosos');
  assert.equal(groupLabel('CAPITÁN DE GALEÓN'), 'Capitán de Galeón');
  assert.equal(groupLabel('LA HECATOMBE DEL LAPEÓN'), 'La Hecatombe del Lapeón');
  assert.equal(groupLabel('ELLOS LLEGARON'), 'Ellos Llegaron');
  assert.equal(groupLabel('Animales'), 'Animales');
  assert.equal(groupLabel('Libros del universo Colosos'), 'Libros del universo Colosos');
});

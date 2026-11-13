import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flattenNav, NavigationSchema, navigationProblems, navSlugs, unlistedSlugs, type NavGroup } from '../../src/core/content/navigation.ts';
import { WIKI_NAVIGATION } from '../../src/features/monsters/config/wiki-navigation.ts';

const nav: NavGroup[] = [
  {
    title: 'UNIVERSO COLOSOS',
    items: [
      { title: 'Wiki', url: '/wiki', icon: 'monitor' },
      { title: 'Personajes', url: '#', icon: 'skull', items: [{ title: 'Animales', url: '/wiki/animales', items: [{ title: 'The Bloop', url: '/wiki/the-bloop' }] }] },
      { title: 'Versus', url: '/wiki/arena', icon: 'swords' },
    ],
  },
];

test('el menú de los archivos cumple el esquema y no tiene problemas', async () => {
  assert.ok(NavigationSchema.safeParse(WIKI_NAVIGATION).success);
  const fs = await import('node:fs');
  const slugs = new Set(fs.readdirSync('src/content').filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, '')));
  assert.deepEqual(navigationProblems(WIKI_NAVIGATION, slugs), []);
});

test('esquema: iconos de la lista, enlaces internos y como mucho 3 niveles', () => {
  assert.ok(NavigationSchema.safeParse(nav).success);
  const badIcon = [{ title: 'X', items: [{ title: 'A', url: '/wiki', icon: 'bomb' }] }];
  assert.equal(NavigationSchema.safeParse(badIcon).success, false);
  for (const url of ['https://evil.example', 'javascript:alert(1)', '/comunidad', '/wiki/Mal Slug', '//evil']) {
    assert.equal(NavigationSchema.safeParse([{ title: 'X', items: [{ title: 'A', url }] }]).success, false, url);
  }
  const deep = [{ title: 'X', items: [{ title: '1', url: '#', items: [{ title: '2', url: '#', items: [{ title: '3', url: '#', items: [{ title: '4', url: '/wiki/a' }] }] }] }] }];
  assert.equal(NavigationSchema.safeParse(deep).success, false);
});

test('navSlugs y flattenNav: solo fichas, con su camino', () => {
  assert.deepEqual([...navSlugs(nav)], ['animales', 'the-bloop']);
  assert.deepEqual(flattenNav(nav).find((e) => e.item.url === '/wiki/the-bloop')?.path, ['UNIVERSO COLOSOS', 'Personajes', 'Animales']);
});

test('navigationProblems: ficha inexistente, repetida y grupo vacío', () => {
  const broken: NavGroup[] = [{ title: 'U', items: [{ title: 'Vacío', url: '#' }, { title: 'A', url: '/wiki/a' }, { title: 'A otra vez', url: '/wiki/a' }, { title: 'Nada', url: '/wiki/nada' }] }];
  const problems = navigationProblems(broken, new Set(['a']));
  assert.equal(problems.length, 3, problems.join('\n'));
  assert.ok(problems.some((p) => p.includes('grupo sin entradas')));
  assert.ok(problems.some((p) => p.includes('dos veces')));
  assert.ok(problems.some((p) => p.includes('no existe (nada)')));
});

test('unlistedSlugs: las fichas que faltan en el menú', () => {
  assert.deepEqual(unlistedSlugs(nav, ['the-bloop', 'animales', 'nueva']), ['nueva']);
});

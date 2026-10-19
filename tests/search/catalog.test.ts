import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogFilter, isIndexCategory, tipoCounts } from '../../src/core/search/catalog.ts';

const a = (slug: string, category: string, universe = 'Colosos') => ({ slug, frontmatter: { category, universe } });
const ITEMS = [
  a('maja', 'Coloso'),
  a('lemug', 'Titán'),
  a('phillip', 'Humano'),
  a('animales', 'Directorio'),
  a('colosos', 'Categoría'),
  a('galeon', 'Historia', 'Capitán de Galeón'),
];

test('sin filtros: todo menos directorios y páginas de categoría', () => {
  assert.deepEqual(catalogFilter(ITEMS, {}).map((i) => i.slug), ['maja', 'lemug', 'phillip', 'galeon']);
});

test('por tipo y por universo', () => {
  assert.deepEqual(catalogFilter(ITEMS, { tipo: 'criaturas' }).map((i) => i.slug), ['maja', 'lemug']);
  assert.deepEqual(catalogFilter(ITEMS, { universe: 'Capitán de Galeón' }).map((i) => i.slug), ['galeon']);
  assert.deepEqual(catalogFilter(ITEMS, { tipo: 'criaturas', universe: 'Capitán de Galeón' }), []);
});

test('tipoCounts: solo grupos con contenido, en orden, sin directorios', () => {
  assert.deepEqual(tipoCounts(ITEMS), [
    { id: 'criaturas', label: 'Criaturas', count: 2 },
    { id: 'personajes', label: 'Personajes', count: 1 },
    { id: 'historia', label: 'Historia', count: 1 },
  ]);
});

test('isIndexCategory: solo Directorio y Categoría', () => {
  assert.equal(isIndexCategory('Directorio'), true);
  assert.equal(isIndexCategory('Categoría'), true);
  assert.equal(isIndexCategory('Coloso'), false);
  assert.equal(isIndexCategory(undefined), false);
});

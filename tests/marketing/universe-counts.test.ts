import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countByUniverse, expedientesLabel } from '../../src/features/marketing/lib/universe-counts.ts';

const a = (universe: string, extra: { category?: string; status?: 'proximamente' } = {}) => ({
  frontmatter: { universe, ...extra },
});

const ARTICLES = [
  a('Colosos', { category: 'Coloso' }),
  a('Colosos', { category: 'Humano' }),
  a('Colosos', { category: 'Directorio' }),
  a('Colosos', { category: 'Categoría' }),
  a('Colosos', { category: 'Coloso', status: 'proximamente' }),
  a('Capitán de Galeón', { category: 'Historia' }),
  a('Ellos Llegaron'), // sin categoría: cuenta
];

test('cuenta por universo sin índices (Directorio/Categoría) ni sellados', () => {
  const countOf = countByUniverse(ARTICLES);
  assert.equal(countOf('Colosos'), 2);
  assert.equal(countOf('Capitán de Galeón'), 1);
  assert.equal(countOf('Ellos Llegaron'), 1);
});

test('un universo sin fichas (o solo con selladas) da 0', () => {
  assert.equal(countByUniverse(ARTICLES)('La Hecatombe del Lapeón'), 0);
  assert.equal(countByUniverse([a('X', { status: 'proximamente' })])('X'), 0);
  assert.equal(countByUniverse([])('Colosos'), 0);
});

test('expedientesLabel: singular solo con 1', () => {
  assert.equal(expedientesLabel(0), '0 expedientes');
  assert.equal(expedientesLabel(1), '1 expediente');
  assert.equal(expedientesLabel(17), '17 expedientes');
});

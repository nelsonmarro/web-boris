import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { TIPOS, tipoOf, isTipoId } from '../../src/core/search/tipos.ts';

test('grupos en el orden de la spec y con ids únicos', () => {
  assert.deepEqual(TIPOS.map((t) => t.id), ['criaturas', 'personajes', 'especies', 'organizaciones', 'vehiculos', 'historia']);
  assert.equal(new Set(TIPOS.map((t) => t.id)).size, TIPOS.length);
});

test('tipoOf', () => {
  assert.equal(tipoOf('Coloso'), 'criaturas');
  assert.equal(tipoOf('Titán'), 'criaturas');
  assert.equal(tipoOf('Humano'), 'personajes');
  assert.equal(tipoOf('Libro'), 'historia');
  assert.equal(tipoOf('Directorio'), null);
  assert.equal(tipoOf('Categoría'), null);
  assert.equal(tipoOf(undefined), null);
  assert.ok(isTipoId('especies'));
  assert.ok(!isTipoId('zzz'));
});

test('cada categoría del contenido pertenece como mucho a un grupo', () => {
  const cats = new Set<string>();
  for (const f of readdirSync('src/content').filter((n) => n.endsWith('.mdx'))) {
    const m = readFileSync(`src/content/${f}`, 'utf8').match(/^category:\s*["']?([^"'\n]+)["']?/m);
    if (m) cats.add(m[1].trim());
  }
  for (const c of cats) {
    const owners = TIPOS.filter((t) => t.categories.includes(c));
    assert.ok(owners.length <= 1, `${c} está en ${owners.length} grupos`);
    if (c !== 'Directorio' && c !== 'Categoría') assert.equal(owners.length, 1, `${c} no tiene grupo`);
  }
});

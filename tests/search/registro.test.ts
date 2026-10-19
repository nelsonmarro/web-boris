import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIPOS } from '../../src/core/search/tipos.ts';
import { progress, registroEntries, registroSlugs, registroTotal } from '../../src/core/search/registro.ts';

type Entry = Parameters<typeof registroEntries>[0][number];

const entry = (slug: string, category: string | undefined, over: Partial<Entry> = {}): Entry => ({
  slug,
  title: slug,
  aliases: [],
  category,
  universe: 'Universo Colosos',
  richness: 0,
  linkable: true,
  ...over,
});

const sealed = (slug: string, category: string) => entry(slug, category, { status: 'proximamente', richness: -100 });

test('los directorios y las categorías quedan fuera del registro', () => {
  const groups = registroEntries([
    entry('colosos', 'Directorio'),
    entry('animales', 'Categoría'),
    entry('the-bloop', 'Coloso'),
  ]);
  const slugs = groups.flatMap((g) => g.items.map((i) => i.slug));
  assert.deepEqual(slugs, ['the-bloop']);
});

test('los grupos siguen el orden de TIPOS y los vacíos no aparecen', () => {
  const groups = registroEntries([
    entry('libro', 'Libro'),
    entry('barco', 'Vehículo'),
    entry('cael', 'Humano'),
    entry('bloop', 'Coloso'),
  ]);
  assert.deepEqual(groups.map((g) => g.tipo), ['criaturas', 'personajes', 'vehiculos', 'historia']);
  assert.deepEqual(groups.map((g) => g.label), ['Criaturas', 'Personajes', 'Vehículos', 'Historia']);
  const order = TIPOS.map((t) => t.id);
  const positions = groups.map((g) => order.indexOf(g.tipo));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test('categorías distintas del mismo tipo comparten grupo', () => {
  const groups = registroEntries([entry('a', 'Coloso'), entry('b', 'Titán'), entry('c', 'Animal')]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].tipo, 'criaturas');
  assert.equal(groups[0].items.length, 3);
});

test('dentro de cada grupo se ordena por richness descendente y, a igualdad, por título', () => {
  const groups = registroEntries([
    entry('pobre', 'Coloso', { title: 'Pobre', richness: 0 }),
    entry('rica', 'Coloso', { title: 'Rica', richness: 4 }),
    entry('media-b', 'Coloso', { title: 'Óscar', richness: 2 }),
    entry('media-a', 'Coloso', { title: 'Alfa', richness: 2 }),
    sealed('sellada', 'Coloso'),
  ]);
  assert.deepEqual(groups[0].items.map((i) => i.slug), ['rica', 'media-a', 'media-b', 'pobre', 'sellada']);
});

test('registroEntries no muta la lista de entrada', () => {
  const input = [entry('b', 'Coloso', { richness: 1 }), entry('a', 'Coloso', { richness: 5 })];
  const copy = [...input];
  registroEntries(input);
  assert.deepEqual(input, copy);
});

test('los expedientes sellados salen en el registro pero no cuentan en el total', () => {
  const entries = [
    entry('a', 'Coloso'),
    entry('b', 'Humano'),
    sealed('c', 'Humano'),
    entry('d', 'Directorio'),
  ];
  assert.equal(registroTotal(entries), 2);
  assert.ok(registroEntries(entries).flatMap((g) => g.items).some((i) => i.slug === 'c'));
});

test('registroTotal de un archivo vacío es 0', () => {
  assert.equal(registroTotal([]), 0);
});

const base = [
  entry('a', 'Coloso'),
  entry('b', 'Humano'),
  sealed('c', 'Humano'),
  entry('d', 'Directorio'),
];

test('progress cuenta los vistos que existen y no están sellados', () => {
  assert.deepEqual(progress(base, { a: '2026-10-19T10:00:00.000Z', b: '2026-10-19T11:00:00.000Z' }), {
    opened: 2,
    total: 2,
  });
  assert.deepEqual(progress(base, {}), { opened: 0, total: 2 });
});

test('progress ignora los slugs desconocidos, los sellados y los índices', () => {
  const seen = {
    a: '2026-10-19T10:00:00.000Z',
    fantasma: '2026-10-19T10:00:00.000Z',
    c: '2026-10-19T10:00:00.000Z',
    d: '2026-10-19T10:00:00.000Z',
  };
  assert.deepEqual(progress(base, seen), { opened: 1, total: 2 });
});

test('progress acepta entradas mínimas (solo el slug)', () => {
  assert.deepEqual(progress([{ slug: 'a' }, { slug: 'b' }], { a: 'x' }), { opened: 1, total: 2 });
});

test('registroSlugs devuelve los slugs que cuentan, en el mismo número que registroTotal', () => {
  const slugs = registroSlugs(base);
  assert.deepEqual(slugs, ['a', 'b']);
  assert.equal(slugs.length, registroTotal(base));
});

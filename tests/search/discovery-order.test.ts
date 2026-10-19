import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareDiscovery, richness } from '../../src/core/search/discovery-order.ts';

const full = { title: 'Zeta', stats: {}, image: '/assets/X/x.webp', infobox: { A: { k: 'v' } }, description: 'd' };

test('un stub siempre va detrás de un artículo con contenido', () => {
  const stub = { title: 'Aaa', status: 'proximamente' as const, stats: {} };
  const bare = { title: 'Zzz' };
  assert.ok(compareDiscovery(stub, bare) > 0);
  assert.ok(compareDiscovery(bare, stub) < 0);
  assert.ok(compareDiscovery(stub, full) > 0);
});

test('con stats va antes que sin stats', () => {
  const a = { title: 'Zzz', stats: {} };
  const b = { title: 'Aaa' };
  assert.ok(compareDiscovery(a, b) < 0);
});

test('un directorio va detrás de una ficha con el mismo resto', () => {
  const dir = { title: 'Aaa', category: 'Directorio' };
  const dir2 = { title: 'Aaa', category: 'Categoría' };
  const ficha = { title: 'Zzz', category: 'Humano' };
  assert.ok(compareDiscovery(dir, ficha) > 0);
  assert.ok(compareDiscovery(dir2, ficha) > 0);
});

test('el desempate es alfabético en español', () => {
  const sorted = [{ title: 'Óscar' }, { title: 'Zeta' }, { title: 'Alfa' }].sort(compareDiscovery);
  assert.deepEqual(sorted.map((a) => a.title), ['Alfa', 'Óscar', 'Zeta']);
});

test('las imágenes de marca no suman', () => {
  assert.equal(richness({ image: '/assets/Branding/logo.webp' }), 0);
  assert.equal(richness({ image: '/assets/Cael/c.webp' }), 1);
});

test('infobox vacío no suma', () => {
  assert.equal(richness({ infobox: {} }), 0);
  assert.equal(richness({ infobox: { A: { k: 'v' } } }), 1);
});

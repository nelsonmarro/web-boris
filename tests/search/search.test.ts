import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntityIndex } from '../../src/core/search/entity-index.ts';
import { levenshtein, search, suggest } from '../../src/core/search/search.ts';

const art = (slug: string, title: string, extra: Record<string, unknown> = {}) => ({
  slug,
  frontmatter: { title, universe: 'Colosos', category: 'Coloso', image: '/assets/x.webp', ...extra },
});

const { entries } = buildEntityIndex([
  art('the-bloop', 'The Bloop Ojo Solo', { stats: {} }),
  art('phillip-forte', 'Phillip Forte', { category: 'Humano' }),
  art('vlad-julia', 'Vlad Julia', { aliases: ['el pez cangrejo'], stats: {} }),
  art('capitan-de-galeon', 'Capitán de Galeón', { category: 'Historia', universe: 'Capitán de Galeón' }),
  art('humanos-colosos', 'Humanos del Universo Colosos', { category: 'Directorio', description: 'Encabezados por Phillip Forte.' }),
  art('labodotype', 'Labodotype macrostoma', { category: 'Especie' }),
  art('cael-cortes', 'Cael Cortés', { category: 'Humano', status: 'proximamente' }),
  art('cael', 'Cael', { category: 'Humano' }),
]);

const slugs = (q: string) => search(q, entries).map((h) => h.entry.slug);

test('levenshtein', () => {
  assert.equal(levenshtein('philip', 'phillip'), 1);
  assert.equal(levenshtein('blopu', 'bloop'), 2);
});

test('palabras en cualquier orden', () => {
  assert.equal(slugs('bloop solo')[0], 'the-bloop');
  assert.equal(slugs('solo bloop')[0], 'the-bloop');
});

test('errata de una letra en palabras de 5 o más', () => {
  assert.equal(slugs('philip')[0], 'phillip-forte');
  assert.equal(slugs('bloup')[0], 'the-bloop');
});

test('apodo con matchedAlias', () => {
  const [hit] = search('cangrejo', entries);
  assert.equal(hit.entry.slug, 'vlad-julia');
  assert.equal(hit.matchedAlias, 'el pez cangrejo');
});

test('tildes y orden: la ficha va antes que el directorio', () => {
  assert.equal(slugs('galeon')[0], 'capitan-de-galeon');
  assert.deepEqual(slugs('phillip').slice(0, 2), ['phillip-forte', 'humanos-colosos']);
});

test('una palabra vacía sola no descarta todo', () => {
  assert.ok(slugs('la').includes('labodotype'));
});

test('título exacto primero; los Próximamente detrás de su grupo', () => {
  assert.equal(slugs('cael')[0], 'cael');
  assert.equal(slugs('cael c')[0], 'cael-cortes'); // 80 (el título empieza por la consulta) > 60
  const humanos = slugs('humano'); // directorio por título (60) y luego tres por categoría (10)
  assert.equal(humanos[0], 'humanos-colosos');
  assert.equal(humanos.at(-1), 'cael-cortes');
});

test('consulta vacía: orden por riqueza', () => {
  const all = slugs('');
  assert.equal(all.at(-1), 'cael-cortes');
  assert.equal(all.length, entries.length);
});

test('suggest para lo que la búsqueda no encuentra', () => {
  assert.equal(search('blopu', entries).length, 0);
  assert.deepEqual(suggest('blopu', entries), { slug: 'the-bloop', title: 'The Bloop Ojo Solo' });
  assert.equal(suggest('zzzz', entries), null);
});

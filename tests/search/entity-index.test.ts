import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, wordsOf, buildEntityIndex, findMentions } from '../../src/core/search/entity-index.ts';

const art = (slug: string, title: string, extra: Record<string, unknown> = {}) => ({
  slug,
  frontmatter: { title, universe: 'Colosos', category: 'Coloso', ...extra },
});

const INDEX = buildEntityIndex([
  art('el-gran-maja', 'El Gran Majá', { aliases: ['Cranioplanus', 'anguila sonriente'] }),
  art('vlad', 'Vlad', { category: 'Humano' }),
  art('vlad-julia', 'Vlad Julia', { aliases: ['el pez cangrejo'] }),
  art('bogbo', 'Bogbo'),
  art('le-mug', "Le'Mug", { category: 'Titán' }),
  art('animales-colosos', 'Animales del Universo Colosos', { category: 'Directorio' }),
  art('cael-cortes', 'Cael Cortés', { category: 'Humano', status: 'proximamente' }),
]);

test('normalize quita tildes, apóstrofos y signos', () => {
  assert.equal(normalize("Le'Mug"), 'lemug');
  assert.equal(normalize('Capitán de Galeón'), 'capitan de galeon');
  assert.equal(normalize('  Slowdown-Criyonte!! '), 'slowdown criyonte');
});

test('wordsOf conserva posiciones originales', () => {
  const words = wordsOf("Vio a Le'Mug.");
  assert.deepEqual(words.map((w) => w.norm), ['vio', 'a', 'lemug']);
  assert.equal("Vio a Le'Mug.".slice(words[2].start, words[2].end), "Le'Mug");
});

test('gana el nombre más largo', () => {
  const m = findMentions('Vlad Julia ataca.', INDEX);
  assert.deepEqual(m.map((x) => x.slug), ['vlad-julia']);
});

test('límite de palabra: Bogbos no es Bogbo', () => {
  assert.equal(findMentions('Los Bogbos nadan.', INDEX).length, 0);
});

test('regla del nombre propio para nombres de una palabra', () => {
  assert.equal(findMentions('un bogbo cualquiera', INDEX).length, 0);
  assert.deepEqual(findMentions('Bogbo emergió', INDEX).map((x) => x.slug), ['bogbo']);
  assert.deepEqual(findMentions('la anguila sonriente', INDEX).map((x) => x.slug), ['el-gran-maja']);
  assert.equal(findMentions('cranioplanus', INDEX).length, 0);
});

test('nunca la propia ficha y nunca entidades no enlazables', () => {
  assert.equal(findMentions('El Gran Majá', INDEX, { self: 'el-gran-maja' }).length, 0);
  assert.equal(findMentions('Animales del Universo Colosos', INDEX).length, 0);
});

test('las entradas llevan richness y linkable', () => {
  const cael = INDEX.bySlug.get('cael-cortes')!;
  assert.ok(cael.richness < 0);
  assert.equal(INDEX.bySlug.get('animales-colosos')!.linkable, false);
  assert.equal(INDEX.bySlug.get('le-mug')!.linkable, true);
});

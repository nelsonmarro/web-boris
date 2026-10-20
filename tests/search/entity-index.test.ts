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

test('la propia ficha consume su nombre largo: Vlad no roba "Vlad Julia" (self)', () => {
  assert.deepEqual(findMentions('Vlad Julia ataca.', INDEX, { self: 'vlad-julia' }), []);
  // sin self sigue ganando el nombre largo
  assert.deepEqual(findMentions('Vlad Julia ataca.', INDEX).map((x) => x.slug), ['vlad-julia']);
});

test('con self, las demás menciones del texto siguen saliendo en su sitio', () => {
  const text = 'Vlad Julia vio a Vlad.';
  const mentions = findMentions(text, INDEX, { self: 'vlad-julia' });
  assert.equal(mentions.length, 1);
  assert.equal(mentions[0].slug, 'vlad');
  assert.equal(text.slice(mentions[0].start, mentions[0].end), 'Vlad');
  assert.equal(mentions[0].start, text.lastIndexOf('Vlad'));
});

test('start y end de la mención recortan exactamente el nombre del texto', () => {
  const text = "Vio a Le'Mug.";
  const mentions = findMentions(text, INDEX);
  assert.equal(mentions.length, 1);
  assert.equal(mentions[0].slug, 'le-mug');
  assert.equal(mentions[0].name, "Le'Mug");
  assert.equal(text.slice(mentions[0].start, mentions[0].end), "Le'Mug");

  const multi = 'Entonces Vlad Julia ataca.';
  const [m] = findMentions(multi, INDEX);
  assert.equal(multi.slice(m.start, m.end), 'Vlad Julia');
});

test('las entradas llevan richness y linkable', () => {
  const cael = INDEX.bySlug.get('cael-cortes')!;
  assert.ok(cael.richness < 0);
  assert.equal(INDEX.bySlug.get('animales-colosos')!.linkable, false);
  assert.equal(INDEX.bySlug.get('le-mug')!.linkable, true);
});

// Contracciones «del»/«al» + nombres que empiezan por «El» (decisión D3).
const CONTRACCIONES = buildEntityIndex([
  art('el-angel', 'El Ángel'),
  art('el-gran-maja', 'El Gran Majá'),
]);

test('contracción: «del Ángel» enlaza el nombre sin la contracción', () => {
  const text = 'la llegada del Ángel';
  const m = findMentions(text, CONTRACCIONES);
  assert.deepEqual(m.map((x) => x.slug), ['el-angel']);
  assert.equal(text.slice(m[0].start, m[0].end), 'Ángel');
  assert.equal(m[0].name, 'El Ángel');
});

test('contracción: «al Gran Majá» de varias palabras', () => {
  const text = 'se enfrentó al Gran Majá';
  const m = findMentions(text, CONTRACCIONES);
  assert.deepEqual(m.map((x) => x.slug), ['el-gran-maja']);
  assert.equal(text.slice(m[0].start, m[0].end), 'Gran Majá');
});

test('contracción: «del ángel» en minúscula no enlaza', () => {
  assert.equal(findMentions('la llegada del ángel', CONTRACCIONES).length, 0);
});

test('contracción: «el Ángel» sin contracción sigue funcionando', () => {
  const text = 'vio. El Ángel nadó';
  const m = findMentions(text, CONTRACCIONES);
  assert.deepEqual(m.map((x) => x.slug), ['el-angel']);
  assert.equal(text.slice(m[0].start, m[0].end), 'El Ángel');
});

test('contracción: la propia ficha consume pero no emite', () => {
  assert.equal(findMentions('la llegada del Ángel', CONTRACCIONES, { self: 'el-angel' }).length, 0);
});

test('contracción: «Al» al inicio de frase y «del» al final del texto', () => {
  const text = 'Al Gran Majá le temen. Es la llegada del';
  const m = findMentions(text, CONTRACCIONES);
  assert.deepEqual(m.map((x) => x.slug), ['el-gran-maja']);
  assert.equal(text.slice(m[0].start, m[0].end), 'Gran Majá');
});

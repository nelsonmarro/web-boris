import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidSlug, overlayArticles } from '../../src/core/content/overlay.ts';
import type { WikiArticle } from '../../src/core/types/wiki.ts';

const article = (slug: string, title: string, content = 'Texto.'): WikiArticle => ({ slug, frontmatter: { title, universe: 'Colosos' }, content });
const FILES = [article('the-bloop', 'The Bloop'), article('luque', 'Luque')];
const data = (title: string, content = 'Nuevo.') => ({ frontmatter: { title, universe: 'Colosos' }, content });

test('sin documentos, quedan los archivos (ordenados por título)', () => {
  assert.deepEqual(overlayArticles(FILES, []).map((a) => a.slug), ['luque', 'the-bloop']);
});

test('lo publicado en el panel gana al archivo y puede añadir fichas nuevas', () => {
  const result = overlayArticles(FILES, [
    { key: 'the-bloop', published: data('The Bloop Ojo Solo', 'Editado.'), deleted: false },
    { key: 'ficha-nueva', published: data('Ábaco'), deleted: false },
  ]);
  assert.deepEqual(result.map((a) => a.slug), ['ficha-nueva', 'luque', 'the-bloop']);
  assert.equal(result.find((a) => a.slug === 'the-bloop')?.content, 'Editado.');
  assert.equal(result.find((a) => a.slug === 'the-bloop')?.frontmatter.title, 'The Bloop Ojo Solo');
});

test('un borrador sin publicar no cambia la web', () => {
  const result = overlayArticles(FILES, [
    { key: 'the-bloop', published: null, deleted: false },
    { key: 'solo-borrador', published: null, deleted: false },
  ]);
  assert.deepEqual(result, overlayArticles(FILES, []));
});

test('`deleted` oculta la ficha, también la del archivo', () => {
  const result = overlayArticles(FILES, [{ key: 'luque', published: data('Luque'), deleted: true }]);
  assert.deepEqual(result.map((a) => a.slug), ['the-bloop']);
});

test('un documento roto se ignora, se avisa y queda el archivo', () => {
  const errors: string[] = [];
  const result = overlayArticles(
    FILES,
    [
      { key: 'the-bloop', published: { frontmatter: { title: 7 }, content: 'x' }, deleted: false },
      { key: 'luque', published: 'no es un objeto', deleted: false },
      { key: 'Slug Malo', published: data('X'), deleted: false },
      { key: 'arena', published: data('Arena'), deleted: false },
    ],
    (message) => errors.push(message),
  );
  assert.deepEqual(result, overlayArticles(FILES, []));
  assert.equal(errors.length, 4);
});

test('isValidSlug: minúsculas, cifras y guiones; sin reservados ni «-vs-»', () => {
  for (const slug of ['the-bloop', 'a', 'x-2']) assert.equal(isValidSlug(slug), true, slug);
  for (const slug of ['', 'The-Bloop', 'con espacio', '-a', 'a-', 'a--b', '../etc', 'arena', 'registro', 'a-vs-b', 'a-vs', 'x'.repeat(81)]) {
    assert.equal(isValidSlug(slug), false, slug);
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mdxErrorInSpanish } from '../../src/features/admin/lib/mdx-errors.ts';
import { checkMdxBody } from '../../src/features/admin/lib/article-check.ts';
import { checkList } from '../../src/features/admin/lib/list-check.ts';

test('mdxErrorInSpanish: los errores típicos, en llano', () => {
  assert.equal(mdxErrorInSpanish('Expected a closing tag for `<WikiQuote>` (1:1-1:12) before the end of `paragraph`'), 'falta cerrar la etiqueta <WikiQuote>: termínala con </WikiQuote> (o con /> si no lleva texto dentro)');
  assert.equal(mdxErrorInSpanish('Unexpected closing tag `</i>`, expected corresponding closing tag for `<b>` (1:7-1:10)'), 'la etiqueta <b> se cierra con </i>: deben llamarse igual');
  assert.equal(mdxErrorInSpanish('Unexpected closing slash `/` in tag, expected an open tag first'), 'hay una etiqueta de cierre </…> sin su etiqueta de apertura');
  assert.equal(mdxErrorInSpanish('Unexpected end of file before name, expected a character that can start a name'), 'el texto acaba con una etiqueta < > sin terminar');
  assert.equal(mdxErrorInSpanish('algo nuevo'), 'hay una etiqueta < > mal escrita');
});

test('checkMdxBody devuelve el aviso en español, con su línea', async () => {
  const [message] = await checkMdxBody('Hola\n\n<WikiQuote>sin cerrar\n', new Set(['WikiQuote']));
  assert.equal(message, 'Texto de la ficha (línea 3): falta cerrar la etiqueta <WikiQuote>: termínala con </WikiQuote> (o con /> si no lleva texto dentro).');
  assert.doesNotMatch(message, /Expected|Unexpected/);
});

test('las novedades avisan en español', () => {
  const ctx = { slugs: new Set<string>(), fighterSlugs: new Set<string>(), sealedSlugs: new Set<string>(), universeKeys: new Set<string>(), canalIds: new Set<string>(), knownVideoIds: new Set<string>(), currentPolls: [], retired: new Map(), now: new Date('2026-11-17T12:00:00Z') };
  const result = checkList('news', [{ id: '2026-11-17-x', fecha: '2026-11-17', titulo: '', resumen: 'Algo', enlace: '/wiki' }], ctx);
  assert.ok('errors' in result);
  assert.ok(result.errors.some((e) => e.includes('el título necesita al menos 3 letras')), result.errors.join(' | '));
  assert.ok(result.errors.every((e) => !/Too small|expected/.test(e)), result.errors.join(' | '));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalJson } from '../../src/features/admin/lib/canonical-json.ts';
import { searchArticles } from '../../src/features/admin/lib/panel-search.ts';
import { errorTarget } from '../../src/features/admin/lib/error-target.ts';
import { LIST_PUBLIC_PATHS, LIST_ROUTES } from '../../src/features/admin/lib/list-routes.ts';

test('canonicalJson no depende del orden de las claves', () => {
  const file = [{ fecha: '2026-11-01', titulo: 'A', resumen: 'r', enlace: '/wiki', id: '2026-11-01-a' }];
  const fromDb = [{ id: '2026-11-01-a', enlace: '/wiki', fecha: '2026-11-01', resumen: 'r', titulo: 'A' }];
  assert.notEqual(JSON.stringify(file), JSON.stringify(fromDb));
  assert.equal(canonicalJson(file), canonicalJson(fromDb));
  assert.equal(canonicalJson({ b: { d: 1, c: [{ z: 1, y: 2 }] }, a: null }), '{"a":null,"b":{"c":[{"y":2,"z":1}],"d":1}}');
});

test('canonicalJson distingue el orden de las listas y los valores', () => {
  assert.notEqual(canonicalJson(['a', 'b']), canonicalJson(['b', 'a']));
  assert.notEqual(canonicalJson({ a: 1 }), canonicalJson({ a: 2 }));
});

const fichas = [
  { slug: 'the-bloop', title: 'The Bloop Ojo Solo', universe: 'Universo Colosos', aliases: ['Ojo Solo'] },
  { slug: 'el-gran-maja', title: 'El Gran Majá', universe: 'Universo Colosos' },
  { slug: 'phillip-forte', title: 'Phillip Forte', universe: 'Capitán de Galeón' },
];

test('searchArticles encuentra con palabras sueltas, erratas, apodos y la dirección', () => {
  assert.deepEqual(searchArticles(fichas, 'el bloop').map((f) => f.slug), ['the-bloop']);
  assert.deepEqual(searchArticles(fichas, 'gran maja').map((f) => f.slug), ['el-gran-maja']);
  assert.deepEqual(searchArticles(fichas, 'philip').map((f) => f.slug), ['phillip-forte']);
  assert.deepEqual(searchArticles(fichas, 'ojo solo').map((f) => f.slug), ['the-bloop']);
  assert.deepEqual(searchArticles(fichas, 'galeon').map((f) => f.slug), ['phillip-forte']);
  assert.equal(searchArticles(fichas, '  ').length, 3);
  assert.equal(searchArticles(fichas, 'zzzz').length, 0);
});

test('errorTarget lleva cada error a su campo', () => {
  assert.deepEqual(errorTarget('Falta la descripción corta.'), { field: 'description' });
  assert.deepEqual(errorTarget('La portada necesita un pie de foto.'), { field: 'imageCaption' });
  assert.deepEqual(errorTarget('Título: Too small'), { field: 'title' });
  assert.deepEqual(errorTarget('La ficha lateral necesita al menos una sección con datos.'), { field: 'infobox' });
  assert.deepEqual(errorTarget('Texto de la ficha (línea 12): Unexpected end. Revisa que cada etiqueta < > esté bien cerrada.'), { field: 'content', line: 12 });
  assert.deepEqual(errorTarget('Texto de la ficha: En <div>, el atributo «onclick» no está permitido'), { field: 'content' });
  assert.deepEqual(errorTarget('El texto necesita al menos 2 apartados «##» (tiene 1, sin contar Referencias).'), { field: 'content' });
  assert.deepEqual(errorTarget('El apodo «Ojo» ya lo usa otra ficha.'), { field: 'aliases' });
  assert.deepEqual(errorTarget('La ficha relacionada «x» no existe.'), { field: 'related' });
  assert.deepEqual(errorTarget('La imagen «/media/a.webp» no existe.', '/media/a.webp'), { field: 'image' });
  assert.deepEqual(errorTarget('La imagen «/media/b.webp» no existe.', '/media/a.webp'), { field: 'content' });
  assert.equal(errorTarget('La dirección de la ficha no es válida.'), null);
});

test('cada lista tiene su página pública', () => {
  for (const key of Object.values(LIST_ROUTES)) assert.match(LIST_PUBLIC_PATHS[key], /^\//);
});

test('los avisos del filtro del texto dicen su línea', async () => {
  const { checkMdxBody } = await import('../../src/features/admin/lib/article-check.ts');
  const errors = await checkMdxBody('## Uno\n\nTexto.\n\n<div onclick="x">hola</div>\n', new Set(['WikiImage']));
  assert.deepEqual(errors, ['Texto de la ficha (línea 5): En <div>, el atributo «onclick» no está permitido.']);
  assert.deepEqual(errorTarget(errors[0]), { field: 'content', line: 5 });
});

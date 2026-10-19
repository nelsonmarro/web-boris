import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionCompleteness } from '../../src/core/search/section-completeness.ts';

test('un apartado solo con <Proximamente /> cuenta como pendiente', () => {
  const mdx = `Entradilla.

## Características

Texto canónico de la ficha.

## Alimentación

<Proximamente />
`;
  assert.deepEqual(sectionCompleteness(mdx), { done: 1, total: 2, pending: ['Alimentación'] });
});

test('un apartado con texto y <Proximamente /> cuenta como hecho', () => {
  const mdx = `## Historia

Hay un primer párrafo con lo que se sabe.

<Proximamente />

## Personalidad

<Proximamente />
`;
  assert.deepEqual(sectionCompleteness(mdx), { done: 1, total: 2, pending: ['Personalidad'] });
});

test('"Referencias" queda excluido, esté pendiente o no', () => {
  const mdx = `## Características

Texto.

## Referencias

<Proximamente />
`;
  assert.deepEqual(sectionCompleteness(mdx), { done: 1, total: 1, pending: [] });
  assert.deepEqual(sectionCompleteness('## Hola\n\nTexto.\n\n## referencias\n\n- Fuente'), { done: 1, total: 1, pending: [] });
});

test('sin ## → { done: 0, total: 0, pending: [] }', () => {
  assert.deepEqual(sectionCompleteness('Solo una entradilla.\n\n<Proximamente />\n'), { done: 0, total: 0, pending: [] });
  assert.deepEqual(sectionCompleteness(''), { done: 0, total: 0, pending: [] });
});

test('las etiquetas JSX (también en varias líneas) y los comentarios no cuentan como texto', () => {
  const mdx = `## Armamento

<WikiImage
  alt="Imagen pendiente"
  caption="Sin imagen concreta todavía"
  align="right"
/>

{/* pendiente de Boris */}

<!-- otro comentario -->

<Proximamente titulo="Armamento" />

## Tripulación

<Proximamente>Texto de aviso del propio bloque.</Proximamente>
`;
  assert.deepEqual(sectionCompleteness(mdx), { done: 0, total: 2, pending: ['Armamento', 'Tripulación'] });
});

test('el texto dentro de otros componentes (hijos) cuenta como contenido', () => {
  const mdx = `## Registro

<RegistroDelirium>Informe sobre IPCARO.</RegistroDelirium>

<Proximamente />
`;
  assert.deepEqual(sectionCompleteness(mdx), { done: 1, total: 1, pending: [] });
});

test('### y el contenido sin <Proximamente> no parten ni vician los apartados', () => {
  const mdx = `## Cuerpo

### Detalle

Texto del detalle.

## Vacío

Sin marca de pendiente.
`;
  assert.deepEqual(sectionCompleteness(mdx), { done: 2, total: 2, pending: [] });
});

test('un ## dentro de un bloque de código no es un apartado', () => {
  const mdx = '## Real\n\nTexto.\n\n```md\n## Falso\n\n<Proximamente />\n```\n';
  assert.deepEqual(sectionCompleteness(mdx), { done: 1, total: 1, pending: [] });
});

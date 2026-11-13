import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { h2Titles } from '../../src/core/content/h2-titles.ts';
import {
  addSection,
  blockAtLine,
  formatAttr,
  imageAttrs,
  insertBlock,
  INTRO,
  markSectionPending,
  moveBlock,
  moveSection,
  newBlock,
  parseBody,
  removeBlock,
  removeSection,
  serializeBody,
  updateBlock,
  updateSectionTitle,
  type BodyDoc,
} from '../../src/features/admin/lib/body-blocks.ts';

const parse = (source: string): BodyDoc => {
  const doc = parseBody(source);
  assert.ok(doc, 'debería analizarse');
  return doc;
};

test('ida y vuelta exacta en todas las fichas de src/content, con los mismos apartados que ve la web', () => {
  const dir = 'src/content';
  const files = readdirSync(dir).filter((file) => file.endsWith('.mdx'));
  assert.ok(files.length > 30);
  for (const file of files) {
    const { content } = matter(readFileSync(`${dir}/${file}`, 'utf8'));
    const doc = parse(content);
    assert.equal(serializeBody(doc), content, file);
    assert.deepEqual(doc.sections.map((section) => section.title), h2Titles(content), file);
  }
});

test('The Bloop: apartados, imágenes, galería y prosa fundida', () => {
  const { content } = matter(readFileSync('src/content/the-bloop.mdx', 'utf8'));
  const doc = parse(content);
  assert.deepEqual(doc.sections.map((section) => section.title), h2Titles(content));
  const kinds = doc.sections.flatMap((section) => section.blocks.map((block) => block.kind));
  assert.ok(kinds.includes('image'));
  assert.ok(kinds.includes('gallery'));
  // Nunca dos bloques de texto seguidos: los párrafos y listas consecutivos son un solo bloque.
  for (const section of doc.sections) {
    section.blocks.forEach((block, index) => assert.ok(!(block.kind === 'text' && section.blocks[index - 1]?.kind === 'text'), section.title));
  }
});

const SAMPLE = `
Intro de la ficha.

## Uno

Primer párrafo.
Sigue el párrafo.

- una lista

<WikiImage src="/assets/a.webp" alt="Una imagen" caption="Pie" align="right" />

## Dos

<Proximamente />

## Referencias

1. Fuente.
`;

test('reconoce cada tipo de bloque', () => {
  const doc = parse(SAMPLE);
  assert.deepEqual(doc.intro.map((block) => block.kind), ['text']);
  assert.deepEqual(doc.sections.map((s) => [s.title, s.blocks.map((b) => b.kind)]), [
    ['Uno', ['text', 'image']],
    ['Dos', ['proximamente']],
    ['Referencias', ['text']],
  ]);
  const quote = parse('<WikiQuote author="Boris">\nHola **mundo**\n</WikiQuote>\n').intro[0];
  assert.equal(quote.kind, 'quote');
  assert.equal(quote.kind === 'quote' && quote.text, 'Hola **mundo**');
  assert.equal(parse('<WikiImage src={x} />\n').intro[0].kind, 'raw');
  assert.equal(parse('<RegistroDelirium />\n').intro[0].kind, 'raw');
  assert.equal(parse('### Sub\n').intro[0].kind, 'subheading');
});

test('editar un bloque solo reescribe ese bloque', () => {
  const doc = parse(SAMPLE);
  const image = doc.sections[0].blocks[1];
  assert.equal(image.kind, 'image');
  const edited = updateBlock(doc, image.id, { attrs: imageAttrs(image.kind === 'image' ? image.attrs : [], { caption: 'Pie "nuevo"' }) });
  const out = serializeBody(edited);
  assert.equal(out, SAMPLE.replace('caption="Pie"', `caption='Pie "nuevo"'`));
});

test('un párrafo nuevo en un apartado queda dentro de él, no tras Referencias', () => {
  const doc = parse(SAMPLE);
  const block = { ...newBlock('text'), text: 'Párrafo nuevo.' } as const;
  const out = serializeBody(insertBlock(doc, doc.sections[1].id, block, 0));
  assert.match(out, /## Dos\n\nPárrafo nuevo\.\n\n<Proximamente \/>\n\n## Referencias/);
});

test('mover, quitar y añadir separan con una línea en blanco', () => {
  const doc = parse(SAMPLE);
  const image = doc.sections[0].blocks[1];
  // Subir la imagen por encima del texto
  assert.match(serializeBody(moveBlock(doc, image.id, -1)), /## Uno\n\n<WikiImage[^\n]+\n\nPrimer párrafo\.\nSigue el párrafo\.\n\n- una lista\n\n## Dos/);
  // Bajarla salta al principio del apartado siguiente
  const down = moveBlock(doc, image.id, 1);
  assert.deepEqual(down.sections[1].blocks.map((b) => b.kind), ['image', 'proximamente']);
  // Subir el primer bloque del primer apartado lo lleva a la introducción
  const up = moveBlock(doc, doc.sections[0].blocks[0].id, -1);
  assert.equal(up.intro.length, 2);
  assert.equal(serializeBody(removeBlock(doc, image.id)), SAMPLE.replace(/\n\n<WikiImage[^\n]+/, ''));
  const added = addSection(doc, 'Comportamiento');
  const titles = added.doc.sections.map((s) => s.title);
  assert.deepEqual(titles, ['Uno', 'Dos', 'Comportamiento', 'Referencias']);
  // Un apartado nuevo con su texto vacío se escribe solo con el título
  assert.match(serializeBody(added.doc), /<Proximamente \/>\n\n## Comportamiento\n\n## Referencias/);
});

test('apartados: renombrar, mover, quitar y marcar Próximamente', () => {
  const doc = parse(SAMPLE);
  const [uno, dos] = doc.sections;
  assert.match(serializeBody(updateSectionTitle(doc, dos.id, 'Comportamiento')), /\n## Comportamiento\n\n<Proximamente \/>/);
  assert.match(serializeBody(moveSection(doc, dos.id, -1)), /^\nIntro de la ficha\.\n\n## Dos\n\n<Proximamente \/>\n\n## Uno/);
  assert.doesNotMatch(serializeBody(removeSection(doc, uno.id)), /## Uno|Primer párrafo/);
  assert.match(serializeBody(markSectionPending(doc, uno.id)), /## Uno\n\n<Proximamente \/>\n\n## Dos/);
});

test('bloques nuevos de cada tipo', () => {
  let doc = parse('## A\n');
  const id = doc.sections[0].id;
  for (const kind of ['subheading', 'image', 'quote', 'alert', 'gallery'] as const) doc = insertBlock(doc, id, newBlock(kind));
  const [sub, image, quote, alert, gallery] = doc.sections[0].blocks;
  doc = updateBlock(doc, sub.id, { title: 'Sub' });
  doc = updateBlock(doc, image.id, { attrs: imageAttrs(image.kind === 'image' ? image.attrs : [], { src: '/media/x.webp', alt: 'Algo' }) });
  doc = updateBlock(doc, quote.id, { text: 'Frase', attrs: [{ name: 'author', value: 'Boris' }] });
  doc = updateBlock(doc, alert.id, { text: 'Cuidado' });
  doc = updateBlock(doc, gallery.id, { images: [[{ name: 'src', value: '/assets/a.webp' }, { name: 'alt', value: 'A' }]] });
  assert.equal(
    serializeBody(doc),
    '## A\n\n### Sub\n\n<WikiImage src="/media/x.webp" align="right" alt="Algo" />\n\n<WikiQuote author="Boris">\nFrase\n</WikiQuote>\n\n<AbyssalAlert variant="info">\nCuidado\n</AbyssalAlert>\n\n<WikiGallery>\n  <WikiImage src="/assets/a.webp" alt="A" />\n</WikiGallery>\n',
  );
  // Y lo generado se vuelve a leer igual
  const again = parse(serializeBody(doc));
  assert.deepEqual(again.sections[0].blocks.map((b) => b.kind), ['subheading', 'image', 'quote', 'alert', 'gallery']);
});

test('los atributos nunca son código y no rompen las comillas', () => {
  assert.equal(formatAttr({ name: 'alt', value: 'Un "ojo"' }), `alt='Un "ojo"'`);
  assert.equal(formatAttr({ name: 'alt', value: `Boris' "ojo"` }), `alt="Boris' ”ojo”"`);
  assert.equal(formatAttr({ name: 'alt', value: 'dos\nlíneas' }), 'alt="dos líneas"');
  assert.equal(formatAttr({ name: 'destacado', value: null }), 'destacado');
  const doc = parse(`<WikiImage alt="{process.env}" caption="a" />\n`);
  const out = serializeBody(updateBlock(doc, doc.intro[0].id, { attrs: [{ name: 'alt', value: '{process.env}' }] }));
  assert.equal(parse(out).intro[0].kind, 'image');
});

test('blockAtLine encuentra el bloque de una línea', () => {
  const doc = parse(SAMPLE);
  const lines = SAMPLE.split('\n');
  const imageLine = lines.findIndex((line) => line.startsWith('<WikiImage')) + 1;
  assert.equal(blockAtLine(doc, imageLine), doc.sections[0].blocks[1].id);
  assert.equal(blockAtLine(doc, lines.indexOf('Sigue el párrafo.') + 1), doc.sections[0].blocks[0].id);
  assert.equal(blockAtLine(doc, lines.indexOf('## Dos') + 1), doc.sections[1].id);
});

test('un MDX roto no se analiza', () => {
  assert.equal(parseBody('<WikiImage src="a"\n\nhola'), null);
  assert.equal(serializeBody(parse('')), '\n');
  assert.equal(INTRO, 'intro');
});

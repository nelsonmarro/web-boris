import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAQ_MAX, FaqSchema, WikiFrontmatterSchema } from '../../src/core/types/wiki.ts';
import { checkFaqSection } from '../../src/core/content/validate.ts';
import { faqJsonLd, faqParagraphs, serializeJsonLd } from '../../src/features/monsters/lib/faq.ts';

const ITEM = { pregunta: '¿Pregunta?', respuesta: 'Respuesta.' };

test('FaqSchema: acepta preguntas con pregunta y respuesta', () => {
  assert.deepEqual(FaqSchema.parse([ITEM]), [ITEM]);
  assert.deepEqual(FaqSchema.parse([]), []);
});

test('FaqSchema: rechaza pregunta o respuesta vacías (también solo espacios)', () => {
  assert.equal(FaqSchema.safeParse([{ pregunta: '', respuesta: 'x' }]).success, false);
  assert.equal(FaqSchema.safeParse([{ pregunta: 'x', respuesta: '   ' }]).success, false);
  assert.equal(FaqSchema.safeParse([{ pregunta: 'x' }]).success, false);
});

test(`FaqSchema: como mucho ${FAQ_MAX} preguntas, sin repetir`, () => {
  const many = (n: number) => Array.from({ length: n }, (_, i) => ({ pregunta: `P${i}`, respuesta: 'R' }));
  assert.equal(FaqSchema.safeParse(many(FAQ_MAX)).success, true);
  assert.equal(FaqSchema.safeParse(many(FAQ_MAX + 1)).success, false);
  const dup = FaqSchema.safeParse([ITEM, { ...ITEM, pregunta: '¿PREGUNTA?' }]);
  assert.equal(dup.success, false);
  assert.match(dup.error!.issues[0].message, /pregunta repetida/);
});

test('WikiFrontmatterSchema: `faq` es opcional', () => {
  const base = { title: 'The Bloop', universe: 'Colosos' };
  assert.equal(WikiFrontmatterSchema.parse(base).faq, undefined);
  assert.deepEqual(WikiFrontmatterSchema.parse({ ...base, faq: [ITEM] }).faq, [ITEM]);
  assert.equal(WikiFrontmatterSchema.safeParse({ ...base, faq: [{ pregunta: '', respuesta: '' }] }).success, false);
});

test('faqParagraphs: separa por línea en blanco y junta los saltos simples', () => {
  assert.deepEqual(faqParagraphs('Uno\ndos.\n\n  Tres.  \n\n'), ['Uno dos.', 'Tres.']);
  assert.deepEqual(faqParagraphs('   '), []);
});

test('faqJsonLd: null sin preguntas; FAQPage con Question/Answer si las hay', () => {
  assert.equal(faqJsonLd(undefined), null);
  assert.equal(faqJsonLd([]), null);
  assert.deepEqual(faqJsonLd([{ pregunta: ' ¿Qué es? ', respuesta: 'Un coloso.\n\nEnorme.' }], 'https://x.test/wiki/a'), {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: 'https://x.test/wiki/a',
    mainEntity: [
      { '@type': 'Question', name: '¿Qué es?', acceptedAnswer: { '@type': 'Answer', text: 'Un coloso.\n\nEnorme.' } },
    ],
  });
  assert.equal('url' in faqJsonLd([ITEM])!, false);
});

test('serializeJsonLd: no deja cerrar la etiqueta <script> y sigue siendo JSON válido', () => {
  const data = { text: '</script><script>alert(1)</script> & más' };
  const out = serializeJsonLd(data);
  assert.equal(out.includes('<'), false);
  assert.equal(out.includes('>'), false);
  assert.deepEqual(JSON.parse(out), data);
});

test('checkFaqSection: error si la ficha trae `faq` y además «## Preguntas frecuentes» en el cuerpo', () => {
  assert.deepEqual(
    checkFaqSection([
      { slug: 'a', faqCount: 2, h2Titles: ['Características', 'Preguntas  Frecuentes'] },
      { slug: 'b', faqCount: 0, h2Titles: ['Preguntas frecuentes'] },
      { slug: 'c', faqCount: 1, h2Titles: ['Características'] },
    ]).map((e) => e.split(':')[0]),
    ['src/content/a.mdx'],
  );
});

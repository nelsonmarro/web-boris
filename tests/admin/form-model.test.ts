import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromForm, toForm } from '../../src/features/admin/components/editor/form-model.ts';
import type { ArticleData } from '../../src/core/content/overlay.ts';
import { ArticleDataSchema } from '../../src/core/content/overlay.ts';

const full: ArticleData = {
  frontmatter: {
    title: 'The Bloop',
    universe: 'Colosos',
    category: 'Coloso',
    description: 'Súper cetáceo.',
    image: '/assets/a.webp',
    imageCaption: 'Foto',
    imagePosition: '50% 20%',
    aliases: ['Ojo Solo', 'el pez cangrejo'],
    related: ['luque'],
    infobox: { 'Información Biológica': { Especie: 'Labodotype', Longitud: '351 m' }, Registro: { Año: '1997' } },
    faq: [{ pregunta: '¿Es peligroso?', respuesta: 'No.' }],
    stats: { length: 351, weight: '20,000 t', intelligence: 8, hostility: 2, power: 90, defense: 85, biteType: 'Aplastante', specialAbilities: ['Rugido'] },
  },
  content: '## Características\n\nTexto.\n',
};

test('ida y vuelta: una ficha completa no cambia', () => {
  assert.deepEqual(fromForm(toForm(full)), full);
});

test('ida y vuelta: una ficha mínima no gana campos vacíos', () => {
  const minimal: ArticleData = { frontmatter: { title: 'X', universe: 'Colosos', status: 'proximamente' }, content: '' };
  assert.deepEqual(fromForm(toForm(minimal)), minimal);
});

test('fromForm: recorta, descarta filas vacías y secciones sin datos, y convierte números con coma', () => {
  const form = toForm(full);
  form.title = '  The Bloop  ';
  form.infobox.push({ title: 'Vacía', rows: [{ key: '', value: '' }] });
  form.infobox[0].rows.push({ key: 'Sin valor', value: ' ' });
  form.faq.push({ pregunta: '', respuesta: '' });
  form.aliases = 'Ojo Solo\n\n  el pez cangrejo  \n';
  form.stats.length = '351,5';
  const data = fromForm(form);
  assert.equal(data.frontmatter.title, 'The Bloop');
  assert.deepEqual(Object.keys(data.frontmatter.infobox ?? {}), ['Información Biológica', 'Registro']);
  assert.equal(data.frontmatter.infobox?.['Información Biológica']['Sin valor'], undefined);
  assert.equal(data.frontmatter.faq?.length, 1);
  assert.deepEqual(data.frontmatter.aliases, ['Ojo Solo', 'el pez cangrejo']);
  assert.equal(data.frontmatter.stats?.length, 351.5);
});

test('fromForm: un número mal escrito llega al esquema como texto y lo rechaza', () => {
  const form = toForm(full);
  form.stats.intelligence = 'mucha';
  assert.equal(ArticleDataSchema.safeParse(fromForm(form)).success, false);
  form.stats.intelligence = '11';
  assert.equal(ArticleDataSchema.safeParse(fromForm(form)).success, false);
});

test('fromForm: sin datos de la Arena no hay `stats`; con saltos de línea de Windows, se normalizan', () => {
  const form = toForm(full);
  form.stats = { length: '', weight: '', intelligence: '', hostility: '', power: '', defense: '', biteType: '', specialAbilities: '' };
  form.content = 'a\r\nb';
  const data = fromForm(form);
  assert.equal(data.frontmatter.stats, undefined);
  assert.equal(data.content, 'a\nb');
});

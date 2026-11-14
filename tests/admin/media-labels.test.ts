import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assetLabel, imageRefs, usageByImage } from '../../src/features/admin/lib/media-labels.ts';

test('assetLabel: grupo por universo y entidad, nombre sin guiones bajos', () => {
  assert.deepEqual(assetLabel('/assets/Universo_Colosos/The_Bloop/The_Bloop_fauces.webp'), { group: 'Colosos › The Bloop', name: 'The Bloop fauces' });
  assert.deepEqual(assetLabel('/assets/Universo_Capitán_de_Galeón/Naves/IMG_20230522_130038.webp'), { group: 'Capitán de Galeón › Naves', name: 'Foto del 22/05/2023' });
  assert.deepEqual(assetLabel('/assets/Universo_Capitán_de_Galeón/Borisao/Borisao_2_F_(1).webp'), { group: 'Capitán de Galeón › Borisao', name: 'Borisao 2 F' });
  assert.equal(assetLabel('/assets/Universo_Colosos/DSC.webp').name, 'Foto sin nombre');
});

test('imageRefs y usageByImage: qué fichas usan cada imagen', () => {
  const mdx = '<WikiImage src="/assets/A/b_c.webp" alt="x" />\n![y](/media/0123abcd.webp)';
  assert.deepEqual(imageRefs(mdx), ['/assets/A/b_c.webp', '/media/0123abcd.webp']);
  assert.deepEqual(imageRefs(JSON.stringify({ image: '/assets/A/Árbol_1.png' })), ['/assets/A/Árbol_1.png']);
  const usage = usageByImage([
    { title: 'The Bloop', texts: [mdx, '/assets/A/b_c.webp'] },
    { title: 'Bogbo', texts: ['/assets/A/b_c.webp'] },
  ]);
  assert.deepEqual(usage.get('/assets/A/b_c.webp'), ['Bogbo', 'The Bloop']);
  assert.deepEqual(usage.get('/media/0123abcd.webp'), ['The Bloop']);
});

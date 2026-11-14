import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assetLabel, combineUsage, deleteBlockedReason, imageRefs, usageByImage } from '../../src/features/admin/lib/media-labels.ts';

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

test('combineUsage: el historial solo nombra fichas que ya no la usan ahora', () => {
  const current = new Map([['/media/a.webp', ['The Bloop']]]);
  const history = new Map([
    ['/media/a.webp', ['Bogbo', 'The Bloop']],
    ['/media/b.webp', ['Luque']],
  ]);
  const use = combineUsage(current, history);
  assert.deepEqual(use.get('/media/a.webp'), { usedIn: ['The Bloop'], inHistory: ['Bogbo'] });
  assert.deepEqual(use.get('/media/b.webp'), { usedIn: [], inHistory: ['Luque'] });
  assert.equal(use.get('/media/c.webp'), undefined);
});

test('deleteBlockedReason: se puede borrar solo si nada la usa, ni ahora ni en el historial', () => {
  assert.equal(deleteBlockedReason(undefined), null);
  assert.equal(deleteBlockedReason({ usedIn: [], inHistory: [] }), null);
  assert.equal(deleteBlockedReason({ usedIn: ['The Bloop'], inHistory: ['Luque'] }), 'No se puede borrar: la usa la ficha «The Bloop».');
  assert.equal(deleteBlockedReason({ usedIn: ['Bogbo', 'The Bloop'], inHistory: [] }), 'No se puede borrar: la usan las fichas «Bogbo», «The Bloop».');
  assert.equal(deleteBlockedReason({ usedIn: [], inHistory: ['Luque'] }), 'No se puede borrar: la usa una versión anterior de «Luque», y recuperarla la necesitaría.');
  assert.match(deleteBlockedReason({ usedIn: [], inHistory: ['Luque', 'Bogbo'] })!, /^No se puede borrar: la usan versiones anteriores de «Luque», «Bogbo»/);
});

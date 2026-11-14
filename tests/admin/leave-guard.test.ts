import { test } from 'node:test';
import assert from 'node:assert/strict';
import { discardsEdits, DISCARDS_EDITS, leavesPage } from '../../src/features/admin/lib/leave-guard.ts';

const here = 'https://boris.example/admin/fichas/the-bloop';
const link = (href: string, extra: Partial<{ target: string; download: boolean }> = {}) => ({ href, target: '', download: false, ...extra });

test('leavesPage: otra página del panel o de la web sí saca del editor', () => {
  assert.equal(leavesPage(link('/admin/fichas'), here), true);
  assert.equal(leavesPage(link('/admin'), here), true);
  assert.equal(leavesPage(link('https://boris.example/wiki/the-bloop'), here), true);
  assert.equal(leavesPage(link('https://otra.example/'), here), true);
  // La misma ficha con otra consulta vuelve a pedir la página: cuenta como salir.
  assert.equal(leavesPage(link('/admin/fichas/the-bloop?menu=1'), here), true);
  assert.equal(leavesPage(link('/admin/fichas/luque', { target: '_self' }), here), true);
});

test('leavesPage: pestaña nueva, descarga, solo el ancla o mailto no sacan del editor', () => {
  assert.equal(leavesPage(link('/wiki/the-bloop', { target: '_blank' }), here), false);
  assert.equal(leavesPage(link('/media/x.webp', { download: true }), here), false);
  assert.equal(leavesPage(link('#historial'), here), false);
  assert.equal(leavesPage(link('/admin/fichas/the-bloop#retirar'), here), false);
  assert.equal(leavesPage(link('mailto:boris@example.invalid'), here), false);
  assert.equal(leavesPage(link('javascript:void(0)'), here), false);
});

test('discardsEdits: es el atributo que vigila el aviso', () => {
  assert.deepEqual(discardsEdits, { [DISCARDS_EDITS]: '' });
  assert.equal(DISCARDS_EDITS, 'data-discards-edits');
});

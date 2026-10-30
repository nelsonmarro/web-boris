import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeSpyHash } from '../../src/components/navbar/lib/scroll-spy.ts';

const universos = { hash: '#universos', top: 300, bottom: 1500 };
const contacto = { hash: '#contacto', top: 3000, bottom: 4000 };

test('marca la sección que cruza la línea de lectura', () => {
  assert.equal(activeSpyHash([universos, contacto], 400), '#universos');
  assert.equal(activeSpyHash([universos, contacto], 3000), '#contacto');
});

test('fuera de las secciones vigiladas no marca nada', () => {
  assert.equal(activeSpyHash([universos, contacto], 200), '');
  // Pasada la sección (p. ej. sobre Personajes destacados): ya no sigue activa.
  assert.equal(activeSpyHash([universos, contacto], 1500), '');
  assert.equal(activeSpyHash([universos, contacto], 4200), '');
  assert.equal(activeSpyHash([], 400), '');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blueWhales } from '../../src/features/monsters/lib/scale.ts';

test('divide entre 30 m y redondea al entero más cercano', () => {
  assert.equal(blueWhales(351), 12); // 11,7
  assert.equal(blueWhales(675), 23); // 22,5 → arriba
  assert.equal(blueWhales(300), 10);
  assert.equal(blueWhales(382), 13);
});

test('desde 60 m (dos ballenas) en adelante', () => {
  assert.equal(blueWhales(60), 2);
  assert.equal(blueWhales(59.9), null);
  assert.equal(blueWhales(30), null);
  assert.equal(blueWhales(0), null);
});

test('una longitud no válida no da escala', () => {
  assert.equal(blueWhales(undefined), null);
  assert.equal(blueWhales(Number.NaN), null);
  assert.equal(blueWhales(Number.POSITIVE_INFINITY), null);
  assert.equal(blueWhales(-120), null);
});

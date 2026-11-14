import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPosition, parsePosition } from '../../src/features/admin/lib/focal-point.ts';

test('parsePosition: porcentajes y palabras de CSS', () => {
  assert.deepEqual(parsePosition('50% 12%'), { x: 50, y: 12 });
  assert.deepEqual(parsePosition(''), { x: 50, y: 50 });
  assert.deepEqual(parsePosition('center top'), { x: 50, y: 0 });
  assert.deepEqual(parsePosition('top'), { x: 50, y: 0 });
  assert.deepEqual(parsePosition('top center'), { x: 50, y: 0 });
  assert.deepEqual(parsePosition('right 30%'), { x: 100, y: 30 });
  assert.deepEqual(parsePosition('30%'), { x: 30, y: 50 });
  assert.deepEqual(parsePosition('150% -4%'), { x: 100, y: 0 });
  assert.equal(parsePosition('10px 20px'), null);
  assert.equal(parsePosition('left right'), null);
  assert.equal(parsePosition('1% 2% 3%'), null);
});

test('formatPosition: el centro se guarda vacío', () => {
  assert.equal(formatPosition({ x: 50, y: 50 }), '');
  assert.equal(formatPosition({ x: 33.4, y: 12.6 }), '33% 13%');
  // Ida y vuelta de los valores que ya usan las fichas.
  for (const value of ['55% 35%', '50% 55%', '50% 12%']) assert.equal(formatPosition(parsePosition(value)!), value);
});

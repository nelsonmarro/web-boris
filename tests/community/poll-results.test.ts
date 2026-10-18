import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTally } from '../../src/features/community/lib/poll-results.ts';

test('porcentajes enteros que suman 100', () => {
  assert.deepEqual(computeTally(['a', 'b'], { a: 2, b: 1 }), {
    totals: { a: 2, b: 1 },
    percents: { a: 67, b: 33 },
    total: 3,
  });
  assert.deepEqual(computeTally(['a', 'b'], { a: 1, b: 1 }).percents, { a: 50, b: 50 });
  assert.deepEqual(computeTally(['a', 'b'], { a: 1, b: 2 }).percents, { a: 33, b: 67 });
});

test('sin votos: todo a cero', () => {
  assert.deepEqual(computeTally(['a', 'b'], {}), { totals: { a: 0, b: 0 }, percents: { a: 0, b: 0 }, total: 0 });
});

test('ignora opciones ajenas al duelo y valores no válidos', () => {
  const t = computeTally(['a', 'b'], { a: 3, b: -2, intruso: 9 });
  assert.deepEqual(t.totals, { a: 3, b: 0 });
  assert.equal(t.total, 3);
  assert.deepEqual(t.percents, { a: 100, b: 0 });
});

test('la suma es 100 para cualquier recuento positivo', () => {
  for (let a = 0; a <= 40; a++) {
    for (let b = 0; b <= 40; b++) {
      if (a + b === 0) continue;
      const { percents } = computeTally(['a', 'b'], { a, b });
      assert.equal(percents.a + percents.b, 100, `${a}/${b}`);
    }
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  APPROX_MARGIN,
  MAX_SHARE_SQUARES,
  biggerOf,
  differenceText,
  isCertainPair,
  isCorrect,
  measuresText,
  nextPair,
  pairKey,
  parseBest,
  parseReto,
  retoOutcome,
  serializeBest,
  shareMessage,
  shareUrl,
  validPairs,
  type Pair,
} from '../../src/features/monsters/lib/size-game.ts';
import { SIZE_REFERENCES, type SizeEntry, type SizePrecision } from '../../src/features/monsters/lib/size-references.ts';

const creature = (id: string, meters: number, precision: SizePrecision = 'exact'): SizeEntry => ({
  id, name: id, meters, precision, dimension: 'longitud', kind: 'criatura',
});
const real = (id: string, meters: number, precision: SizePrecision = 'exact'): SizeEntry => ({
  id, name: id, meters, precision, dimension: 'altura', kind: 'real',
});

/** Rng que devuelve los valores dados en orden (y repite el último). */
const seq = (...values: number[]) => {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
};
const key = (p: Pair) => pairKey(p[0], p[1]);

/** El pool real a 2026-10-29: las seis fichas con longitud canónica + las cinco referencias. */
const MAJA = creature('el-gran-maja', 675);
const VLAD = creature('vlad-julia', 500, 'atLeast');
const BOGBO = creature('bogbo', 382);
const BLOOP = creature('the-bloop', 351);
const CRIYONTE = creature('slowdown-criyonte', 300, 'approx');
const LEMUG = creature('le-mug', 200, 'approx');
const REAL_POOL = [MAJA, VLAD, BOGBO, BLOOP, CRIYONTE, LEMUG, ...SIZE_REFERENCES];
const ref = (id: string) => SIZE_REFERENCES.find((r) => r.id === id)!;

/* ---------- Parejas con respuesta segura ---------- */

test('exactas: distintas y sin empate', () => {
  assert.equal(isCertainPair(BOGBO, BLOOP), true);
  assert.equal(isCertainPair(BOGBO, BOGBO), false);
  assert.equal(isCertainPair(creature('x', 330), real('eiffel', 330)), false);
});

test('una cota inferior solo frente a algo seguro más corto que la cota', () => {
  assert.equal(isCertainPair(VLAD, MAJA), false); // «más de 500» frente a 675: no se sabe
  assert.equal(isCertainPair(VLAD, ref('ref-burj-khalifa')), false);
  assert.equal(isCertainPair(VLAD, creature('quinientos', 500)), false);
  assert.equal(isCertainPair(VLAD, ref('ref-empire-state')), true); // 443 < 500
  assert.equal(isCertainPair(VLAD, BOGBO), true);
  assert.equal(isCertainPair(VLAD, CRIYONTE), true); // ≈300 (hasta 345) < 500
  assert.equal(isCertainPair(VLAD, creature('casi', 450, 'approx')), false); // ≈450 puede llegar a 517
  assert.equal(isCertainPair(VLAD, creature('otra-cota', 100, 'atLeast')), false); // dos cotas: nunca
});

test('un valor aproximado solo si la diferencia es de al menos un 15 %', () => {
  assert.equal(APPROX_MARGIN, 0.15);
  assert.equal(isCertainPair(CRIYONTE, ref('ref-torre-eiffel')), false); // 10 %
  assert.equal(isCertainPair(CRIYONTE, ref('ref-titanic')), false); // 11,5 %
  assert.equal(isCertainPair(CRIYONTE, BLOOP), true); // 17 %
  assert.equal(isCertainPair(CRIYONTE, creature('justo', 345)), true); // 15 % exacto
  assert.equal(isCertainPair(LEMUG, ref('ref-titanic')), true); // 34,5 %
  assert.equal(isCertainPair(CRIYONTE, LEMUG), true); // 50 %
  assert.equal(isCertainPair(creature('a', 100, 'approx'), creature('b', 110, 'approx')), false);
});

test('validPairs del pool real: ninguna dudosa, siempre con una criatura, y bastantes para jugar', () => {
  const pairs = validPairs(REAL_POOL);
  for (const [a, b] of pairs) {
    assert.ok(isCertainPair(a, b));
    assert.ok(a.kind === 'criatura' || b.kind === 'criatura');
  }
  const keys = new Set(pairs.map(([a, b]) => pairKey(a, b)));
  assert.equal(keys.size, pairs.length);
  assert.ok(!keys.has(pairKey(VLAD, MAJA)));
  assert.ok(!keys.has(pairKey(CRIYONTE, ref('ref-torre-eiffel'))));
  assert.ok(!keys.has(pairKey(ref('ref-titanic'), ref('ref-burj-khalifa'))));
  // 6 criaturas: 15 parejas entre ellas + 30 con referencias = 45 posibles; fuera las 4 dudosas
  // (Vlad–Majá, Vlad–Burj, Criyonte–Eiffel, Criyonte–Titanic) → 41.
  assert.equal(pairs.length, 41);
});

/* ---------- Emparejar ---------- */

test('nextPair nunca repite una pareja en la partida y se agota con «todas»', () => {
  const used = new Set<string>();
  let pair = nextPair(REAL_POOL, used);
  let rounds = 0;
  while (pair) {
    const k = key(pair);
    assert.ok(!used.has(k), `repetida: ${k}`);
    assert.ok(isCertainPair(pair[0], pair[1]));
    used.add(k);
    rounds++;
    pair = nextPair(REAL_POOL, used);
  }
  assert.equal(rounds, validPairs(REAL_POOL).length);
});

test('nextPair: sin criaturas empareja referencias; sin pareja posible, null', () => {
  const pair = nextPair([real('r1', 1), real('r2', 2)]);
  assert.ok(pair);
  assert.equal(key(pair), 'r1|r2');
  assert.equal(nextPair([]), null);
  assert.equal(nextPair([creature('a', 1)]), null);
  assert.equal(nextPair([creature('a', 5), real('b', 5)]), null);
  assert.equal(nextPair([VLAD, MAJA]), null);
});

test('el rng decide la pareja y el lado; uno fuera de contrato no rompe', () => {
  const pool = [creature('a', 300), creature('b', 500)];
  const pair = nextPair(pool, new Set(), seq(0, 0.9))!;
  assert.deepEqual([pair[0].id, pair[1].id], ['b', 'a']);
  const same = nextPair(pool, new Set(), seq(0, 0.1))!;
  assert.deepEqual([same[0].id, same[1].id], ['a', 'b']);
  assert.ok(nextPair(REAL_POOL, new Set(), () => 1));
  assert.ok(nextPair(REAL_POOL, new Set(), () => Number.NaN));
});

/* ---------- Resultado ---------- */

test('isCorrect / biggerOf, también con cota inferior', () => {
  const pair: Pair = [BOGBO, ref('ref-burj-khalifa')];
  assert.equal(biggerOf(pair).id, 'ref-burj-khalifa');
  assert.equal(isCorrect(pair, 'ref-burj-khalifa'), true);
  assert.equal(isCorrect(pair, 'bogbo'), false);
  assert.equal(isCorrect(pair, 'otro'), false);
  assert.equal(biggerOf([BOGBO, VLAD]).id, 'vlad-julia');
});

test('differenceText: «X mide N m más que Y», con la precisión de los datos', () => {
  assert.equal(differenceText([BOGBO, MAJA]), 'el-gran-maja mide 293 m más que bogbo.');
  assert.equal(differenceText([BLOOP, CRIYONTE]), 'the-bloop mide unos 50 m más que slowdown-criyonte.');
  assert.equal(differenceText([VLAD, BOGBO]), 'vlad-julia mide más de 118 m más que bogbo.');
  assert.equal(differenceText([LEMUG, VLAD]), 'vlad-julia mide al menos unos 300 m más que le-mug.');
});

test('measuresText enseña las dos medidas como la fuente', () => {
  assert.equal(measuresText([VLAD, CRIYONTE]), 'vlad-julia: más de 500 m · slowdown-criyonte: ≈ 300 m');
});

/* ---------- Reto ---------- */

test('parseReto: entero de 1 a 999; lo demás se ignora', () => {
  assert.equal(parseReto('7'), 7);
  assert.equal(parseReto('1'), 1);
  assert.equal(parseReto('999'), 999);
  assert.equal(parseReto('007'), 7);
  for (const bad of [null, undefined, '', '0', '000', '1000', '-3', '+3', '3.5', '3,5', ' 3', '3 ', 'abc', '1e2', '0x10']) {
    assert.equal(parseReto(bad), null, String(bad));
  }
});

test('retoOutcome: superar es hacer más que el reto', () => {
  assert.deepEqual(retoOutcome(8, 7), { kind: 'beaten' });
  assert.deepEqual(retoOutcome(7, 7), { kind: 'short', missing: 1 });
  assert.deepEqual(retoOutcome(3, 7), { kind: 'short', missing: 5 });
  assert.deepEqual(retoOutcome(41, 999, true), { kind: 'maxed' });
  assert.deepEqual(retoOutcome(41, 12, true), { kind: 'beaten' });
});

/* ---------- Compartir ---------- */

test('shareUrl lleva el reto, acotado', () => {
  assert.equal(shareUrl('https://x.dev', 7), 'https://x.dev/wiki/tamanos?reto=7');
  assert.equal(shareUrl('https://x.dev/', 7), 'https://x.dev/wiki/tamanos?reto=7');
  assert.equal(shareUrl('https://x.dev', 5000), 'https://x.dev/wiki/tamanos?reto=999');
  assert.equal(shareUrl('https://x.dev', 0), 'https://x.dev/wiki/tamanos?reto=1');
});

test('shareMessage: al estilo Wordle, sin nombres ni respuestas', () => {
  const answers = [true, true, true, true, true, true, true, false];
  const msg = shareMessage(7, answers, 'https://x.dev');
  assert.equal(msg.text, '¿Quién mide más? — racha de 7 🐋\n✅✅✅✅✅✅✅❌\n¿Me superas?');
  assert.equal(msg.url, 'https://x.dev/wiki/tamanos?reto=7');
  assert.equal(msg.full, `${msg.text} ${msg.url}`);
});

test('shareMessage resume con «+N» pasados 20 cuadrados', () => {
  const answers = [...Array(25).fill(true), false];
  const { text } = shareMessage(25, answers, 'https://x.dev');
  const row = text.split('\n')[1];
  assert.equal(MAX_SHARE_SQUARES, 20);
  assert.equal([...row.split(' ')[0]].length, 20);
  assert.ok(row.endsWith(' +6'));
});

test('shareMessage nunca menciona criaturas ni medidas', () => {
  const { full } = shareMessage(3, [true, true, true, false], 'https://x.dev');
  for (const e of REAL_POOL) assert.ok(!full.includes(e.name));
  assert.ok(!/\d+ m\b/.test(full));
});

/* ---------- Mejor racha ---------- */

test('parseBest acepta el formato guardado y descarta lo demás', () => {
  assert.equal(parseBest(serializeBest(7)), 7);
  assert.equal(parseBest('12'), 12);
  assert.equal(parseBest(null), 0);
  assert.equal(parseBest(''), 0);
  assert.equal(parseBest('{roto'), 0);
  assert.equal(parseBest('{"best":"9"}'), 0);
  assert.equal(parseBest('{"best":-3}'), 0);
  assert.equal(parseBest('{"best":2.5}'), 0);
  assert.equal(parseBest('null'), 0);
  assert.equal(parseBest('[4]'), 0);
});

test('serializeBest guarda un entero no negativo', () => {
  assert.equal(serializeBest(4), '{"best":4}');
  assert.equal(serializeBest(-1), '{"best":0}');
});

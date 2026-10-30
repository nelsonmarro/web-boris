import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ARENA_STORAGE_KEY,
  EMPTY_PREDICTIONS,
  JITTER,
  battleShareText,
  battleUrl,
  drawEntrants,
  findCanonBattle,
  findCanonFact,
  isUpset,
  jitter,
  parsePredictions,
  predictionsText,
  recordPrediction,
  roundSummary,
  runTournament,
  scoreLine,
  seededRng,
  serializePredictions,
  simulateBattle,
  tournamentShareText,
  verdictText,
  type BattleFighter,
} from '../../src/features/monsters/lib/arena-battle.ts';
import type { CanonBattle } from '../../src/features/monsters/config/canon-battles.ts';

// Stats reales de las fichas (frontmatter), para que los tests reflejen la Arena de verdad.
const BLOOP: BattleFighter = { slug: 'the-bloop', stats: { length: 351, intelligence: 8, hostility: 3, power: 82, defense: 90 } };
const MAJA: BattleFighter = { slug: 'el-gran-maja', stats: { length: 675, intelligence: 9, hostility: 10, power: 88, defense: 80 } };
const BOGBO: BattleFighter = { slug: 'bogbo', stats: { length: 382, intelligence: 7, hostility: 2, power: 80, defense: 88 } };
const CRIYONTE: BattleFighter = { slug: 'slowdown-criyonte', stats: { length: 300, intelligence: 6, hostility: 10, power: 92, defense: 85 } };
const VLAD: BattleFighter = { slug: 'vlad-julia', stats: { length: 500, intelligence: 5, hostility: 1, power: 75, defense: 100 } };
const LEMUG: BattleFighter = { slug: 'le-mug', stats: { length: 200, intelligence: 6, hostility: 2, power: 45, defense: 40 } };
const ALL = [BLOOP, MAJA, BOGBO, CRIYONTE, VLAD, LEMUG];

/** Generador que devuelve una secuencia fija (y repite el último valor). */
const fixed = (...values: number[]) => {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
};

test('seededRng: misma semilla, misma secuencia; siempre en [0, 1)', () => {
  const a = seededRng(42);
  const b = seededRng(42);
  for (let i = 0; i < 1000; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.notEqual(seededRng(1)(), seededRng(2)());
});

test('jitter: nunca sale de ±8 % y llega a los extremos', () => {
  assert.equal(jitter(100, () => 0), 100 * (1 - JITTER));
  assert.equal(jitter(100, () => 0.5), 100);
  assert.ok(Math.abs(jitter(100, () => 0.999999) - 100 * (1 + JITTER)) < 1e-3);
  const rng = seededRng(7);
  for (let i = 0; i < 5000; i++) {
    const v = jitter(50, rng);
    assert.ok(v >= 50 * (1 - JITTER) && v <= 50 * (1 + JITTER), `fuera de rango: ${v}`);
  }
  assert.equal(jitter(0, rng), 0);
});

test('cinco asaltos en el orden del radar, con valores tras el factor sorpresa dentro de ±8 %', () => {
  const result = simulateBattle(BOGBO, CRIYONTE, { rng: seededRng(3) });
  assert.deepEqual(result.rounds.map((r) => r.axis), ['Poder', 'Defensa', 'Hostilidad', 'Inteligencia', 'Escala']);
  for (const round of result.rounds) {
    round.rolled.forEach((v, i) => {
      const base = round.base[i];
      assert.ok(v >= base * (1 - JITTER) - 1e-9 && v <= base * (1 + JITTER) + 1e-9);
    });
  }
  assert.equal(result.wins.A + result.wins.B + result.rounds.filter((r) => !r.winner).length, 5);
});

test('gana quien gana más asaltos', () => {
  // Sin variación (rng = 0.5): Criyonte gana Poder, Hostilidad; Vlad Julia gana Defensa, Escala; Criyonte gana Inteligencia.
  const result = simulateBattle(CRIYONTE, VLAD, { rng: () => 0.5 });
  assert.deepEqual(result.wins, { A: 3, B: 2 });
  assert.equal(result.winner, 'A');
  assert.equal(result.decidedBy, 'asaltos');
  assert.equal(scoreLine(result), '3-2');
});

test('empate a asaltos: decide el índice de combate', () => {
  // A y B se reparten los ejes 2-2 con un asalto empatado; B tiene más índice.
  const a: BattleFighter = { slug: 'a', stats: { power: 60, defense: 40, hostility: 5, intelligence: 4, length: 100 } };
  const b: BattleFighter = { slug: 'b', stats: { power: 50, defense: 90, hostility: 4, intelligence: 5, length: 100 } };
  const result = simulateBattle(a, b, { rng: () => 0.5 });
  assert.deepEqual(result.wins, { A: 2, B: 2 });
  assert.equal(result.rounds[4].winner, null);
  assert.equal(result.decidedBy, 'indice');
  assert.equal(result.winner, 'B');
  assert.match(verdictText(result, 'Alfa', 'Beta'), /^¡Gana Beta! Empate a 2 asaltos: decide el índice de combate/);
});

test('empate total (mismas stats): lo decide el azar', () => {
  const twin = (slug: string): BattleFighter => ({ slug, stats: { power: 50, defense: 50, hostility: 5, intelligence: 5, length: 100 } });
  const low = simulateBattle(twin('x'), twin('y'), { rng: fixed(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.1) });
  assert.equal(low.decidedBy, 'sorteo');
  assert.equal(low.winner, 'A');
  const high = simulateBattle(twin('x'), twin('y'), { rng: fixed(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9) });
  assert.equal(high.winner, 'B');
});

test('un combate muy desigual no cambia de ganador al repetirlo', () => {
  for (let seed = 0; seed < 300; seed++) {
    const result = simulateBattle(MAJA, LEMUG, { rng: seededRng(seed) });
    assert.equal(result.winner, 'A');
    assert.deepEqual(result.wins, { A: 5, B: 0 });
  }
});

test('un combate igualado puede cambiar de ganador al repetirlo', () => {
  const winners = new Set<string>();
  for (let seed = 0; seed < 300; seed++) winners.add(simulateBattle(BLOOP, BOGBO, { rng: seededRng(seed) }).winner);
  assert.deepEqual([...winners].sort(), ['A', 'B']);
});

test('canon: The Bloop vs El Gran Majá lo gana siempre El Gran Majá, en cualquier orden y con cualquier azar', () => {
  for (let seed = 0; seed < 200; seed++) {
    const ab = simulateBattle(BLOOP, MAJA, { rng: seededRng(seed) });
    assert.equal(ab.winner, 'B');
    assert.equal(ab.decidedBy, 'canon');
    assert.equal(ab.canon?.winner, 'el-gran-maja');
    const ba = simulateBattle(MAJA, BLOOP, { rng: seededRng(seed) });
    assert.equal(ba.winner, 'A');
  }
});

test('canon: sin aleatoriedad (no consume el generador y los asaltos son los valores reales)', () => {
  let calls = 0;
  const result = simulateBattle(BLOOP, MAJA, {
    rng: () => {
      calls++;
      return 0;
    },
  });
  assert.equal(calls, 0);
  for (const round of result.rounds) assert.deepEqual(round.rolled, round.base);
  assert.deepEqual(result.wins, { A: 1, B: 4 });
  assert.equal(verdictText(result, 'The Bloop Ojo Solo', 'El Gran Majá'), '¡Gana El Gran Majá por 4-1! Así ocurrió en el canon.');
});

test('canon manda aunque los asaltos digan lo contrario', () => {
  const battles: CanonBattle[] = [{ a: 'le-mug', b: 'el-gran-maja', winner: 'le-mug', quote: 'x', source: { slug: 'le-mug', anchor: 'x' } }];
  const result = simulateBattle(MAJA, LEMUG, { rng: seededRng(1), battles });
  assert.equal(result.winner, 'B');
  assert.equal(result.decidedBy, 'canon');
  assert.deepEqual(result.wins, { A: 5, B: 0 });
  assert.equal(verdictText(result, 'El Gran Majá', "Le'Mug"), "¡Gana Le'Mug! Los asaltos no le favorecían, pero así ocurrió en el canon.");
  assert.equal(
    battleShareText({ nameA: 'El Gran Majá', nameB: "Le'Mug", result, url: 'https://x' }),
    "El Gran Majá vs Le'Mug — ganó Le'Mug, como en el canon, en la Versus Arena. ¿Estás de acuerdo? https://x",
  );
});

test('findCanonBattle / findCanonFact: en cualquier orden; el dato de pareja manda sobre el comodín', () => {
  assert.equal(findCanonBattle('el-gran-maja', 'the-bloop')?.winner, 'el-gran-maja');
  assert.equal(findCanonBattle('bogbo', 'the-bloop'), null);
  assert.match(findCanonFact('the-bloop', 'slowdown-criyonte')?.quote ?? '', /nunca ha sido desafiado/);
  assert.match(findCanonFact('el-gran-maja', 'vlad-julia')?.quote ?? '', /sobre todo con El Gran Majá/);
  assert.match(findCanonFact('le-mug', 'vlad-julia')?.quote ?? '', /carece de depredadores/);
  assert.equal(findCanonFact('le-mug', 'bogbo'), null);
  // Un dato nunca fuerza el resultado: Criyonte vs The Bloop se decide por asaltos.
  assert.equal(simulateBattle(CRIYONTE, BLOOP, { rng: seededRng(5) }).decidedBy !== 'canon', true);
});

test('textos: asalto, veredicto y compartir', () => {
  const result = simulateBattle(CRIYONTE, VLAD, { rng: () => 0.5 });
  assert.equal(roundSummary(result.rounds[0], 0, 'Slowdown Criyonte', 'Vlad Julia'), 'Asalto 1 · Poder: gana Slowdown Criyonte (92 a 75).');
  assert.equal(verdictText(result, 'Slowdown Criyonte', 'Vlad Julia'), '¡Gana Slowdown Criyonte por 3-2!');
  const url = battleUrl('https://wiki.example', 'slowdown-criyonte', 'vlad-julia');
  assert.equal(url, 'https://wiki.example/wiki/arena?a=slowdown-criyonte&b=vlad-julia');
  assert.equal(
    battleShareText({ nameA: 'Slowdown Criyonte', nameB: 'Vlad Julia', result, url }),
    'Slowdown Criyonte vs Vlad Julia — ganó Slowdown Criyonte por 3-2 en la Versus Arena. ¿Estás de acuerdo? https://wiki.example/wiki/arena?a=slowdown-criyonte&b=vlad-julia',
  );
  assert.equal(tournamentShareText('Vlad Julia', 'https://wiki.example/wiki/arena'), 'Campeón del torneo: Vlad Julia — Versus Arena. ¿Estás de acuerdo? https://wiki.example/wiki/arena');
  const tie = { ...result, rounds: [{ axis: 'Escala', base: [10, 10] as const, rolled: [10, 10] as const, winner: null }] };
  assert.equal(roundSummary(tie.rounds[0], 4, 'A', 'B'), 'Asalto 5 · Escala: empate (10 a 10).');
});

test('sorpresa: el asalto lo gana quien tenía menos en el eje; el texto muestra los valores reales', () => {
  // Poder 50 vs 52: con A al +8 % y B al -8 %, gana A.
  const a: BattleFighter = { slug: 'a', stats: { power: 50 } };
  const b: BattleFighter = { slug: 'b', stats: { power: 52 } };
  const result = simulateBattle(a, b, { rng: fixed(0.999, 0) });
  const round = result.rounds[0];
  assert.equal(round.winner, 'A');
  assert.ok(isUpset(round));
  assert.equal(roundSummary(round, 0, 'Alfa', 'Beta'), 'Asalto 1 · Poder: gana Alfa por sorpresa (50 a 52).');
  assert.equal(isUpset(simulateBattle(a, b, { rng: () => 0.5 }).rounds[0]), false);
  assert.equal(isUpset(result.rounds[1]), false); // 0 a 0: empate
});

test('drawEntrants: 4 distintos, deterministas con semilla; con menos, todos', () => {
  const slugs = ALL.map((f) => f.slug);
  const first = drawEntrants(slugs, seededRng(9));
  assert.equal(first.length, 4);
  assert.equal(new Set(first).size, 4);
  assert.ok(first.every((s) => slugs.includes(s)));
  assert.deepEqual(drawEntrants(slugs, seededRng(9)), first);
  assert.deepEqual(drawEntrants(['a', 'b'], seededRng(1)).sort(), ['a', 'b']);
  const seen = new Set<string>();
  for (let seed = 0; seed < 200; seed++) drawEntrants(slugs, seededRng(seed)).forEach((s) => seen.add(s));
  assert.equal(seen.size, slugs.length);
});

test('runTournament: semifinales 1-2 y 3-4, final entre sus ganadores, campeón = ganador de la final', () => {
  for (let seed = 0; seed < 100; seed++) {
    const t = runTournament([BLOOP, BOGBO, MAJA, LEMUG], { rng: seededRng(seed) });
    const [s1, s2, final] = t.matches;
    assert.deepEqual([s1.label, s2.label, final.label], ['Semifinal 1', 'Semifinal 2', 'Final']);
    assert.deepEqual([s1.a, s1.b], ['the-bloop', 'bogbo']);
    assert.deepEqual([s2.a, s2.b], ['el-gran-maja', 'le-mug']);
    assert.equal(s2.winner, 'el-gran-maja');
    assert.deepEqual([final.a, final.b], [s1.winner, s2.winner]);
    assert.equal(t.champion, final.winner);
    // Si The Bloop llega a la final contra El Gran Majá, manda el canon.
    if (s1.winner === 'the-bloop') {
      assert.equal(final.result.decidedBy, 'canon');
      assert.equal(t.champion, 'el-gran-maja');
    }
  }
});

test('runTournament: misma semilla, mismo torneo; exige 4 distintos', () => {
  const entrants = [CRIYONTE, VLAD, BOGBO, BLOOP];
  assert.deepEqual(runTournament(entrants, { rng: seededRng(11) }), runTournament(entrants, { rng: seededRng(11) }));
  assert.throws(() => runTournament([BLOOP, MAJA, BOGBO]));
  assert.throws(() => runTournament([BLOOP, MAJA, BOGBO, BLOOP]));
});

test('predicciones: lectura defensiva, registro y texto', () => {
  assert.equal(ARENA_STORAGE_KEY, 'wb-arena');
  assert.deepEqual(parsePredictions(null), EMPTY_PREDICTIONS);
  assert.deepEqual(parsePredictions('{roto'), EMPTY_PREDICTIONS);
  assert.deepEqual(parsePredictions('{"hits":3,"total":2}'), EMPTY_PREDICTIONS);
  assert.deepEqual(parsePredictions('{"hits":-1,"total":2}'), EMPTY_PREDICTIONS);
  assert.deepEqual(parsePredictions('{"hits":1.5,"total":2}'), EMPTY_PREDICTIONS);
  assert.deepEqual(parsePredictions('null'), EMPTY_PREDICTIONS);
  let stats = parsePredictions(serializePredictions({ hits: 6, total: 9 }));
  assert.deepEqual(stats, { hits: 6, total: 9 });
  stats = recordPrediction(stats, true);
  assert.deepEqual(stats, { hits: 7, total: 10 });
  assert.deepEqual(recordPrediction(stats, false), { hits: 7, total: 11 });
  assert.equal(predictionsText(stats), 'Tus predicciones: 7/10');
});

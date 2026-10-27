import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyHistory,
  parsePollId,
  summarizeHistory,
  type HistoryRow,
  type SummarizeOptions,
} from '../../src/features/community/lib/poll-history.ts';
import type { CuratedPoll } from '../../src/core/content/schemas.ts';

const CURATED: CuratedPoll[] = [
  { semana: '2026-W38', tipo: 'desclasificar', a: 'cael-cortes', b: 'ya-abierta' },
  { semana: '2026-W42', tipo: 'duelo', a: 'vlad-julia', b: 'el-gran-maja' },
  { semana: '2026-W45', tipo: 'desclasificar', a: 'cael-cortes', b: 'aodos-ay01' },
];
const SEALED = new Set(['cael-cortes', 'aodos-ay01']);
/** Todas las fichas que usan los fixtures. */
const KNOWN = new Set([
  'bogbo',
  'le-mug',
  'the-bloop',
  'slowdown-criyonte',
  'vlad-julia',
  'el-gran-maja',
  'cael-cortes',
  'aodos-ay01',
  'ya-abierta',
]);

/** Filas del `groupBy` de una encuesta: `{ opción: votos }`. */
const rows = (pollId: string, counts: Record<string, number>): HistoryRow[] =>
  Object.entries(counts).map(([option, count]) => ({ pollId, option, count }));

const opts = (over: Partial<SummarizeOptions> = {}): SummarizeOptions => ({
  currentPollId: '2026-W44-bogbo-vs-le-mug',
  curated: CURATED,
  sealedSlugs: SEALED,
  previousWeek: '2026-W43',
  knownSlugs: KNOWN,
  ...over,
});

test('parsePollId: semana, y a y b partidos por el primer -vs-', () => {
  assert.deepEqual(parsePollId('2026-W42-vlad-julia-vs-el-gran-maja'), {
    week: '2026-W42',
    a: 'vlad-julia',
    b: 'el-gran-maja',
  });
  assert.deepEqual(parsePollId('2026-W45-cael-cortes-vs-aodos-ay01'), {
    week: '2026-W45',
    a: 'cael-cortes',
    b: 'aodos-ay01',
  });
  // Un slug que empieza por «vs-» no confunde el corte.
  assert.deepEqual(parsePollId('2026-W01-bogbo-vs-vs-algo'), { week: '2026-W01', a: 'bogbo', b: 'vs-algo' });
});

test('parsePollId: null si el id no encaja', () => {
  for (const id of [
    '',
    '2026-W42',
    '2026-W42-bogbo',
    '2026-W42-bogbo-vs-',
    '2026-W42--vs-le-mug',
    '2026-W54-bogbo-vs-le-mug',
    '2026W42-bogbo-vs-le-mug',
    '2026-W42_bogbo-vs-le-mug',
    '2026-W42-Bogbo-vs-le-mug',
    '2026-W42-bogbo-vs-bogbo',
  ]) {
    assert.equal(parsePollId(id), null, id);
  }
});

test('sin votos: historial vacío', () => {
  assert.deepEqual(summarizeHistory([], opts()), emptyHistory());
  assert.deepEqual(emptyHistory(), { lastWeek: null, palmares: [], masPedidos: [] });
});

test('lastWeek: la semana pasada más alta con votos; la vigente queda fuera', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W42-vlad-julia-vs-el-gran-maja', { 'vlad-julia': 3, 'el-gran-maja': 1 }),
      ...rows('2026-W43-the-bloop-vs-slowdown-criyonte', { 'the-bloop': 1, 'slowdown-criyonte': 3 }),
      ...rows('2026-W44-bogbo-vs-le-mug', { bogbo: 10, 'le-mug': 9 }),
    ],
    opts(),
  );
  assert.deepEqual(history.lastWeek, {
    id: '2026-W43-the-bloop-vs-slowdown-criyonte',
    week: '2026-W43',
    tipo: 'duelo',
    a: 'the-bloop',
    b: 'slowdown-criyonte',
    winner: 'slowdown-criyonte',
    totals: { 'the-bloop': 1, 'slowdown-criyonte': 3 },
    percents: { 'the-bloop': 25, 'slowdown-criyonte': 75 },
    total: 4,
  });
});

test('ignora opciones ajenas, ids que no parsean y otras encuestas de la semana vigente', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W41-bogbo-vs-le-mug', { bogbo: 2, 'le-mug': 1 }),
      // Solo votos a una opción que no es del duelo: total 0, no cuenta como semana pasada.
      ...rows('2026-W43-the-bloop-vs-slowdown-criyonte', { intruso: 5 }),
      ...rows('basura', { bogbo: 9 }),
      ...rows('2026-W43-sin-separador', { sin: 9 }),
      // Duelo automático de esta semana que se reinició: no es «la semana pasada».
      ...rows('2026-W44-the-bloop-vs-le-mug', { 'the-bloop': 7 }),
    ],
    opts(),
  );
  // W43 no tuvo votos válidos y W41 no es «la semana pasada».
  assert.equal(history.lastWeek, null);
  assert.deepEqual(history.palmares, [{ slug: 'bogbo', wins: 1, duels: 1 }]);
});

test('sin encuesta vigente (currentPollId null) cuentan todas las que parsean', () => {
  const history = summarizeHistory(rows('2026-W44-bogbo-vs-le-mug', { bogbo: 1 }),
    opts({ currentPollId: null, previousWeek: '2026-W44' }),
  );
  assert.equal(history.lastWeek?.id, '2026-W44-bogbo-vs-le-mug');
});

test('dos encuestas con votos en la misma semana: gana la de más votos', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W43-bogbo-vs-le-mug', { bogbo: 1 }),
      ...rows('2026-W43-the-bloop-vs-le-mug', { 'the-bloop': 2, 'le-mug': 1 }),
    ],
    opts(),
  );
  assert.equal(history.lastWeek?.id, '2026-W43-the-bloop-vs-le-mug');
});

test('empate: winner null y no suma victorias', () => {
  const history = summarizeHistory(rows('2026-W43-bogbo-vs-le-mug', { bogbo: 2, 'le-mug': 2 }), opts());
  assert.equal(history.lastWeek?.winner, null);
  assert.equal(history.lastWeek?.total, 4);
  assert.deepEqual(history.palmares, []);
});

test('palmarés: victorias desc, luego ratio desc; los empates no son victorias; límite', () => {
  const all = [
    ...rows('2026-W39-bogbo-vs-vlad-julia', { bogbo: 1 }),
    ...rows('2026-W40-bogbo-vs-le-mug', { bogbo: 3, 'le-mug': 1 }),
    ...rows('2026-W41-bogbo-vs-the-bloop', { bogbo: 2, 'the-bloop': 5 }),
    ...rows('2026-W42-vlad-julia-vs-el-gran-maja', { 'vlad-julia': 4, 'el-gran-maja': 4 }),
    ...rows('2026-W43-the-bloop-vs-le-mug', { 'the-bloop': 2, 'le-mug': 1 }),
  ];
  assert.deepEqual(summarizeHistory(all, opts()).palmares, [
    { slug: 'the-bloop', wins: 2, duels: 2 },
    { slug: 'bogbo', wins: 2, duels: 3 },
  ]);
  assert.deepEqual(summarizeHistory(all, opts({ limit: 1 })).palmares, [{ slug: 'the-bloop', wins: 2, duels: 2 }]);
});

test('palmarés: a igualdad de victorias y ratio, por slug', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W30-bogbo-vs-le-mug', { 'le-mug': 2, bogbo: 1 }),
      ...rows('2026-W31-vlad-julia-vs-el-gran-maja', { 'el-gran-maja': 1 }),
    ],
    opts(),
  );
  assert.deepEqual(history.palmares, [
    { slug: 'el-gran-maja', wins: 1, duels: 1 },
    { slug: 'le-mug', wins: 1, duels: 1 },
  ]);
});

test('más pedidos: solo votaciones desclasificar y solo fichas aún selladas; fuera del palmarés', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W38-cael-cortes-vs-ya-abierta', { 'cael-cortes': 2, 'ya-abierta': 9 }),
      ...rows('2026-W45-cael-cortes-vs-aodos-ay01', { 'cael-cortes': 3, 'aodos-ay01': 5 }),
    ],
    opts({ currentPollId: '2026-W46-bogbo-vs-le-mug', previousWeek: '2026-W45' }),
  );
  assert.deepEqual(history.masPedidos, [
    { slug: 'aodos-ay01', votes: 5 },
    { slug: 'cael-cortes', votes: 5 },
  ]);
  assert.deepEqual(history.palmares, []);
  assert.equal(history.lastWeek?.tipo, 'desclasificar');
  assert.equal(history.lastWeek?.winner, 'aodos-ay01');
  assert.deepEqual(
    summarizeHistory(rows('2026-W45-cael-cortes-vs-aodos-ay01', { 'cael-cortes': 3, 'aodos-ay01': 5 }), {
      ...opts({ currentPollId: '2026-W46-bogbo-vs-le-mug', previousWeek: '2026-W45' }),
      limit: 1,
    }).masPedidos,
    [{ slug: 'aodos-ay01', votes: 5 }],
  );
});

test('una encuesta con las mismas fichas pero otra semana que la curada es un duelo', () => {
  // En W43 no hay votación curada con esas fichas (la curada es de W45): cuenta como duelo (palmarés), no como «más pedidos».
  const history = summarizeHistory(
    rows('2026-W43-cael-cortes-vs-aodos-ay01', { 'cael-cortes': 1 }),
    opts(),
  );
  assert.equal(history.lastWeek?.tipo, 'duelo');
  assert.deepEqual(history.masPedidos, []);
  assert.deepEqual(history.palmares, [{ slug: 'cael-cortes', wins: 1, duels: 1 }]);
});

test('lastWeek: votos solo de hace dos semanas → null, pero cuentan en el palmarés', () => {
  const history = summarizeHistory(rows('2026-W42-bogbo-vs-le-mug', { bogbo: 2, 'le-mug': 1 }), opts());
  assert.equal(history.lastWeek, null);
  assert.deepEqual(history.palmares, [{ slug: 'bogbo', wins: 1, duels: 1 }]);
});

test('palmarés: una ficha inexistente no ocupa plaza y el límite se llena con las conocidas', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W38-fantasma-vs-le-mug', { fantasma: 5 }),
      ...rows('2026-W39-fantasma-vs-bogbo', { fantasma: 5 }),
      ...rows('2026-W40-bogbo-vs-le-mug', { bogbo: 2 }),
      ...rows('2026-W41-le-mug-vs-the-bloop', { 'le-mug': 2 }),
    ],
    opts({ limit: 2 }),
  );
  assert.deepEqual(
    history.palmares.map((e) => e.slug),
    ['bogbo', 'le-mug'],
  );
});

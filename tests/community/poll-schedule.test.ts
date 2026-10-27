import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_QUESTION,
  DEFAULT_QUESTION_DESCLASIFICAR,
  getCurrentPoll,
  getNextPoll,
  isoWeekKey,
  pollIdFor,
  weeksSinceEpoch,
} from '../../src/features/community/lib/poll-schedule.ts';

const FIGHTERS = ['vlad-julia', 'the-bloop', 'el-gran-maja', 'bogbo', 'le-mug', 'slowdown-criyonte'];

test('isoWeekKey sigue la definición ISO (lunes, jueves decide el año)', () => {
  assert.equal(isoWeekKey(new Date('2026-10-18T12:00:00Z')), '2026-W42'); // domingo
  assert.equal(isoWeekKey(new Date('2026-10-19T00:00:00Z')), '2026-W43'); // lunes
  assert.equal(isoWeekKey(new Date('2021-01-03T10:00:00Z')), '2020-W53');
  assert.equal(isoWeekKey(new Date('2024-12-30T10:00:00Z')), '2025-W01');
  assert.equal(isoWeekKey(new Date('2026-01-01T10:00:00Z')), '2026-W01');
});

test('weeksSinceEpoch es igual toda la semana y suma 1 el lunes', () => {
  const sunday = weeksSinceEpoch(new Date('2026-10-18T23:59:59Z'));
  assert.equal(weeksSinceEpoch(new Date('2026-10-12T00:00:00Z')), sunday);
  assert.equal(weeksSinceEpoch(new Date('2026-10-19T00:00:00Z')), sunday + 1);
  assert.equal(weeksSinceEpoch(new Date('1970-01-05T00:00:00Z')), 0);
});

test('el duelo curado de la semana gana a la rotación automática', () => {
  const poll = getCurrentPoll(
    [{ semana: '2026-W42', tipo: 'duelo', a: 'vlad-julia', b: 'el-gran-maja', pregunta: '¿Quién resiste?' }],
    FIGHTERS,
    new Date('2026-10-14T09:00:00Z'),
  );
  assert.deepEqual(poll, {
    id: '2026-W42-vlad-julia-vs-el-gran-maja',
    week: '2026-W42',
    tipo: 'duelo',
    a: 'vlad-julia',
    b: 'el-gran-maja',
    question: '¿Quién resiste?',
  });
});

test('una encuesta curada "desclasificar" propaga su tipo, con su pregunta por defecto o la curada', () => {
  const poll = getCurrentPoll(
    [{ semana: '2026-W45', tipo: 'desclasificar', a: 'cael-cortes', b: 'aodos-ay01' }],
    FIGHTERS,
    new Date('2026-11-04T09:00:00Z'),
  );
  assert.ok(poll);
  assert.equal(poll.tipo, 'desclasificar');
  assert.equal(poll.id, '2026-W45-cael-cortes-vs-aodos-ay01');
  assert.equal(poll.question, DEFAULT_QUESTION_DESCLASIFICAR);
  assert.equal(DEFAULT_QUESTION_DESCLASIFICAR, '¿Qué expediente quieres que Boris desclasifique primero?');

  const curada = getCurrentPoll(
    [{ semana: '2026-W45', tipo: 'desclasificar', a: 'cael-cortes', b: 'aodos-ay01', pregunta: '¿Cuál se abre antes?' }],
    FIGHTERS,
    new Date('2026-11-04T09:00:00Z'),
  );
  assert.equal(curada?.question, '¿Cuál se abre antes?');
});

test('sin duelo curado: emparejamiento automático estable y nunca contra sí mismo', () => {
  for (let n = 2; n <= FIGHTERS.length; n++) {
    const fighters = FIGHTERS.slice(0, n);
    for (let week = 0; week < 120; week++) {
      const date = new Date(Date.UTC(2026, 0, 5) + week * 7 * 86_400_000);
      const monday = getCurrentPoll([], fighters, date);
      const sunday = getCurrentPoll([], fighters, new Date(date.getTime() + 6 * 86_400_000 + 3_600_000));
      assert.ok(monday);
      assert.equal(monday.tipo, 'duelo'); // la rotación automática siempre genera duelos
      assert.notEqual(monday.a, monday.b);
      assert.deepEqual(monday, sunday);
      assert.equal(monday.question, DEFAULT_QUESTION);
      assert.equal(monday.id, pollIdFor(monday.week, monday.a, monday.b));
    }
  }
});

test('el orden y los duplicados de la lista de luchadores no cambian el resultado', () => {
  const date = new Date('2026-11-04T12:00:00Z');
  const a = getCurrentPoll([], FIGHTERS, date);
  const b = getCurrentPoll([], [...FIGHTERS].reverse().concat('bogbo'), date);
  assert.deepEqual(a, b);
});

test('menos de dos luchadores → sin encuesta', () => {
  assert.equal(getCurrentPoll([], ['bogbo'], new Date('2026-11-04T12:00:00Z')), null);
  assert.equal(getCurrentPoll([], [], new Date('2026-11-04T12:00:00Z')), null);
});

test('una encuesta curada de otra semana no cuenta: rotación automática', () => {
  const date = new Date('2026-10-14T09:00:00Z'); // 2026-W42
  const curated = [{ semana: '2026-W41', tipo: 'duelo' as const, a: 'vlad-julia', b: 'el-gran-maja' }];
  assert.deepEqual(getCurrentPoll(curated, FIGHTERS, date), getCurrentPoll([], FIGHTERS, date));
});

test('getNextPoll: la votación curada de la semana siguiente', () => {
  const curated = [{ semana: '2026-W45', tipo: 'desclasificar' as const, a: 'cael-cortes', b: 'aodos-ay01' }];
  // Domingo 2026-11-01, último día de 2026-W44.
  const next = getNextPoll(curated, FIGHTERS, new Date('2026-11-01T23:59:00Z'));
  assert.ok(next);
  assert.equal(next.id, '2026-W45-cael-cortes-vs-aodos-ay01');
  assert.equal(next.week, '2026-W45');
  assert.equal(next.tipo, 'desclasificar');
});

test('getNextPoll: sin curada, el emparejamiento automático de la semana siguiente', () => {
  const tuesday = new Date('2026-10-27T10:00:00Z'); // 2026-W44
  const next = getNextPoll([], FIGHTERS, tuesday);
  assert.equal(next?.week, '2026-W45');
  assert.deepEqual(next, getCurrentPoll([], FIGHTERS, new Date('2026-11-02T00:00:00Z')));
});

test('getNextPoll: null con menos de dos luchadores y sin curada', () => {
  assert.equal(getNextPoll([], ['bogbo'], new Date('2026-10-27T10:00:00Z')), null);
});

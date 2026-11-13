import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkList, lockedPollProblems, type ListContext } from '../../src/features/admin/lib/list-check.ts';
import { newsId, overlayList } from '../../src/core/content/lists.ts';

const NOW = new Date('2026-11-12T12:00:00Z'); // semana 2026-W46
const ctx: ListContext = {
  slugs: new Set(['the-bloop', 'luque', 'cael-cortes', 'aodos-ay01', 'vlad-julia']),
  fighterSlugs: new Set(['the-bloop', 'luque', 'vlad-julia']),
  sealedSlugs: new Set(['cael-cortes', 'aodos-ay01']),
  universeKeys: new Set(['Colosos']),
  canalIds: new Set(['hedUAqopPBg', 'XurjKHinBIY']),
  knownVideoIds: new Set(['hedUAqopPBg']),
  currentPolls: [
    { semana: '2026-W45', tipo: 'duelo', a: 'the-bloop', b: 'luque' },
    { semana: '2026-W46', tipo: 'duelo', a: 'luque', b: 'vlad-julia' },
    { semana: '2026-W48', tipo: 'duelo', a: 'the-bloop', b: 'vlad-julia' },
  ],
  now: NOW,
};

test('votaciones: las pasadas y la actual quedan fijas; las futuras se pueden cambiar o quitar', () => {
  const keep = ctx.currentPolls.slice(0, 2);
  assert.deepEqual(lockedPollProblems([...keep], ctx.currentPolls, NOW), []);
  assert.deepEqual(lockedPollProblems([...keep, { semana: '2026-W47', tipo: 'duelo', a: 'luque', b: 'the-bloop' }], ctx.currentPolls, NOW), []);
  assert.match(lockedPollProblems([keep[1]], ctx.currentPolls, NOW)[0], /2026-W45 .* no se puede quitar/);
  assert.match(lockedPollProblems([keep[0], { ...keep[1], b: 'the-bloop' }], ctx.currentPolls, NOW)[0], /2026-W46 .* no se puede cambiar/);
  assert.match(lockedPollProblems([...keep, { semana: '2026-W44', tipo: 'duelo', a: 'luque', b: 'the-bloop' }], ctx.currentPolls, NOW)[0], /semana 2026-W44.*futura/);
});

test('votaciones: duelos con datos de la Arena; «desclasificar» futuro con fichas selladas', () => {
  const base = ctx.currentPolls.slice(0, 2);
  const ok = checkList('polls', [...base, { semana: '2026-W47', tipo: 'desclasificar', a: 'cael-cortes', b: 'aodos-ay01' }], ctx);
  assert.ok('value' in ok);
  const bad = checkList('polls', [...base, { semana: '2026-W47', a: 'cael-cortes', b: 'nadie' }], ctx);
  assert.ok('errors' in bad);
  assert.deepEqual(bad.errors.sort(), ['2026-W47: "cael-cortes" no tiene datos de la Arena', '2026-W47: "nadie" no existe'].sort());
});

test('novedades: id con su fecha, enlaces internos que existan y externos solo de YouTube', () => {
  const entry = { id: '2026-11-12-hola', fecha: '2026-11-12', titulo: 'Hola mundo', resumen: 'Resumen corto', enlace: '/wiki/the-bloop' };
  assert.ok('value' in checkList('news', [entry], ctx));
  const missing = checkList('news', [{ ...entry, enlace: '/wiki/nadie' }], ctx);
  assert.ok('errors' in missing && /enlace interno inexistente/.test(missing.errors[0]));
  assert.ok('errors' in checkList('news', [{ ...entry, enlace: 'https://evil.example' }], ctx));
  assert.ok('errors' in checkList('news', [{ ...entry, fecha: '2026-11-13' }], ctx));
  assert.ok('errors' in checkList('news', [entry, entry], ctx));
});

test('vídeos, orden de la historia y «Empieza por aquí»', () => {
  assert.ok('value' in checkList('videos', [{ id: 'hedUAqopPBg', fichas: ['the-bloop'] }], ctx));
  const unknown = checkList('videos', [{ id: 'XurjKHinBIY', fichas: ['the-bloop'] }], ctx);
  assert.ok('errors' in unknown && /titulo/.test(unknown.errors[0]), JSON.stringify(unknown));
  assert.ok('value' in checkList('storyOrder', [{ universo: 'Colosos', ids: ['XurjKHinBIY'] }], ctx));
  const story = checkList('storyOrder', [{ universo: 'Otro', ids: ['aaaaaaaaaaa'] }], ctx);
  assert.ok('errors' in story && story.errors.length === 2);
  assert.ok('value' in checkList('startHere', ['the-bloop', 'luque'], ctx));
  const start = checkList('startHere', ['cael-cortes', 'nadie'], ctx);
  assert.ok('errors' in start && start.errors.length === 2);
  assert.ok('errors' in checkList('startHere', ['the-bloop', 'the-bloop'], ctx));
});

test('overlayList: lo publicado válido sustituye a los archivos; roto o ausente, quedan los archivos', () => {
  const file = ['the-bloop'];
  assert.deepEqual(overlayList('startHere', file, null), file);
  assert.deepEqual(overlayList('startHere', file, ['luque']), ['luque']);
  const errors: string[] = [];
  assert.deepEqual(overlayList('startHere', file, ['Mal Slug'], (m) => errors.push(m)), file);
  assert.equal(errors.length, 1);
  // `tipo` toma su valor por defecto al leer lo publicado.
  assert.deepEqual(overlayList('polls', [], [{ semana: '2026-W50', a: 'a', b: 'b' }]), [{ semana: '2026-W50', tipo: 'duelo', a: 'a', b: 'b' }]);
});

test('newsId: fecha y título sin tildes ni signos', () => {
  assert.equal(newsId('2026-11-12', '¡Llega Colosos 3: el tráiler!'), '2026-11-12-llega-colosos-3-el-trailer');
  assert.equal(newsId('2026-11-12', '¿?'), '2026-11-12-novedad');
});

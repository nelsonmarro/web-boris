import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CuratedPollsSchema, NewsEntrySchema } from '../../src/core/content/schemas.ts';

test('acepta duelos curados válidos', () => {
  const r = CuratedPollsSchema.safeParse([
    { semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja' },
    { semana: '2026-W43', a: 'the-bloop', b: 'slowdown-criyote', pregunta: '¿Quién gana?' },
  ]);
  assert.equal(r.success, true);
});

test('rechaza semanas repetidas', () => {
  const r = CuratedPollsSchema.safeParse([
    { semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja' },
    { semana: '2026-W42', a: 'the-bloop', b: 'bogbo' },
  ]);
  assert.equal(r.success, false);
});

test('rechaza un duelo contra sí mismo', () => {
  const r = CuratedPollsSchema.safeParse([{ semana: '2026-W42', a: 'bogbo', b: 'bogbo' }]);
  assert.equal(r.success, false);
});

test('rechaza semanas mal formadas', () => {
  for (const semana of ['2026-42', '2026-W54', '2026-W00', '26-W10']) {
    const r = CuratedPollsSchema.safeParse([{ semana, a: 'a-1', b: 'b-1' }]);
    assert.equal(r.success, false, semana);
  }
});

test('normaliza la fecha Date que produce gray-matter', () => {
  const n = NewsEntrySchema.parse({
    fecha: new Date('2026-10-18T00:00:00Z'),
    titulo: 'Título de prueba',
    resumen: 'Resumen corto',
    enlace: '/wiki/bogbo',
  });
  assert.equal(n.fecha, '2026-10-18');
});

test('rechaza enlaces http y resúmenes largos', () => {
  const base = { fecha: '2026-10-18', titulo: 'Título de prueba', resumen: 'Resumen corto', enlace: '/wiki' };
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'http://x.com' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, resumen: 'x'.repeat(161) }).success, false);
  assert.equal(NewsEntrySchema.safeParse(base).success, true);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: '//evil.com' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://www.youtube.com/watch?v=vRVFd7LfTTs' }).success, true);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CuratedPollsSchema, NewsEntrySchema, VideoLinksSchema } from '../../src/core/content/schemas.ts';

test('acepta duelos curados válidos', () => {
  const r = CuratedPollsSchema.safeParse([
    { semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja' },
    { semana: '2026-W43', a: 'the-bloop', b: 'slowdown-criyonte', pregunta: '¿Quién gana?' },
  ]);
  assert.equal(r.success, true);
});

test('tipo: por defecto es "duelo"; acepta "desclasificar" y rechaza otros valores', () => {
  const [duelo] = CuratedPollsSchema.parse([{ semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja' }]);
  assert.equal(duelo.tipo, 'duelo');
  const [desclasificar] = CuratedPollsSchema.parse([
    { semana: '2026-W45', tipo: 'desclasificar', a: 'cael-cortes', b: 'aodos-ay01' },
  ]);
  assert.equal(desclasificar.tipo, 'desclasificar');
  assert.equal(
    CuratedPollsSchema.safeParse([{ semana: '2026-W45', tipo: 'otro', a: 'cael-cortes', b: 'aodos-ay01' }]).success,
    false,
  );
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
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: '/\\evil.com' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://www.youtube.com/watch?v=vRVFd7LfTTs' }).success, true);
});

test('novedades: enlaces https solo de YouTube (youtube.com, www.youtube.com, m.youtube.com, youtu.be)', () => {
  const base = { fecha: '2026-10-18', titulo: 'Título de prueba', resumen: 'Resumen corto' };
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://youtu.be/vRVFd7LfTTs' }).success, true);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://evil.com/x' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://youtube.com.evil.com/x' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://user@www.youtube.com/x' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://' }).success, false);
});

test('videos.json: acepta un vídeo con sus fichas', () => {
  const r = VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['the-bloop', 'el-gran-maja'] }]);
  assert.equal(r.success, true);
});

test('videos.json: el id debe tener 11 caracteres de YouTube [A-Za-z0-9_-]', () => {
  for (const id of ['corto', 'hedUAqopPBgX', 'hedUAqop BG', 'hedUAqop.BG', '']) {
    assert.equal(VideoLinksSchema.safeParse([{ id, fichas: ['the-bloop'] }]).success, false, id);
  }
  assert.equal(VideoLinksSchema.safeParse([{ id: 'a_b-C1234ZZ', fichas: ['the-bloop'] }]).success, true);
});

test('videos.json: fichas no vacías, con slugs válidos y sin repetir', () => {
  assert.equal(VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: [] }]).success, false);
  assert.equal(VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['The Bloop'] }]).success, false);
  assert.equal(VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['the-bloop', 'the-bloop'] }]).success, false);
});

test('videos.json: rechaza el mismo vídeo dos veces', () => {
  const r = VideoLinksSchema.safeParse([
    { id: 'hedUAqopPBg', fichas: ['the-bloop'] },
    { id: 'hedUAqopPBg', fichas: ['el-gran-maja'] },
  ]);
  assert.equal(r.success, false);
});

test('videos.json: `titulo` es opcional y, si está, tiene entre 1 y 200 caracteres', () => {
  const ok = VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['the-bloop'], titulo: 'Colosos - La Batalla' }]);
  assert.equal(ok.success, true);
  assert.equal(ok.success && ok.data[0].titulo, 'Colosos - La Batalla');
  assert.equal(VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['the-bloop'] }]).success, true);
  assert.equal(VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['the-bloop'], titulo: '' }]).success, false);
  assert.equal(VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['the-bloop'], titulo: '   ' }]).success, false);
  assert.equal(VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['the-bloop'], titulo: 'x'.repeat(200) }]).success, true);
  assert.equal(VideoLinksSchema.safeParse([{ id: 'hedUAqopPBg', fichas: ['the-bloop'], titulo: 'x'.repeat(201) }]).success, false);
});

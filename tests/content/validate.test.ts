import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkArticleStandard,
  crossCheckEntities,
  crossCheckHeroPool,
  crossCheckStartHere,
  crossCheckNews,
  crossCheckPollIdSlugs,
  crossCheckPolls,
  crossCheckReservedSlugs,
  crossCheckVideoLinks,
} from '../../src/core/content/validate.ts';

const ARTICLES = new Set(['the-bloop', 'el-gran-maja', 'la-hecatombe-del-lapeon']);
const FIGHTERS = new Set(['the-bloop', 'el-gran-maja']);
const SEALED = new Set(['cael-cortes', 'aodos-ay01']);
/** Lunes 2026-10-19: semana ISO 2026-W43. Las encuestas se comparan con esta fecha, no con la de hoy. */
const NOW = new Date('2026-10-19T12:00:00Z');

test('duelos: slug inexistente o sin stats', () => {
  const errors = crossCheckPolls(
    [
      { semana: '2026-W42', tipo: 'duelo', a: 'the-bloop', b: 'el-gran-maja' },
      { semana: '2026-W43', tipo: 'duelo', a: 'the-bloop', b: 'no-existe' },
      { semana: '2026-W44', tipo: 'duelo', a: 'la-hecatombe-del-lapeon', b: 'the-bloop' },
    ],
    ARTICLES,
    FIGHTERS,
    SEALED,
    NOW,
  );
  assert.equal(errors.length, 2);
  assert.match(errors[0], /no-existe.*no existe/);
  assert.match(errors[1], /la-hecatombe-del-lapeon.*no tiene stats/);
});

test('desclasificar: a y b deben ser artículos sellados (status: proximamente); no piden stats', () => {
  const ARTICLES_WITH_SEALED = new Set([...ARTICLES, ...SEALED]);
  assert.deepEqual(
    crossCheckPolls(
      [{ semana: '2026-W45', tipo: 'desclasificar', a: 'cael-cortes', b: 'aodos-ay01' }],
      ARTICLES_WITH_SEALED,
      FIGHTERS,
      SEALED,
      NOW,
    ),
    [],
  );
  const errors = crossCheckPolls(
    [
      { semana: '2026-W45', tipo: 'desclasificar', a: 'cael-cortes', b: 'the-bloop' },
      { semana: '2026-W46', tipo: 'desclasificar', a: 'no-existe', b: 'aodos-ay01' },
    ],
    ARTICLES_WITH_SEALED,
    FIGHTERS,
    SEALED,
    NOW,
  );
  assert.equal(errors.length, 2);
  assert.match(errors[0], /2026-W45.*the-bloop.*sellado/);
  assert.match(errors[1], /2026-W46.*no-existe.*no existe/);
});

test('duelo: un artículo sellado sin stats sigue dando error', () => {
  const errors = crossCheckPolls(
    [{ semana: '2026-W45', tipo: 'duelo', a: 'cael-cortes', b: 'the-bloop' }],
    new Set([...ARTICLES, ...SEALED]),
    FIGHTERS,
    SEALED,
    NOW,
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /cael-cortes.*no tiene stats/);
});

test('desclasificar: "sellada" solo se exige en las semanas estrictamente futuras; en la actual y las pasadas basta con que existan', () => {
  const articles = new Set([...ARTICLES, ...SEALED]);
  // `the-bloop` ya no está sellado (Boris lo desclasificó): es el resultado esperado de la votación.
  const poll = (semana: string) => [{ semana, tipo: 'desclasificar' as const, a: 'cael-cortes', b: 'the-bloop' }];

  // Futura (W44 > W43): una ficha no sellada da error.
  const future = crossCheckPolls(poll('2026-W44'), articles, FIGHTERS, SEALED, NOW);
  assert.equal(future.length, 1);
  assert.match(future[0], /2026-W44.*the-bloop.*sellado/);

  // Actual (W43) y pasada (W42, W01 de 2026, y un año anterior): sin error.
  for (const semana of ['2026-W43', '2026-W42', '2026-W01', '2025-W52']) {
    assert.deepEqual(crossCheckPolls(poll(semana), articles, FIGHTERS, SEALED, NOW), [], semana);
  }
  // El año cuenta: 2027-W01 es futura aunque su número de semana sea menor.
  assert.equal(crossCheckPolls(poll('2027-W01'), articles, FIGHTERS, SEALED, NOW).length, 1);
});

test('desclasificar: en una semana pasada la ficha tiene que existir igualmente', () => {
  const errors = crossCheckPolls(
    [{ semana: '2026-W40', tipo: 'desclasificar', a: 'no-existe', b: 'cael-cortes' }],
    new Set([...ARTICLES, ...SEALED]),
    FIGHTERS,
    SEALED,
    NOW,
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /2026-W40.*no-existe.*no existe/);
});

test('desclasificar: la fecha inyectable cambia el veredicto de una misma encuesta', () => {
  const articles = new Set([...ARTICLES, ...SEALED]);
  const polls = [{ semana: '2026-W45', tipo: 'desclasificar' as const, a: 'cael-cortes', b: 'the-bloop' }];
  assert.equal(crossCheckPolls(polls, articles, FIGHTERS, SEALED, new Date('2026-10-19T12:00:00Z')).length, 1);
  // Del lunes 2 de noviembre (W45) en adelante la votación ya no es futura.
  assert.deepEqual(crossCheckPolls(polls, articles, FIGHTERS, SEALED, new Date('2026-11-02T00:00:00Z')), []);
});

test('novedades: enlaces internos rotos; externos e internos válidos pasan', () => {
  const base = { fecha: '2026-10-18', titulo: 'T', resumen: 'R' };
  const errors = crossCheckNews(
    [
      { ...base, id: 'ok-articulo', enlace: '/wiki/the-bloop' },
      { ...base, id: 'ok-ruta', enlace: '/comunidad' },
      { ...base, id: 'ok-arena', enlace: '/wiki/arena?a=the-bloop&b=el-gran-maja' },
      { ...base, id: 'ok-registro', enlace: '/wiki/registro' },
      { ...base, id: 'ok-registro-hash', enlace: '/wiki/registro#vistos' },
      { ...base, id: 'ok-aleatorio', enlace: '/wiki/aleatorio' },
      { ...base, id: 'ok-externo', enlace: 'https://www.youtube.com/watch?v=vRVFd7LfTTs' },
      { ...base, id: 'rota', enlace: '/wiki/no-existe' },
    ],
    ARTICLES,
  );
  assert.deepEqual(errors, ['novedades/rota.md: enlace interno inexistente /wiki/no-existe']);
});

test('crossCheckEntities: apodo duplicado, apodo igual a otro título y related inválido', () => {
  const errors = crossCheckEntities([
    { slug: 'a', title: 'Alfa', aliases: ['La Bestia'], related: ['zzz'] },
    { slug: 'b', title: 'Beta', aliases: ['la bestia', 'Alfa'], related: ['b'] },
  ]);
  assert.deepEqual(errors, [
    'related de a apunta a "zzz", que no existe',
    'apodo "la bestia" repetido en a y b',
    'apodo "Alfa" de b es el título de a',
    'related de b se apunta a sí misma',
  ]);
});

test('crossCheckEntities: un apodo que se queda vacío al normalizar es un error y no choca con otros', () => {
  assert.deepEqual(
    crossCheckEntities([
      { slug: 'a', title: 'Alfa', aliases: ['¡¡!!', 'Ok'] },
      { slug: 'b', title: 'Beta', aliases: ['---'] },
    ]),
    ['apodo "¡¡!!" de a queda vacío al normalizar', 'apodo "---" de b queda vacío al normalizar'],
  );
});

test('crossCheckEntities: related con el mismo slug repetido', () => {
  assert.deepEqual(
    crossCheckEntities([
      { slug: 'a', title: 'Alfa', related: ['b', 'c', 'b'] },
      { slug: 'b', title: 'Beta' },
      { slug: 'c', title: 'Gamma' },
    ]),
    ['related de a repite "b"'],
  );
});

test('crossCheckEntities: contenido válido no da errores', () => {
  assert.deepEqual(crossCheckEntities([{ slug: 'a', title: 'Alfa', aliases: ['La Bestia'] }, { slug: 'b', title: 'Beta', related: ['a'] }]), []);
});

// Vídeos de `FEATURED_VIDEOS` (los que no necesitan `titulo`).
const FEATURED_IDS = new Set(['hedUAqopPBg', 'XurjKHinBIY']);

test('crossCheckVideoLinks: cada slug de fichas debe existir en src/content', () => {
  assert.deepEqual(
    crossCheckVideoLinks([{ id: 'hedUAqopPBg', fichas: ['the-bloop', 'el-gran-maja'] }], ARTICLES, FEATURED_IDS),
    [],
  );
  assert.deepEqual(
    crossCheckVideoLinks(
      [
        { id: 'hedUAqopPBg', fichas: ['the-bloop', 'no-existe'] },
        { id: 'XurjKHinBIY', fichas: ['tampoco'] },
      ],
      ARTICLES,
      FEATURED_IDS,
    ),
    [
      'videos.json hedUAqopPBg: "no-existe" no existe en src/content',
      'videos.json XurjKHinBIY: "tampoco" no existe en src/content',
    ],
  );
});

test('crossCheckVideoLinks: un id fuera de FEATURED_VIDEOS sin `titulo` es un error; con `titulo` no', () => {
  const errors = crossCheckVideoLinks(
    [
      { id: 'hedUAqopPBg', fichas: ['the-bloop'] }, // destacado: no necesita título
      { id: 'zzzzzzzzzzz', fichas: ['the-bloop'] }, // sin título y no destacado
      { id: 'yyyyyyyyyyy', fichas: ['the-bloop'], titulo: 'Un short manual' }, // con título
    ],
    ARTICLES,
    FEATURED_IDS,
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^videos\.json zzzzzzzzzzz: .*FEATURED_VIDEOS.*titulo/);
});

test('crossCheckReservedSlugs: arena, registro y aleatorio no pueden ser el slug de un MDX', () => {
  assert.deepEqual(crossCheckReservedSlugs(['the-bloop', 'el-gran-maja']), []);
  const errors = crossCheckReservedSlugs(['the-bloop', 'arena', 'registro', 'aleatorio']);
  assert.equal(errors.length, 3);
  assert.match(errors[0], /arena\.mdx.*reservado.*\/wiki\/arena/);
  assert.match(errors[1], /registro\.mdx.*reservado.*\/wiki\/registro/);
  assert.match(errors[2], /aleatorio\.mdx.*reservado.*\/wiki\/aleatorio/);
  // Solo el nombre exacto: un slug que lo contiene es válido.
  assert.deepEqual(crossCheckReservedSlugs(['arena-de-colosos', 'registro-de-vuelo', 'el-aleatorio']), []);
});

test('crossCheckPollIdSlugs: un slug con "-vs-" o acabado en "-vs" rompería el id de la encuesta', () => {
  assert.deepEqual(crossCheckPollIdSlugs(['the-bloop', 'el-gran-maja', 'vs-inicio', 'canvas-azul', 'versus']), []);
  const errors = crossCheckPollIdSlugs(['the-bloop', 'bloop-vs-maja', 'colosos-vs']);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /^src\/content\/bloop-vs-maja\.mdx: .*-vs-.*encuesta/);
  assert.match(errors[1], /^src\/content\/colosos-vs\.mdx: /);
});

test('HERO_POOL: cada slug existe, no está sellado y tiene imagen (toma propia en public/ o la de la ficha)', () => {
  const existing = new Set(['/assets/the-bloop-hero.webp', '/assets/cael-hero.webp']);
  const errors = crossCheckHeroPool(
    [
      { slug: 'the-bloop', image: '/assets/the-bloop-hero.webp' },
      { slug: 'no-existe', image: '/assets/the-bloop-hero.webp' },
      { slug: 'sin-imagen' },
      { slug: 'toma-rota', image: '/assets/no-esta.webp' },
      { slug: 'cael-cortes', image: '/assets/cael-hero.webp' },
    ],
    new Set(['the-bloop', 'sin-imagen', 'toma-rota', 'cael-cortes']),
    new Set(['the-bloop', 'toma-rota', 'cael-cortes']),
    new Set(['cael-cortes']),
    (p) => existing.has(p),
  );
  assert.equal(errors.length, 4);
  assert.match(errors[0], /"no-existe" no existe/);
  assert.match(errors[1], /"sin-imagen" no trae `image` y su ficha tampoco/);
  // La ficha sí tiene `image`, pero la toma propia manda: si no existe, es un error.
  assert.match(errors[2], /"toma-rota": la imagen \/assets\/no-esta\.webp no existe en public\//);
  assert.match(errors[3], /"cael-cortes" es un expediente sellado/);
});

test('HERO_POOL válido: sin errores (sin toma propia basta la image de la ficha)', () => {
  assert.deepEqual(
    crossCheckHeroPool(
      [{ slug: 'the-bloop', image: '/assets/the-bloop-hero.webp' }, { slug: 'el-gran-maja' }],
      ARTICLES,
      new Set(['the-bloop', 'el-gran-maja']),
      SEALED,
      (p) => p === '/assets/the-bloop-hero.webp',
    ),
    [],
  );
});

/** Ficha que cumple el estándar (spec «fichas estándar» §4): cada test rompe una regla. */
const STANDARD = {
  slug: 'the-bloop',
  category: 'Coloso',
  description: 'Coloso del Pacífico Sur.',
  image: '/assets/The_Bloop/x.webp',
  imageCaption: 'The Bloop emergiendo.',
  infoboxSections: 2,
  h2Titles: ['Características', 'Alimentación', 'Referencias'],
};

test('checkArticleStandard: una ficha completa no da errores (sin image no pide imageCaption)', () => {
  assert.deepEqual(checkArticleStandard([STANDARD]), []);
  assert.deepEqual(checkArticleStandard([{ ...STANDARD, image: undefined, imageCaption: undefined }]), []);
});

test('checkArticleStandard: falta description (o está en blanco)', () => {
  for (const description of [undefined, '  ']) {
    const errors = checkArticleStandard([{ ...STANDARD, description }]);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^src\/content\/the-bloop\.mdx: falta `description`/);
  }
});

test('checkArticleStandard: image sin imageCaption', () => {
  const errors = checkArticleStandard([{ ...STANDARD, imageCaption: undefined }]);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /the-bloop\.mdx: tiene `image` pero falta `imageCaption`/);
});

test('checkArticleStandard: infobox sin secciones', () => {
  const errors = checkArticleStandard([{ ...STANDARD, infoboxSections: 0 }]);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /the-bloop\.mdx: el `infobox` necesita al menos una sección/);
});

test('checkArticleStandard: menos de dos apartados ## sin contar Referencias (con o sin tilde)', () => {
  const errors = checkArticleStandard([
    { ...STANDARD, slug: 'uno', h2Titles: ['Características', 'Referencias'] },
    { ...STANDARD, slug: 'ninguno', h2Titles: ['REFERENCIAS'] },
  ]);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /uno\.mdx: tiene 1 apartado/);
  assert.match(errors[1], /ninguno\.mdx: tiene 0 apartado/);
});

test('checkArticleStandard: varias reglas incumplidas dan un error por regla', () => {
  const errors = checkArticleStandard([
    { slug: 'vacia', category: 'Humano', image: '/assets/x.webp', infoboxSections: 0, h2Titles: [] },
  ]);
  assert.equal(errors.length, 4);
  assert.ok(errors.every((e) => e.startsWith('src/content/vacia.mdx: ')));
});

test('checkArticleStandard: los índices (Directorio / Categoría) y las selladas quedan exentos', () => {
  const bare = { slug: 'x', infoboxSections: 0, h2Titles: [] };
  assert.deepEqual(
    checkArticleStandard([
      { ...bare, slug: 'directorio', category: 'Directorio' },
      { ...bare, slug: 'categoria', category: 'Categoría' },
      { ...bare, slug: 'sellada', category: 'Coloso', status: 'proximamente', image: '/assets/x.webp' },
    ]),
    [],
  );
  // Sin categoría no es un índice: se le exige el estándar.
  assert.equal(checkArticleStandard([bare]).length, 3);
});

test('START_HERE: cada slug existe y no está sellado', () => {
  const errors = crossCheckStartHere(['the-bloop', 'no-existe', 'cael-cortes'], new Set([...ARTICLES, 'cael-cortes']), new Set(['cael-cortes']));
  assert.equal(errors.length, 2);
  assert.match(errors[0], /"no-existe" no existe/);
  assert.match(errors[1], /"cael-cortes" es un expediente sellado/);
  assert.deepEqual(crossCheckStartHere(['the-bloop', 'el-gran-maja'], ARTICLES, SEALED), []);
});

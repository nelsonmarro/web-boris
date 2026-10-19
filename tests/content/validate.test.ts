import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crossCheckEntities, crossCheckNews, crossCheckPolls, crossCheckVideoLinks } from '../../src/core/content/validate.ts';

const ARTICLES = new Set(['the-bloop', 'el-gran-maja', 'la-hecatombe-del-lapeon']);
const FIGHTERS = new Set(['the-bloop', 'el-gran-maja']);
const SEALED = new Set(['cael-cortes', 'aodos-ay01']);

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
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /cael-cortes.*no tiene stats/);
});

test('novedades: enlaces internos rotos; externos e internos válidos pasan', () => {
  const base = { fecha: '2026-10-18', titulo: 'T', resumen: 'R' };
  const errors = crossCheckNews(
    [
      { ...base, id: 'ok-articulo', enlace: '/wiki/the-bloop' },
      { ...base, id: 'ok-ruta', enlace: '/comunidad' },
      { ...base, id: 'ok-arena', enlace: '/wiki/arena?a=the-bloop&b=el-gran-maja' },
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

test('crossCheckVideoLinks: cada slug de fichas debe existir en src/content', () => {
  assert.deepEqual(
    crossCheckVideoLinks([{ id: 'hedUAqopPBg', fichas: ['the-bloop', 'el-gran-maja'] }], ARTICLES),
    [],
  );
  assert.deepEqual(
    crossCheckVideoLinks(
      [
        { id: 'hedUAqopPBg', fichas: ['the-bloop', 'no-existe'] },
        { id: 'XurjKHinBIY', fichas: ['tampoco'] },
      ],
      ARTICLES,
    ),
    [
      'videos.json hedUAqopPBg: "no-existe" no existe en src/content',
      'videos.json XurjKHinBIY: "tampoco" no existe en src/content',
    ],
  );
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crossCheckEntities, crossCheckNews, crossCheckPolls } from '../../src/core/content/validate.ts';

const ARTICLES = new Set(['the-bloop', 'el-gran-maja', 'la-hecatombe-del-lapeon']);
const FIGHTERS = new Set(['the-bloop', 'el-gran-maja']);

test('duelos: slug inexistente o sin stats', () => {
  const errors = crossCheckPolls(
    [
      { semana: '2026-W42', a: 'the-bloop', b: 'el-gran-maja' },
      { semana: '2026-W43', a: 'the-bloop', b: 'no-existe' },
      { semana: '2026-W44', a: 'la-hecatombe-del-lapeon', b: 'the-bloop' },
    ],
    ARTICLES,
    FIGHTERS,
  );
  assert.equal(errors.length, 2);
  assert.match(errors[0], /no-existe.*no existe/);
  assert.match(errors[1], /la-hecatombe-del-lapeon.*no tiene stats/);
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
  assert.ok(errors.some((e) => e.includes('la bestia')));
  assert.ok(errors.some((e) => e.includes('Alfa')));
  assert.ok(errors.some((e) => e.includes('zzz')));
  assert.ok(errors.some((e) => e.includes('b') && e.includes('sí misma')));
});

test('crossCheckEntities: contenido válido no da errores', () => {
  assert.deepEqual(crossCheckEntities([{ slug: 'a', title: 'Alfa', aliases: ['La Bestia'] }, { slug: 'b', title: 'Beta', related: ['a'] }]), []);
});

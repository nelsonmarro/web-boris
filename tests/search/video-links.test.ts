import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntityIndex } from '../../src/core/search/entity-index.ts';
import { linkVideos } from '../../src/core/search/video-links.ts';

const art = (slug: string, title: string, extra: Record<string, unknown> = {}) => ({
  slug,
  frontmatter: { title, universe: 'Colosos', category: 'Coloso', ...extra },
});

const INDEX = buildEntityIndex([
  art('the-bloop', 'The Bloop'),
  art('el-gran-maja', 'El Gran Majá'),
  art('bogbo', 'Bogbo'),
  art('animales-colosos', 'Animales del Universo Colosos', { category: 'Directorio' }),
]);

const ids = (list: { id: string }[] | undefined) => list?.map((v) => v.id);

test('relaciona por el título: los nombres de varias palabras valen siempre', () => {
  const videos = [{ id: 'hedUAqopPBg', title: 'Colosos - The Bloop vs El Gran Majá - La Batalla' }];
  const map = linkVideos(videos, INDEX, []);
  assert.deepEqual(ids(map.get('the-bloop')), ['hedUAqopPBg']);
  assert.deepEqual(ids(map.get('el-gran-maja')), ['hedUAqopPBg']);
});

test('relaciona por el título con un nombre de una sola palabra solo si va en mayúscula', () => {
  const map = linkVideos(
    [
      { id: 'aaaaaaaaaaa', title: 'Bogbo ataca el puerto' },
      { id: 'bbbbbbbbbbb', title: 'un bogbo cualquiera' },
    ],
    INDEX,
    [],
  );
  assert.deepEqual(ids(map.get('bogbo')), ['aaaaaaaaaaa']);
});

test('una categoría no enlazable (Directorio) no relaciona vídeos', () => {
  const map = linkVideos([{ id: 'aaaaaaaaaaa', title: 'Animales del Universo Colosos' }], INDEX, []);
  assert.equal(map.size, 0);
});

test('relaciona por la lista manual aunque el título no nombre a nadie', () => {
  const map = linkVideos(
    [{ id: 'XurjKHinBIY', title: 'Extinción masiva' }],
    INDEX,
    [{ id: 'XurjKHinBIY', fichas: ['the-bloop', 'bogbo'] }],
  );
  assert.deepEqual(ids(map.get('the-bloop')), ['XurjKHinBIY']);
  assert.deepEqual(ids(map.get('bogbo')), ['XurjKHinBIY']);
  assert.equal(map.get('bogbo')?.[0].title, 'Extinción masiva');
});

test('sin duplicados: título repetido, título + manual y manual repetido dan un solo vídeo', () => {
  const map = linkVideos(
    [{ id: 'aaaaaaaaaaa', title: 'Bogbo contra Bogbo' }],
    INDEX,
    [
      { id: 'aaaaaaaaaaa', fichas: ['bogbo', 'bogbo'] },
      { id: 'aaaaaaaaaaa', fichas: ['bogbo'] },
    ],
  );
  assert.deepEqual(ids(map.get('bogbo')), ['aaaaaaaaaaa']);
});

test('un vídeo sin relaciones no aparece en ninguna ficha', () => {
  const map = linkVideos(
    [
      { id: 'aaaaaaaaaaa', title: 'Vlog del canal' },
      { id: 'bbbbbbbbbbb', title: 'Bogbo ataca' },
    ],
    INDEX,
    [],
  );
  const everyId = [...map.values()].flatMap((list) => list.map((v) => v.id));
  assert.deepEqual(everyId, ['bbbbbbbbbbb']);
});

test('mantiene el orden de los vídeos, no el de la lista manual ni el de las menciones', () => {
  const videos = [
    { id: 'aaaaaaaaaaa', title: 'Primero: Bogbo' },
    { id: 'bbbbbbbbbbb', title: 'Segundo sin nombres' },
    { id: 'ccccccccccc', title: 'Tercero: Bogbo' },
  ];
  const map = linkVideos(videos, INDEX, [
    { id: 'ccccccccccc', fichas: ['bogbo'] },
    { id: 'bbbbbbbbbbb', fichas: ['bogbo'] },
  ]);
  assert.deepEqual(ids(map.get('bogbo')), ['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc']);
});

test('una relación manual con un vídeo que no está en la lista se ignora (no hay título)', () => {
  const map = linkVideos([{ id: 'aaaaaaaaaaa', title: 'Vlog del canal' }], INDEX, [
    { id: 'zzzzzzzzzzz', fichas: ['bogbo'] },
  ]);
  assert.equal(map.size, 0);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  displayVideoTitle,
  groupVideosByUniverse,
  isFeedMissing,
  parseVideoOrder,
  sortVideosByDate,
  universeFromTitle,
  universeOfVideo,
} from '../../src/features/community/lib/videos-by-universe.ts';

const v = (id: string, published?: string) => (published ? { id, title: id, published } : { id, title: id });

const UNIVERSE: Record<string, string> = {
  'the-bloop': 'Colosos',
  'el-gran-maja': 'Colosos',
  borisao: 'Capitán de Galeón',
  'el-angel': 'Ellos Llegaron',
  lapeon: 'La Hecatombe del Lapeón',
};
const universeOf = (slug: string) => UNIVERSE[slug];
const ORDER = ['Colosos', 'Capitán de Galeón', 'Ellos Llegaron', 'La Hecatombe del Lapeón'];

test('parseVideoOrder: solo «recientes» cambia el orden por defecto', () => {
  assert.equal(parseVideoOrder('recientes'), 'recientes');
  assert.equal(parseVideoOrder('antiguos'), 'antiguos');
  assert.equal(parseVideoOrder(null), 'antiguos');
  assert.equal(parseVideoOrder(undefined), 'antiguos');
  assert.equal(parseVideoOrder('RECIENTES'), 'antiguos');
});

test('sortVideosByDate: antiguos primero con los sin fecha delante; recientes primero con ellos detrás', () => {
  const videos = [
    v('sinfecha1'),
    v('b', '2025-12-13T14:19:43+00:00'),
    v('sinfecha2'),
    v('d', '2026-03-01T10:00:00+00:00'),
    v('invalida', 'no-es-una-fecha'),
    v('a', '2025-01-01T00:00:00Z'),
  ];
  assert.deepEqual(
    sortVideosByDate(videos, 'antiguos').map((x) => x.id),
    ['sinfecha1', 'sinfecha2', 'invalida', 'a', 'b', 'd'],
  );
  assert.deepEqual(
    sortVideosByDate(videos, 'recientes').map((x) => x.id),
    ['d', 'b', 'a', 'sinfecha1', 'sinfecha2', 'invalida'],
  );
});

test('sortVideosByDate: a igual fecha, el orden de entrada; no muta la lista', () => {
  const same = [v('x', '2026-01-01T00:00:00Z'), v('y', '2026-01-01T00:00:00Z')];
  const copy = structuredClone(same);
  assert.deepEqual(sortVideosByDate(same, 'antiguos').map((x) => x.id), ['x', 'y']);
  assert.deepEqual(sortVideosByDate(same, 'recientes').map((x) => x.id), ['x', 'y']);
  assert.deepEqual(same, copy);
});

test('isFeedMissing: sin ninguna fecha válida ni nada de canal.json, solo quedan los destacados', () => {
  assert.equal(isFeedMissing([v('a'), v('b')]), true);
  assert.equal(isFeedMissing([v('a', 'no-es-una-fecha')]), true);
  assert.equal(isFeedMissing([]), true);
  assert.equal(isFeedMissing([v('a'), v('b', '2026-01-01T00:00:00Z')]), false);
  // canal.json sin fechas basta: no falta la lista del canal.
  assert.equal(isFeedMissing([v('a'), c('b', 'video', 1)]), false);
});

/** Una entrada de `canal.json` (con tipo y orden), con o sin fecha. */
const c = (id: string, tipo: 'video' | 'short', orden: number, published?: string) => ({ ...v(id, published), tipo, orden });

test('sortVideosByDate: sin fechas, canal.json por orden dentro de cada tipo (vídeos, Shorts y luego los demás)', () => {
  const videos = [c('v2', 'video', 2), v('destacado'), c('s1', 'short', 1), c('v1', 'video', 1), c('s2', 'short', 2)];
  assert.deepEqual(sortVideosByDate(videos, 'antiguos').map((x) => x.id), ['v1', 'v2', 's1', 's2', 'destacado']);
  assert.deepEqual(sortVideosByDate(videos, 'recientes').map((x) => x.id), ['v2', 'v1', 's2', 's1', 'destacado']);
});

test('sortVideosByDate: con fecha en los dos manda la fecha; sin ella, el orden de su tipo la acota', () => {
  const videos = [
    c('v3', 'video', 3), // sin fecha: después de v2 (2025-06), y antes que s2 (2025-09)
    c('s2', 'short', 2, '2025-09-01'),
    c('v1', 'video', 1, '2024-01-01'),
    c('s1', 'short', 1, '2025-03-01'),
    c('v2', 'video', 2, '2025-06-01'),
    c('v0', 'video', 0), // sin fecha y sin anterior fechado: el más antiguo
  ];
  assert.deepEqual(sortVideosByDate(videos, 'antiguos').map((x) => x.id), ['v0', 'v1', 's1', 'v2', 'v3', 's2']);
  assert.deepEqual(sortVideosByDate(videos, 'recientes').map((x) => x.id), ['s2', 'v3', 'v2', 's1', 'v1', 'v0']);
});

test('sortVideosByDate: el orden dentro de un tipo se respeta aunque solo algunos traigan fecha', () => {
  const videos = [c('s4', 'short', 4, '2026-01-01T00:00:00Z'), c('s2', 'short', 2), c('s3', 'short', 3), c('s1', 'short', 1, '2025-01-01')];
  assert.deepEqual(sortVideosByDate(videos, 'antiguos').map((x) => x.id), ['s1', 's2', 's3', 's4']);
  assert.deepEqual(sortVideosByDate(videos, 'recientes').map((x) => x.id), ['s4', 's3', 's2', 's1']);
});

test('universeOfVideo: el más repetido; a igualdad, el de la primera ficha; las desconocidas no cuentan', () => {
  assert.equal(universeOfVideo(['borisao', 'the-bloop', 'el-gran-maja'], universeOf), 'Colosos');
  assert.equal(universeOfVideo(['el-angel', 'the-bloop'], universeOf), 'Ellos Llegaron');
  assert.equal(universeOfVideo(['no-existe', 'no-existe-2', 'borisao'], universeOf), 'Capitán de Galeón');
  assert.equal(universeOfVideo([], universeOf), undefined);
  assert.equal(universeOfVideo(['no-existe'], universeOf), undefined);
});

test('groupVideosByUniverse: grupos en el orden de los universos, «Otros vídeos» al final, antiguos primero', () => {
  const channel = [
    v('blitz'),
    v('batalla'),
    v('galeon', '2026-02-01T00:00:00Z'),
    v('suelto', '2026-01-15T00:00:00Z'),
    v('trailer', '2025-12-13T00:00:00Z'),
  ];
  const bySlug = new Map([
    ['the-bloop', [v('batalla'), v('trailer')]],
    ['el-gran-maja', [v('batalla')]],
    ['borisao', [v('galeon')]],
    ['el-angel', [v('blitz')]],
  ]);
  const groups = groupVideosByUniverse(channel, bySlug, universeOf, ORDER);
  assert.deepEqual(
    groups.map((g) => [g.universe, g.videos.map((x) => x.id)]),
    [
      ['Colosos', ['batalla', 'trailer']],
      ['Capitán de Galeón', ['galeon']],
      ['Ellos Llegaron', ['blitz']],
      [null, ['suelto']],
    ],
  );
  const batalla = groups[0].videos[0];
  assert.deepEqual(batalla.fichas, ['the-bloop', 'el-gran-maja']);
  assert.equal(groups[3].videos[0].fichas.length, 0);
});

test('groupVideosByUniverse: un vídeo de varios universos va al más repetido', () => {
  const groups = groupVideosByUniverse(
    [v('cruce')],
    new Map([
      ['el-angel', [v('cruce')]],
      ['the-bloop', [v('cruce')]],
      ['el-gran-maja', [v('cruce')]],
    ]),
    universeOf,
    ORDER,
  );
  assert.deepEqual(groups.map((g) => g.universe), ['Colosos']);
  assert.deepEqual(groups[0].videos[0].fichas, ['el-angel', 'the-bloop', 'el-gran-maja']);
});

test('groupVideosByUniverse: los vídeos de videos.json que el canal no trae entran, sin fecha y sin repetirse', () => {
  const groups = groupVideosByUniverse(
    [v('canal', '2026-01-01T00:00:00Z')],
    new Map([
      ['the-bloop', [v('canal'), { id: 'manual', title: 'Vídeo manual' }]],
      ['el-gran-maja', [{ id: 'manual', title: 'Vídeo manual' }]],
    ]),
    universeOf,
    ORDER,
  );
  assert.equal(groups.length, 1);
  assert.deepEqual(
    groups[0].videos.map((x) => [x.id, x.title, x.published, x.fichas]),
    [
      ['manual', 'Vídeo manual', undefined, ['the-bloop', 'el-gran-maja']],
      ['canal', 'canal', '2026-01-01T00:00:00Z', ['the-bloop']],
    ],
  );
});

test('groupVideosByUniverse: una ficha desconocida no sale como chip; un universo fuera de la lista va tras los conocidos', () => {
  const groups = groupVideosByUniverse(
    [v('raro'), v('fantasma'), v('colosos')],
    new Map([
      ['no-existe', [v('fantasma')]],
      ['otro', [v('raro')]],
      ['the-bloop', [v('colosos')]],
    ]),
    (slug) => (slug === 'otro' ? 'Universo nuevo' : universeOf(slug)),
    ORDER,
  );
  assert.deepEqual(
    groups.map((g) => [g.universe, g.videos.map((x) => [x.id, x.fichas])]),
    [
      ['Colosos', [['colosos', ['the-bloop']]]],
      ['Universo nuevo', [['raro', ['otro']]]],
      [null, [['fantasma', []]]],
    ],
  );
});

test('groupVideosByUniverse: sin fechas, cada grupo por el orden de canal.json', () => {
  const groups = groupVideosByUniverse(
    [c('p3', 'short', 3), c('p1', 'short', 1), c('p2', 'short', 2)],
    new Map([['el-angel', [v('p1'), v('p2'), v('p3')]]]),
    universeOf,
    ORDER,
  );
  assert.deepEqual(groups[0].videos.map((x) => [x.id, x.orden]), [['p1', 1], ['p2', 2], ['p3', 3]]);
});

test('groupVideosByUniverse: sin vídeos, sin grupos', () => {
  assert.deepEqual(groupVideosByUniverse([], new Map(), universeOf, ORDER), []);
});

const KEYWORDS = [
  { universe: 'Colosos', keywords: ['Colosos', 'The Bloop', 'Gran Majá'] },
  { universe: 'Capitán de Galeón', keywords: ['Capitán de Galeón'] },
  { universe: 'Ellos Llegaron', keywords: ['Ellos llegaron'] },
];

test('universeFromTitle: palabras enteras, sin mayúsculas, tildes ni #', () => {
  assert.equal(universeFromTitle('INVASION EXTRATERRESTE (Ellos llegaron /4 PARTES)', KEYWORDS), 'Ellos Llegaron');
  assert.equal(universeFromTitle('"Ellos llegaron" Parte 5 #shorts', KEYWORDS), 'Ellos Llegaron');
  assert.equal(universeFromTitle('🌊Porcia la Gris, la hembra más grande🌊 #shorts #colosos', KEYWORDS), 'Colosos');
  assert.equal(universeFromTitle('THE BLOOP', KEYWORDS), 'Colosos');
  assert.equal(universeFromTitle('Sonidos de El Gran Maja', KEYWORDS), 'Colosos');
  assert.equal(universeFromTitle('El capitan de galeon vuelve', KEYWORDS), 'Capitán de Galeón');
  // Solo palabras enteras: «Colosossss» o «Bloopers» no cuentan.
  assert.equal(universeFromTitle('Colosossss y Bloopers', KEYWORDS), undefined);
  assert.equal(universeFromTitle('Liminal spaces', KEYWORDS), undefined);
  assert.equal(universeFromTitle('Algo', [{ universe: 'X', keywords: ['  ', '#'] }]), undefined);
});

test('groupVideosByUniverse: sin fichas, manda el título; con fichas, mandan las fichas; el tipo se conserva', () => {
  const groups = groupVideosByUniverse(
    [
      { id: 'parte7', title: 'Ellos llegaron - Parte 7 #shorts', published: '2025-03-01', tipo: 'short' as const },
      { id: 'liminal', title: 'Liminal spaces', published: '2024-01-01', tipo: 'video' as const },
      { id: 'cruce', title: 'Ellos llegaron y The Bloop', published: '2025-04-01' },
    ],
    new Map([['borisao', [v('cruce')]]]),
    universeOf,
    ORDER,
    KEYWORDS,
  );
  assert.deepEqual(
    groups.map((g) => [g.universe, g.videos.map((x) => [x.id, x.tipo])]),
    [
      ['Capitán de Galeón', [['cruce', undefined]]],
      ['Ellos Llegaron', [['parte7', 'short']]],
      [null, [['liminal', 'video']]],
    ],
  );
});

test('displayVideoTitle: quita los hashtags y los separadores que quedan colgando', () => {
  assert.equal(displayVideoTitle('The Bloop de caza #shorts'), 'The Bloop de caza');
  assert.equal(displayVideoTitle('El Gran Majá 003 #shorts #cgi'), 'El Gran Majá 003');
  assert.equal(displayVideoTitle('Cherno Alpha vs Raythe - Versión Extendida #kaiju #pacificrim'), 'Cherno Alpha vs Raythe - Versión Extendida');
  assert.equal(displayVideoTitle('Ahora sí  #space #moon -   @papayesauriooficial'), 'Ahora sí - @papayesauriooficial');
  assert.equal(displayVideoTitle('Bombardeo de Dresde #cgi #www -'), 'Bombardeo de Dresde');
  assert.equal(displayVideoTitle('Colosos 3: Tráiler Oficial'), 'Colosos 3: Tráiler Oficial');
  assert.equal(displayVideoTitle('C# en 4K'), 'C# en 4K');
  assert.equal(displayVideoTitle('#shorts'), '#shorts');
});

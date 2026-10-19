import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeChannelVideos } from '../../src/features/community/lib/merge-videos.ts';

const FEATURED = [
  { id: 'hedUAqopPBg', title: 'Colosos - The Bloop vs El Gran Majá - La Batalla' },
  { id: 'XurjKHinBIY', title: 'Extinción masiva' },
];

test('primero los destacados y luego los del feed, en su orden', () => {
  const feed = [
    { id: 'vRVFd7LfTTs', title: 'Colosos 3: Tráiler Oficial', published: '2025-12-13T14:19:43+00:00' },
    { id: 'YykxsLwHPw4', title: 'Otro vídeo' },
  ];
  assert.deepEqual(
    mergeChannelVideos(FEATURED, feed).map((v) => v.id),
    ['hedUAqopPBg', 'XurjKHinBIY', 'vRVFd7LfTTs', 'YykxsLwHPw4'],
  );
});

test('sin duplicados por id: gana el destacado y toma la fecha del feed', () => {
  const feed = [{ id: 'hedUAqopPBg', title: 'Título del feed', published: '2024-01-02T00:00:00+00:00' }];
  assert.deepEqual(mergeChannelVideos(FEATURED, feed), [
    { id: 'hedUAqopPBg', title: FEATURED[0].title, published: '2024-01-02T00:00:00+00:00' },
    FEATURED[1],
  ]);
});

test('también deduplica dentro del feed', () => {
  const feed = [
    { id: 'vRVFd7LfTTs', title: 'Uno' },
    { id: 'vRVFd7LfTTs', title: 'Uno otra vez' },
  ];
  assert.deepEqual(mergeChannelVideos([], feed), [{ id: 'vRVFd7LfTTs', title: 'Uno' }]);
});

test('feed vacío (el RSS falló): solo los destacados', () => {
  assert.deepEqual(mergeChannelVideos(FEATURED, []), FEATURED);
});

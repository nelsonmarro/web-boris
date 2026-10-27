import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latestVideos } from '../../src/features/community/lib/latest-videos.ts';

const v = (id: string, published?: string) => (published ? { id, title: id, published } : { id, title: id });

const VIDEOS = [
  v('aaaaaaaaaaa'),
  v('bbbbbbbbbbb', '2025-12-13T14:19:43+00:00'),
  v('ccccccccccc'),
  v('ddddddddddd', '2026-03-01T10:00:00+00:00'),
  v('eeeeeeeeeee', 'no-es-una-fecha'),
];

test('más reciente primero; los sin fecha (o con fecha inválida) al final, en su orden', () => {
  assert.deepEqual(
    latestVideos(VIDEOS, 10).map((x) => x.id),
    ['ddddddddddd', 'bbbbbbbbbbb', 'aaaaaaaaaaa', 'ccccccccccc', 'eeeeeeeeeee'],
  );
});

test('n limita el número de vídeos', () => {
  assert.deepEqual(latestVideos(VIDEOS, 2).map((x) => x.id), ['ddddddddddd', 'bbbbbbbbbbb']);
  assert.deepEqual(latestVideos(VIDEOS, 0), []);
  assert.deepEqual(latestVideos([], 4), []);
});

test('misma fecha: se respeta el orden de entrada; no muta la lista', () => {
  const same = [v('xxxxxxxxxxx', '2026-01-01T00:00:00Z'), v('yyyyyyyyyyy', '2026-01-01T00:00:00Z')];
  const copy = structuredClone(same);
  assert.deepEqual(latestVideos(same, 4).map((x) => x.id), ['xxxxxxxxxxx', 'yyyyyyyyyyy']);
  assert.deepEqual(same, copy);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { channelVideosUrl, latestVideoHref } from '../../src/features/marketing/lib/latest-video-link.ts';

const CHANNEL = 'https://youtube.com/@borisaoblois';

test('con el feed RSS enlaza al vídeo', () => {
  assert.equal(latestVideoHref({ id: 'abcdefghijk', source: 'rss' }, CHANNEL), 'https://www.youtube.com/watch?v=abcdefghijk');
});

test('con el respaldo (no es el último) o sin dato, la pestaña Vídeos del canal', () => {
  assert.equal(latestVideoHref({ id: 'abcdefghijk', source: 'fallback' }, CHANNEL), `${CHANNEL}/videos`);
  assert.equal(latestVideoHref(null, CHANNEL), `${CHANNEL}/videos`);
  assert.equal(latestVideoHref(undefined, CHANNEL), `${CHANNEL}/videos`);
});

test('channelVideosUrl no duplica la barra final', () => {
  assert.equal(channelVideosUrl(`${CHANNEL}/`), `${CHANNEL}/videos`);
});

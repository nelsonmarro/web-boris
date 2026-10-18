import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseYoutubeFeed } from '../../src/features/community/lib/youtube-feed.ts';

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">
  <title>Borisao Blois</title>
  <published>2021-03-03T20:42:26+00:00</published>
  <entry>
    <id>yt:video:vRVFd7LfTTs</id>
    <yt:videoId>vRVFd7LfTTs</yt:videoId>
    <title>Colosos 3: Tráiler Oficial</title>
    <published>2025-12-13T14:19:43+00:00</published>
  </entry>
  <entry>
    <yt:videoId>YykxsLwHPw4</yt:videoId>
    <title>Colosos &amp; Ocultos &quot;2&quot;</title>
    <published>2025-02-05T12:26:01+00:00</published>
  </entry>
  <entry>
    <yt:videoId>id-roto</yt:videoId>
    <title>Inválido</title>
    <published>2025-01-01T00:00:00+00:00</published>
  </entry>
</feed>`;

test('extrae los vídeos en el orden del feed e ignora la cabecera del canal', () => {
  assert.deepEqual(parseYoutubeFeed(FEED), [
    { id: 'vRVFd7LfTTs', title: 'Colosos 3: Tráiler Oficial', published: '2025-12-13T14:19:43+00:00' },
    { id: 'YykxsLwHPw4', title: 'Colosos & Ocultos "2"', published: '2025-02-05T12:26:01+00:00' },
  ]);
});

test('feed vacío o basura → lista vacía', () => {
  assert.deepEqual(parseYoutubeFeed(''), []);
  assert.deepEqual(parseYoutubeFeed('<html>error</html>'), []);
});

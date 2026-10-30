import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ChannelFormatError,
  extractInitialData,
  extractInnertube,
  extractJsonObject,
  parseBrowseContinuation,
  parseChannelTab,
  parseGridItems,
  parseWatchDate,
} from '../../src/features/community/lib/youtube-channel-page.ts';

// Fixtures recortados de las pestañas reales del canal (octubre de 2026): misma forma, sin miniaturas ni menús.
const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

test('pestaña «Vídeos»: lockupViewModel → id y título, y el token de la página siguiente', () => {
  const page = parseChannelTab(extractInitialData(fixture('canal-videos.html')));
  assert.deepEqual(page.items, [
    { id: 'vRVFd7LfTTs', titulo: 'Colosos 3: Tráiler Oficial' },
    { id: 'hedUAqopPBg', titulo: 'Colosos - The Bloop vs El Gran Majá - La Batalla' },
  ]);
  assert.equal(page.continuation, 'TOKEN-VIDEOS-2');
});

test('pestaña «Shorts»: shortsLockupViewModel → id del reelWatchEndpoint y título', () => {
  const page = parseChannelTab(extractInitialData(fixture('canal-shorts.html')));
  assert.deepEqual(page.items, [
    { id: 'BP6fwpSuR7I', titulo: 'El Blitz #ww2 #blitz' },
    { id: 'q89VJXA38sQ', titulo: 'Historical Footage - 1941' },
  ]);
  assert.equal(page.continuation, 'TOKEN-SHORTS-2');
});

test('ytcfg: clave y contexto de la API interna', () => {
  const { apiKey, context } = extractInnertube(fixture('canal-videos.html'));
  assert.equal(apiKey, 'AIzaFIXTURE');
  assert.deepEqual(context, { client: { hl: 'es', clientName: 'WEB', clientVersion: '2.20261029.00.00' } });
});

test('extractJsonObject corta por llaves, no por un `};` o `</script>` dentro de una cadena', () => {
  const html = 'var ytInitialData = {"a":{"t":"x};</script>{"},"b":[1,{"c":"\\"}"}]};</script>';
  const start = html.indexOf('{');
  assert.deepEqual(JSON.parse(extractJsonObject(html, start)), { a: { t: 'x};</script>{' }, b: [1, { c: '"}' }] });
  assert.throws(() => extractJsonObject('{"a":1', 0), ChannelFormatError);
});

test('continuación de browse: append y reload; sin token, última página', () => {
  const item = (id: string, titulo: string) => ({
    richItemRenderer: {
      content: {
        lockupViewModel: { contentId: id, contentType: 'LOCKUP_CONTENT_TYPE_VIDEO', metadata: { lockupMetadataViewModel: { title: { content: titulo } } } },
      },
    },
  });
  const page = parseBrowseContinuation({
    onResponseReceivedActions: [
      { appendContinuationItemsAction: { continuationItems: [item('aaaaaaaaaaa', 'Uno'), item('bbbbbbbbbbb', 'Dos')] } },
    ],
  });
  assert.deepEqual(page, { items: [{ id: 'aaaaaaaaaaa', titulo: 'Uno' }, { id: 'bbbbbbbbbbb', titulo: 'Dos' }] });
  const reload = parseBrowseContinuation({
    onResponseReceivedActions: [
      {
        reloadContinuationItemsCommand: {
          continuationItems: [
            item('ccccccccccc', 'Tres'),
            { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'T3' } } } },
          ],
        },
      },
    ],
  });
  assert.deepEqual(reload, { items: [{ id: 'ccccccccccc', titulo: 'Tres' }], continuation: 'T3' });
});

test('formatos antiguos: reelItemRenderer y videoRenderer', () => {
  const page = parseGridItems([
    { richItemRenderer: { content: { reelItemRenderer: { videoId: 'ddddddddddd', headline: { simpleText: 'Short viejo' } } } } },
    { richItemRenderer: { content: { videoRenderer: { videoId: 'eeeeeeeeeee', title: { runs: [{ text: 'Vídeo ' }, { text: 'viejo' }] } } } } },
  ]);
  assert.deepEqual(page.items, [
    { id: 'ddddddddddd', titulo: 'Short viejo' },
    { id: 'eeeeeeeeeee', titulo: 'Vídeo viejo' },
  ]);
});

test('un lockup que no es vídeo (lista) se ignora', () => {
  const page = parseGridItems([
    { richItemRenderer: { content: { lockupViewModel: { contentId: 'PLxxxxxxxx', contentType: 'LOCKUP_CONTENT_TYPE_PLAYLIST' } } } },
  ]);
  assert.deepEqual(page.items, []);
});

test('formato desconocido, id inválido o sin título: error claro, no una lista incompleta', () => {
  assert.throws(() => parseGridItems([{ richItemRenderer: { content: { nuevoViewModel: {} } } }]), /elemento 0: nuevoViewModel/);
  assert.throws(() => parseGridItems([{ algoRaro: {} }]), /elemento 0: algoRaro/);
  assert.throws(
    () => parseGridItems([{ richItemRenderer: { content: { reelItemRenderer: { videoId: 'corto', headline: { simpleText: 'x' } } } } }]),
    /id de vídeo inválido/,
  );
  assert.throws(
    () => parseGridItems([{ richItemRenderer: { content: { reelItemRenderer: { videoId: 'fffffffffff' } } } }]),
    /sin título/,
  );
  assert.throws(() => extractInitialData('<html>sin datos</html>'), /ytInitialData/);
  assert.throws(() => parseChannelTab({ contents: {} }), /pestañas/);
  assert.throws(() => parseChannelTab({ contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: {} }] } } }), /seleccionada/);
  assert.throws(() => parseBrowseContinuation({}), /onResponseReceivedActions/);
});

test('parseWatchDate: publishDate con zona → ISO en UTC; respaldo itemprop; sin fecha, error', () => {
  assert.equal(parseWatchDate('..."publishDate":"2025-12-13T06:19:43-08:00",...'), '2025-12-13T14:19:43.000Z');
  // A última hora del día en el Pacífico ya es el día siguiente en UTC.
  assert.equal(parseWatchDate('"uploadDate":"2025-01-19T16:59:17-08:00"').slice(0, 10), '2025-01-20');
  assert.equal(parseWatchDate('<meta itemprop="datePublished" content="2024-05-01T10:00:00-07:00">'), '2024-05-01T17:00:00.000Z');
  assert.throws(() => parseWatchDate('<html></html>'), /publishDate/);
  assert.throws(() => parseWatchDate('"publishDate":"ayer"'), /fecha inválida/);
});

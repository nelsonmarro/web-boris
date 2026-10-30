import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  channelVideoList,
  newestCanalVideo,
  parseCanal,
  readCanal,
  serializeCanal,
  sortCanal,
  type CanalEntry,
} from '../../src/features/community/lib/canal.ts';

const entry = (id: string, orden: number, tipo: 'video' | 'short' = 'video', fecha?: string): CanalEntry => ({
  id,
  titulo: `Título ${id}`,
  tipo,
  orden,
  ...(fecha ? { fecha } : {}),
});

test('parseCanal: acepta la forma válida, con y sin fecha', () => {
  const ok = [entry('aaaaaaaaaaa', 1, 'video', '2024-01-02'), entry('bbbbbbbbbbb', 1, 'short'), entry('ccccccccccc', 2)];
  assert.deepEqual(parseCanal(ok), { items: ok, errors: [] });
  assert.deepEqual(parseCanal([]), { items: [], errors: [] });
});

test('parseCanal: id de 11 caracteres, fecha válida si la hay, tipo conocido, orden y sin repetidos', () => {
  const errors = (json: unknown) => parseCanal(json).errors.join('\n');
  assert.match(errors([entry('corto', 1)]), /id de YouTube inválido/);
  assert.match(errors([entry('aaaaaaaaaaa', 1, 'video', '2024-1-2')]), /YYYY-MM-DD/);
  assert.match(errors([entry('aaaaaaaaaaa', 1, 'video', '2024-02-30')]), /fecha inexistente/);
  assert.match(errors([{ ...entry('aaaaaaaaaaa', 1), tipo: 'directo' }]), /tipo/);
  assert.match(errors([{ ...entry('aaaaaaaaaaa', 1), titulo: ' ' }]), /titulo/);
  assert.match(errors([entry('aaaaaaaaaaa', 1), entry('aaaaaaaaaaa', 2)]), /vídeo repetido: aaaaaaaaaaa/);
  assert.match(errors([entry('aaaaaaaaaaa', 0)]), /orden debe ser positivo/);
  assert.match(errors([entry('aaaaaaaaaaa', 1.5)]), /orden debe ser un entero/);
  assert.match(errors([{ id: 'aaaaaaaaaaa', titulo: 'x', tipo: 'video' }]), /orden/);
  assert.match(errors([entry('aaaaaaaaaaa', 3), entry('bbbbbbbbbbb', 3)]), /orden repetido en video: 3/);
  // El mismo orden en tipos distintos es válido: cada tipo cuenta por su lado.
  assert.deepEqual(parseCanal([entry('aaaaaaaaaaa', 1), entry('bbbbbbbbbbb', 1, 'short')]).errors, []);
  assert.match(errors({}), /\(raíz\)/);
  assert.equal(parseCanal([entry('corto', 1)]).items.length, 0);
});

test('readCanal: sin archivo, vacío sin errores; JSON roto, error; serializeCanal se vuelve a leer igual', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'canal-'));
  assert.deepEqual(readCanal(path.join(dir, 'no-existe.json')), { items: [], errors: [] });
  const broken = path.join(dir, 'roto.json');
  writeFileSync(broken, '[{');
  assert.match(readCanal(broken).errors[0], /roto\.json: JSON inválido/);
  const entries = [entry('aaaaaaaaaaa', 1, 'video', '2024-01-02'), entry('bbbbbbbbbbb', 1, 'short')];
  const file = path.join(dir, 'canal.json');
  writeFileSync(file, serializeCanal(entries));
  assert.deepEqual(readCanal(file), { items: entries, errors: [] });
  assert.equal(serializeCanal(entries).split('\n').length, 5); // [, dos entradas, ], línea final
  assert.doesNotMatch(serializeCanal(entries), /"fecha":null|undefined/);
});

test('sortCanal / serializeCanal: vídeos y luego shorts, cada bloque del más antiguo al más nuevo', () => {
  const entries = [entry('shortdos000', 2, 'short'), entry('videodos000', 2), entry('shortuno000', 1, 'short'), entry('videouno000', 1)];
  assert.deepEqual(sortCanal(entries).map((e) => e.id), ['videouno000', 'videodos000', 'shortuno000', 'shortdos000']);
  const lines = serializeCanal(entries).split('\n');
  assert.match(lines[1], /videouno000/);
  assert.match(lines[4], /shortdos000/);
});

test('newestCanalVideo: el vídeo (no Short) de mayor orden', () => {
  assert.equal(newestCanalVideo([entry('viejo000000', 1), entry('nuevo000000', 2), entry('shortnuevo0', 9, 'short')])?.id, 'nuevo000000');
  assert.equal(newestCanalVideo([entry('shortnuevo0', 9, 'short')]), undefined);
  assert.equal(newestCanalVideo([]), undefined);
});

test('channelVideoList: destacados, RSS y canal.json (del más nuevo al más viejo), sin repetir, con tipo y orden', () => {
  const featured = [{ id: 'hedUAqopPBg', title: 'Título de Boris' }];
  const feed = [{ id: 'nuevo000000', title: 'Del RSS', published: '2026-10-20T10:00:00+00:00' }];
  const canal = [
    entry('hedUAqopPBg', 1, 'video', '2023-05-01'),
    entry('viejo000000', 1, 'short', '2024-01-02'),
    { ...entry('nuevo000000', 2, 'video', '2026-10-21'), titulo: 'Del canal' },
  ];
  assert.deepEqual(channelVideoList(featured, feed, canal), [
    { id: 'hedUAqopPBg', title: 'Título de Boris', published: '2023-05-01', tipo: 'video', orden: 1 },
    { id: 'nuevo000000', title: 'Del RSS', published: '2026-10-20T10:00:00+00:00', tipo: 'video', orden: 2 },
    { id: 'viejo000000', title: 'Título viejo000000', published: '2024-01-02', tipo: 'short', orden: 1 },
  ]);
});

test('channelVideoList: sin fechas, canal.json va por orden dentro de cada tipo (vídeos y luego shorts) y sin fecha', () => {
  const canal = [entry('videouno000', 1), entry('shortuno000', 1, 'short'), entry('videodos000', 2), entry('shortdos000', 2, 'short')];
  assert.deepEqual(channelVideoList([], [], canal), [
    { id: 'videodos000', title: 'Título videodos000', tipo: 'video', orden: 2 },
    { id: 'videouno000', title: 'Título videouno000', tipo: 'video', orden: 1 },
    { id: 'shortdos000', title: 'Título shortdos000', tipo: 'short', orden: 2 },
    { id: 'shortuno000', title: 'Título shortuno000', tipo: 'short', orden: 1 },
  ]);
});

test('channelVideoList: sin canal.json ni RSS, solo los destacados (sin fecha ni tipo)', () => {
  const featured = [{ id: 'hedUAqopPBg', title: 'Batalla' }];
  assert.deepEqual(channelVideoList(featured, [], []), [{ id: 'hedUAqopPBg', title: 'Batalla' }]);
});

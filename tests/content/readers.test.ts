import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readCuratedPolls, readNews, readVideoLinks } from '../../src/core/content/readers.ts';

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'wb-content-'));
}

test('lee novedades válidas, ordena por fecha y reporta las inválidas', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, '2026-01-01-a.md'), '---\nfecha: 2026-01-01\ntitulo: "Primera novedad"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  fs.writeFileSync(path.join(dir, '2026-02-01-b.md'), '---\nfecha: 2026-02-01\ntitulo: "Segunda novedad"\nresumen: "Texto"\nenlace: https://youtube.com/x\n---\n');
  fs.writeFileSync(path.join(dir, 'rota.md'), '---\ntitulo: "Sin fecha"\n---\n');
  const { items, errors } = readNews(dir);
  assert.deepEqual(items.map((n) => n.id), ['2026-02-01-b', '2026-01-01-a']);
  assert.equal(items[1].fecha, '2026-01-01');
  assert.equal(errors.length > 0, true);
  assert.match(errors[0], /^rota\.md:/);
});

test('carpeta de novedades inexistente → vacío sin errores', () => {
  assert.deepEqual(readNews(path.join(tmpDir(), 'no-existe')), { items: [], errors: [] });
});

test('lee encuestas.json y reporta JSON o esquema inválidos', () => {
  const dir = tmpDir();
  const ok = path.join(dir, 'ok.json');
  fs.writeFileSync(ok, JSON.stringify([{ semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja' }]));
  assert.equal(readCuratedPolls(ok).items.length, 1);

  const broken = path.join(dir, 'broken.json');
  fs.writeFileSync(broken, '[{');
  assert.match(readCuratedPolls(broken).errors[0], /JSON inválido/);

  const invalid = path.join(dir, 'invalid.json');
  fs.writeFileSync(invalid, JSON.stringify([{ semana: 'x', a: 'a', b: 'a' }]));
  const r = readCuratedPolls(invalid);
  assert.equal(r.items.length, 0);
  assert.ok(r.errors.length >= 1);
});

test('lee videos.json y reporta archivo ausente, JSON roto o esquema inválido', () => {
  const dir = tmpDir();
  assert.deepEqual(readVideoLinks(path.join(dir, 'no-existe.json')), { items: [], errors: [] });

  const ok = path.join(dir, 'ok.json');
  fs.writeFileSync(ok, JSON.stringify([{ id: 'hedUAqopPBg', fichas: ['the-bloop', 'el-gran-maja'] }]));
  assert.deepEqual(readVideoLinks(ok).items, [{ id: 'hedUAqopPBg', fichas: ['the-bloop', 'el-gran-maja'] }]);

  const broken = path.join(dir, 'broken.json');
  fs.writeFileSync(broken, '[{');
  assert.match(readVideoLinks(broken).errors[0], /^broken\.json: JSON inválido/);

  const invalid = path.join(dir, 'invalid.json');
  fs.writeFileSync(invalid, JSON.stringify([{ id: 'corto', fichas: ['the-bloop'] }]));
  const r = readVideoLinks(invalid);
  assert.equal(r.items.length, 0);
  assert.match(r.errors[0], /^invalid\.json: 0\.id/);
});

test('novedades: la fecha debe coincidir con el prefijo del nombre del archivo', () => {
  const dir = tmpDir();
  // js-yaml convierte 2026-02-30 en 2026-03-02 sin avisar: el nombre lo delata.
  fs.writeFileSync(path.join(dir, '2026-02-30-imposible.md'), '---\nfecha: 2026-02-30\ntitulo: "Fecha imposible"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  fs.writeFileSync(path.join(dir, 'sin-fecha-en-el-nombre.md'), '---\nfecha: 2026-01-01\ntitulo: "Nombre sin fecha"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  fs.writeFileSync(path.join(dir, '2026-01-02-ok.md'), '---\nfecha: 2026-01-02\ntitulo: "Correcta"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  const { items, errors } = readNews(dir);
  assert.deepEqual(items.map((n) => n.id), ['2026-01-02-ok']);
  assert.equal(errors.length, 2);
  assert.match(errors.find((e) => e.startsWith('2026-02-30-imposible.md')) ?? '', /2026-03-02/);
  assert.match(errors.find((e) => e.startsWith('sin-fecha-en-el-nombre.md')) ?? '', /<yyyy-mm-dd>-<slug>\.md/);
});

test('novedades: un YAML roto se registra y se salta, sin lanzar', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, '2026-01-01-rota.md'), '---\nfecha: 2026-01-01\ntitulo: "sin cerrar\n  : [\n---\n');
  fs.writeFileSync(path.join(dir, '2026-01-02-ok.md'), '---\nfecha: 2026-01-02\ntitulo: "Correcta"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  const { items, errors } = readNews(dir);
  assert.deepEqual(items.map((n) => n.id), ['2026-01-02-ok']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^2026-01-01-rota\.md: YAML inválido/);
});

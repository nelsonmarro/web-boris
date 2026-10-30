import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { StoryOrderSchema } from '../../src/core/content/schemas.ts';
import { readStoryOrder } from '../../src/core/content/readers.ts';
import { crossCheckStoryOrder } from '../../src/core/content/validate.ts';

const A = 'Rc3Jz97ls2k';
const B = 'TAgYBQhc52c';

test('StoryOrderSchema: universo, ids de YouTube y nota opcional', () => {
  assert.deepEqual(StoryOrderSchema.parse([{ universo: 'Colosos', ids: [A, B] }]), [{ universo: 'Colosos', ids: [A, B] }]);
  assert.equal(StoryOrderSchema.safeParse([{ universo: 'Colosos', ids: [A], nota: 'Nota' }]).success, true);
});

test('StoryOrderSchema: rechaza ids inválidos o repetidos, listas vacías, universos repetidos y notas largas', () => {
  assert.equal(StoryOrderSchema.safeParse([{ universo: 'Colosos', ids: ['corto'] }]).success, false);
  assert.equal(StoryOrderSchema.safeParse([{ universo: 'Colosos', ids: [A, A] }]).success, false);
  assert.equal(StoryOrderSchema.safeParse([{ universo: 'Colosos', ids: [] }]).success, false);
  assert.equal(StoryOrderSchema.safeParse([{ universo: ' ', ids: [A] }]).success, false);
  assert.equal(
    StoryOrderSchema.safeParse([
      { universo: 'Colosos', ids: [A] },
      { universo: 'Colosos', ids: [B] },
    ]).success,
    false,
  );
  assert.equal(StoryOrderSchema.safeParse([{ universo: 'Colosos', ids: [A], nota: 'x'.repeat(201) }]).success, false);
});

test('readStoryOrder: sin archivo, vacío y sin errores; JSON roto o inválido, error', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-story-'));
  assert.deepEqual(readStoryOrder(path.join(dir, 'orden-historia.json')), { items: [], errors: [] });

  const ok = path.join(dir, 'ok.json');
  fs.writeFileSync(ok, JSON.stringify([{ universo: 'Colosos', ids: [A] }]));
  assert.deepEqual(readStoryOrder(ok), { items: [{ universo: 'Colosos', ids: [A] }], errors: [] });

  const broken = path.join(dir, 'broken.json');
  fs.writeFileSync(broken, '[{');
  assert.match(readStoryOrder(broken).errors[0], /^broken\.json: JSON inválido/);

  const invalid = path.join(dir, 'invalid.json');
  fs.writeFileSync(invalid, JSON.stringify([{ universo: 'Colosos', ids: ['x'] }]));
  const r = readStoryOrder(invalid);
  assert.equal(r.items.length, 0);
  assert.match(r.errors[0], /^invalid\.json: 0\.ids\.0/);
});

test('crossCheckStoryOrder: universo de universes.ts y vídeos de canal.json', () => {
  const universes = new Set(['Colosos', 'Capitán de Galeón']);
  const canal = new Set([A]);
  assert.deepEqual(crossCheckStoryOrder([{ universo: 'Colosos', ids: [A] }], universes, canal), []);
  const errors = crossCheckStoryOrder([{ universo: 'Colossos', ids: [A, B] }], universes, canal);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /"Colossos" no es un universo/);
  assert.match(errors[1], new RegExp(`${B} no está en canal\\.json`));
});

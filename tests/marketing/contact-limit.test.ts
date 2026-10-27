import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  allowContact,
  CONTACT_WINDOW_MS,
  hasUsableResendKey,
  pruneHits,
  type ContactHits,
} from '../../src/features/marketing/lib/contact-limit.ts';

test('deja 3 envíos por red y rechaza el cuarto', () => {
  const hits: ContactHits = new Map();
  assert.ok(allowContact(hits, 'a', 0));
  assert.ok(allowContact(hits, 'a', 1));
  assert.ok(allowContact(hits, 'a', 2));
  assert.equal(allowContact(hits, 'a', 3), false);
});

test('cada red lleva su propia cuenta', () => {
  const hits: ContactHits = new Map();
  for (let i = 0; i < 3; i++) allowContact(hits, 'a', i);
  assert.ok(allowContact(hits, 'b', 5));
});

test('los envíos rechazados no alargan el bloqueo', () => {
  const hits: ContactHits = new Map();
  for (let i = 0; i < 3; i++) allowContact(hits, 'a', i);
  allowContact(hits, 'a', CONTACT_WINDOW_MS - 1);
  assert.ok(allowContact(hits, 'a', CONTACT_WINDOW_MS + 5));
});

test('la ventana expira y vuelve a dejar enviar', () => {
  const hits: ContactHits = new Map();
  for (let i = 0; i < 3; i++) allowContact(hits, 'a', 0);
  assert.equal(allowContact(hits, 'a', CONTACT_WINDOW_MS - 1), false);
  assert.ok(allowContact(hits, 'a', CONTACT_WINDOW_MS));
});

test('pruneHits borra las redes caducadas', () => {
  const hits: ContactHits = new Map([['a', [0]], ['b', [CONTACT_WINDOW_MS]]]);
  pruneHits(hits, CONTACT_WINDOW_MS + 1);
  assert.deepEqual([...hits.keys()], ['b']);
});

test('claves de relleno y ausentes no son utilizables', () => {
  for (const k of ['re_pendiente', 're_build_placeholder', 're_dummy', 're_qa_invalida', 'abc', '', undefined]) {
    assert.equal(hasUsableResendKey(k), false, String(k));
  }
});

test('cualquier otra clave re_ se intenta', () => {
  assert.ok(hasUsableResendKey('re_AbCd1234_xyz'));
  assert.ok(hasUsableResendKey('re_xxxxxxxx'));
});

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Almacenamiento simulado y modificable: el store lo busca en `globalThis.localStorage` en cada llamada,
 * así que se puede romper entre una prueba y otra sin recargar el módulo.
 */
const data = new Map<string, string>();
let writes = 0;
const behaviour = { getThrows: false, setThrows: false };

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => {
      if (behaviour.getThrows) throw new Error('SecurityError');
      return data.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (behaviour.setThrows) throw new Error('QuotaExceededError');
      writes++;
      data.set(k, v);
    },
    removeItem: (k: string) => void data.delete(k),
  },
});

const { useRegistro, REGISTRO_STORAGE_KEY } = await import('../../src/features/monsters/store/registro-store.ts');

const stored = () => JSON.parse(data.get(REGISTRO_STORAGE_KEY) ?? 'null') as { state: { seen: Record<string, string> } } | null;

beforeEach(() => {
  data.clear();
  writes = 0;
  behaviour.getThrows = false;
  behaviour.setThrows = false;
  useRegistro.setState({ seen: {} });
  writes = 0;
  data.clear();
});

test('hidrata en el mismo instante con almacenamiento síncrono', () => {
  assert.equal(useRegistro.persist.hasHydrated(), true);
});

test('markSeen guarda el slug con la fecha ISO en localStorage (wb-registro)', () => {
  useRegistro.getState().markSeen('the-bloop');
  const seen = useRegistro.getState().seen;
  assert.deepEqual(Object.keys(seen), ['the-bloop']);
  assert.match(seen['the-bloop'], /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(stored()?.state.seen, seen);
});

test('markSeen es idempotente: conserva la primera fecha y no vuelve a escribir', () => {
  useRegistro.getState().markSeen('the-bloop');
  const first = useRegistro.getState().seen['the-bloop'];
  const before = writes;
  useRegistro.getState().markSeen('the-bloop');
  assert.equal(useRegistro.getState().seen['the-bloop'], first);
  assert.equal(writes, before);
});

test('si localStorage lanza al escribir, markSeen no falla y el registro sigue en memoria', () => {
  behaviour.setThrows = true;
  assert.doesNotThrow(() => useRegistro.getState().markSeen('a'));
  assert.deepEqual(Object.keys(useRegistro.getState().seen), ['a']);
});

test('si localStorage lanza al leer o el JSON está dañado, la hidratación termina sin errores', async () => {
  useRegistro.getState().markSeen('a');
  behaviour.getThrows = true;
  await useRegistro.persist.rehydrate();
  assert.equal(useRegistro.persist.hasHydrated(), true);
  assert.deepEqual(Object.keys(useRegistro.getState().seen), ['a']);

  behaviour.getThrows = false;
  data.set(REGISTRO_STORAGE_KEY, '{no es json');
  await useRegistro.persist.rehydrate();
  assert.equal(useRegistro.persist.hasHydrated(), true);
  assert.deepEqual(Object.keys(useRegistro.getState().seen), ['a']);
});

test('rehidratar une lo guardado con lo que hay en memoria y se queda con la fecha más antigua', async () => {
  useRegistro.setState({ seen: { a: '2026-10-19T12:00:00.000Z', b: '2026-10-19T12:00:00.000Z' } });
  data.set(
    REGISTRO_STORAGE_KEY,
    JSON.stringify({ state: { seen: { a: '2026-10-19T09:00:00.000Z', c: '2026-10-19T10:00:00.000Z' } }, version: 0 }),
  );
  await useRegistro.persist.rehydrate();
  assert.deepEqual(useRegistro.getState().seen, {
    a: '2026-10-19T09:00:00.000Z',
    b: '2026-10-19T12:00:00.000Z',
    c: '2026-10-19T10:00:00.000Z',
  });
});

test('descarta datos guardados con otra forma', async () => {
  data.set(REGISTRO_STORAGE_KEY, JSON.stringify({ state: { seen: { ok: '2026-10-19T09:00:00.000Z', mal: 5, peor: null } }, version: 0 }));
  await useRegistro.persist.rehydrate();
  assert.deepEqual(useRegistro.getState().seen, { ok: '2026-10-19T09:00:00.000Z' });

  data.set(REGISTRO_STORAGE_KEY, JSON.stringify({ state: { seen: ['x', 'y'] }, version: 0 }));
  await useRegistro.persist.rehydrate();
  assert.deepEqual(useRegistro.getState().seen, { ok: '2026-10-19T09:00:00.000Z' });
});

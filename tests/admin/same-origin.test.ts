import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSameOrigin } from '../../src/features/admin/lib/same-origin.ts';

const headers = (values: Record<string, string>) => ({ get: (name: string) => values[name.toLowerCase()] ?? null });

test('detrás de nginx con HTTPS: vale el origen público aunque el servidor se vea como http://0.0.0.0:3000', () => {
  const env = { AUTH_URL: 'https://borisaoblois.example' };
  const h = headers({ host: 'borisaoblois.example', 'x-forwarded-proto': 'https' });
  assert.equal(isSameOrigin('https://borisaoblois.example', h, env, 'http://0.0.0.0:3000/api/admin/media'), true);
  // Sin AUTH_URL también vale por lo que reenvía el proxy.
  assert.equal(isSameOrigin('https://borisaoblois.example', h, {}, 'http://0.0.0.0:3000/api/admin/media'), true);
});

test('Docker local: AUTH_URL http://localhost:3131 y el servidor en el 3000', () => {
  const h = headers({ host: 'localhost:3131' });
  assert.equal(isSameOrigin('http://localhost:3131', h, { AUTH_URL: 'http://localhost:3131' }, 'http://0.0.0.0:3000/api/admin/media'), true);
});

test('rechaza otros orígenes, el origen nulo, la falta de Origin y cabeceras de host manipuladas', () => {
  const env = { AUTH_URL: 'https://borisaoblois.example' };
  const h = headers({ host: 'borisaoblois.example', 'x-forwarded-proto': 'https' });
  assert.equal(isSameOrigin('https://evil.example', h, env, 'http://0.0.0.0:3000/x'), false);
  assert.equal(isSameOrigin('http://borisaoblois.example', h, env, 'http://0.0.0.0:3000/x'), false); // otro esquema
  assert.equal(isSameOrigin('null', h, env, 'http://0.0.0.0:3000/x'), false);
  assert.equal(isSameOrigin(null, h, env, 'http://0.0.0.0:3000/x'), false);
  const odd = headers({ host: 'evil.example/@x', 'x-forwarded-proto': 'javascript' });
  assert.equal(isSameOrigin('javascript://evil.example/@x', odd, {}, 'http://0.0.0.0:3000/x'), false);
  // Variables mal escritas no abren nada.
  assert.equal(isSameOrigin('https://evil.example', headers({}), { AUTH_URL: 'no es una url' }, 'http://0.0.0.0:3000/x'), false);
});

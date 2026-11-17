import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPORARY_PASSWORD_HOURS, temporaryPasswordExpired, temporaryPasswordUntil } from '../../src/features/admin/lib/temporary-password.ts';

test('la contraseña temporal caduca a las 72 h y solo en cuentas sin configurar', () => {
  const now = new Date('2026-11-17T10:00:00Z');
  const until = temporaryPasswordUntil(now);
  assert.equal(TEMPORARY_PASSWORD_HOURS, 72);
  assert.equal(until.toISOString(), '2026-11-20T10:00:00.000Z');
  const fresh = { totpEnabledAt: null, temporaryPasswordUntil: until };
  assert.equal(temporaryPasswordExpired(fresh, new Date('2026-11-20T09:59:59Z')), false);
  assert.equal(temporaryPasswordExpired(fresh, new Date('2026-11-20T10:00:01Z')), true);
  // Ya configurada (2FA activo) o creada antes de existir la caducidad: no caduca.
  assert.equal(temporaryPasswordExpired({ totpEnabledAt: now, temporaryPasswordUntil: until }, new Date('2027-01-01')), false);
  assert.equal(temporaryPasswordExpired({ totpEnabledAt: null, temporaryPasswordUntil: null }, new Date('2027-01-01')), false);
});

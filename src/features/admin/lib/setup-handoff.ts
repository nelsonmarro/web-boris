/**
 * Pase de un solo uso para entrar al panel justo después de configurar la cuenta (auditoría #17). Lo crea la acción de
 * configuración y lo gasta «Ya los guardé: entrar al panel» (el tiempo de guardar los códigos de recuperación). Al
 * gastarlo sube la `sessionVersion` de la cuenta, así que no sirve dos veces. Puro (node:crypto).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export const HANDOFF_SECONDS = 15 * 60;

const sign = (secret: string, payload: string) => createHmac('sha256', secret).update(`admin-setup|${payload}`).digest('base64url');

export function createHandoff(secret: string, userId: string, sessionVersion: number, now: number): string {
  const payload = `${userId}.${sessionVersion}.${Math.floor(now / 1000) + HANDOFF_SECONDS}`;
  return `${payload}.${sign(secret, payload)}`;
}

/** La cuenta y la versión de sesión del pase, o `null` si está mal formado, mal firmado o caducado. */
export function readHandoff(secret: string, token: string, now: number): { userId: string; sessionVersion: number } | null {
  if (typeof token !== 'string' || token.length > 300) return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [userId, version, expires, signature] = parts;
  const expected = Buffer.from(sign(secret, `${userId}.${version}.${expires}`));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const sessionVersion = Number(version);
  const exp = Number(expires);
  if (!userId || !Number.isInteger(sessionVersion) || !Number.isInteger(exp) || exp * 1000 < now) return null;
  return { userId, sessionVersion };
}

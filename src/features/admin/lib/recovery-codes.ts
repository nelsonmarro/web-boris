/** Códigos de recuperación del 2FA: de un solo uso; en la base solo queda su hash. Puro. */
import { createHmac, randomBytes } from 'node:crypto';
import { base32Encode } from './totp.ts';

export const RECOVERY_CODE_COUNT = 10;

/** `XXXXX-XXXXX` (50 bits de azar, alfabeto base32). */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const text = base32Encode(randomBytes(7)).slice(0, 10);
    return `${text.slice(0, 5)}-${text.slice(5)}`;
  });
}

/** Forma canónica de lo que teclea la persona: sin espacios ni guiones, en mayúsculas. */
export const normalizeRecoveryCode = (code: string): string => code.replace(/[\s-]/g, '').toUpperCase();

/** ¿Tiene forma de código de recuperación (y no de código TOTP)? */
export const looksLikeRecoveryCode = (code: string): boolean => /^[A-Z2-7]{10}$/.test(normalizeRecoveryCode(code));

/** Los códigos tienen azar de sobra: basta un HMAC con el secreto de la app (no hace falta un hash lento). */
export const hashRecoveryCode = (code: string, appSecret: string): string =>
  createHmac('sha256', appSecret).update(`recovery|${normalizeRecoveryCode(code)}`).digest('hex');

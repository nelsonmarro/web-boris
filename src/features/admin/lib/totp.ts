/** Códigos TOTP del segundo factor (RFC 6238: HMAC-SHA1, 6 dígitos, 30 s). Puro. */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const TOTP_PERIOD_SECONDS = 30;
export const TOTP_DIGITS = 6;
/** Pasos aceptados a cada lado del actual: tolera un reloj desviado ±30 s. */
const WINDOW = 1;
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

/** Decodifica base32 sin relleno; ignora espacios y mayúsculas. Lanza si hay un carácter ajeno al alfabeto. */
export function base32Decode(text: string): Buffer {
  const clean = text.replace(/[\s=-]/g, '').toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) throw new Error('base32 no válido');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Secreto nuevo de 160 bits en base32 (lo que esperan las apps autenticadoras). */
export const generateTotpSecret = (): string => base32Encode(randomBytes(20));

export const totpStep = (nowMs: number): number => Math.floor(nowMs / 1000 / TOTP_PERIOD_SECONDS);

/** Código del paso `step` (HOTP, RFC 4226 §5.3). */
export function totpCode(secret: string, step: number, digits = TOTP_DIGITS): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = digest.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** digits).padStart(digits, '0');
}

/**
 * Paso al que corresponde `code`, o `null` si no vale. Solo acepta pasos posteriores a `lastStep` (el último ya
 * usado): un código visto por encima del hombro no sirve una segunda vez.
 */
export function verifyTotp(secret: string, code: string, nowMs: number, lastStep = -1): number | null {
  const candidate = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(candidate)) return null;
  const current = totpStep(nowMs);
  let matched: number | null = null;
  // Recorre siempre toda la ventana: el tiempo no depende de qué paso acierta.
  for (let step = current - WINDOW; step <= current + WINDOW; step += 1) {
    const equal = timingSafeEqual(Buffer.from(totpCode(secret, step)), Buffer.from(candidate));
    if (equal && step > lastStep && matched === null) matched = step;
  }
  return matched;
}

/** URI `otpauth://` que codifica el QR de alta. */
export function otpauthUri(secret: string, account: string, issuer: string): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
  const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: String(TOTP_DIGITS), period: String(TOTP_PERIOD_SECONDS) });
  return `otpauth://totp/${label}?${params.toString()}`;
}

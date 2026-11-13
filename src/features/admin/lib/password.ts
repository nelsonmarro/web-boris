/** Contraseñas del panel: scrypt de node:crypto (spec CMS §4.1). Puro. */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 200;

/** Parámetros recomendados por OWASP para scrypt; viajan en el hash para poder subirlos sin romper los antiguos. */
const PARAMS = { N: 2 ** 17, r: 8, p: 1 } as const;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
/** Límites de lo que se acepta al verificar: un hash manipulado no puede pedir un coste absurdo. */
const MAX_N = 2 ** 20;

function derive(password: string, salt: Buffer, N: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // scrypt usa 128·N·r bytes; el límite por defecto de Node (32 MB) no alcanza para N = 2^17.
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { N, r, p, maxmem: 256 * N * r }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** `scrypt$N$r$p$sal$clave` (sal y clave en base64url). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, PARAMS.N, PARAMS.r, PARAMS.p);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64url'), key.toString('base64url')].join('$');
}

/** Comparación en tiempo constante. Un hash con formato desconocido nunca coincide. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, key] = stored.split('$');
  const N = Number(n);
  const R = Number(r);
  const P = Number(p);
  if (scheme !== 'scrypt' || !salt || !key) return false;
  if (!Number.isInteger(N) || N < 2 ** 14 || N > MAX_N || (N & (N - 1)) !== 0 || R !== 8 || P !== 1) return false;
  const expected = Buffer.from(key, 'base64url');
  if (expected.length !== KEY_LENGTH || password.length > PASSWORD_MAX_LENGTH) return false;
  const actual = await derive(password, Buffer.from(salt, 'base64url'), N, R, P);
  return timingSafeEqual(actual, expected);
}

/** Hash de relleno: se verifica contra él cuando la cuenta no existe, para que el tiempo de respuesta no la delate. */
let dummyHash: Promise<string> | null = null;
export async function burnPasswordTime(password: string): Promise<void> {
  dummyHash ??= hashPassword(randomBytes(24).toString('base64url'));
  await verifyPassword(password, await dummyHash);
}

/** Motivo por el que una contraseña nueva no vale, o `null` si vale. */
export function passwordProblem(password: string, email = ''): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (password.length > PASSWORD_MAX_LENGTH) return `La contraseña no puede pasar de ${PASSWORD_MAX_LENGTH} caracteres.`;
  if (new Set(password).size < 5) return 'La contraseña repite demasiado los mismos caracteres.';
  const local = email.split('@')[0]?.toLowerCase();
  if (local && local.length >= 4 && password.toLowerCase().includes(local)) return 'La contraseña no puede contener tu correo.';
  return null;
}

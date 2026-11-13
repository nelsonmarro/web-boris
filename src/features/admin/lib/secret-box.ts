/** Cifrado en reposo de los secretos TOTP: AES-256-GCM con una clave derivada del secreto de la app. Puro. */
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

const VERSION = 'v1';

function keyFor(appSecret: string, purpose: string): Buffer {
  if (appSecret.length < 32) throw new Error('El secreto de la app debe tener al menos 32 caracteres.');
  return Buffer.from(hkdfSync('sha256', appSecret, 'web-boris-admin', purpose, 32));
}

/** `v1.<iv>.<etiqueta>.<cifrado>` en base64url. `purpose` separa las claves por uso (p. ej. `totp`). */
export function seal(plain: string, appSecret: string, purpose: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFor(appSecret, purpose), iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [VERSION, iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.');
}

/** Texto original, o `null` si el sobre está manipulado, es de otra clave o no tiene el formato. */
export function open(sealed: string, appSecret: string, purpose: string): string | null {
  const [version, iv, tag, data] = sealed.split('.');
  if (version !== VERSION || !iv || !tag || data === undefined) return null;
  try {
    const decipher = createDecipheriv('aes-256-gcm', keyFor(appSecret, purpose), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

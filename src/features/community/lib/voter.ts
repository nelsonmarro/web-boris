/** Identidad anónima del votante y configuración de la votación. Puro (node:crypto). */
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

export const VOTER_COOKIE = 'wb_voter';
/** Votos máximos por red (hash de IP) y encuesta: deja votar a un hogar sin abrir la puerta al spam. */
export const MAX_VOTES_PER_IP = 5;
export const VOTER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** HMAC-SHA256 en hex: no reversible sin el secreto. */
export function hmac(secret: string, value: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export const voterKeyFor = (secret: string, voterId: string): string => hmac(secret, voterId);

export const ipHashFor = (secret: string, ip: string, pollId: string): string => hmac(secret, `${ip}|${pollId}`);

/**
 * IP del cliente detrás del proxy inverso. Nunca se guarda en claro.
 * El proxy inverso debe fijar X-Real-IP; ver spec §9. Sin él se usa el último salto de X-Forwarded-For.
 */
export function clientIp(get: (name: string) => string | null): string {
  const real = get('x-real-ip')?.trim();
  if (real) return real;
  const last = get('x-forwarded-for')
    ?.split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .at(-1);
  return last || 'desconocida';
}

/** Los 8 grupos de una IPv6 en hex sin ceros a la izquierda (`::` expandido; una IPv4 final cuenta como 2 grupos). */
function ipv6Groups(ip: string): string[] {
  let address = ip.split('%')[0].toLowerCase(); // sin la zona (`fe80::1%eth0`)
  const v4 = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(address);
  if (v4) {
    const [a, b, c, d] = v4.slice(1).map(Number);
    address = `${address.slice(0, v4.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const [head, tail] = address.split('::');
  const left = head ? head.split(':') : [];
  const right = tail === undefined ? [] : tail ? tail.split(':') : [];
  const groups = tail === undefined ? left : [...left, ...Array(8 - left.length - right.length).fill('0'), ...right];
  return groups.map((g) => Number.parseInt(g, 16).toString(16));
}

/**
 * Red del votante para el límite de votos por red: una IPv4 tal cual (también la mapeada `::ffff:a.b.c.d`) y una
 * IPv6 por su prefijo /64. Las direcciones IPv6 de privacidad rotan dentro del /64 y, sin agruparlas, esquivarían
 * el límite. Lo que no es una IP (`desconocida`) pasa igual.
 */
export function networkOf(ip: string): string {
  const value = ip.trim();
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(value);
  if (mapped && isIP(mapped[1]) === 4) return mapped[1];
  if (isIP(value) !== 6) return value;
  return `${ipv6Groups(value).slice(0, 4).join(':')}::/64`;
}

/** Secreto de votación (≥ 32 caracteres) o `null` si la votación no está configurada. */
export function voteSecret(env: Record<string, string | undefined> = process.env): string | null {
  const secret = env.VOTE_SECRET;
  return secret && secret.length >= 32 && env.DATABASE_URL ? secret : null;
}

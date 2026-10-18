/** Identidad anónima del votante y configuración de la votación. Puro (node:crypto). */
import { createHmac } from 'node:crypto';

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

/** IP del cliente detrás del proxy inverso. Nunca se guarda en claro. */
export function clientIp(get: (name: string) => string | null): string {
  const forwarded = get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || get('x-real-ip')?.trim() || 'desconocida';
}

/** Secreto de votación (≥ 32 caracteres) o `null` si la votación no está configurada. */
export function voteSecret(env: Record<string, string | undefined> = process.env): string | null {
  const secret = env.VOTE_SECRET;
  return secret && secret.length >= 32 && env.DATABASE_URL ? secret : null;
}

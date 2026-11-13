import 'server-only';

/** Secreto de la app (`AUTH_SECRET`, ≥ 32 caracteres) con el que se cifran los secretos TOTP y se firman los hashes. */
export function adminSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

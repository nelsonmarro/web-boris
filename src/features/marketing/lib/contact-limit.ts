/** Límite de envíos del formulario de contacto por red. Puro: el reloj y el mapa llegan por parámetro. */

export const CONTACT_MAX_PER_WINDOW = 3;
export const CONTACT_WINDOW_MS = 60 * 60 * 1000;

/** Marcas de tiempo (ms) de los envíos recientes de cada red. */
export type ContactHits = Map<string, number[]>;

/** Quita las marcas caducadas y las redes sin marcas, para que el mapa no crezca sin fin. */
export function pruneHits(hits: ContactHits, now: number, windowMs = CONTACT_WINDOW_MS): void {
  for (const [key, stamps] of hits) {
    const fresh = stamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) hits.delete(key);
    else if (fresh.length !== stamps.length) hits.set(key, fresh);
  }
}

/**
 * Registra un envío de `network` y dice si cabe en la ventana. Un envío rechazado no se cuenta,
 * así quien insiste no se prolonga el bloqueo.
 */
export function allowContact(
  hits: ContactHits,
  network: string,
  now: number,
  max = CONTACT_MAX_PER_WINDOW,
  windowMs = CONTACT_WINDOW_MS,
): boolean {
  pruneHits(hits, now, windowMs);
  const stamps = hits.get(network) ?? [];
  if (stamps.length >= max) return false;
  hits.set(network, [...stamps, now]);
  return true;
}

/** Claves de relleno conocidas (entornos locales, builds y QA). */
export const PLACEHOLDER_RESEND_KEYS: readonly string[] = [
  're_pendiente',
  're_build_placeholder',
  're_dummy',
  're_qa_invalida',
];

/** Una clave se intenta usar si empieza por `re_` y no es una de relleno conocida. */
export function hasUsableResendKey(key: string | undefined): key is string {
  if (!key) return false;
  return key.startsWith('re_') && !PLACEHOLDER_RESEND_KEYS.includes(key);
}

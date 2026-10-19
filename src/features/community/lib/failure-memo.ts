/**
 * Memoiza el FALLO de una función asíncrona sin argumentos. Puro (lo prueban los tests con node:test): sin imports.
 *
 * - Un éxito pasa tal cual y no se guarda (la caché de datos ya es cosa de `fetch`).
 * - Un fallo se recuerda `ttlMs`: las llamadas siguientes se rechazan al instante con el mismo error, sin repetir la
 *   petición ni esperar su tiempo límite. Pasado el plazo se vuelve a intentar.
 * - Las llamadas simultáneas comparten una sola petición en curso.
 *
 * Sirve para el feed RSS del canal: si YouTube responde 404, el build y el ISR de cada ficha no deben repetir esa
 * petición (ni esperar 4 s) por cada página.
 */
export function memoizeFailure<T>(
  fn: () => Promise<T>,
  ttlMs: number,
  now: () => number = Date.now,
): () => Promise<T> {
  let inflight: Promise<T> | null = null;
  let failure: { error: unknown; at: number } | null = null;

  return () => {
    if (failure) {
      if (now() - failure.at < ttlMs) return Promise.reject(failure.error);
      failure = null;
    }
    if (inflight) return inflight;

    // `new Promise` convierte un fallo síncrono de `fn` en un rechazo más.
    const run = new Promise<T>((resolve) => resolve(fn())).then(
      (value) => {
        inflight = null;
        return value;
      },
      (error: unknown) => {
        inflight = null;
        failure = { error, at: now() };
        throw error;
      },
    );
    inflight = run;
    return run;
  };
}

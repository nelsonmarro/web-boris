/**
 * Reintentos con pausa para peticiones con fallos transitorios. Puro (lo prueban los tests con node:test): sin imports.
 * Lo usa el feed RSS del canal, que responde 404/500 de forma intermitente (#61).
 */

export interface RetryOptions {
  /** Pausa antes de cada reintento, en ms: su longitud es el número máximo de reintentos. */
  delaysMs: readonly number[];
  /** Si el error merece otro intento. */
  shouldRetry: (error: unknown) => boolean;
  /** Inyectable en los tests. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Llama a `fn` hasta que acierte, se agoten las pausas o `shouldRetry` diga que no. Lanza el último error. */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  { delaysMs, shouldRetry, sleep = defaultSleep }: RetryOptions,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= delaysMs.length || !shouldRetry(error)) throw error;
      await sleep(delaysMs[attempt]);
    }
  }
}

/** Respuesta HTTP no satisfactoria, con su código para decidir si se reintenta. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
    this.name = 'HttpError';
  }
}

/**
 * Fallos que pueden no repetirse: 404 (el feed de YouTube lo da al azar), 408, 429 y 5xx; un fallo de red
 * (`fetch` lanza `TypeError`) y el tiempo límite de un intento (`TimeoutError`).
 */
export function isTransientFetchError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return error.status === 404 || error.status === 408 || error.status === 429 || error.status >= 500;
  }
  return error instanceof Error && (error.name === 'TypeError' || error.name === 'TimeoutError');
}

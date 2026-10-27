/**
 * Resume un error de red en una frase corta para el registro (`HTTP 404`, `fetch failed: EAI_AGAIN`, `tiempo límite`),
 * sin la traza ni la cadena de `cause`. Puro (lo prueban los tests con node:test): sin imports.
 */
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  if (error.name === 'TimeoutError' || error.name === 'AbortError') return 'tiempo límite';
  const cause = (error as { cause?: unknown }).cause;
  const code = cause && typeof cause === 'object' ? (cause as { code?: unknown }).code : undefined;
  return typeof code === 'string' ? `${error.message}: ${code}` : error.message;
}

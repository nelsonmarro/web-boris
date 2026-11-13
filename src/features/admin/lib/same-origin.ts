/**
 * ¿Viene la petición de la propia web? Para las rutas del panel que no son server actions (la subida de imágenes):
 * las server actions ya hacen esta comprobación por su cuenta. Puro.
 *
 * No basta con comparar con `request.url`: detrás de un proxy (nginx con HTTPS en el VPS, o Docker) el servidor se ve
 * a sí mismo como `http://0.0.0.0:3000` o con otro esquema, y la subida respondía siempre 403 en producción. Valen la
 * dirección pública configurada (`AUTH_URL`, `NEXT_PUBLIC_SITE_URL`) y el host que reenvía el proxy.
 */
export function isSameOrigin(
  origin: string | null,
  headers: { get(name: string): string | null },
  env: Record<string, string | undefined>,
  requestUrl: string,
): boolean {
  if (!origin || origin === 'null') return false;
  const allowed = new Set<string>();
  const add = (value: string | undefined) => {
    if (!value) return;
    try {
      allowed.add(new URL(value).origin);
    } catch {
      // Una variable mal escrita no autoriza nada.
    }
  };
  add(env.AUTH_URL);
  add(env.NEXT_PUBLIC_SITE_URL);
  const url = new URL(requestUrl);
  const host = headers.get('x-forwarded-host')?.split(',')[0]?.trim() || headers.get('host');
  const proto = headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || url.protocol.replace(':', '');
  if (host && /^[a-z0-9.-]+(:\d+)?$/i.test(host) && (proto === 'http' || proto === 'https')) add(`${proto}://${host}`);
  add(url.origin);
  return allowed.has(origin);
}

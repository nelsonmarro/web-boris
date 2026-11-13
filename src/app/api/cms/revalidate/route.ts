import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateContent } from '@/core/content/revalidate';

const digest = (value: string) => createHash('sha256').update(value).digest();

/**
 * Regenera las páginas con lo publicado en el panel. Lo llama `deploy/deploy.sh` desde dentro del contenedor tras
 * cada despliegue: las páginas salen del build solo con los archivos (el build no se conecta a la base) y, sin esto,
 * lo publicado tardaría hasta una hora en volver. Exige `Authorization: Bearer <AUTH_SECRET>`.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.AUTH_SECRET;
  const token = /^Bearer (.+)$/.exec(request.headers.get('authorization') ?? '')?.[1];
  if (!secret || secret.length < 32 || !token || !timingSafeEqual(digest(token), digest(secret))) {
    return new Response(null, { status: 404 });
  }
  revalidateContent();
  return Response.json({ revalidated: true });
}

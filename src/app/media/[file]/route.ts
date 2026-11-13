import fs from 'node:fs/promises';
import { mediaFilePath } from '@/features/admin/server/media';

/**
 * Sirve las imágenes subidas desde el panel. Solo nombres `<32 hex>.webp` (el resto, 404), siempre como imagen y con
 * caché de un año: el nombre sale del contenido, así que un archivo nunca cambia.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const file = mediaFilePath((await params).file);
  if (!file) return new Response(null, { status: 404 });
  let data: Buffer;
  try {
    data = await fs.readFile(file);
  } catch {
    return new Response(null, { status: 404 });
  }
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(data.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}

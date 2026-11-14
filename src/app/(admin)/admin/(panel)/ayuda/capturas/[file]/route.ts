import fs from 'node:fs/promises';
import path from 'node:path';
import { currentAdmin } from '@/features/admin/server/require-admin';
import { GUIDE_IMAGE_FILE } from '@/features/admin/lib/guide';

/** Capturas del manual (`src/content/panel/capturas`, van en la imagen con `src/content`). */
const DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'content', 'panel', 'capturas');

/**
 * Sirve una captura del manual solo a quien tiene sesión completa del panel: enseñan el panel por dentro y no hace falta
 * que sean públicas. Solo nombres `<nombre>.webp` (nada de rutas); el resto, 404.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const admin = await currentAdmin();
  if (!admin?.ready) return new Response(null, { status: 401 });
  const name = GUIDE_IMAGE_FILE.exec((await params).file)?.[1];
  if (!name) return new Response(null, { status: 404 });
  let data: Buffer;
  try {
    data = await fs.readFile(path.join(/*turbopackIgnore: true*/ DIR, `${name}.webp`));
  } catch {
    return new Response(null, { status: 404 });
  }
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(data.length),
      'Cache-Control': 'private, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}

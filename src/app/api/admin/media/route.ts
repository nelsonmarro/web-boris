import { currentAdmin } from '@/features/admin/server/require-admin';
import { saveUpload } from '@/features/admin/server/media';
import { audit } from '@/features/admin/server/audit';
import { ImageRejected, MAX_UPLOAD_BYTES } from '@/features/admin/lib/image-processing';

/** Margen de la petición multipart sobre el archivo (cabeceras y límites del formulario). */
const OVERHEAD = 64 * 1024;

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * Subida de una imagen al panel (un archivo por petición, campo `file`). Es un route handler y no una server action
 * para no subir el límite de tamaño de todas las acciones del sitio. Exige sesión de administración completa y que
 * la petición venga de la propia web (`Origin`), porque va con la cookie de sesión.
 */
export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await currentAdmin();
  if (!admin?.ready) return json({ error: 'Tu sesión ha caducado. Vuelve a entrar.' }, 401);

  const length = Number(request.headers.get('content-length'));
  if (!Number.isFinite(length) || length <= 0) return json({ error: 'Falta el tamaño de la subida.' }, 411);
  if (length > MAX_UPLOAD_BYTES + OVERHEAD) return json({ error: `La imagen pasa de ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.` }, 413);

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return json({ error: 'No se pudo leer la subida.' }, 400);
  }
  if (!(file instanceof File)) return json({ error: 'No llegó ninguna imagen.' }, 400);

  try {
    const image = await saveUpload(Buffer.from(await file.arrayBuffer()), file.name, admin.id);
    await audit('media.upload', { userId: admin.id, target: `${image.path} (${image.name})` });
    return json(image);
  } catch (error) {
    if (error instanceof ImageRejected) return json({ error: error.message }, 422);
    console.error('[admin:media]', error);
    return json({ error: 'No se pudo guardar la imagen.' }, 500);
  }
}

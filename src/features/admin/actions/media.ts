'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../server/require-admin';
import { audit } from '../server/audit';
import { deleteUpload, imageUsage, listRepoAssets, listUploads, type LibraryImage } from '../server/media';
import { prisma } from '@/lib/prisma';
import { MEDIA_PREFIX, isMediaPath } from '@/core/content/media-path';

export interface Library {
  uploads: LibraryImage[];
  assets: LibraryImage[];
}

/** Imágenes para el selector del editor: las subidas y las de la web. */
export async function getLibrary(): Promise<Library> {
  await requireAdmin();
  const [uploads, usage] = await Promise.all([listUploads(), imageUsage()]);
  const withUsage = (image: LibraryImage): LibraryImage => ({ ...image, usedIn: usage.get(image.path)?.usedIn ?? [] });
  return { uploads: uploads.map(withUsage), assets: listRepoAssets().map(withUsage) };
}

export async function deleteMediaAction(id: string): Promise<{ ok: boolean; message: string }> {
  const admin = await requireAdmin();
  if (typeof id !== 'string') return { ok: false, message: 'Imagen no válida.' };
  const result = await deleteUpload(id);
  if (!result.deleted) return { ok: false, message: result.reason };
  await audit('media.delete', { userId: admin.id, target: id });
  revalidatePath('/admin/imagenes');
  return { ok: true, message: 'Imagen borrada.' };
}

export async function updateMediaAltAction(id: string, alt: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  if (typeof id !== 'string' || typeof alt !== 'string') return { ok: false };
  await prisma.mediaAsset.updateMany({ where: { id }, data: { alt: alt.trim().slice(0, 300) } });
  return { ok: true };
}

/** Recuerda la descripción de una imagen subida (por su ruta `/media/…`) para la próxima vez que se elija. */
export async function rememberMediaAltAction(path: string, alt: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  if (typeof path !== 'string' || typeof alt !== 'string' || !isMediaPath(path)) return { ok: false };
  await prisma.mediaAsset.updateMany({ where: { filename: path.slice(MEDIA_PREFIX.length) }, data: { alt: alt.trim().slice(0, 300) } });
  return { ok: true };
}

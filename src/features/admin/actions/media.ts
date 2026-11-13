'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../server/require-admin';
import { audit } from '../server/audit';
import { deleteUpload, listRepoAssets, listUploads, type LibraryImage } from '../server/media';
import { prisma } from '@/lib/prisma';

export interface Library {
  uploads: LibraryImage[];
  assets: LibraryImage[];
}

/** Imágenes para el selector del editor: las subidas y las de la web. */
export async function getLibrary(): Promise<Library> {
  await requireAdmin();
  return { uploads: await listUploads(), assets: listRepoAssets() };
}

export async function deleteMediaAction(id: string): Promise<{ ok: boolean; message: string }> {
  const admin = await requireAdmin();
  if (typeof id !== 'string') return { ok: false, message: 'Imagen no válida.' };
  const result = await deleteUpload(id);
  if (!result.deleted) {
    return {
      ok: false,
      message: result.usedBy.length ? `No se puede borrar: la usan ${result.usedBy.join(', ')}.` : 'Esa imagen ya no existe.',
    };
  }
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

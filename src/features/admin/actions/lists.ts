'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isListKey, LIST_KIND } from '@/core/content/lists';
import { revalidateContent } from '@/core/content/revalidate';
import { checkList } from '../lib/list-check';
import { requireAdmin } from '../server/require-admin';
import { audit } from '../server/audit';
import { listContext, NEW_LIST_TOKEN } from '../server/lists';

const PAYLOAD_MAX = 400_000;

export interface ListActionResult {
  ok: boolean;
  token?: string;
  message?: string;
  errors?: string[];
  conflict?: boolean;
}

/**
 * Publica una lista entera (novedades, votaciones…). Se comprueba como `check:content` y contra lo que ve la web
 * ahora; luego se guarda con su versión en el historial. Las listas no tienen borrador: son cortas y la vista previa
 * es la propia página.
 */
export async function publishList(key: string, payload: string, token: string, note: string): Promise<ListActionResult> {
  const admin = await requireAdmin();
  if (!isListKey(key)) return { ok: false, message: 'Lista desconocida.' };
  if (typeof payload !== 'string' || payload.length > PAYLOAD_MAX) return { ok: false, message: 'La lista es demasiado grande.' };
  let value: unknown;
  try {
    value = JSON.parse(payload);
  } catch {
    return { ok: false, message: 'No se pudieron leer los datos del editor.' };
  }
  const checked = checkList(key, value, await listContext());
  if ('errors' in checked) return { ok: false, message: 'No se puede publicar todavía:', errors: checked.errors };

  const data = checked.value as Prisma.InputJsonValue;
  const cleanNote = typeof note === 'string' ? note.trim().slice(0, 200) || null : null;
  const done = await prisma.$transaction(async (tx) => {
    let id: string;
    if (token === NEW_LIST_TOKEN) {
      try {
        id = (await tx.cmsDocument.create({ data: { kind: LIST_KIND, key, published: data, publishedAt: new Date(), updatedById: admin.id }, select: { id: true } })).id;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return null;
        throw error;
      }
    } else {
      const updatedAt = new Date(token);
      if (Number.isNaN(updatedAt.getTime())) return null;
      const { count } = await tx.cmsDocument.updateMany({ where: { kind: LIST_KIND, key, updatedAt }, data: { published: data, publishedAt: new Date(), updatedById: admin.id } });
      if (count !== 1) return null;
      id = (await tx.cmsDocument.findUniqueOrThrow({ where: { kind_key: { kind: LIST_KIND, key } }, select: { id: true } })).id;
    }
    await tx.cmsVersion.create({ data: { documentId: id, data, authorId: admin.id, note: cleanNote } });
    return (await tx.cmsDocument.findUniqueOrThrow({ where: { id }, select: { updatedAt: true } })).updatedAt.toISOString();
  });
  if (!done) {
    return { ok: false, conflict: true, message: 'La lista ha cambiado desde que la abriste (en otra pestaña o por otra persona). Recarga la página y vuelve a aplicar tus cambios.' };
  }
  await audit('list.publish', { userId: admin.id, target: key });
  revalidateContent();
  return { ok: true, token: done, message: 'Publicado. Ya se ve en la web.' };
}

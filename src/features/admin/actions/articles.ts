'use server';

import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fileContentRepository } from '@/core/content/file-repository';
import { ARTICLE_KIND, isValidSlug, type ArticleData } from '@/core/content/overlay';
import { revalidateContent } from '@/core/content/revalidate';
import { parseArticleData } from '../lib/article-check';
import { newArticleData, ARTICLE_CATEGORIES } from '../lib/article-template';
import { requireAdmin } from '../server/require-admin';
import { audit } from '../server/audit';
import { stashArticlePreview as stashPreview } from '../server/preview';
import { checkArticleForPublish, slugTaken } from '../server/articles';
import { discardDraft, NEW_TOKEN, publishDraft, toJson, writeDraft } from '../server/cms-store';

/** Tope del JSON que manda el editor (el cuerpo admite 200 000 caracteres; el resto, holgura). */
const PAYLOAD_MAX = 400_000;

export interface ArticleActionResult {
  ok: boolean;
  /** Nueva marca de concurrencia tras escribir. */
  token?: string;
  /** Mensaje general (éxito o motivo del fallo). */
  message?: string;
  /** Problemas concretos que hay que corregir. */
  errors?: string[];
  /** Otra persona (u otra pestaña) cambió la ficha mientras se editaba. */
  conflict?: boolean;
}

const CONFLICT: ArticleActionResult = {
  ok: false,
  conflict: true,
  message: 'La ficha ha cambiado desde que la abriste (en otra pestaña o por otra persona). Copia tus cambios, recarga la página y vuelve a aplicarlos.',
};

function readPayload(payload: unknown): { data: ArticleData } | { errors: string[] } {
  if (typeof payload !== 'string' || payload.length > PAYLOAD_MAX) return { errors: ['La ficha es demasiado grande.'] };
  let json: unknown;
  try {
    json = JSON.parse(payload);
  } catch {
    return { errors: ['No se pudieron leer los datos del editor.'] };
  }
  return parseArticleData(json);
}

const where = (slug: string) => ({ kind_key: { kind: ARTICLE_KIND, key: slug } });

async function editableSlug(slug: unknown): Promise<string | null> {
  if (typeof slug !== 'string' || !isValidSlug(slug)) return null;
  // Solo fichas que existen (en los archivos o en el panel): guardar no crea fichas, eso lo hace `createArticleAction`.
  return (await slugTaken(slug)) ? slug : null;
}

export async function saveArticleDraft(slug: string, payload: string, token: string): Promise<ArticleActionResult> {
  const admin = await requireAdmin();
  if (!(await editableSlug(slug))) return { ok: false, message: 'Esa ficha no existe.' };
  const read = readPayload(payload);
  if ('errors' in read) return { ok: false, message: 'No se pudo guardar.', errors: read.errors };
  const next = await writeDraft(prisma, slug, read.data, token, admin.id);
  if (!next) return CONFLICT;
  await audit('article.save', { userId: admin.id, target: slug });
  return { ok: true, token: next, message: 'Borrador guardado. Todavía no se ve en la web.' };
}

export async function publishArticle(slug: string, payload: string, token: string, note: string): Promise<ArticleActionResult> {
  const admin = await requireAdmin();
  if (!(await editableSlug(slug))) return { ok: false, message: 'Esa ficha no existe.' };
  const read = readPayload(payload);
  if ('errors' in read) return { ok: false, message: 'No se pudo publicar.', errors: read.errors };

  // Primero se guarda: si algo impide publicar, el trabajo no se pierde.
  const saved = await writeDraft(prisma, slug, read.data, token, admin.id);
  if (!saved) return CONFLICT;
  const check = await checkArticleForPublish(slug, read.data);
  if (check.errors.length > 0) {
    return { ok: false, token: saved, message: 'Guardado como borrador, pero no se puede publicar todavía:', errors: check.errors };
  }

  const done = await publishDraft(prisma, slug, read.data, saved, admin.id, typeof note === 'string' ? note : '');
  if (!done) return CONFLICT;
  await audit('article.publish', { userId: admin.id, target: slug });
  revalidateContent();
  return { ok: true, token: done, message: 'Publicada. Ya se ve en la web.' };
}

export async function discardArticleDraft(slug: string, token: string): Promise<ArticleActionResult> {
  const admin = await requireAdmin();
  if (!(await editableSlug(slug)) || token === NEW_TOKEN) return { ok: false, message: 'No hay borrador que descartar.' };
  const inFile = (await fileContentRepository.getArticle(slug)) !== null;
  const done = await discardDraft(prisma, slug, token, admin.id, inFile);
  if (!done) return CONFLICT;
  await audit('article.discard', { userId: admin.id, target: slug });
  redirect(done.removed ? '/admin/fichas' : (`/admin/fichas/${slug}` as Route));
}

/** Oculta la ficha de la web (también la del archivo). Se puede deshacer con `undeleteArticle`. */
export async function deleteArticle(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!(await editableSlug(slug))) redirect('/admin/fichas');
  await prisma.$transaction(async (tx) => {
    const doc = await tx.cmsDocument.upsert({
      where: where(slug),
      create: { kind: ARTICLE_KIND, key: slug, deleted: true, updatedById: admin.id },
      update: { deleted: true, updatedById: admin.id },
      select: { id: true },
    });
    await tx.cmsVersion.create({ data: { documentId: doc.id, data: Prisma.DbNull, authorId: admin.id, note: 'Ficha retirada de la web' } });
  });
  await audit('article.delete', { userId: admin.id, target: slug });
  revalidateContent();
  redirect(`/admin/fichas/${slug}` as Route);
}

export async function undeleteArticle(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!(await editableSlug(slug))) redirect('/admin/fichas');
  await prisma.cmsDocument.updateMany({ where: { kind: ARTICLE_KIND, key: slug }, data: { deleted: false, updatedById: admin.id } });
  await audit('article.undelete', { userId: admin.id, target: slug });
  revalidateContent();
  redirect(`/admin/fichas/${slug}` as Route);
}

/** Copia una versión publicada al borrador (no la publica: hay que revisarla y pulsar «Publicar»). */
export async function restoreArticleVersion(slug: string, versionId: string): Promise<void> {
  const admin = await requireAdmin();
  if (!(await editableSlug(slug)) || typeof versionId !== 'string') redirect('/admin/fichas');
  const version = await prisma.cmsVersion.findFirst({ where: { id: versionId, document: { kind: ARTICLE_KIND, key: slug } }, select: { data: true } });
  const read = version?.data ? parseArticleData(version.data) : null;
  if (read && 'data' in read) {
    await prisma.cmsDocument.update({ where: where(slug), data: { draft: toJson(read.data), updatedById: admin.id } });
    await audit('article.restore-version', { userId: admin.id, target: `${slug} ← ${versionId}` });
  }
  redirect(`/admin/fichas/${slug}?restaurada=1` as Route);
}

export interface CreateArticleState {
  error?: string;
}

export async function createArticleAction(_previous: CreateArticleState, formData: FormData): Promise<CreateArticleState> {
  const admin = await requireAdmin();
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  const title = text('title').slice(0, 200);
  const universe = text('universe').slice(0, 100);
  const category = text('category');
  const slug = text('slug').toLowerCase();
  if (!title) return { error: 'Escribe el nombre de la ficha.' };
  if (!universe) return { error: 'Elige el universo.' };
  if (!ARTICLE_CATEGORIES.includes(category)) return { error: 'Elige la categoría.' };
  if (!isValidSlug(slug)) {
    return { error: 'La dirección solo puede llevar letras minúsculas sin tildes, números y guiones (p. ej. «gran-maja»).' };
  }
  if (await slugTaken(slug)) return { error: `Ya hay una ficha con la dirección «${slug}». Elige otra.` };
  try {
    await prisma.cmsDocument.create({
      data: { kind: ARTICLE_KIND, key: slug, draft: toJson(newArticleData({ title, universe, category })), updatedById: admin.id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { error: `Ya hay una ficha con la dirección «${slug}».` };
    throw error;
  }
  await audit('article.create', { userId: admin.id, target: slug });
  redirect(`/admin/fichas/${slug}` as Route);
}

/**
 * Vista previa en vivo: guarda en memoria lo que se está editando (sin tocar el borrador) para que
 * `/admin/vista-previa/<ficha>?vivo=1` lo pinte. Solo valida la forma; los problemas se ven en la propia vista previa.
 */
export async function stashArticlePreview(slug: string, payload: string): Promise<{ ok: boolean; message?: string }> {
  const admin = await requireAdmin();
  if (!isValidSlug(slug)) return { ok: false, message: 'Ficha no válida.' };
  const parsed = readPayload(payload);
  if ('errors' in parsed) return { ok: false, message: parsed.errors[0] };
  stashPreview(admin.id, slug, parsed.data);
  return { ok: true };
}

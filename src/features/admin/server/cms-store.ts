/**
 * Escrituras de los documentos del panel (`CmsDocument`) con su marca de concurrencia. La marca es el `updatedAt` del
 * documento (o `NEW_TOKEN` si aún no existe): toda escritura lleva en el `where` la que vio el editor, así que dos
 * pestañas nunca se pisan y la segunda recibe `null` (conflicto).
 *
 * Recibe el cliente de Prisma como parámetro e importa con rutas relativas para poder probarlo contra Postgres con
 * node:test (`tests/integration/`); por eso tampoco importa `server-only`. Solo lo usan `server/` y `actions/`.
 */
import { Prisma, type PrismaClient } from '@prisma/client';
import { ARTICLE_KIND, type ArticleData } from '../../../core/content/overlay.ts';
import { LIST_KIND, type ListKey, type ListValues } from '../../../core/content/lists.ts';

/** Marca de concurrencia de un documento que aún no existe en la base. */
export const NEW_TOKEN = 'nuevo';

type Db = PrismaClient | Prisma.TransactionClient;

export const tokenOf = (doc: { updatedAt: Date } | null | undefined): string => (doc ? doc.updatedAt.toISOString() : NEW_TOKEN);

/** La fecha de una marca, o `null` si no es una marca válida (ni `NEW_TOKEN`). */
export function parseToken(token: unknown): Date | null {
  if (typeof token !== 'string' || token === NEW_TOKEN) return null;
  const date = new Date(token);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Lo que se guarda en una columna `Json`. Fichas y listas son JSON puro (lo garantizan sus esquemas), pero sus tipos
 * no llevan la firma de índice que pide Prisma.
 */
export const toJson = (value: ArticleData | ListValues[ListKey]): Prisma.InputJsonValue => value as unknown as Prisma.InputJsonValue;

const isUniqueViolation = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

type DocumentData = Omit<Prisma.CmsDocumentUncheckedCreateInput, 'kind' | 'key' | 'id'>;

/**
 * Escribe `data` en el documento `kind`/`key` si nadie lo ha cambiado desde `token`. Con `NEW_TOKEN` lo crea (si
 * otro lo creó antes, conflicto). Devuelve su id y la marca nueva, o `null` si hubo conflicto.
 */
export async function writeIfUnchanged(db: Db, kind: string, key: string, token: string, data: DocumentData): Promise<{ id: string; token: string } | null> {
  if (token === NEW_TOKEN) {
    try {
      const created = await db.cmsDocument.create({ data: { kind, key, ...data }, select: { id: true, updatedAt: true } });
      return { id: created.id, token: tokenOf(created) };
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
  }
  const updatedAt = parseToken(token);
  if (!updatedAt) return null;
  const { count } = await db.cmsDocument.updateMany({ where: { kind, key, updatedAt }, data });
  if (count !== 1) return null;
  const doc = await db.cmsDocument.findUniqueOrThrow({ where: { kind_key: { kind, key } }, select: { id: true, updatedAt: true } });
  return { id: doc.id, token: tokenOf(doc) };
}

export interface VersionItem {
  id: string;
  createdAt: string;
  author: string | null;
  note: string | null;
  /** La versión es una retirada de la web (sin datos). */
  isDeletion: boolean;
}

/** Las versiones de un documento para el historial del editor. */
export const versionItems = (versions: { id: string; createdAt: Date; note: string | null; data: unknown; author: { name: string | null; email: string | null } | null }[]): VersionItem[] =>
  versions.map((version) => ({
    id: version.id,
    createdAt: version.createdAt.toISOString(),
    author: version.author?.name ?? version.author?.email ?? null,
    note: version.note,
    isDeletion: version.data === null,
  }));

/** Lo que hay que pedir de las versiones para `versionItems` (las 30 últimas). */
export const VERSIONS_INCLUDE = {
  versions: { orderBy: { createdAt: 'desc' }, take: 30, include: { author: { select: { name: true, email: true } } } },
} satisfies Prisma.CmsDocumentInclude;

/** Guarda `data` como borrador de la ficha `slug`. Devuelve la marca nueva o `null` si hubo conflicto. */
export async function writeDraft(db: Db, slug: string, data: ArticleData, token: string, userId: string): Promise<string | null> {
  return (await writeIfUnchanged(db, ARTICLE_KIND, slug, token, { draft: toJson(data), updatedById: userId }))?.token ?? null;
}

/**
 * Publica `data` (ya guardado como borrador con la marca `token`): pasa a ser lo publicado, se vacía el borrador, deja
 * de estar retirada y se apunta la versión en el historial, todo en una transacción.
 */
export async function publishDraft(db: PrismaClient, slug: string, data: ArticleData, token: string, userId: string, note: string): Promise<string | null> {
  const published = toJson(data);
  return db.$transaction(async (tx) => {
    const written = await writeIfUnchanged(tx, ARTICLE_KIND, slug, token, { published, draft: Prisma.DbNull, deleted: false, publishedAt: new Date(), updatedById: userId });
    if (!written) return null;
    await tx.cmsVersion.create({ data: { documentId: written.id, data: published, authorId: userId, note: note.trim().slice(0, 200) || null } });
    return written.token;
  });
}

/**
 * Descarta el borrador de `slug`. Una ficha creada en el panel que nunca se publicó (ni está en los archivos, `inFile`)
 * no existe sin su borrador: se elimina. Devuelve si se eliminó, o `null` si hubo conflicto.
 */
export async function discardDraft(db: Db, slug: string, token: string, userId: string, inFile: boolean): Promise<{ removed: boolean } | null> {
  const updatedAt = parseToken(token);
  if (!updatedAt) return null;
  const doc = await db.cmsDocument.findUnique({ where: { kind_key: { kind: ARTICLE_KIND, key: slug } }, select: { published: true, deleted: true } });
  if (!doc) return null;
  const removed = !inFile && doc.published === null && !doc.deleted;
  const where = { kind: ARTICLE_KIND, key: slug, updatedAt };
  const { count } = removed ? await db.cmsDocument.deleteMany({ where }) : await db.cmsDocument.updateMany({ where, data: { draft: Prisma.DbNull, updatedById: userId } });
  return count === 1 ? { removed } : null;
}

/**
 * Guarda `list` (ya comprobada) como lo publicado de la lista `key`, con su versión en el historial. Devuelve la marca
 * nueva o `null` si la lista cambió desde `token`.
 */
export async function commitList<K extends ListKey>(db: PrismaClient, adminId: string, key: K, list: ListValues[K], token: string, note: string | null): Promise<string | null> {
  const value = toJson(list);
  return db.$transaction(async (tx) => {
    const written = await writeIfUnchanged(tx, LIST_KIND, key, token, { published: value, publishedAt: new Date(), updatedById: adminId });
    if (!written) return null;
    await tx.cmsVersion.create({ data: { documentId: written.id, data: value, authorId: adminId, note } });
    return written.token;
  });
}

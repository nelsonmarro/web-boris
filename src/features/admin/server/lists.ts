import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fileContentRepository } from '@/core/content/file-repository';
import { getContentRepository } from '@/core/content';
import { LIST_KIND, parseList, type ListKey, type ListValues } from '@/core/content/lists';
import { getCanal } from '@/features/community/data/channel-videos';
import { FEATURED_VIDEOS } from '@/features/marketing/config/videos';
import { hasStats } from '@/features/monsters/lib/stats';
import { UNIVERSE_OPTIONS } from '../lib/universe-options';
import type { ListContext } from '../lib/list-check';

/** Marca de concurrencia de una lista que aún no tiene documento en la base. */
export const NEW_LIST_TOKEN = 'nuevo';

export const LIST_TITLES: Record<ListKey, string> = {
  news: 'Novedades',
  polls: 'Votaciones semanales',
  videos: 'Vídeos de cada ficha',
  storyOrder: 'Orden de la historia',
  startHere: 'Empieza por aquí',
  navigation: 'Menú lateral',
};

const fromFiles: { [K in ListKey]: () => Promise<ListValues[K]> } = {
  news: () => fileContentRepository.getNews(),
  polls: () => fileContentRepository.getCuratedPolls(),
  videos: () => fileContentRepository.getVideoLinks(),
  storyOrder: () => fileContentRepository.getStoryOrder(),
  startHere: () => fileContentRepository.getStartHere(),
  navigation: () => fileContentRepository.getNavigation(),
};

export interface ListVersionItem {
  id: string;
  createdAt: string;
  author: string | null;
  note: string | null;
}

interface ListStateBase {
  token: string;
  /** Se publicó alguna vez desde el panel (si no, es la lista de los archivos). */
  fromPanel: boolean;
  versions: ListVersionItem[];
  /** La versión cargada en el editor, si se pidió recuperar una. */
  restoring: string | null;
}

/** Estado de una lista para su editor. Con `K` amplio es una unión por `key`: comprobar `key` da el tipo de `value`. */
export type ListEditorState<K extends ListKey = ListKey> = {
  [P in K]: ListStateBase & {
    key: P;
    /** Lo que ve la web (o la versión elegida para recuperar). */
    value: ListValues[P];
  };
}[K];

export async function loadList<K extends ListKey>(key: K, versionId?: string): Promise<ListEditorState<K>> {
  const doc = await prisma.cmsDocument.findUnique({
    where: { kind_key: { kind: LIST_KIND, key } },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 30, include: { author: { select: { name: true, email: true } } } } },
  });
  const published = doc?.published ? parseList(key, doc.published) : null;
  let value = published?.success ? published.data : await fromFiles[key]();
  let restoring: string | null = null;
  if (versionId && doc) {
    const version = await prisma.cmsVersion.findFirst({ where: { id: versionId, documentId: doc.id }, select: { id: true, data: true } });
    const parsed = version?.data ? parseList(key, version.data) : null;
    if (parsed?.success) {
      value = parsed.data;
      restoring = version!.id;
    }
  }
  const state: ListStateBase & { key: K; value: ListValues[K] } = {
    key,
    value,
    token: doc ? doc.updatedAt.toISOString() : NEW_LIST_TOKEN,
    fromPanel: !!published?.success,
    versions: (doc?.versions ?? []).map((version) => ({
      id: version.id,
      createdAt: version.createdAt.toISOString(),
      author: version.author?.name ?? version.author?.email ?? null,
      note: version.note,
    })),
    restoring,
  };
  // TypeScript no reparte `K` sobre la unión: para una clave concreta es exactamente esto.
  return state as ListEditorState<K>;
}

/** Todo lo que necesitan las comprobaciones de las listas, con el contenido que ve la web ahora. */
export async function listContext(): Promise<ListContext> {
  const repo = getContentRepository();
  const [articles, canal, currentPolls] = await Promise.all([repo.getArticles(), getCanal(), repo.getCuratedPolls()]);
  const canalIds = new Set(canal.map((video) => video.id));
  return {
    slugs: new Set(articles.map((a) => a.slug)),
    fighterSlugs: new Set(articles.filter((a) => hasStats(a.frontmatter)).map((a) => a.slug)),
    sealedSlugs: new Set(articles.filter((a) => a.frontmatter.status === 'proximamente').map((a) => a.slug)),
    universeKeys: new Set(UNIVERSE_OPTIONS),
    canalIds,
    knownVideoIds: new Set([...FEATURED_VIDEOS.map((video) => video.id), ...canalIds]),
    currentPolls,
    now: new Date(),
  };
}

export interface VideoOption {
  id: string;
  titulo: string;
}

/** Vídeos del canal para los selectores (destacados y `canal.json`, sin repetir). */
export async function videoOptions(): Promise<VideoOption[]> {
  const canal = await getCanal();
  const seen = new Set<string>();
  const options: VideoOption[] = [];
  for (const video of [...FEATURED_VIDEOS.map((v) => ({ id: v.id, titulo: v.title })), ...canal.map((v) => ({ id: v.id, titulo: v.titulo }))]) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    options.push(video);
  }
  return options;
}

/**
 * Guarda `value` (ya comprobado) como lo publicado de la lista `key`, con su versión en el historial. `token` es la
 * marca de concurrencia que vio el editor: si la lista cambió desde entonces, no guarda nada y devuelve `null`. Si no,
 * la marca nueva.
 */
export async function commitList<K extends ListKey>(adminId: string, key: K, list: ListValues[K], token: string, note: string | null): Promise<string | null> {
  // Las listas son JSON puro (lo garantiza su esquema), pero sus tipos no llevan la firma de índice que pide Prisma.
  const value = list as unknown as Prisma.InputJsonValue;
  return prisma.$transaction(async (tx) => {
    let id: string;
    if (token === NEW_LIST_TOKEN) {
      try {
        id = (await tx.cmsDocument.create({ data: { kind: LIST_KIND, key, published: value, publishedAt: new Date(), updatedById: adminId }, select: { id: true } })).id;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return null;
        throw error;
      }
    } else {
      const updatedAt = new Date(token);
      if (Number.isNaN(updatedAt.getTime())) return null;
      const { count } = await tx.cmsDocument.updateMany({ where: { kind: LIST_KIND, key, updatedAt }, data: { published: value, publishedAt: new Date(), updatedById: adminId } });
      if (count !== 1) return null;
      id = (await tx.cmsDocument.findUniqueOrThrow({ where: { kind_key: { kind: LIST_KIND, key } }, select: { id: true } })).id;
    }
    await tx.cmsVersion.create({ data: { documentId: id, data: value, authorId: adminId, note } });
    return (await tx.cmsDocument.findUniqueOrThrow({ where: { id }, select: { updatedAt: true } })).updatedAt.toISOString();
  });
}

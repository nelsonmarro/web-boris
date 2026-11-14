import 'server-only';
import { prisma } from '@/lib/prisma';
import { fileContentRepository } from '@/core/content/file-repository';
import { getContentRepository } from '@/core/content';
import { LIST_KIND, parseList, type ListKey, type ListValues } from '@/core/content/lists';
import { getCanal } from '@/features/community/data/channel-videos';
import { FEATURED_VIDEOS } from '@/features/marketing/config/videos';
import { hasStats } from '@/features/monsters/lib/stats';
import { UNIVERSE_OPTIONS } from '../lib/universe-options';
import type { ListContext } from '../lib/list-check';
import { tokenOf, versionItems, VERSIONS_INCLUDE, type VersionItem } from './cms-store';

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

interface ListStateBase {
  token: string;
  /** Se publicó alguna vez desde el panel (si no, es la lista de los archivos). */
  fromPanel: boolean;
  versions: VersionItem[];
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
    include: VERSIONS_INCLUDE,
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
    token: tokenOf(doc),
    fromPanel: !!published?.success,
    versions: versionItems(doc?.versions ?? []),
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

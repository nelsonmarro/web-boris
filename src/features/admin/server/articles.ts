import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { fileContentRepository } from '@/core/content/file-repository';
import { getContentRepository } from '@/core/content';
import { ARTICLE_KIND, ArticleDataSchema, type ArticleData } from '@/core/content/overlay';
import { COMPONENT_NAMES } from '@/features/monsters/components/wiki/mdx/MdxRenderer';
import { checkArticle, type ArticleCheck } from '../lib/article-check';
import { isMediaPath, MEDIA_PREFIX } from '@/core/content/media-path';
import { mediaExists } from './media';
import { tokenOf, versionItems, VERSIONS_INCLUDE, type VersionItem } from './cms-store';


const PUBLIC_DIR = path.join(process.cwd(), 'public');

/** ¿Existe la imagen? `/media/…` en la biblioteca subida, o `/assets/…` en `public/` (sin salir de `public/assets`). */
export function assetExists(asset: string): boolean {
  if (isMediaPath(asset)) return mediaExists(asset.slice(MEDIA_PREFIX.length));
  if (!asset.startsWith('/assets/') || asset.includes('..') || asset.includes('\0')) return false;
  let decoded = asset;
  try {
    decoded = decodeURI(asset);
  } catch {
    return false;
  }
  const full = path.join(PUBLIC_DIR, decoded);
  return full.startsWith(path.join(PUBLIC_DIR, 'assets') + path.sep) && fs.existsSync(full);
}

const parse = (value: unknown): ArticleData | null => {
  const parsed = ArticleDataSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

import type { ArticleStatus } from '../lib/article-filters';

export type { ArticleStatus };

export interface ArticleListItem {
  slug: string;
  title: string;
  universe: string;
  category?: string;
  sealed: boolean;
  /** Portada (la `image` de lo que se edita). */
  image?: string;
  status: ArticleStatus;
  /** Tiene cambios guardados sin publicar (además de su estado). */
  hasDraft: boolean;
  updatedAt: string | null;
}

/** Todas las fichas para el listado del panel: las de los archivos y las del panel, con su estado. */
export async function listArticles(): Promise<ArticleListItem[]> {
  const [files, docs] = await Promise.all([
    fileContentRepository.getArticles(),
    prisma.cmsDocument.findMany({ where: { kind: ARTICLE_KIND }, select: { key: true, draft: true, published: true, deleted: true, updatedAt: true } }),
  ]);
  const items = new Map<string, ArticleListItem>();
  for (const file of files) {
    items.set(file.slug, {
      slug: file.slug,
      title: file.frontmatter.title,
      universe: file.frontmatter.universe,
      category: file.frontmatter.category,
      sealed: file.frontmatter.status === 'proximamente',
      image: file.frontmatter.image,
      status: 'archivo',
      hasDraft: false,
      updatedAt: null,
    });
  }
  for (const doc of docs) {
    const shown = parse(doc.draft) ?? parse(doc.published);
    const base = items.get(doc.key);
    const data = shown ?? (base ? null : { frontmatter: { title: doc.key, universe: '—' }, content: '' });
    const status: ArticleStatus = doc.deleted ? 'borrada' : doc.published !== null ? 'publicada' : base ? 'archivo' : 'nueva';
    items.set(doc.key, {
      slug: doc.key,
      title: data?.frontmatter.title ?? base!.title,
      universe: data?.frontmatter.universe ?? base!.universe,
      category: data ? data.frontmatter.category : base!.category,
      sealed: data ? data.frontmatter.status === 'proximamente' : base!.sealed,
      image: data ? data.frontmatter.image : base!.image,
      status,
      hasDraft: doc.draft !== null,
      updatedAt: doc.updatedAt.toISOString(),
    });
  }
  return [...items.values()].sort((a, b) => a.title.localeCompare(b.title, 'es'));
}

export interface ArticleEditorState {
  slug: string;
  /** Lo que se edita: el borrador, o lo publicado, o el archivo. */
  data: ArticleData;
  /** Lo que ve la web ahora (o `null` si nunca se publicó). */
  live: ArticleData | null;
  hasDraft: boolean;
  /** El borrador guardado no se pudo leer (se edita lo publicado). */
  draftUnreadable: boolean;
  deleted: boolean;
  inFile: boolean;
  /** Marca de concurrencia: cambia con cada escritura. */
  token: string;
  versions: VersionItem[];
}

/** Estado completo de una ficha para el editor, o `null` si no existe ni en los archivos ni en el panel. */
export async function loadArticleEditor(slug: string): Promise<ArticleEditorState | null> {
  const [file, doc] = await Promise.all([
    fileContentRepository.getArticle(slug),
    prisma.cmsDocument.findUnique({
      where: { kind_key: { kind: ARTICLE_KIND, key: slug } },
      include: VERSIONS_INCLUDE,
    }),
  ]);
  if (!file && !doc) return null;
  const fileData = file ? { frontmatter: file.frontmatter, content: file.content } : null;
  const published = doc ? parse(doc.published) : null;
  const live = doc?.deleted ? null : (published ?? fileData);
  const draft = doc ? parse(doc.draft) : null;
  const data = draft ?? published ?? fileData ?? { frontmatter: { title: slug, universe: 'Colosos' }, content: '' };
  return {
    slug,
    data,
    live,
    hasDraft: draft !== null,
    draftUnreadable: !!doc?.draft && draft === null,
    deleted: doc?.deleted ?? false,
    inFile: !!file,
    token: tokenOf(doc),
    versions: versionItems(doc?.versions ?? []),
  };
}

/** Comprobaciones de publicación de `data` como ficha `slug`, contra el resto de fichas que ve la web. */
export async function checkArticleForPublish(slug: string, data: ArticleData): Promise<ArticleCheck> {
  const others = (await getContentRepository().getArticles()).map((article) => ({
    slug: article.slug,
    title: article.frontmatter.title,
    aliases: article.frontmatter.aliases,
    related: article.frontmatter.related,
  }));
  return checkArticle(slug, data, { others, components: COMPONENT_NAMES, assetExists });
}

/** ¿Está ya ocupado `slug` (por un archivo o por un documento del panel, también borrado)? */
export async function slugTaken(slug: string): Promise<boolean> {
  if (await fileContentRepository.getArticle(slug)) return true;
  return (await prisma.cmsDocument.count({ where: { kind: ARTICLE_KIND, key: slug } })) > 0;
}

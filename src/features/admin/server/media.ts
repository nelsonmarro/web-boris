import 'server-only';
import fs from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { MEDIA_FILE, MEDIA_PREFIX } from '@/core/content/media-path';
import { processImage } from '../lib/image-processing';
import { assetLabel, combineUsage, deleteBlockedReason, usageByImage, type ImageUse } from '../lib/media-labels';
import { fileContentRepository } from '@/core/content/file-repository';
import { ARTICLE_KIND } from '@/core/content/overlay';

/**
 * Carpeta de las imágenes subidas: `MEDIA_DIR` (en producción, un volumen de Docker) o `.media/` en local.
 * Los `turbopackIgnore` evitan que el trazado de `standalone` copie el proyecto entero: estas rutas son datos que
 * aparecen en tiempo de ejecución, no código.
 */
export function mediaDir(): string {
  return process.env.MEDIA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), '.media');
}

/** Ruta en disco de un archivo de la biblioteca, o `null` si el nombre no es uno de los nuestros (nada de `..`). */
export function mediaFilePath(filename: string): string | null {
  return MEDIA_FILE.test(filename) ? path.join(/*turbopackIgnore: true*/ mediaDir(), filename) : null;
}

export const mediaExists = (filename: string): boolean => {
  const file = mediaFilePath(filename);
  return !!file && existsSync(file);
};

export interface LibraryImage {
  path: string;
  alt: string;
  width?: number;
  height?: number;
  name: string;
  /** Grupo legible de las imágenes de la web («Colosos › The Bloop»). */
  group?: string;
  /** Títulos de las fichas que la usan (borrador, publicada o archivo). */
  usedIn?: string[];
}

/** Recodifica y guarda una imagen subida. Si ya existía (mismo contenido), devuelve la que hay. */
export async function saveUpload(input: Buffer, originalName: string, userId: string): Promise<LibraryImage> {
  const image = await processImage(input);
  const file = mediaFilePath(image.filename)!;
  await fs.mkdir(mediaDir(), { recursive: true });
  // A un temporal y luego `rename` (atómico): nunca hay un archivo a medias con el nombre definitivo, ni para la web
  // ni para la copia de seguridad (`deploy/backup.sh`, que ignora los `.tmp-*`). Si ya existía, tenía este mismo
  // contenido (el nombre es su hash) y sustituirlo no cambia nada.
  const temporary = `${file}.tmp-${randomBytes(6).toString('hex')}`;
  await fs.writeFile(temporary, image.data, { flag: 'wx', mode: 0o644 });
  try {
    await fs.rename(temporary, file);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
  const name = path.basename(originalName).replace(/[^\p{L}\p{N} ._()-]/gu, '').slice(0, 120) || 'imagen';
  const asset = await prisma.mediaAsset.upsert({
    where: { filename: image.filename },
    // Sin texto alternativo: el nombre del archivo («IMG_2034», «Foto del móvil») no describe la imagen y acababa en la
    // web. Se pide una descripción al elegirla (`MediaPicker`).
    create: { filename: image.filename, originalName: name, alt: '', width: image.width, height: image.height, bytes: image.data.length, uploadedById: userId },
    update: {},
  });
  return { path: `${MEDIA_PREFIX}${asset.filename}`, alt: asset.alt, width: asset.width, height: asset.height, name: asset.originalName };
}

export async function listUploads(): Promise<(LibraryImage & { id: string; bytes: number; createdAt: string })[]> {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return assets.map((asset) => ({
    id: asset.id,
    path: `${MEDIA_PREFIX}${asset.filename}`,
    alt: asset.alt,
    width: asset.width,
    height: asset.height,
    name: asset.originalName,
    bytes: asset.bytes,
    createdAt: asset.createdAt.toISOString(),
  }));
}

const IMAGE_EXTENSION = /\.(webp|png|jpe?g|avif)$/i;
let repoAssets: LibraryImage[] | null = null;

/** Imágenes de `public/assets` (las del repositorio; no cambian mientras la app corre). */
export function listRepoAssets(): LibraryImage[] {
  if (repoAssets) return repoAssets;
  const root = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public');
  const found: LibraryImage[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (IMAGE_EXTENSION.test(entry.name)) {
        const rel = `/${path.relative(root, full).split(path.sep).join('/')}`;
        // Ni el logo ni los esquemas del sitio sirven como imagen de una ficha (regla de check:content).
        if (/\/(Branding|Esquemas)\//.test(rel)) continue;
        found.push({ path: rel, alt: '', ...assetLabel(rel) });
      }
    }
  };
  if (existsSync(path.join(root, 'assets'))) walk(path.join(root, 'assets'));
  repoAssets = found.sort((a, b) => a.group!.localeCompare(b.group!, 'es') || a.name.localeCompare(b.name, 'es'));
  return repoAssets;
}

/** Borra una imagen subida que no usa nada (ni ahora ni el historial). Si no se pudo, dice por qué. */
export async function deleteUpload(id: string): Promise<{ deleted: true } | { deleted: false; reason: string }> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { deleted: false, reason: 'Esa imagen ya no existe.' };
  const reason = deleteBlockedReason((await imageUsage()).get(`${MEDIA_PREFIX}${asset.filename}`));
  if (reason) return { deleted: false, reason };
  await prisma.mediaAsset.delete({ where: { id } });
  const file = mediaFilePath(asset.filename);
  if (file) await fs.rm(file, { force: true });
  return { deleted: true };
}

/**
 * Qué fichas usan cada imagen (por su ruta), la única fuente para mostrarlo y para dejar borrar. Ahora: las de los
 * archivos y, para las que tienen documento en el panel, su borrador y lo publicado (que sustituye al archivo; una
 * ficha retirada cuenta, porque se puede volver a mostrar). Historial: sus versiones anteriores, que se pueden recuperar.
 */
export async function imageUsage(): Promise<Map<string, ImageUse>> {
  const [files, docs, versions] = await Promise.all([
    fileContentRepository.getArticles(),
    prisma.cmsDocument.findMany({ where: { kind: ARTICLE_KIND }, select: { key: true, draft: true, published: true } }),
    prisma.cmsVersion.findMany({ where: { document: { kind: ARTICLE_KIND }, data: { not: Prisma.DbNull } }, select: { data: true, document: { select: { key: true } } } }),
  ]);
  const articles = new Map(files.map((file) => [file.slug, { title: file.frontmatter.title, texts: [JSON.stringify(file.frontmatter), file.content] }]));
  const titleOf = (value: unknown) => {
    const title = (value as { frontmatter?: { title?: unknown } } | null)?.frontmatter?.title;
    return typeof title === 'string' ? title : null;
  };
  for (const doc of docs) {
    const title = titleOf(doc.draft) ?? titleOf(doc.published) ?? articles.get(doc.key)?.title ?? doc.key;
    articles.set(doc.key, { title, texts: [JSON.stringify(doc.draft ?? null), JSON.stringify(doc.published ?? null)] });
  }
  const history = versions.map((version) => ({ title: articles.get(version.document.key)?.title ?? version.document.key, texts: [JSON.stringify(version.data)] }));
  return combineUsage(usageByImage([...articles.values()]), usageByImage(history));
}

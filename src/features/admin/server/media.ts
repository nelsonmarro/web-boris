import 'server-only';
import fs from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { MEDIA_FILE, MEDIA_PREFIX } from '@/core/content/media-path';
import { processImage } from '../lib/image-processing';

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
  const alt = name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').trim();
  const asset = await prisma.mediaAsset.upsert({
    where: { filename: image.filename },
    create: { filename: image.filename, originalName: name, alt, width: image.width, height: image.height, bytes: image.data.length, uploadedById: userId },
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
        found.push({ path: rel, alt: entry.name.replace(IMAGE_EXTENSION, '').replace(/[_-]+/g, ' '), name: rel.replace('/assets/', '') });
      }
    }
  };
  if (existsSync(path.join(root, 'assets'))) walk(path.join(root, 'assets'));
  repoAssets = found.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return repoAssets;
}

/** Fichas (por su dirección) cuyo borrador o versión publicada usan `filename`. */
export async function mediaUsage(filename: string): Promise<string[]> {
  if (!MEDIA_FILE.test(filename)) return [];
  const needle = `%${MEDIA_PREFIX}${filename}%`;
  const rows = await prisma.$queryRaw<{ key: string }[]>(Prisma.sql`
    SELECT key FROM "CmsDocument" WHERE draft::text LIKE ${needle} OR published::text LIKE ${needle} ORDER BY key`);
  return rows.map((row) => row.key);
}

/** Borra una imagen que ninguna ficha usa. Devuelve las fichas que la usan si no se pudo borrar. */
export async function deleteUpload(id: string): Promise<{ deleted: boolean; usedBy: string[] }> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { deleted: false, usedBy: [] };
  const usedBy = await mediaUsage(asset.filename);
  if (usedBy.length > 0) return { deleted: false, usedBy };
  await prisma.mediaAsset.delete({ where: { id } });
  const file = mediaFilePath(asset.filename);
  if (file) await fs.rm(file, { force: true });
  return { deleted: true, usedBy: [] };
}

import { join, normalize, sep } from 'node:path';
import sharp from 'sharp';
import { coverCrop, parseObjectPosition } from './og-layout';

const PUBLIC_DIR = join(process.cwd(), 'public');

/**
 * La portada de la ficha, recortada al panel de la imagen social y en JPEG como `data:` URL. Satori (el motor de
 * `next/og`) no pinta WebP, y todas las portadas lo son: `sharp` la convierte y hace el `object-fit: cover` con el
 * `imagePosition` de la ficha. Solo rutas locales de `public/`; si falta o no se puede leer, `null` (placeholder).
 */
export async function loadCover(
  src: string,
  width: number,
  height: number,
  position: string | undefined,
): Promise<string | null> {
  if (!src.startsWith('/')) return null;
  try {
    const file = normalize(join(PUBLIC_DIR, decodeURI(src)));
    if (!file.startsWith(PUBLIC_DIR + sep)) return null;
    const image = sharp(file);
    const { width: srcWidth, height: srcHeight } = await image.metadata();
    if (!srcWidth || !srcHeight) return null;
    const crop = coverCrop(srcWidth, srcHeight, width, height, parseObjectPosition(position));
    const jpeg = await image
      .resize(crop.resizeWidth, crop.resizeHeight)
      .extract({ left: crop.left, top: crop.top, width, height })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch (error) {
    console.error(`[og] no se pudo leer la portada ${src}:`, error);
    return null;
  }
}

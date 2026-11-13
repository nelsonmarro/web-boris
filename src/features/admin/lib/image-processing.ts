/**
 * Recodificación de las imágenes que se suben al panel (spec CMS §4.6). Puro (sharp + node:crypto).
 * Nunca se guarda el archivo original: se decodifica y se vuelve a codificar a WebP, lo que descarta los metadatos
 * (EXIF con GPS, perfiles…) y cualquier contenido escondido tras la imagen. SVG no se admite (puede llevar scripts).
 */
import { createHash } from 'node:crypto';
import sharp from 'sharp';

/** Tamaño máximo del archivo subido. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
/** Píxeles máximos de la imagen de entrada: frena las «bombas» de descompresión. */
export const MAX_INPUT_PIXELS = 80_000_000;
/** Lado mayor de la imagen guardada (como el `magick -resize '2560x2560>'` de las importaciones a mano). */
export const MAX_SIDE = 2560;
export const ACCEPTED_FORMATS: ReadonlySet<string> = new Set(['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'heif']);

export class ImageRejected extends Error {}

export interface ProcessedImage {
  data: Buffer;
  /** `<32 hex del SHA-256 del resultado>.webp`: la misma imagen siempre da el mismo nombre. */
  filename: string;
  width: number;
  height: number;
}

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  if (input.length === 0) throw new ImageRejected('El archivo está vacío.');
  if (input.length > MAX_UPLOAD_BYTES) throw new ImageRejected(`La imagen pasa de ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`);
  let format: string | undefined;
  try {
    ({ format } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata());
  } catch (error) {
    if (error instanceof Error && /pixel limit/i.test(error.message)) throw new ImageRejected('La imagen tiene demasiados píxeles.');
    throw new ImageRejected('El archivo no es una imagen válida.');
  }
  if (!format || !ACCEPTED_FORMATS.has(format)) {
    throw new ImageRejected('Formato no admitido. Sube JPG, PNG, WebP, AVIF, GIF, TIFF o HEIC.');
  }
  try {
    const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error', animated: false })
      .rotate() // aplica la orientación EXIF antes de que se pierdan los metadatos
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 6, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
    const filename = `${createHash('sha256').update(data).digest('hex').slice(0, 32)}.webp`;
    return { data, filename, width: info.width, height: info.height };
  } catch (error) {
    const reason = error instanceof Error ? error.message : '';
    if (/pixel limit/i.test(reason)) throw new ImageRejected('La imagen tiene demasiados píxeles.');
    throw new ImageRejected('No se pudo leer la imagen (¿está dañada?).');
  }
}

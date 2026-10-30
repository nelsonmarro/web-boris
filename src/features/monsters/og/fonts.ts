import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Las dos tipografías de marca (OFL, licencias junto a los archivos): Unbounded para el título, Barlow Condensed para el resto. */
export const OG_FONT_TITLE = 'Unbounded';
export const OG_FONT_TEXT = 'Barlow Condensed';

const FONTS_DIR = join(process.cwd(), 'src/features/monsters/og/fonts');

type OgFont = { name: string; data: Buffer; weight: 600 | 700; style: 'normal' };

let fonts: Promise<OgFont[]> | undefined;

/** Se leen una vez por proceso (el build genera todas las imágenes de las fichas seguidas). WOFF: Satori no lee WOFF2. */
export function loadOgFonts(): Promise<OgFont[]> {
  fonts ??= Promise.all([
    readFile(join(FONTS_DIR, 'unbounded-latin-700-normal.woff')).then(
      (data): OgFont => ({ name: OG_FONT_TITLE, data, weight: 700, style: 'normal' }),
    ),
    readFile(join(FONTS_DIR, 'barlow-condensed-latin-600-normal.woff')).then(
      (data): OgFont => ({ name: OG_FONT_TEXT, data, weight: 600, style: 'normal' }),
    ),
    readFile(join(FONTS_DIR, 'barlow-condensed-latin-700-normal.woff')).then(
      (data): OgFont => ({ name: OG_FONT_TEXT, data, weight: 700, style: 'normal' }),
    ),
  ]).catch((error: unknown) => {
    fonts = undefined; // un fallo no se queda en caché: el siguiente intento vuelve a leer
    throw error;
  });
  return fonts;
}

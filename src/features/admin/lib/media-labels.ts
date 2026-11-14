/**
 * Nombres legibles de las imágenes de la web y en qué fichas se usa cada imagen (auditoría #18 y #19). Puro.
 */

const humanize = (text: string) => text.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

/** Nombre de cámara o del móvil («IMG_20230522_130038», «PXL_…», «DSC0042»…): no describe la imagen. */
const CAMERA = /^(?:IMG|PXL|DSC|DCIM|VID|Screenshot|WhatsApp Image)[_ -]?(\d{4})?(\d{2})?(\d{2})?/i;

/**
 * `/assets/Universo_Colosos/The_Bloop/The_Bloop_fauces.webp` → `{ group: 'Colosos › The Bloop', name: 'The Bloop fauces' }`.
 * Un nombre de cámara pasa a «Foto del 22/05/2023» (o «Foto sin nombre»).
 */
export function assetLabel(path: string): { group: string; name: string } {
  const parts = path.replace(/^\/assets\//, '').split('/');
  const file = parts.pop() ?? '';
  const folders = parts.map((part, i) => humanize(i === 0 ? part.replace(/^Universo_/, '') : part));
  const base = file.replace(/\.[a-z0-9]+$/i, '');
  const camera = CAMERA.exec(base);
  let name = humanize(base.replace(/\s*\(\d+\)$/, ''));
  if (camera) name = camera[1] && camera[2] && camera[3] ? `Foto del ${camera[3]}/${camera[2]}/${camera[1]}` : 'Foto sin nombre';
  return { group: folders.join(' › ') || 'Otras', name: name || 'Imagen' };
}

/** Rutas de imágenes (`/assets/…` o `/media/…`) que aparecen en un texto: MDX, frontmatter o JSON guardado. */
export function imageRefs(text: string): string[] {
  return [...new Set(text.match(/\/(?:assets|media)\/[^\s"'()<>\\]+?\.(?:webp|png|jpe?g|avif|gif)/gi) ?? [])];
}

/** Para cada ruta de imagen, los títulos de las fichas que la usan (sin repetir, en orden alfabético). */
export function usageByImage(articles: readonly { title: string; texts: readonly string[] }[]): Map<string, string[]> {
  const usage = new Map<string, Set<string>>();
  for (const article of articles) {
    for (const ref of article.texts.flatMap(imageRefs)) {
      const titles = usage.get(ref) ?? new Set<string>();
      titles.add(article.title);
      usage.set(ref, titles);
    }
  }
  return new Map([...usage].map(([ref, titles]) => [ref, [...titles].sort((a, b) => a.localeCompare(b, 'es'))]));
}

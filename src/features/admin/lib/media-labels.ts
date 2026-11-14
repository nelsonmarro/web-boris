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

/** Dónde se usa una imagen: fichas que la usan ahora (borrador, publicada o archivo) y otras que solo la tienen en su historial. */
export interface ImageUse {
  usedIn: string[];
  /** Fichas que ya no la usan, pero alguna versión anterior suya sí: recuperarla la necesitaría. */
  inHistory: string[];
}

/** Junta el uso actual y el del historial (sin repetir en el historial una ficha que ya la usa ahora). */
export function combineUsage(current: ReadonlyMap<string, string[]>, history: ReadonlyMap<string, string[]>): Map<string, ImageUse> {
  const combined = new Map<string, ImageUse>();
  for (const path of new Set([...current.keys(), ...history.keys()])) {
    const usedIn = current.get(path) ?? [];
    combined.set(path, { usedIn, inHistory: (history.get(path) ?? []).filter((title) => !usedIn.includes(title)) });
  }
  return combined;
}

const titles = (list: readonly string[]) => list.map((title) => `«${title}»`).join(', ');

/** Por qué no se puede borrar una imagen, o `null` si nada la usa (ni ahora ni en el historial). */
export function deleteBlockedReason(use: ImageUse | undefined): string | null {
  if (!use || (use.usedIn.length === 0 && use.inHistory.length === 0)) return null;
  if (use.usedIn.length) return `No se puede borrar: la usa${use.usedIn.length > 1 ? 'n las fichas' : ' la ficha'} ${titles(use.usedIn)}.`;
  return `No se puede borrar: la usa${use.inHistory.length > 1 ? 'n versiones anteriores de' : ' una versión anterior de'} ${titles(use.inHistory)}, y recuperarla la necesitaría.`;
}

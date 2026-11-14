/**
 * Manual del panel (`src/content/panel/guia.md`, en `/admin/ayuda`). Puro: imports relativos con `.ts`.
 * - Cada `## Sección` empieza con una frase que resume la tarea: es la descripción de su tarjeta en «¿Qué quieres hacer?».
 * - Las capturas van con `<Captura nombre="…" alt="…" pie="…" />` y viven en `src/content/panel/capturas/<nombre>.webp`
 *   (privadas: las sirve una ruta del panel que exige sesión). Sus números naranjas son los pasos de la lista de debajo.
 */
import { createSlugger } from '../../../utils/slugify.ts';

/** Nombre de una captura: minúsculas, números y guiones (sin rutas ni extensiones). */
export const GUIDE_IMAGE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const GUIDE_IMAGE_FILE = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.webp$/;

export const guideImageSrc = (name: string) => `/admin/ayuda/capturas/${name}.webp`;

export interface GuideSection {
  /** El mismo `id` que `rehypeHeadingIds` da al `h2` (el slugger recorre h2 y h3 en orden). */
  id: string;
  title: string;
  /** La primera frase de la sección. */
  summary: string;
}

/** Secciones `##` del manual con su ancla y su resumen, para el índice de tareas. */
export function guideSections(markdown: string): GuideSection[] {
  const slug = createSlugger();
  const sections: GuideSection[] = [];
  let current: GuideSection | null = null;
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      const id = slug(heading[2]);
      current = heading[1] === '##' ? { id, title: heading[2], summary: '' } : null;
      if (current) sections.push(current);
      continue;
    }
    // El resumen es el primer párrafo normal tras el título (no una captura, una lista ni un aviso).
    if (current && !current.summary && line && !/^[<>\-*\d|`]/.test(line)) current.summary = line;
  }
  return sections;
}

/** Nombres de las capturas que usa el manual. */
export function guideImageNames(markdown: string): string[] {
  return [...markdown.matchAll(/<Captura\s[^>]*nombre="([^"]+)"/g)].map((match) => match[1]);
}

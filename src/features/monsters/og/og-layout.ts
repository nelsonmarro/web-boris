// Lógica pura de la imagen para compartir de cada ficha (spec UX fase 2 §6): sin `next/og` ni `sharp`, probada con node:test.
import type { WikiFrontmatter } from '../../../core/types/wiki.ts';
import { getThreatLevel, type ThreatTone } from '../lib/stats.ts';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
/** Ancho del panel de la portada, pegado al borde derecho y a toda la altura. */
export const OG_COVER_WIDTH = 560;
/** Ancho útil del título en la columna izquierda. */
export const OG_TITLE_WIDTH = 600;

export interface OgFact {
  label: string;
  value: string;
  tone?: ThreatTone;
}

/** Longitud · Amenaza · Peso, como la línea de datos de la cabecera de la ficha, sin los que falten (como mucho 3). */
export function ogFacts(stats: WikiFrontmatter['stats']): OgFact[] {
  if (!stats) return [];
  const facts: OgFact[] = [];
  if (typeof stats.length === 'number' && Number.isFinite(stats.length)) {
    facts.push({ label: 'Longitud', value: `${stats.length.toLocaleString('es-ES')} m` });
  }
  const threat = getThreatLevel(stats.hostility);
  if (threat) facts.push({ label: 'Amenaza', value: threat.label, tone: threat.tone });
  // «No determinado» no es un dato: en una imagen para compartir solo ocupa sitio.
  if (stats.weight && !/^no determinad/i.test(stats.weight.trim())) {
    facts.push({ label: 'Peso', value: clampText(stats.weight, 22) });
  }
  return facts.slice(0, 3);
}

/**
 * Ancho medio de un carácter de Unbounded Bold, en em (es una tipografía muy ancha). Medido sobre las imágenes:
 * «macrostoma» ocupa 0,82 em por letra; con el margen, ninguna palabra se sale de la columna.
 */
export const UNBOUNDED_EM = 0.84;
const TITLE_SIZES = [76, 64, 56, 48, 42, 36] as const;

/**
 * Cuerpo del título: el mayor en el que la palabra más larga cabe en una línea y el título entero en dos líneas (en
 * tres si en dos no cabe ni con el menor). Es una estimación (no hay medida real de texto antes de Satori).
 */
export function titleFontSize(title: string, width = OG_TITLE_WIDTH): number {
  const words = title.trim().split(/\s+/);
  const longest = Math.max(...words.map((w) => w.length));
  for (const maxLines of [2, 3]) {
    for (const size of TITLE_SIZES) {
      const charW = size * UNBOUNDED_EM;
      if (longest * charW > width) continue;
      if (estimateLines(words, Math.floor(width / charW)) <= maxLines) return size;
    }
  }
  return TITLE_SIZES[TITLE_SIZES.length - 1];
}

/** Líneas que ocupa un texto partido por palabras con `perLine` caracteres por línea. */
function estimateLines(words: string[], perLine: number): number {
  let lines = 1;
  let used = 0;
  for (const word of words) {
    const need = used === 0 ? word.length : used + 1 + word.length;
    if (need <= perLine) {
      used = need;
    } else {
      lines += 1;
      used = word.length;
    }
  }
  return lines;
}

/** Recorta un texto en el último límite de palabra antes de `max` caracteres y añade «…». */
export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:—-]+$/, '')}…`;
}

const KEYWORDS: Record<string, number> = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };

/**
 * `object-position` de CSS (`"50% 20%"`, `"center top"`…) a fracciones 0-1. Si falta o no se entiende, el mismo
 * encuadre por defecto que la cabecera de la ficha (`50% 30%`).
 */
export function parseObjectPosition(position: string | undefined): [number, number] {
  const fallback: [number, number] = [0.5, 0.3];
  if (!position) return fallback;
  const parts = position.trim().toLowerCase().split(/\s+/);
  const toFraction = (part: string | undefined, def: number): number | null => {
    if (part === undefined) return def;
    if (part in KEYWORDS) return KEYWORDS[part];
    const match = /^(-?\d+(?:\.\d+)?)%$/.exec(part);
    return match ? Math.max(0, Math.min(1, Number(match[1]) / 100)) : null;
  };
  let [first, second] = parts;
  // `top`/`bottom` primero («top center»): es la coordenada vertical.
  if (first === 'top' || first === 'bottom') [first, second] = [second ?? 'center', first];
  const x = toFraction(first, 0.5);
  const y = toFraction(second, 0.5);
  return x === null || y === null ? fallback : [x, y];
}

export interface CoverCrop {
  /** Tamaño al que se escala la imagen antes de recortar (cubre la caja, como `object-fit: cover`). */
  resizeWidth: number;
  resizeHeight: number;
  /** Esquina del recorte de `boxWidth`×`boxHeight` dentro de la imagen escalada. */
  left: number;
  top: number;
}

/** `object-fit: cover` + `object-position` resueltos a un escalado y un recorte exactos (para `sharp`). */
export function coverCrop(
  srcWidth: number,
  srcHeight: number,
  boxWidth: number,
  boxHeight: number,
  [x, y]: [number, number],
): CoverCrop {
  const scale = Math.max(boxWidth / srcWidth, boxHeight / srcHeight);
  const resizeWidth = Math.max(boxWidth, Math.round(srcWidth * scale));
  const resizeHeight = Math.max(boxHeight, Math.round(srcHeight * scale));
  return {
    resizeWidth,
    resizeHeight,
    left: Math.round((resizeWidth - boxWidth) * x),
    top: Math.round((resizeHeight - boxHeight) * y),
  };
}

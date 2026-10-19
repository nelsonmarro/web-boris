/**
 * Cuántos apartados `##` de una ficha tienen contenido canónico y cuáles siguen pendientes
 * (solo `<Proximamente />`). Puro (lo prueba node:test): sin imports.
 */

export interface SectionCompleteness {
  /** Apartados con texto propio. */
  done: number;
  /** Apartados contados (sin "Referencias"). */
  total: number;
  /** Títulos de los apartados que solo tienen `<Proximamente />`, en orden. */
  pending: string[];
}

/** Elementos `<Proximamente …/>` o `<Proximamente …>…</Proximamente>`: su texto es el aviso, no lore. */
const PROXIMAMENTE_ELEMENT = /<Proximamente(?=[\s/>])(?:\s(?:[^>"'{]|"[^"]*"|'[^']*'|\{[^}]*\})*)?(?:\/>|>[\s\S]*?<\/Proximamente\s*>)/g;
const COMMENTS = /\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->/g;
/** Etiqueta JSX de apertura, cierre o autocierre; admite atributos en varias líneas. */
const JSX_TAG = /<\/?[A-Za-z][\w.]*(?:\s(?:[^>"'{]|"[^"]*"|'[^']*'|\{[^}]*\})*)?\/?>/g;

function isReferencias(title: string): boolean {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase() === 'referencias';
}

/** Parte el cuerpo en apartados `##` (nunca `###`), sin mirar dentro de bloques de código. */
function splitSections(mdx: string): { title: string; body: string }[] {
  const sections: { title: string; lines: string[] }[] = [];
  let fence: string | null = null;
  for (const line of mdx.split(/\r?\n/)) {
    const marker = line.match(/^\s*(```+|~~~+)/)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0];
      else if (marker[0] === fence) fence = null;
    }
    const heading = fence === null && !marker ? line.match(/^##[ \t]+(.+?)[ \t]*#*[ \t]*$/) : null;
    if (heading) sections.push({ title: heading[1].trim(), lines: [] });
    else sections.at(-1)?.lines.push(line);
  }
  return sections.map((s) => ({ title: s.title, body: s.lines.join('\n') }));
}

/** Un apartado está pendiente si tiene `<Proximamente` y, quitado este, ningún texto (etiquetas y comentarios no cuentan). */
function isPending(body: string): boolean {
  if (!/<Proximamente(?=[\s/>])/.test(body)) return false;
  const rest = body.replace(PROXIMAMENTE_ELEMENT, ' ').replace(COMMENTS, ' ').replace(JSX_TAG, ' ');
  return rest.trim() === '';
}

export function sectionCompleteness(mdx: string): SectionCompleteness {
  const sections = splitSections(mdx).filter((s) => !isReferencias(s.title));
  const pending = sections.filter((s) => isPending(s.body)).map((s) => s.title);
  return { done: sections.length - pending.length, total: sections.length, pending };
}

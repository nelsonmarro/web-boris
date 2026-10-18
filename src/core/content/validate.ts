/** Referencias cruzadas del contenido del hub contra los artículos. Puro. */
import type { CuratedPoll, NewsEntry } from './schemas.ts';

/** Rutas propias (no MDX) a las que puede enlazar una novedad. */
const STATIC_ROUTES = new Set(['/', '/wiki', '/wiki/arena', '/comunidad']);

export function crossCheckPolls(
  polls: readonly CuratedPoll[],
  articleSlugs: ReadonlySet<string>,
  fighterSlugs: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  for (const p of polls) {
    for (const slug of [p.a, p.b]) {
      if (!articleSlugs.has(slug)) errors.push(`encuestas.json ${p.semana}: "${slug}" no existe en src/content`);
      else if (!fighterSlugs.has(slug)) errors.push(`encuestas.json ${p.semana}: "${slug}" no tiene stats`);
    }
  }
  return errors;
}

export function crossCheckNews(news: readonly NewsEntry[], articleSlugs: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  for (const n of news) {
    if (!n.enlace.startsWith('/')) continue; // externos (https://) no se comprueban
    const pathOnly = n.enlace.split(/[?#]/)[0];
    const article = pathOnly.match(/^\/wiki\/([^/]+)$/)?.[1];
    const ok = STATIC_ROUTES.has(pathOnly) || (article !== undefined && articleSlugs.has(article));
    if (!ok) errors.push(`novedades/${n.id}.md: enlace interno inexistente ${n.enlace}`);
  }
  return errors;
}

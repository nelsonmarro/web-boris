/** Referencias cruzadas del contenido del hub contra los artículos. Puro. */
import { normalize } from '../search/entity-index.ts';
import type { CuratedPoll, NewsEntry, VideoLink } from './schemas.ts';

/** Rutas propias (no MDX) a las que puede enlazar una novedad. */
const STATIC_ROUTES = new Set(['/', '/wiki', '/wiki/arena', '/comunidad']);

/**
 * `duelo`: a y b deben existir y tener stats (la Arena). `desclasificar`: a y b deben existir y estar
 * sellados (`status: proximamente`); no piden stats.
 */
export function crossCheckPolls(
  polls: readonly CuratedPoll[],
  articleSlugs: ReadonlySet<string>,
  fighterSlugs: ReadonlySet<string>,
  sealedSlugs: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  for (const p of polls) {
    for (const slug of [p.a, p.b]) {
      if (!articleSlugs.has(slug)) errors.push(`encuestas.json ${p.semana}: "${slug}" no existe en src/content`);
      else if (p.tipo === 'desclasificar') {
        if (!sealedSlugs.has(slug)) {
          errors.push(`encuestas.json ${p.semana}: "${slug}" no es un expediente sellado (status: proximamente)`);
        }
      } else if (!fighterSlugs.has(slug)) errors.push(`encuestas.json ${p.semana}: "${slug}" no tiene stats`);
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

/** `videos.json`: cada ficha de cada vídeo debe existir en src/content. (El formato del id ya lo valida el esquema.) */
export function crossCheckVideoLinks(links: readonly VideoLink[], articleSlugs: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  for (const l of links) {
    for (const slug of l.fichas) {
      if (!articleSlugs.has(slug)) errors.push(`videos.json ${l.id}: "${slug}" no existe en src/content`);
    }
  }
  return errors;
}

/** Apodos (`aliases`) y `related` de las fichas: sin duplicados, sin colisión con títulos y apuntando a fichas que existen. */
export function crossCheckEntities(
  items: readonly { slug: string; title: string; aliases?: readonly string[]; related?: readonly string[] }[],
): string[] {
  const errors: string[] = [];
  const titles = new Map(items.map((i) => [normalize(i.title), i.slug]));
  const aliasOwner = new Map<string, string>();
  const slugs = new Set(items.map((i) => i.slug));
  for (const item of items) {
    for (const alias of item.aliases ?? []) {
      const n = normalize(alias);
      if (!n) {
        errors.push(`apodo "${alias}" de ${item.slug} queda vacío al normalizar`);
        continue;
      }
      const owner = aliasOwner.get(n);
      if (owner && owner !== item.slug) errors.push(`apodo "${alias}" repetido en ${owner} y ${item.slug}`);
      aliasOwner.set(n, item.slug);
      const titled = titles.get(n);
      if (titled && titled !== item.slug) errors.push(`apodo "${alias}" de ${item.slug} es el título de ${titled}`);
    }
    const seenRelated = new Set<string>();
    for (const rel of item.related ?? []) {
      if (seenRelated.has(rel)) {
        errors.push(`related de ${item.slug} repite "${rel}"`);
        continue;
      }
      seenRelated.add(rel);
      if (rel === item.slug) errors.push(`related de ${item.slug} se apunta a sí misma`);
      else if (!slugs.has(rel)) errors.push(`related de ${item.slug} apunta a "${rel}", que no existe`);
    }
  }
  return errors;
}

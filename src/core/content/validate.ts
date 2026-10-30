/** Referencias cruzadas del contenido del hub contra los artículos. Puro. */
import { isoWeekKey } from './iso-week.ts';
import { normalize } from '../search/entity-index.ts';
import { RESERVED_SLUGS, STATIC_WIKI_ROUTES } from '../search/wiki-routes.ts';
import { isIndexCategory } from '../search/catalog.ts';
import type { CuratedPoll, NewsEntry, StoryOrderEntry, VideoLink } from './schemas.ts';

/** Rutas propias (no MDX) a las que puede enlazar una novedad. */
const STATIC_ROUTES: ReadonlySet<string> = new Set(['/', '/wiki', '/comunidad', ...STATIC_WIKI_ROUTES]);

/** Un MDX no puede llamarse como una ruta estática de la wiki (`arena`, `registro`, `aleatorio`): la ruta ganaría y la ficha sería inalcanzable. */
export function crossCheckReservedSlugs(slugs: Iterable<string>): string[] {
  const errors: string[] = [];
  const present = new Set(slugs);
  for (const slug of RESERVED_SLUGS) {
    if (present.has(slug)) {
      errors.push(`src/content/${slug}.mdx: "${slug}" es un nombre reservado (ruta estática /wiki/${slug}); renombra la ficha`);
    }
  }
  return errors;
}

/** `-vs-` dentro del slug, o `-vs` al final: el corte de `parsePollId` caería dentro del nombre. */
const POLL_SEPARATOR_IN_SLUG = /-vs(?:-|$)/;

/**
 * El id de una encuesta es `<semana>-<a>-vs-<b>` y el historial de /comunidad lo parte por el primer `-vs-`
 * (`parsePollId`). Un slug que contenga `-vs-` o acabe en `-vs` partiría mal sus encuestas: se rechaza.
 */
export function crossCheckPollIdSlugs(slugs: Iterable<string>): string[] {
  const errors: string[] = [];
  for (const slug of slugs) {
    if (POLL_SEPARATOR_IN_SLUG.test(slug)) {
      errors.push(
        `src/content/${slug}.mdx: "${slug}" contiene "-vs-" (o acaba en "-vs"), que separa las opciones en el id de una encuesta; renombra la ficha`,
      );
    }
  }
  return errors;
}

/**
 * `HERO_POOL` (expedientes que pueden abrir la landing, spec 2026-10-27 §3): cada slug debe existir y no estar sellado
 * (`status: proximamente`), y cada entrada necesita una imagen que el hero pinte a pantalla completa: su toma propia
 * (`image`, que debe existir en public/: lo dice `assetExists`) o, si no la trae, la `image` de la ficha.
 */
export function crossCheckHeroPool(
  pool: readonly { slug: string; image?: string }[],
  articleSlugs: ReadonlySet<string>,
  imageSlugs: ReadonlySet<string>,
  sealedSlugs: ReadonlySet<string>,
  assetExists: (publicPath: string) => boolean,
): string[] {
  const errors: string[] = [];
  for (const { slug, image } of pool) {
    if (!articleSlugs.has(slug)) {
      errors.push(`hero-pool.ts: "${slug}" no existe en src/content`);
      continue;
    }
    if (image !== undefined) {
      if (!assetExists(image)) errors.push(`hero-pool.ts: "${slug}": la imagen ${image} no existe en public/`);
    } else if (!imageSlugs.has(slug)) {
      errors.push(`hero-pool.ts: "${slug}" no trae \`image\` y su ficha tampoco (el hero necesita una imagen)`);
    }
    if (sealedSlugs.has(slug)) {
      errors.push(`hero-pool.ts: "${slug}" es un expediente sellado (status: proximamente) y no puede abrir la landing`);
    }
  }
  return errors;
}

/** `START_HERE` («Empieza por aquí» de /wiki, spec 2026-10-29 §C): cada slug debe existir y no estar sellado. */
export function crossCheckStartHere(
  slugsList: readonly string[],
  articleSlugs: ReadonlySet<string>,
  sealedSlugs: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  for (const slug of slugsList) {
    if (!articleSlugs.has(slug)) errors.push(`start-here.ts: "${slug}" no existe en src/content`);
    else if (sealedSlugs.has(slug)) errors.push(`start-here.ts: "${slug}" es un expediente sellado (status: proximamente)`);
  }
  return errors;
}

/**
 * `duelo`: a y b deben existir y tener stats (la Arena). `desclasificar`: a y b deben existir y, mientras la
 * votación es de una semana estrictamente futura respecto a `now`, estar sellados (`status: proximamente`). En la
 * semana actual y las pasadas basta con que existan: que Boris desclasifique una ficha es justo el resultado esperado.
 * La semana es la ISO de `iso-week` (`YYYY-Www`, que se ordena como texto).
 */
export function crossCheckPolls(
  polls: readonly CuratedPoll[],
  articleSlugs: ReadonlySet<string>,
  fighterSlugs: ReadonlySet<string>,
  sealedSlugs: ReadonlySet<string>,
  now: Date = new Date(),
): string[] {
  const errors: string[] = [];
  const currentWeek = isoWeekKey(now);
  for (const p of polls) {
    const future = p.semana > currentWeek;
    for (const slug of [p.a, p.b]) {
      if (!articleSlugs.has(slug)) errors.push(`encuestas.json ${p.semana}: "${slug}" no existe en src/content`);
      else if (p.tipo === 'desclasificar') {
        if (future && !sealedSlugs.has(slug)) {
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

/**
 * `videos.json`: cada ficha de cada vídeo debe existir en src/content, y un vídeo que no está en `FEATURED_VIDEOS`
 * (`featuredIds`) tiene que traer `titulo`: el feed del canal no se conoce al validar y sin título no hay qué mostrar.
 * (El formato del id ya lo valida el esquema.)
 */
export function crossCheckVideoLinks(
  links: readonly VideoLink[],
  articleSlugs: ReadonlySet<string>,
  featuredIds: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  for (const l of links) {
    for (const slug of l.fichas) {
      if (!articleSlugs.has(slug)) errors.push(`videos.json ${l.id}: "${slug}" no existe en src/content`);
    }
    if (!featuredIds.has(l.id) && !l.titulo) {
      errors.push(`videos.json ${l.id}: no está en FEATURED_VIDEOS y no trae "titulo" (sin título no se puede mostrar en «Aparece en»)`);
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

/** Lo que `checkArticleStandard` necesita de cada ficha (el script lo saca del frontmatter y del cuerpo MDX). */
export interface ArticleStandardInput {
  slug: string;
  category?: string;
  status?: string;
  description?: string;
  image?: string;
  imageCaption?: string;
  /** Secciones del `infobox` del frontmatter (la automática «Expediente» no cuenta). */
  infoboxSections: number;
  /** Títulos de los apartados `##` del cuerpo, en orden (fuera de bloques de código). */
  h2Titles: readonly string[];
}

const isReferencias = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase() === 'referencias';

/**
 * Estándar de ficha (spec 2026-10-27 «fichas estándar» §2 y §4): toda ficha que no es índice (Directorio/Categoría)
 * ni está sellada (`status: proximamente`) debe tener `description`, `imageCaption` si tiene `image`, un `infobox`
 * con al menos una sección propia y al menos dos apartados `##` sin contar «Referencias». Un error por regla incumplida.
 */
export function checkArticleStandard(articles: readonly ArticleStandardInput[]): string[] {
  const errors: string[] = [];
  for (const a of articles) {
    if (isIndexCategory(a.category) || a.status === 'proximamente') continue;
    const file = `src/content/${a.slug}.mdx`;
    if (!a.description?.trim()) errors.push(`${file}: falta \`description\``);
    if (a.image && !a.imageCaption?.trim()) errors.push(`${file}: tiene \`image\` pero falta \`imageCaption\``);
    if (a.infoboxSections < 1) errors.push(`${file}: el \`infobox\` necesita al menos una sección propia (además de «Expediente»)`);
    const sections = a.h2Titles.filter((t) => !isReferencias(t)).length;
    if (sections < 2) {
      errors.push(`${file}: tiene ${sections} apartado(s) \`##\` sin contar Referencias; el estándar pide al menos 2 (los vacíos llevan <Proximamente />)`);
    }
  }
  return errors;
}

const isPreguntasFrecuentes = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase() === 'preguntas frecuentes';

/**
 * `faq` del frontmatter: la ficha pinta su propia sección «Preguntas frecuentes» al final del cuerpo. Si el MDX ya tiene
 * un apartado `## Preguntas frecuentes`, saldría dos veces (y con el mismo ancla): se pide usar solo el frontmatter.
 * (Que cada pregunta y respuesta no esté vacía, y que no haya más de 10, lo valida `FaqSchema`.)
 */
export function checkFaqSection(
  articles: readonly { slug: string; faqCount: number; h2Titles: readonly string[] }[],
): string[] {
  const errors: string[] = [];
  for (const a of articles) {
    if (a.faqCount > 0 && a.h2Titles.some(isPreguntasFrecuentes)) {
      errors.push(
        `src/content/${a.slug}.mdx: tiene \`faq\` en el frontmatter y además un apartado «## Preguntas frecuentes»; deja solo el \`faq\``,
      );
    }
  }
  return errors;
}

/**
 * `orden-historia.json`: cada `universo` debe ser un universo con fichas (`universeKey` de `universes.ts`) y cada id,
 * un vídeo de `canal.json` (la instantánea del canal: el orden de la historia solo puede usar vídeos que existen).
 */
export function crossCheckStoryOrder(
  entries: readonly StoryOrderEntry[],
  universeKeys: ReadonlySet<string>,
  canalIds: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  for (const e of entries) {
    if (!universeKeys.has(e.universo)) {
      errors.push(`orden-historia.json: "${e.universo}" no es un universo de universes.ts (universeKey)`);
    }
    for (const id of e.ids) {
      if (!canalIds.has(id)) errors.push(`orden-historia.json ${e.universo}: el vídeo ${id} no está en canal.json`);
    }
  }
  return errors;
}

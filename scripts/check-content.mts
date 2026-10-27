/**
 * Checks de contenido de la wiki (issue #13).
 * Uso: npm run check:content  (Node >= 22.6 con --experimental-strip-types)
 *
 * Falla (exit 1) si:
 *  1. Algún MDX de src/content no cumple WikiFrontmatterSchema.
 *  2. Algún `url: "/wiki/<slug>"` de wiki-navigation.ts no tiene su .mdx ni ruta estática.
 *  3. Algún `universeKey` de universes.ts no tiene al menos un artículo.
 *  4. Alguna ruta /assets/... referenciada en MDX o universes.ts no existe en public/.
 *  5. Algún MDX usa el logo (Branding/) o el esquema del sitio (Esquemas/) como imagen:
 *     no representan lore; sin arte concreto se omite la portada (placeholder por categoría).
 *  6. Las novedades (src/content/novedades/*.md) o las encuestas (src/content/encuestas.json) no cumplen su esquema,
 *     un duelo usa una criatura inexistente o sin stats, una encuesta `desclasificar` de una semana futura usa una
 *     ficha que no está sellada (`status: proximamente`; en la semana actual y las pasadas basta con que exista), o
 *     una novedad enlaza a una ruta interna inexistente (las rutas estáticas /wiki/arena, /wiki/registro y
 *     /wiki/aleatorio sí valen). Además, cada novedad se llama `<yyyy-mm-dd>-<slug>.md` con la fecha de su `fecha`,
 *     un enlace externo solo puede ser de YouTube y un frontmatter YAML mal formado se reporta como error.
 *  7. Los apodos (`aliases`) se repiten entre fichas o coinciden con el título de otra, o un `related` apunta a sí
 *     misma o a una ficha inexistente.
 *  8. `videos.json` (relaciones vídeo ↔ ficha de «Aparece en») no cumple su esquema (id de YouTube de 11 caracteres,
 *     fichas sin repetir, vídeo sin repetir, `titulo` de 1 a 200 caracteres), nombra una ficha que no existe en
 *     src/content o trae un id que no está en FEATURED_VIDEOS sin `titulo`.
 *  9. Un MDX usa como slug un nombre reservado por una ruta estática (`arena`, `registro`, `aleatorio`) o un slug
 *     que contiene `-vs-` (o acaba en `-vs`), que rompería el id de sus encuestas (`<semana>-<a>-vs-<b>`).
 * 10. Un slug de HERO_POOL (src/features/marketing/config/hero-pool.ts) no existe en src/content o está sellado
 *     (`status: proximamente`), su toma propia (`image`) no existe en public/, o no trae toma y su ficha no tiene
 *     `image`.
 * 11. Una ficha que no es índice (Directorio/Categoría) ni está sellada (`status: proximamente`) no cumple el estándar
 *     (spec 2026-10-27 «fichas estándar» §4): le falta `description`, `imageCaption` teniendo `image`, una sección
 *     propia en el `infobox` o dos apartados `##` (sin contar Referencias; los `##` de bloques de código no cuentan).
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { WikiFrontmatterSchema } from '../src/core/types/wiki.ts';
import { readCuratedPolls, readNews, readVideoLinks } from '../src/core/content/readers.ts';
import {
  type ArticleStandardInput,
  checkArticleStandard,
  crossCheckEntities,
  crossCheckHeroPool,
  crossCheckNews,
  crossCheckPollIdSlugs,
  crossCheckPolls,
  crossCheckReservedSlugs,
  crossCheckVideoLinks,
} from '../src/core/content/validate.ts';
// Solo datos, sin dependencias de servidor: se pueden leer desde el script.
import { FEATURED_VIDEOS } from '../src/features/marketing/config/videos.ts';
import { HERO_POOL } from '../src/features/marketing/config/hero-pool.ts';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const NAV_FILE = path.join(ROOT, 'src', 'features', 'monsters', 'config', 'wiki-navigation.ts');
const UNIVERSES_FILE = path.join(ROOT, 'src', 'features', 'marketing', 'config', 'universes.ts');
const WIKI_APP_DIR = path.join(ROOT, 'src', 'app', '(wiki)', 'wiki');
const PUBLIC_DIR = path.join(ROOT, 'public');

const problems: Record<string, string[]> = {
  'Frontmatter inválido': [],
  'Navegación sin artículo': [],
  'Universo sin artículos': [],
  'Assets inexistentes': [],
  'Imagen que no es lore': [],
  'Comunidad (novedades / encuestas)': [],
  'Apodos y relacionados': [],
  'Vídeos ↔ fichas (videos.json)': [],
  'Slugs reservados': [],
  'Hero de la landing (HERO_POOL)': [],
  'Ficha fuera del estándar': [],
};

const NON_LORE_ASSETS = ['/assets/Branding/', '/assets/Universo_Colosos/Esquemas/'];

const mdxFiles = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx')).sort();
const slugs = new Set(mdxFiles.map((f) => f.replace(/\.mdx$/, '')));
const universesWithArticles = new Set<string>();
const fighterSlugs = new Set<string>();
const sealedSlugs = new Set<string>();
const imageSlugs = new Set<string>();
const entityItems: { slug: string; title: string; aliases?: string[]; related?: string[] }[] = [];
const standardItems: ArticleStandardInput[] = [];

/** Títulos de los apartados `##` (nunca `###`) del cuerpo, sin mirar dentro de bloques de código ``` / ~~~. */
function h2Titles(body: string): string[] {
  const titles: string[] = [];
  let fence: string | null = null;
  for (const line of body.split(/\r?\n/)) {
    const marker = line.match(/^\s*(```+|~~~+)/)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0];
      else if (marker[0] === fence) fence = null;
      continue;
    }
    const heading = fence === null ? line.match(/^##[ \t]+(.+?)[ \t]*#*[ \t]*$/) : null;
    if (heading) titles.push(heading[1].trim());
  }
  return titles;
}

/** Extrae rutas /assets/... de un texto (MDX o TS). */
function extractAssets(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/\/assets\/[^"'`<>\s]+/g)) {
    let p = m[0];
    // Markdown `![](/assets/x.webp)`: el `)` final es del link, salvo nombres con "(1)".
    if (!assetExists(p) && p.endsWith(')') && assetExists(p.slice(0, -1))) p = p.slice(0, -1);
    found.add(p);
  }
  return [...found];
}

function assetExists(assetPath: string): boolean {
  let decoded = assetPath;
  try {
    decoded = decodeURIComponent(assetPath);
  } catch {
    // ruta con % mal formado: se comprueba tal cual
  }
  return existsSync(path.join(PUBLIC_DIR, decoded.split(/[?#]/)[0]));
}

// 1 + 4 (MDX)
for (const file of mdxFiles) {
  const raw = readFileSync(path.join(CONTENT_DIR, file), 'utf8');
  const { data, content } = matter(raw);
  const parsed = WikiFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      problems['Frontmatter inválido'].push(`${file}: ${issue.path.join('.') || '(raíz)'} — ${issue.message}`);
    }
  } else {
    universesWithArticles.add(parsed.data.universe);
    const stats = parsed.data.stats;
    if (stats && Object.keys(stats).length > 0) fighterSlugs.add(file.replace(/\.mdx$/, ''));
    if (parsed.data.status === 'proximamente') sealedSlugs.add(file.replace(/\.mdx$/, ''));
    if (parsed.data.image) imageSlugs.add(file.replace(/\.mdx$/, ''));
    entityItems.push({
      slug: file.replace(/\.mdx$/, ''),
      title: parsed.data.title,
      aliases: parsed.data.aliases,
      related: parsed.data.related,
    });
    standardItems.push({
      slug: file.replace(/\.mdx$/, ''),
      category: parsed.data.category,
      status: parsed.data.status,
      description: parsed.data.description,
      image: parsed.data.image,
      imageCaption: parsed.data.imageCaption,
      infoboxSections: Object.keys(parsed.data.infobox ?? {}).length,
      h2Titles: h2Titles(content),
    });
  }
  for (const asset of extractAssets(raw)) {
    if (!assetExists(asset)) problems['Assets inexistentes'].push(`${file}: ${asset}`);
    if (NON_LORE_ASSETS.some((prefix) => asset.startsWith(prefix))) problems['Imagen que no es lore'].push(`${file}: ${asset}`);
  }
}

// 2: navegación
const navSrc = readFileSync(NAV_FILE, 'utf8');
const navSlugs = new Set<string>();
for (const m of navSrc.matchAll(/url:\s*["']\/wiki\/([^"'#?]+)["']/g)) navSlugs.add(m[1]);
if (navSlugs.size === 0) problems['Navegación sin artículo'].push('no se encontraron entradas de navegación — ¿cambió el formato de wiki-navigation.ts?');
for (const slug of [...navSlugs].sort()) {
  // Válido si hay MDX o una ruta estática propia (p. ej. /wiki/arena → app/(wiki)/wiki/arena/page.tsx).
  const hasStaticRoute = existsSync(path.join(WIKI_APP_DIR, slug, 'page.tsx'));
  if (!slugs.has(slug) && !hasStaticRoute) problems['Navegación sin artículo'].push(`/wiki/${slug} → falta src/content/${slug}.mdx (ni ruta estática en app/(wiki)/wiki/${slug})`);
}

// 3 + 4 (universes.ts)
const uniSrc = readFileSync(UNIVERSES_FILE, 'utf8');
for (const m of uniSrc.matchAll(/universeKey:\s*['"]([^'"]+)['"]/g)) {
  if (!universesWithArticles.has(m[1])) {
    problems['Universo sin artículos'].push(`universeKey "${m[1]}" no tiene ningún artículo con ese \`universe:\``);
  }
}
for (const asset of extractAssets(uniSrc)) {
  if (!assetExists(asset)) problems['Assets inexistentes'].push(`universes.ts: ${asset}`);
}

// 6: hub /comunidad
const news = readNews(path.join(CONTENT_DIR, 'novedades'));
const polls = readCuratedPolls(path.join(CONTENT_DIR, 'encuestas.json'));
problems['Comunidad (novedades / encuestas)'].push(
  ...news.errors,
  ...polls.errors,
  ...crossCheckNews(news.items, slugs),
  ...crossCheckPolls(polls.items, slugs, fighterSlugs, sealedSlugs),
);

// 7: apodos y related
problems['Apodos y relacionados'].push(...crossCheckEntities(entityItems));

// 8: vídeos ↔ fichas
const videoLinks = readVideoLinks(path.join(CONTENT_DIR, 'videos.json'));
problems['Vídeos ↔ fichas (videos.json)'].push(
  ...videoLinks.errors,
  ...crossCheckVideoLinks(videoLinks.items, slugs, new Set(FEATURED_VIDEOS.map((v) => v.id))),
);

// 9: nombres reservados por rutas estáticas y slugs que romperían el id de una encuesta
problems['Slugs reservados'].push(...crossCheckReservedSlugs(slugs), ...crossCheckPollIdSlugs(slugs));

// 10: expedientes que pueden abrir la landing
problems['Hero de la landing (HERO_POOL)'].push(...crossCheckHeroPool(HERO_POOL, slugs, imageSlugs, sealedSlugs, assetExists));

// 11: estándar de ficha (descripción, pie de portada, infobox y apartados)
problems['Ficha fuera del estándar'].push(...checkArticleStandard(standardItems));

// Reporte
console.log(
  `check:content — ${mdxFiles.length} artículos, ${navSlugs.size} entradas de navegación, ${universesWithArticles.size} universos con contenido`,
);
let total = 0;
for (const [title, list] of Object.entries(problems)) {
  if (list.length === 0) continue;
  total += list.length;
  console.error(`\n✗ ${title} (${list.length})`);
  for (const item of list) console.error(`  - ${item}`);
}
if (total > 0) {
  console.error(`\n${total} problema(s) encontrados.`);
  process.exit(1);
}
console.log('✓ Todo en orden.');

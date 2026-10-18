/**
 * Checks de contenido de la wiki (issue #13).
 * Uso: npm run check:content  (Node >= 22.6 con --experimental-strip-types)
 *
 * Falla (exit 1) si:
 *  1. Algún MDX de src/content no cumple WikiFrontmatterSchema.
 *  2. Algún `url: "/wiki/<slug>"` de wiki-navigation.ts no tiene su .mdx ni ruta estática.
 *  3. Algún `universeKey` de universes.ts no tiene al menos un artículo.
 *  4. Alguna ruta /assets/... referenciada en MDX o universes.ts no existe en public/.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { WikiFrontmatterSchema } from '../src/core/types/wiki.ts';

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
};

const mdxFiles = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx')).sort();
const slugs = new Set(mdxFiles.map((f) => f.replace(/\.mdx$/, '')));
const universesWithArticles = new Set<string>();

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
  const { data } = matter(raw);
  const parsed = WikiFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      problems['Frontmatter inválido'].push(`${file}: ${issue.path.join('.') || '(raíz)'} — ${issue.message}`);
    }
  } else {
    universesWithArticles.add(parsed.data.universe);
  }
  for (const asset of extractAssets(raw)) {
    if (!assetExists(asset)) problems['Assets inexistentes'].push(`${file}: ${asset}`);
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

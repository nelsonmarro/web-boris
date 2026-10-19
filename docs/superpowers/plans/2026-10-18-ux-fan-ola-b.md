# UX fan · Ola B (descubrimiento) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que ningún clic del fan termine en un callejón sin salida.
- Los nombres del texto enlazan solos a su ficha.
- "Relacionados" sale de quién menciona a quién.
- Una única búsqueda (con apodos y erratas) se abre desde cualquier sitio.
- Los artículos largos tienen orientación en el móvil.
- Las fotos se ven en un visor dentro de la página.

**Architecture:**
- **Índice de entidades puro** en `src/core/search/` (`buildEntityIndex`, `findMentions`, `search`). El repositorio de contenido lo construye y lo cachea.
- **Lo consumen tres piezas:**
  - un plugin remark (enlaces automáticos);
  - un grafo de menciones (relacionados);
  - la paleta de búsqueda global y el explorador.
- **UI nueva** en componentes cliente aislados: paleta, barra de progreso, chip de apartado, carrusel y visor.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind v4, `next-mdx-remote-client/rsc` (remark/rehype), Zustand v5, TanStack Query v5, Base UI `Dialog`, `vaul` y `node:test` con strip-types.

**Spec:** `docs/superpowers/specs/2026-10-18-ux-fan-ola-b-design.md` (§ = sección de la spec).

## Global Constraints

- **Solo canon:**
  - no se escribe lore nuevo;
  - `aliases` solo con la tabla de la spec §6;
  - las etiquetas de interfaz sí se pueden escribir.
- **Sin dependencias nuevas:** `vaul`, `zustand`, `@base-ui/react`, `@tanstack/react-query` y `framer-motion` ya están en `package.json`.
- **"Ley Abisal":**
  - superficies sólidas `#061a2e` bajo el texto;
  - `.glass-liquid` solo en navbar, footer y botón secundario;
  - naranja `#FF7300` / `primary` solo para indicadores y estado activo;
  - texto ≥ 11 px y objetivos táctiles ≥ 44 px;
  - foco visible (`focus-visible:outline-hidden` + `ring`), nunca `outline-none`;
  - `motion-reduce:` sin animaciones.
- **Next 16:**
  - `typedRoutes` → `as Route` en los hrefs con query o con plantillas;
  - `next/image` con `fetchPriority="high"` + `loading="eager"`, nunca `priority`.
- **Módulos de `src/core/search/`:**
  - sin imports en tiempo de ejecución con alias `@/`;
  - entre ellos, rutas relativas con extensión `.ts` (`import { x } from './entity-index.ts'`);
  - los tests importan con ruta relativa (`../../src/core/search/x.ts`), como en `tests/community/*.test.ts`.
- **Validación de cada tarea:** `npx tsc --noEmit`, `npm run lint` (0 errores; hay 1 aviso previo en `.remember/` que no es nuestro), `npm test` y `npm run check:content`.
- **`npm run build`:** solo lo ejecuta el orquestador, porque `.next` es compartido.
- **Commits:** en español, Conventional Commits con scope `wiki`, `search` o `content`. Terminan con:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## File Structure

| Archivo | Tarea | Responsabilidad |
|---|---|---|
| `src/core/search/discovery-order.ts` (movido) | 1 | `richness`, `compareDiscovery` (los de la Ola A) |
| `src/features/monsters/lib/discovery-order.ts` | 1 | Reexporta desde el core |
| `src/core/search/entity-index.ts` | 1 | `normalize`, `wordsOf`, `buildEntityIndex`, `findMentions` |
| `src/core/search/search.ts` | 1 | `levenshtein`, `search`, `suggest` |
| `src/core/types/wiki.ts` | 1 | `aliases?`, `related?` en el esquema |
| `src/content/{el-gran-maja,slowdown-criyote,vlad-julia,le-mug,phiscanula-arcticum}.mdx` | 1 | `aliases:` (spec §6) |
| `src/core/content/validate.ts`, `scripts/check-content.mts` | 1 | `crossCheckEntities` |
| `src/core/content/entities.ts` | 1 (+2) | `getEntityIndex()` en caché (y `getMentionGraph()` en la tarea 2) |
| `src/core/search/extract-body-text.ts` | 2 | `extractBodyText`, `extractWikiLinks` |
| `src/core/search/mention-graph.ts` | 2 | `buildMentionGraph` |
| `src/core/search/related-rank.ts` | 2 | `rankRelated` |
| `src/utils/remark-entity-links.ts` | 2 | Plugin remark |
| `src/features/monsters/lib/related.ts` | 2 | Compone `rankRelated` |
| `src/features/monsters/components/wiki/mdx/MdxRenderer.tsx` | 2 | Componente `a` y `remarkPlugins` |
| `src/features/monsters/components/wiki/article/WikiArticleContent.tsx` | 2 | Pasa el índice; marcador `data-article-body` |
| `src/app/(wiki)/wiki/[slug]/page.tsx` | 2, después el orquestador | Obtiene el índice; montaje de piezas de las tareas 4 y 5 |
| `src/components/search/{useSearchPalette.ts,SearchPalette.tsx,SearchTrigger.tsx}` | 3 | Paleta global y disparadores |
| `src/app/layout.tsx`, `src/app/(wiki)/wiki/layout.tsx`, navbar de la landing | 3 | Montaje y disparadores |
| `src/features/marketing/components/hero/SearchBar.tsx` | 3 | Pasa a disparador |
| `src/features/monsters/actions/get-wiki-articles.ts`, `WikiList.tsx`, `WikiEmptyState.tsx` | 3 | Explorador con `search()` y estado vacío |
| `src/features/monsters/components/wiki/WikiCommandPalette.tsx` | 3 | Se elimina |
| `src/features/monsters/components/wiki/article/{ArticleProgress,SectionChip,RelatedCarousel}.tsx` | 4 | Orientación y carrusel |
| `WikiArticleFooter.tsx`, `WikiArticleCard.tsx` (`compact`), `mdx/WikiTOC.tsx` | 4 | Carrusel, tarjeta compacta, marcador `data-toc` |
| `src/features/monsters/components/wiki/mdx/{ArticleImages.tsx,ImageViewer.tsx}`, `WikiGallery.tsx` | 5 | Visor |

**Lotes de ejecución:**
- **Lote 1:** tarea 1.
- **Lote 2:** tareas 2 y 3 en paralelo (archivos disjuntos).
- **Lote 3:** tareas 4 y 5 en paralelo (archivos disjuntos). Ninguna toca `page.tsx`; el orquestador cablea sus componentes en `page.tsx`.
- **Tarea 6:** QA y entrega, a cargo del orquestador.

---

### Task 1: Núcleo — índice de entidades, búsqueda, apodos y validación

**Files:**
- Move: `src/features/monsters/lib/discovery-order.ts` → `src/core/search/discovery-order.ts`. Deja en la ruta antigua `export { richness, compareDiscovery } from '@/core/search/discovery-order'; export type { DiscoveryFields } from '@/core/search/discovery-order';`.
- Move: `tests/monsters/discovery-order.test.ts` → `tests/search/discovery-order.test.ts`, con el import `../../src/core/search/discovery-order.ts`. Borra `tests/monsters/` si queda vacío.
- Create: `src/core/search/entity-index.ts`, `src/core/search/search.ts`, `src/core/content/entities.ts`.
- Create: `tests/search/entity-index.test.ts`, `tests/search/search.test.ts`.
- Modify: `src/core/types/wiki.ts` (esquema), los 5 MDX de §6, `src/core/content/validate.ts`, `scripts/check-content.mts` y `tests/content/validate.test.ts`.

**Interfaces:**
- Produces, todo desde `src/core/search/entity-index.ts`:
  - `normalize(s: string): string`;
  - `wordsOf(text: string): Word[]`, con `Word = { raw: string; norm: string; start: number; end: number }`;
  - `interface IndexableArticle { slug: string; frontmatter: { title: string; universe: string; category?: string; status?: 'proximamente'; image?: string; imagePosition?: string; description?: string; aliases?: string[]; stats?: unknown; infobox?: Record<string, unknown> } }`;
  - `interface EntityEntry { slug; title; aliases: string[]; category?; universe; status?; image?; imagePosition?; description?; richness: number; linkable: boolean }`;
  - `interface EntityIndex { entries: EntityEntry[]; bySlug: Map<string, EntityEntry>; names: NameEntry[] }`, con `NameEntry = { slug: string; name: string; tokens: string[] }`, solo enlazables y ordenados por número de tokens descendente y luego por longitud;
  - `buildEntityIndex(articles: readonly IndexableArticle[]): EntityIndex`;
  - `interface Mention { slug: string; start: number; end: number; name: string }`;
  - `findMentions(text: string, index: EntityIndex, opts?: { self?: string }): Mention[]`.
- Produces, desde `src/core/search/search.ts`:
  - `levenshtein(a: string, b: string): number`;
  - `interface SearchHit { entry: EntityEntry; score: number; matchedAlias?: string }`;
  - `search(query: string, entries: readonly EntityEntry[], opts?: { limit?: number }): SearchHit[]`;
  - `suggest(query: string, entries: readonly EntityEntry[]): { slug: string; title: string } | null`.
- Produces, desde `src/core/content/entities.ts`: `getEntityIndex(): Promise<EntityIndex>` (React `cache`).

- [ ] **Step 1: Mover discovery-order** (sin cambiar código) y comprobar que `npm test` sigue en verde (34 tests).

- [ ] **Step 2: Escribir el test que falla del índice**

`tests/search/entity-index.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, wordsOf, buildEntityIndex, findMentions } from '../../src/core/search/entity-index.ts';

const art = (slug: string, title: string, extra: Record<string, unknown> = {}) => ({
  slug,
  frontmatter: { title, universe: 'Colosos', category: 'Coloso', ...extra },
});

const INDEX = buildEntityIndex([
  art('el-gran-maja', 'El Gran Majá', { aliases: ['Cranioplanus', 'anguila sonriente'] }),
  art('vlad', 'Vlad', { category: 'Humano' }),
  art('vlad-julia', 'Vlad Julia', { aliases: ['el pez cangrejo'] }),
  art('bogbo', 'Bogbo'),
  art('le-mug', "Le'Mug", { category: 'Titán' }),
  art('animales-colosos', 'Animales del Universo Colosos', { category: 'Directorio' }),
  art('cael-cortes', 'Cael Cortés', { category: 'Humano', status: 'proximamente' }),
]);

test('normalize quita tildes, apóstrofos y signos', () => {
  assert.equal(normalize("Le'Mug"), 'lemug');
  assert.equal(normalize('Capitán de Galeón'), 'capitan de galeon');
  assert.equal(normalize('  Slowdown-Criyonte!! '), 'slowdown criyonte');
});

test('wordsOf conserva posiciones originales', () => {
  const words = wordsOf("Vio a Le'Mug.");
  assert.deepEqual(words.map((w) => w.norm), ['vio', 'a', 'lemug']);
  assert.equal("Vio a Le'Mug.".slice(words[2].start, words[2].end), "Le'Mug");
});

test('gana el nombre más largo', () => {
  const m = findMentions('Vlad Julia ataca.', INDEX);
  assert.deepEqual(m.map((x) => x.slug), ['vlad-julia']);
});

test('límite de palabra: Bogbos no es Bogbo', () => {
  assert.equal(findMentions('Los Bogbos nadan.', INDEX).length, 0);
});

test('regla del nombre propio para nombres de una palabra', () => {
  assert.equal(findMentions('un bogbo cualquiera', INDEX).length, 0);
  assert.deepEqual(findMentions('Bogbo emergió', INDEX).map((x) => x.slug), ['bogbo']);
  assert.deepEqual(findMentions('la anguila sonriente', INDEX).map((x) => x.slug), ['el-gran-maja']);
  assert.equal(findMentions('cranioplanus', INDEX).length, 0);
});

test('nunca la propia ficha y nunca entidades no enlazables', () => {
  assert.equal(findMentions('El Gran Majá', INDEX, { self: 'el-gran-maja' }).length, 0);
  assert.equal(findMentions('Animales del Universo Colosos', INDEX).length, 0);
});

test('las entradas llevan richness y linkable', () => {
  const cael = INDEX.bySlug.get('cael-cortes')!;
  assert.ok(cael.richness < 0);
  assert.equal(INDEX.bySlug.get('animales-colosos')!.linkable, false);
  assert.equal(INDEX.bySlug.get('le-mug')!.linkable, true);
});
```

- [ ] **Step 3: Ejecutar y ver que falla.** `npm test`. Esperado: `ERR_MODULE_NOT_FOUND` en `entity-index.ts`.

- [ ] **Step 4: Implementar `src/core/search/entity-index.ts`**

```ts
/**
 * Índice de entidades del archivo (spec Ola B §3). Puro: lo usan los enlaces
 * automáticos, el grafo de menciones y la búsqueda. Sin imports con alias `@/`.
 */
import { richness } from './discovery-order.ts';

export interface Word { raw: string; norm: string; start: number; end: number }

export interface IndexableArticle {
  slug: string;
  frontmatter: {
    title: string;
    universe: string;
    category?: string;
    status?: 'proximamente';
    image?: string;
    imagePosition?: string;
    description?: string;
    aliases?: string[];
    stats?: unknown;
    infobox?: Record<string, unknown>;
  };
}

export interface EntityEntry {
  slug: string;
  title: string;
  aliases: string[];
  category?: string;
  universe: string;
  status?: 'proximamente';
  image?: string;
  imagePosition?: string;
  description?: string;
  richness: number;
  linkable: boolean;
}

export interface NameEntry { slug: string; name: string; tokens: string[] }

export interface EntityIndex {
  entries: EntityEntry[];
  bySlug: Map<string, EntityEntry>;
  names: NameEntry[];
}

export interface Mention { slug: string; start: number; end: number; name: string }

/** Categorías con nombre propio: se enlazan. Directorios, categorías e historias, no. */
export const LINKABLE_CATEGORIES = new Set([
  'Coloso', 'Titán', 'Animal', 'Especie', 'Humano', 'Organización', 'Vehículo', 'Entidad', 'Libro',
]);

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export function wordsOf(text: string): Word[] {
  const words: Word[] = [];
  for (const m of text.matchAll(WORD_RE)) {
    const start = m.index ?? 0;
    words.push({ raw: m[0], norm: normalize(m[0]), start, end: start + m[0].length });
  }
  return words;
}

const tokensOf = (name: string) => wordsOf(name).map((w) => w.norm).filter(Boolean);

export function buildEntityIndex(articles: readonly IndexableArticle[]): EntityIndex {
  const entries: EntityEntry[] = articles.map(({ slug, frontmatter: fm }) => ({
    slug,
    title: fm.title,
    aliases: fm.aliases ?? [],
    category: fm.category,
    universe: fm.universe,
    status: fm.status,
    image: fm.image,
    imagePosition: fm.imagePosition,
    description: fm.description,
    richness: richness(fm),
    linkable: !!fm.category && LINKABLE_CATEGORIES.has(fm.category),
  }));
  const names: NameEntry[] = entries
    .filter((e) => e.linkable)
    .flatMap((e) => [e.title, ...e.aliases].map((name) => ({ slug: e.slug, name, tokens: tokensOf(name) })))
    .filter((n) => n.tokens.length > 0)
    .sort((a, b) => b.tokens.length - a.tokens.length || b.name.length - a.name.length);
  return { entries, bySlug: new Map(entries.map((e) => [e.slug, e])), names };
}

const startsUpper = (s: string) => /^\p{Lu}/u.test(s);

export function findMentions(text: string, index: EntityIndex, opts: { self?: string } = {}): Mention[] {
  const words = wordsOf(text);
  const mentions: Mention[] = [];
  let i = 0;
  while (i < words.length) {
    let matched: NameEntry | undefined;
    for (const n of index.names) {
      if (n.slug === opts.self) continue;
      if (i + n.tokens.length > words.length) continue;
      let ok = true;
      for (let k = 0; k < n.tokens.length; k++) {
        if (words[i + k].norm !== n.tokens[k]) { ok = false; break; }
      }
      if (!ok) continue;
      if (n.tokens.length === 1 && !startsUpper(words[i].raw)) continue;
      matched = n;
      break;
    }
    if (matched) {
      const last = words[i + matched.tokens.length - 1];
      mentions.push({ slug: matched.slug, start: words[i].start, end: last.end, name: matched.name });
      i += matched.tokens.length;
    } else {
      i += 1;
    }
  }
  return mentions;
}
```

Nota: `richness(fm)` acepta el subconjunto `DiscoveryFields` sin `title`. Si TypeScript se queja del tipo de `stats`, ajusta `DiscoveryFields` en `discovery-order.ts` para aceptar `stats?: unknown` (ya lo hace).

- [ ] **Step 5: Ejecutar `npm test`.** Esperado: los tests de `entity-index` en verde.

- [ ] **Step 6: Escribir el test que falla de la búsqueda**

`tests/search/search.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntityIndex } from '../../src/core/search/entity-index.ts';
import { levenshtein, search, suggest } from '../../src/core/search/search.ts';

const art = (slug: string, title: string, extra: Record<string, unknown> = {}) => ({
  slug,
  frontmatter: { title, universe: 'Colosos', category: 'Coloso', image: '/assets/x.webp', ...extra },
});

const { entries } = buildEntityIndex([
  art('the-bloop', 'The Bloop Ojo Solo', { stats: {} }),
  art('phillip-forte', 'Phillip Forte', { category: 'Humano' }),
  art('vlad-julia', 'Vlad Julia', { aliases: ['el pez cangrejo'], stats: {} }),
  art('capitan-de-galeon', 'Capitán de Galeón', { category: 'Historia', universe: 'Capitán de Galeón' }),
  art('humanos-colosos', 'Humanos del Universo Colosos', { category: 'Directorio', description: 'Encabezados por Phillip Forte.' }),
  art('labodotype', 'Labodotype macrostoma', { category: 'Especie' }),
  art('cael-cortes', 'Cael Cortés', { category: 'Humano', status: 'proximamente' }),
  art('cael', 'Cael', { category: 'Humano' }),
]);

const slugs = (q: string) => search(q, entries).map((h) => h.entry.slug);

test('levenshtein', () => {
  assert.equal(levenshtein('philip', 'phillip'), 1);
  assert.equal(levenshtein('blopu', 'bloop'), 2);
});

test('palabras en cualquier orden', () => {
  assert.equal(slugs('bloop solo')[0], 'the-bloop');
  assert.equal(slugs('solo bloop')[0], 'the-bloop');
});

test('errata de una letra en palabras de 5 o más', () => {
  assert.equal(slugs('philip')[0], 'phillip-forte');
  assert.equal(slugs('bloup')[0], 'the-bloop');
});

test('apodo con matchedAlias', () => {
  const [hit] = search('cangrejo', entries);
  assert.equal(hit.entry.slug, 'vlad-julia');
  assert.equal(hit.matchedAlias, 'el pez cangrejo');
});

test('tildes y orden: la ficha va antes que el directorio', () => {
  assert.equal(slugs('galeon')[0], 'capitan-de-galeon');
  assert.deepEqual(slugs('phillip').slice(0, 2), ['phillip-forte', 'humanos-colosos']);
});

test('una palabra vacía sola no descarta todo', () => {
  assert.ok(slugs('la').includes('labodotype'));
});

test('título exacto primero; los Próximamente detrás de su grupo', () => {
  assert.equal(slugs('cael')[0], 'cael');
  assert.equal(slugs('cael c')[0], 'cael-cortes'); // 80 (el título empieza por la consulta) > 60
  const humanos = slugs('humano'); // directorio por título (60) y luego tres por categoría (10)
  assert.equal(humanos[0], 'humanos-colosos');
  assert.equal(humanos.at(-1), 'cael-cortes');
});

test('consulta vacía: orden por riqueza', () => {
  const all = slugs('');
  assert.equal(all.at(-1), 'cael-cortes');
  assert.equal(all.length, entries.length);
});

test('suggest para lo que la búsqueda no encuentra', () => {
  assert.equal(search('blopu', entries).length, 0);
  assert.deepEqual(suggest('blopu', entries), { slug: 'the-bloop', title: 'The Bloop Ojo Solo' });
  assert.equal(suggest('zzzz', entries), null);
});
```

- [ ] **Step 7: Ejecutar y ver que falla.** `npm test`. Esperado: `ERR_MODULE_NOT_FOUND` en `search.ts`.

- [ ] **Step 8: Implementar `src/core/search/search.ts`**

```ts
/** Búsqueda única del archivo (spec Ola B §4). Pura. */
import { normalize, wordsOf, type EntityEntry } from './entity-index.ts';
import { compareDiscovery } from './discovery-order.ts';

export interface SearchHit { entry: EntityEntry; score: number; matchedAlias?: string }

const STOP = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'y', 'the']);

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

type Hit = 'exact' | 'typo' | null;

/** El token coincide con alguna palabra: como prefijo (exacto) o a distancia 1 si tiene ≥ 5 letras (errata). */
function matchToken(token: string, words: readonly string[]): Hit {
  if (words.some((w) => w.startsWith(token))) return 'exact';
  if (token.length >= 5 && words.some((w) => levenshtein(token, w) <= 1)) return 'typo';
  return null;
}

const toks = (s?: string) => (s ? wordsOf(s).map((w) => w.norm) : []);

function queryTokens(q: string): string[] {
  const all = q.split(' ').filter(Boolean);
  const useful = all.filter((t) => !STOP.has(t));
  return useful.length > 0 ? useful : all;
}

function scoreEntry(entry: EntityEntry, qn: string, tokens: string[]): SearchHit | null {
  const title = normalize(entry.title);
  if (title === qn) return { entry, score: 100 };
  if (title.startsWith(qn)) return { entry, score: 80 };

  const titleWords = toks(entry.title);
  const aliasWords = entry.aliases.map((a) => ({ alias: a, words: toks(a), norm: normalize(a) }));
  const otherWords = [...toks(entry.description), ...toks(entry.category), ...toks(entry.universe)];

  const typos = (hits: Hit[]) => hits.filter((h) => h === 'typo').length;

  const inTitle = tokens.map((t) => matchToken(t, titleWords));
  if (inTitle.every(Boolean)) return { entry, score: 60 - 5 * typos(inTitle) };

  const aliasHit = aliasWords.find((a) => a.norm === qn || a.norm.startsWith(qn));
  if (aliasHit) return { entry, score: 50, matchedAlias: aliasHit.alias };

  for (const a of aliasWords) {
    const both = tokens.map((t) => matchToken(t, [...titleWords, ...a.words]));
    if (both.every(Boolean)) return { entry, score: 40 - 5 * typos(both), matchedAlias: a.alias };
  }

  const anyField = [...titleWords, ...aliasWords.flatMap((a) => a.words), ...otherWords];
  const any = tokens.map((t) => matchToken(t, anyField));
  if (any.every(Boolean)) return { entry, score: 10 - 5 * typos(any) };
  return null;
}

export function search(query: string, entries: readonly EntityEntry[], opts: { limit?: number } = {}): SearchHit[] {
  const qn = normalize(query);
  const byDiscovery = (a: EntityEntry, b: EntityEntry) => compareDiscovery(a, b);
  let hits: SearchHit[];
  if (!qn) {
    hits = [...entries].sort(byDiscovery).map((entry) => ({ entry, score: 0 }));
  } else {
    const tokens = queryTokens(qn);
    hits = entries
      .map((e) => scoreEntry(e, qn, tokens))
      .filter((h): h is SearchHit => h !== null)
      .sort((a, b) => b.score - a.score || byDiscovery(a.entry, b.entry));
  }
  return opts.limit ? hits.slice(0, opts.limit) : hits;
}

export function suggest(query: string, entries: readonly EntityEntry[]): { slug: string; title: string } | null {
  const qn = normalize(query);
  if (qn.length < 3) return null;
  let best: { entry: EntityEntry; d: number } | null = null;
  for (const entry of entries) {
    const candidates = [normalize(entry.title), ...toks(entry.title), ...entry.aliases.map(normalize)];
    const d = Math.min(...candidates.map((c) => levenshtein(qn, c)));
    if (d <= 2 && (!best || d < best.d || (d === best.d && entry.richness > best.entry.richness))) {
      best = { entry, d };
    }
  }
  return best ? { slug: best.entry.slug, title: best.entry.title } : null;
}
```

`compareDiscovery` recibe objetos con `title`, `status`, `category`, `image`, `stats` e `infobox`. `EntityEntry` no tiene `stats` ni `infobox`, pero sí `richness`. **Cambia `compareDiscovery`** en `src/core/search/discovery-order.ts` para que use `a.richness ?? richness(a)` cuando exista: añade `richness?: number` a `DiscoveryFields` y calcula `const ra = a.richness ?? richness(a)`. Los tests de discovery-order de la Ola A deben seguir en verde.

- [ ] **Step 9: Ejecutar `npm test`.** Esperado: todo en verde. "cael c": Cael Cortés puntúa 80 (el título empieza por la consulta) y Cael puntúa 60 (los tokens `cael` y `c` son prefijos de "cael"), así que Cael Cortés va primero.

- [ ] **Step 10: Esquema y datos**

En `src/core/types/wiki.ts`, dentro de `WikiFrontmatterSchema`, después de `description`:

```ts
  aliases: z.array(z.string().min(1)).optional(), // apodos canónicos (spec Ola B §6)
  related: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).optional(), // orden fijado a mano
```

Añade `aliases:` al frontmatter, como lista YAML, exactamente con estos valores:

| Archivo | Valor |
|---|---|
| `el-gran-maja.mdx` | `aliases: ["Cranioplanus", "anguila sonriente", "anguila cráneo plano"]` |
| `slowdown-criyote.mdx` | `aliases: ["La Mancha Estrellada"]` |
| `vlad-julia.mdx` | `aliases: ["el pez cangrejo"]` |
| `le-mug.mdx` | `aliases: ["Señora de la Prole"]` |
| `phiscanula-arcticum.mdx` | `aliases: ["Fiscánula ártica"]` |

- [ ] **Step 11: Test que falla de la validación.** En `tests/content/validate.test.ts`, añade:

```ts
import { crossCheckEntities } from '../../src/core/content/validate.ts';

test('crossCheckEntities: apodo duplicado, apodo igual a otro título y related inválido', () => {
  const errors = crossCheckEntities([
    { slug: 'a', title: 'Alfa', aliases: ['La Bestia'], related: ['zzz'] },
    { slug: 'b', title: 'Beta', aliases: ['la bestia', 'Alfa'], related: ['b'] },
  ]);
  assert.ok(errors.some((e) => e.includes('la bestia')));
  assert.ok(errors.some((e) => e.includes('Alfa')));
  assert.ok(errors.some((e) => e.includes('zzz')));
  assert.ok(errors.some((e) => e.includes('b') && e.includes('sí misma')));
});

test('crossCheckEntities: contenido válido no da errores', () => {
  assert.deepEqual(crossCheckEntities([{ slug: 'a', title: 'Alfa', aliases: ['La Bestia'] }, { slug: 'b', title: 'Beta', related: ['a'] }]), []);
});
```

Si ese archivo de test no importa `test` ni `assert`, añádelos como en los tests vecinos.

- [ ] **Step 12: Implementar `crossCheckEntities`** en `src/core/content/validate.ts`. Es puro y no puede importar `entity-index.ts` con alias; usa una normalización local con la misma regla, o importa `../search/entity-index.ts` (relativo con `.ts`):

```ts
import { normalize } from '../search/entity-index.ts';

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
      const owner = aliasOwner.get(n);
      if (owner && owner !== item.slug) errors.push(`apodo "${alias}" repetido en ${owner} y ${item.slug}`);
      aliasOwner.set(n, item.slug);
      const titled = titles.get(n);
      if (titled && titled !== item.slug) errors.push(`apodo "${alias}" de ${item.slug} es el título de ${titled}`);
    }
    for (const rel of item.related ?? []) {
      if (rel === item.slug) errors.push(`related de ${item.slug} se apunta a sí misma`);
      else if (!slugs.has(rel)) errors.push(`related de ${item.slug} apunta a "${rel}", que no existe`);
    }
  }
  return errors;
}
```

En `scripts/check-content.mts`, junto a `crossCheckNews`/`crossCheckPolls`, añade `...crossCheckEntities(articles.map((a) => ({ slug: a.slug, title: a.frontmatter.title, aliases: a.frontmatter.aliases, related: a.frontmatter.related })))`. Usa el nombre de la lista de artículos que ya tenga el script.

- [ ] **Step 13: `src/core/content/entities.ts`**

```ts
import { cache } from 'react';
import { buildEntityIndex, type EntityIndex } from '@/core/search/entity-index';
import { getContentRepository } from '@/core/content';

/** Índice de entidades del archivo, una vez por petición/build (spec Ola B §1). */
export const getEntityIndex = cache(async (): Promise<EntityIndex> => {
  const articles = await getContentRepository().getArticles();
  return buildEntityIndex(articles);
});
```

Si TypeScript rechaza los imports `@/core/search/entity-index` por la extensión `.ts` de los imports internos, revisa `tsconfig` (`allowImportingTsExtensions`): ya se usa así en `scripts/check-content.mts`.

- [ ] **Step 14: Validar.** `npx tsc --noEmit && npm run lint && npm test && npm run check:content`. Esperado: todo en verde, sin errores de `crossCheckEntities` sobre el contenido real.

- [ ] **Step 15: Commit**

```bash
git add -A src/core src/features/monsters/lib/discovery-order.ts src/content tests scripts/check-content.mts
git commit -m "feat(search): índice de entidades, búsqueda única y apodos canónicos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Enlaces automáticos, grafo de menciones y relacionados

**Files:**
- Create: `src/core/search/extract-body-text.ts`, `src/core/search/mention-graph.ts`, `src/core/search/related-rank.ts`, `src/utils/remark-entity-links.ts`.
- Create: `tests/search/extract-body-text.test.ts`, `tests/search/related-rank.test.ts`, `tests/search/remark-entity-links.test.ts`.
- Modify:
  - `src/core/content/entities.ts` (añade `getMentionGraph`);
  - `src/features/monsters/lib/related.ts`;
  - `src/features/monsters/components/wiki/mdx/MdxRenderer.tsx`;
  - `src/features/monsters/components/wiki/article/WikiArticleContent.tsx`;
  - `src/app/(wiki)/wiki/[slug]/page.tsx`.

**Interfaces:**
- Consumes: `buildEntityIndex`, `findMentions`, `EntityIndex` (tarea 1).
- Produces:
  - `extractBodyText(mdx: string): string`;
  - `extractWikiLinks(mdx: string): string[]` (slugs);
  - `interface MentionGraph { out: Map<string, Set<string>>; in: Map<string, Set<string>> }`;
  - `buildMentionGraph(articles: readonly { slug: string; content: string }[], index: EntityIndex): MentionGraph`;
  - `rankRelated(input: RankInput): string[]` (slugs), con `RankInput = { slug: string; curated?: readonly string[]; graph: MentionGraph; siblings: readonly string[]; sameCategory: readonly string[]; sameUniverse: readonly string[]; isDirectory: (s: string) => boolean; isStub: (s: string) => boolean; max?: number }`;
  - `remarkEntityLinks(opts: { index: EntityIndex; self?: string })`;
  - `getMentionGraph(): Promise<MentionGraph>`;
  - `getRelatedArticles(slug, all, max = 6)`, con la misma firma pública;
  - en `WikiArticleContent`, la prop nueva `entityIndex?: EntityIndex` y el atributo `data-article-body` en el contenedor del cuerpo, que usa la tarea 4;
  - en `MdxRenderer`, las props nuevas `entityIndex?: EntityIndex` y `slug?: string`.

- [ ] **Step 1: Tests que fallan de `extractBodyText` y `extractWikiLinks`** (`tests/search/extract-body-text.test.ts`):

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractBodyText, extractWikiLinks } from '../../src/core/search/extract-body-text.ts';

const MDX = `Phillip Forte lidera DELIRIUM.

<WikiImage src="/x.webp" alt="El Gran Majá" caption="Bogbo de frente" align="right" />

<RegistroDelirium>Informe sobre IPCARO.</RegistroDelirium>

## Conflicto con [The Bloop Ojo Solo](/wiki/the-bloop)

\`\`\`
Bogbo en código
\`\`\`
`;

test('quita JSX con atributos pero conserva los hijos', () => {
  const t = extractBodyText(MDX);
  assert.ok(t.includes('Informe sobre IPCARO.'));
  assert.ok(!t.includes('Bogbo de frente'));
  assert.ok(!t.includes('El Gran Majá'));
});

test('enlaces markdown → su texto; títulos se conservan; código fuera', () => {
  const t = extractBodyText(MDX);
  assert.ok(t.includes('Conflicto con The Bloop Ojo Solo'));
  assert.ok(!t.includes('/wiki/the-bloop'));
  assert.ok(!t.includes('Bogbo en código'));
});

test('extractWikiLinks devuelve los slugs enlazados a mano', () => {
  assert.deepEqual(extractWikiLinks(MDX), ['the-bloop']);
});
```

- [ ] **Step 2: Implementar `extract-body-text.ts`**

```ts
/** Texto del cuerpo de un MDX para el grafo de menciones (spec Ola B §7). Puro. */
export function extractBodyText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/<\/?[A-Za-z][\w.]*(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?\/?>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '');
}

export function extractWikiLinks(mdx: string): string[] {
  const slugs = new Set<string>();
  for (const m of mdx.matchAll(/\]\(\/wiki\/([a-z0-9-]+)\)/g)) slugs.add(m[1]);
  return [...slugs];
}
```

Ejecuta `npm test` y comprueba que esos tests pasan.

- [ ] **Step 3: Implementar `mention-graph.ts`** (puro):

```ts
import { findMentions, type EntityIndex } from './entity-index.ts';
import { extractBodyText, extractWikiLinks } from './extract-body-text.ts';

export interface MentionGraph { out: Map<string, Set<string>>; in: Map<string, Set<string>> }

export function buildMentionGraph(articles: readonly { slug: string; content: string }[], index: EntityIndex): MentionGraph {
  const out = new Map<string, Set<string>>();
  const inn = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    if (from === to || !index.bySlug.has(to)) return;
    if (!out.has(from)) out.set(from, new Set());
    if (!inn.has(to)) inn.set(to, new Set());
    out.get(from)!.add(to);
    inn.get(to)!.add(from);
  };
  for (const a of articles) {
    for (const m of findMentions(extractBodyText(a.content), index, { self: a.slug })) add(a.slug, m.slug);
    for (const s of extractWikiLinks(a.content)) add(a.slug, s);
  }
  return { out, in: inn };
}
```

Añade a `tests/search/related-rank.test.ts`:

```ts
import { buildMentionGraph } from '../../src/core/search/mention-graph.ts';
import { buildEntityIndex } from '../../src/core/search/entity-index.ts';

test('buildMentionGraph: menciones y enlaces a mano en ambos sentidos', () => {
  const arts = [
    { slug: 'phillip', frontmatter: { title: 'Phillip Forte', universe: 'C', category: 'Humano' }, content: 'Lidera DELIRIUM.' },
    { slug: 'delirium', frontmatter: { title: 'DELIRIUM', universe: 'C', category: 'Organización' }, content: 'Dirigida por Phillip Forte.' },
    { slug: 'bogbo', frontmatter: { title: 'Bogbo', universe: 'C', category: 'Coloso' }, content: 'Ver [ficha](/wiki/delirium).' },
  ];
  const g = buildMentionGraph(arts, buildEntityIndex(arts));
  assert.deepEqual([...g.out.get('phillip')!], ['delirium']);
  assert.deepEqual([...g.in.get('delirium')!].sort(), ['bogbo', 'phillip']);
  assert.deepEqual([...g.in.get('phillip')!], ['delirium']);
});
```

- [ ] **Step 4: Tests que fallan de `rankRelated`** (en el mismo archivo):

```ts
import { rankRelated } from '../../src/core/search/related-rank.ts';

const graph = {
  out: new Map([['phillip', new Set(['delirium', 'maja', 'ipcaro'])]]),
  in: new Map([['phillip', new Set(['delirium', 'maja', 'bogbo'])]]),
};
const base = {
  slug: 'phillip',
  graph,
  siblings: ['cael', 'animales'],
  sameCategory: ['cael'],
  sameUniverse: ['bloop', 'animales', 'vlad'],
  isDirectory: (s: string) => s === 'animales',
  isStub: (s: string) => s === 'cael',
};

test('orden: mutuas → salientes → entrantes → menú → categoría → universo', () => {
  assert.deepEqual(rankRelated({ ...base, max: 10 }), ['delirium', 'maja', 'ipcaro', 'bogbo', 'bloop', 'vlad', 'cael']);
});

test('curated va primero y se respeta el límite después de mover los stubs', () => {
  assert.deepEqual(rankRelated({ ...base, curated: ['vlad'], max: 3 }), ['vlad', 'delirium', 'maja']);
});

test('sin directorios ni la propia ficha', () => {
  const r = rankRelated({ ...base, siblings: ['phillip', 'animales'], max: 10 });
  assert.ok(!r.includes('animales') && !r.includes('phillip'));
});
```

- [ ] **Step 5: Implementar `related-rank.ts`**

```ts
import type { MentionGraph } from './mention-graph.ts';

export interface RankInput {
  slug: string;
  curated?: readonly string[];
  graph: MentionGraph;
  siblings: readonly string[];
  sameCategory: readonly string[];
  sameUniverse: readonly string[];
  isDirectory: (s: string) => boolean;
  isStub: (s: string) => boolean;
  max?: number;
}

export function rankRelated({ slug, curated = [], graph, siblings, sameCategory, sameUniverse, isDirectory, isStub, max = 6 }: RankInput): string[] {
  const out = graph.out.get(slug) ?? new Set<string>();
  const inn = graph.in.get(slug) ?? new Set<string>();
  const mutual = [...out].filter((s) => inn.has(s));
  const onlyOut = [...out].filter((s) => !inn.has(s));
  const onlyIn = [...inn].filter((s) => !out.has(s));
  const seen = new Set<string>([slug]);
  const ordered: string[] = [];
  for (const s of [...curated, ...mutual, ...onlyOut, ...onlyIn, ...siblings, ...sameCategory, ...sameUniverse]) {
    if (seen.has(s) || isDirectory(s)) continue;
    seen.add(s);
    ordered.push(s);
  }
  return [...ordered.filter((s) => !isStub(s)), ...ordered.filter(isStub)].slice(0, max);
}
```

El primer test espera las mutuas en orden de inserción (`delirium`, `maja`). (Los `Set` conservan el orden de inserción, así que el resultado es determinista.)

- [ ] **Step 6: `getRelatedArticles`** (`src/features/monsters/lib/related.ts`). Conserva `findNavSiblings` y la firma pública, y reescribe el cuerpo:

```ts
import { buildEntityIndex } from '@/core/search/entity-index';
import { buildMentionGraph } from '@/core/search/mention-graph';
import { rankRelated } from '@/core/search/related-rank';

const graphCache = new WeakMap<readonly WikiArticle[], ReturnType<typeof buildMentionGraph>>();

export function getRelatedArticles(slug: string, all: WikiArticle[], max = 6): WikiArticleSummary[] {
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  const current = bySlug.get(slug);
  if (!current) return [];
  let graph = graphCache.get(all);
  if (!graph) {
    graph = buildMentionGraph(all, buildEntityIndex(all));
    graphCache.set(all, graph);
  }
  const { category, universe } = current.frontmatter;
  const slugs = rankRelated({
    slug,
    curated: current.frontmatter.related,
    graph,
    siblings: findNavSiblings(slug).map(slugFromUrl).filter((s): s is string => !!s),
    sameCategory: category ? all.filter((a) => a.frontmatter.category === category).map((a) => a.slug) : [],
    sameUniverse: all.filter((a) => a.frontmatter.universe === universe).map((a) => a.slug),
    isDirectory: (s) => bySlug.get(s)?.frontmatter.category === 'Directorio',
    isStub: (s) => bySlug.get(s)?.frontmatter.status === 'proximamente',
    max,
  });
  return slugs.map((s) => bySlug.get(s)).filter((a): a is WikiArticle => !!a).map(toSummary);
}
```

Añade a `src/core/content/entities.ts`: `export const getMentionGraph = cache(async () => { const articles = await getContentRepository().getArticles(); return buildMentionGraph(articles, await getEntityIndex()); });`. Hoy no tiene consumidores; lo usará la Ola C.

- [ ] **Step 7: Tests que fallan del plugin** (`tests/search/remark-entity-links.test.ts`). Usa árboles mdast construidos a mano:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntityIndex } from '../../src/core/search/entity-index.ts';
import { remarkEntityLinks } from '../../src/utils/remark-entity-links.ts';

const index = buildEntityIndex([
  { slug: 'ipcaro', frontmatter: { title: 'IPCARO', universe: 'Colosos', category: 'Organización' } },
  { slug: 'delirium', frontmatter: { title: 'DELIRIUM', universe: 'Colosos', category: 'Organización' } },
  { slug: 'cael', frontmatter: { title: 'Cael Cortés', universe: 'Colosos', category: 'Humano', status: 'proximamente' } },
]);
const run = (tree: any, self?: string) => { remarkEntityLinks({ index, self })(tree); return tree; };
const text = (value: string) => ({ type: 'text', value });
const p = (...children: any[]) => ({ type: 'paragraph', children });

test('solo la primera mención se enlaza', () => {
  const tree = run({ type: 'root', children: [p(text('IPCARO e IPCARO.'))] });
  const kids = tree.children[0].children;
  assert.equal(kids.filter((k: any) => k.type === 'link').length, 1);
  assert.equal(kids[0].type, 'link');
  assert.equal(kids[0].url, '/wiki/ipcaro');
  assert.equal(kids[0].data.hProperties['data-entity'], 'ipcaro');
});

test('nada en títulos ni dentro de enlaces existentes', () => {
  const tree = run({ type: 'root', children: [
    { type: 'heading', depth: 2, children: [text('IPCARO')] },
    p({ type: 'link', url: '/x', children: [text('DELIRIUM')] }),
  ] });
  assert.equal(tree.children[0].children[0].type, 'text');
  assert.equal(tree.children[1].children[0].children[0].type, 'text');
});

test('negrita: el enlace queda dentro de strong', () => {
  const tree = run({ type: 'root', children: [p({ type: 'strong', children: [text('DELIRIUM')] })] });
  assert.equal(tree.children[0].children[0].children[0].type, 'link');
});

test('WikiImage se ignora y los Próximamente se marcan', () => {
  const tree = run({ type: 'root', children: [
    { type: 'mdxJsxFlowElement', name: 'WikiImage', attributes: [], children: [p(text('IPCARO'))] },
    p(text('Cael Cortés espera.')),
  ] });
  assert.equal(tree.children[0].children[0].children[0].type, 'text');
  assert.equal(tree.children[1].children[0].data.hProperties['data-entity-pending'], 'true');
});

test('nunca enlaza la propia ficha', () => {
  const tree = run({ type: 'root', children: [p(text('IPCARO.'))] }, 'ipcaro');
  assert.equal(tree.children[0].children[0].type, 'text');
});
```

- [ ] **Step 8: Implementar `src/utils/remark-entity-links.ts`**. Debe ser puro, con imports relativos con `.ts`, para que el test lo cargue.

```ts
/** Enlaza la 1.ª mención en prosa de cada entidad (spec Ola B §5). */
import { findMentions, type EntityIndex } from '../core/search/entity-index.ts';

interface Node { type: string; value?: string; url?: string; name?: string; children?: Node[]; data?: { hProperties?: Record<string, string> } }

const SKIP_TYPES = new Set(['heading', 'link', 'linkReference', 'code', 'inlineCode', 'image', 'imageReference']);
const SKIP_JSX = new Set(['WikiImage', 'WikiGallery', 'WikiTOC', 'Proximamente', 'WikiInfobox', 'InfoField']);

export function remarkEntityLinks({ index, self }: { index: EntityIndex; self?: string }) {
  return (tree: Node) => {
    const linked = new Set<string>();
    const visit = (node: Node) => {
      if (SKIP_TYPES.has(node.type)) return;
      if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name && SKIP_JSX.has(node.name)) return;
      if (!node.children) return;
      const next: Node[] = [];
      for (const child of node.children) {
        if (child.type !== 'text' || !child.value) {
          visit(child);
          next.push(child);
          continue;
        }
        const value = child.value;
        let cursor = 0;
        for (const m of findMentions(value, index, { self })) {
          if (linked.has(m.slug)) continue;
          linked.add(m.slug);
          if (m.start > cursor) next.push({ type: 'text', value: value.slice(cursor, m.start) });
          const entry = index.bySlug.get(m.slug)!;
          const hProperties: Record<string, string> = { 'data-entity': m.slug };
          if (entry.status === 'proximamente') hProperties['data-entity-pending'] = 'true';
          next.push({ type: 'link', url: `/wiki/${m.slug}`, children: [{ type: 'text', value: value.slice(m.start, m.end) }], data: { hProperties } });
          cursor = m.end;
        }
        if (cursor === 0) next.push(child);
        else if (cursor < value.length) next.push({ type: 'text', value: value.slice(cursor) });
      }
      node.children = next;
    };
    visit(tree);
  };
}
```

Ejecuta `npm test` y comprueba que los tests del plugin pasan.

- [ ] **Step 9: Cablear el render**
  - **`MdxRenderer.tsx`:**
    - props `{ content: string; entityIndex?: EntityIndex; slug?: string }`;
    - `options={{ mdxOptions: { rehypePlugins: [rehypeHeadingIds], remarkPlugins: entityIndex ? [[remarkEntityLinks, { index: entityIndex, self: slug }]] : [] } }}`. Si los tipos de `next-mdx-remote-client` piden un `Pluggable`, usa `as never` o el tipo `PluggableList` de `unified`, solo con `import type`.
    - Añade el componente `a` a `components` (imports: `Link` de `next/link`, `type Route` de `next`, `cn` de `@/utils/cn` y `type EntityIndex` de `@/core/search/entity-index`):

```tsx
  a: ({ href = '', children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { 'data-entity-pending'?: string }) => {
    const pending = props['data-entity-pending'] === 'true';
    if (href.startsWith('/')) {
      return (
        <Link
          href={href as Route}
          {...props}
          className={cn(
            'font-semibold text-white underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm',
            pending && 'decoration-dashed',
          )}
        >
          {children}
          {pending && <span className="sr-only"> (próximamente)</span>}
        </Link>
      );
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  },
```

  - **`WikiArticleContent.tsx`:**
    - recibe `entityIndex?: EntityIndex` y `slug: string`, y los pasa a `<MdxRenderer content={content} entityIndex={entityIndex} slug={slug} />`;
    - añade `data-article-body` al `<div>` de "Main Content", el que contiene `MdxRenderer`.
  - **`[slug]/page.tsx`:** `const entityIndex = await getEntityIndex();`, que se pasa a `WikiArticleContent` junto con `slug`. La llamada a `getRelatedArticles` no cambia; ahora devuelve hasta 6.

- [ ] **Step 10: Validar.** `npx tsc --noEmit && npm run lint && npm test && npm run check:content`. Escribe un script desechable en `/tmp/claude-1000/-home-nelson-workspace-github-nelsonmarro-web-boris/df9546ca-1347-4ac3-8754-2de4be0b7fa3/scratchpad/` que, con el contenido real, imprima:
  - las menciones que el plugin enlazaría en `el-gran-maja` y en `phillip-forte`;
  - los relacionados de `phillip-forte`, `el-gran-maja`, `le-mug` y `supperbial-anguilla`.

  Inclúyelo en el informe.

- [ ] **Step 11: Commit**

```bash
git add src/core src/utils/remark-entity-links.ts src/features/monsters/lib/related.ts src/features/monsters/components/wiki/mdx/MdxRenderer.tsx src/features/monsters/components/wiki/article/WikiArticleContent.tsx "src/app/(wiki)/wiki/[slug]/page.tsx" tests/search
git commit -m "feat(wiki): enlaces automáticos a la 1.ª mención y relacionados por grafo de menciones

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Paleta de búsqueda global y explorador

**Files:**
- Create: `src/components/search/useSearchPalette.ts`, `src/components/search/SearchPalette.tsx`, `src/components/search/SearchTrigger.tsx`.
- Delete: `src/features/monsters/components/wiki/WikiCommandPalette.tsx`, después de migrar su lógica de teclado, `Dialog` y filas a `SearchPalette`.
- Modify:
  - `src/app/layout.tsx`: monta `<SearchPalette />` una vez dentro de `<Providers>`, porque necesita QueryClient;
  - `src/app/(wiki)/wiki/layout.tsx`: el `<WikiCommandPalette />` de la cabecera se sustituye por `<SearchTrigger variant="pill" className="hidden md:inline-flex" />` + `<SearchTrigger variant="icon" className="md:hidden" />`;
  - la navbar de la landing: localiza su componente de acciones a partir de `src/app/(marketing)/layout.tsx` y añade los mismos disparadores. Comprueba que no se dupliquen dentro de la cabecera de la wiki, que también usa `NavActions`: si `NavActions` es compartido, pon los disparadores en el componente de navbar de la landing, no en `NavActions`;
  - `src/features/marketing/components/hero/SearchBar.tsx`: pasa a ser disparador. Conserva la prop `placeholder`, quita `id="hero-search"` y no tiene `<form>`;
  - `src/features/monsters/actions/get-wiki-articles.ts`;
  - `src/features/monsters/components/WikiList.tsx`;
  - `src/features/monsters/components/wiki/WikiEmptyState.tsx` (localízalo con `grep -rn "Ningún registro coincide"`).

**Interfaces:**
- Consumes: `search`, `suggest`, `EntityEntry` (tarea 1) y `getEntityIndex()` (tarea 1).
- Produces:
  - `useSearchPalette`: `{ open: boolean; query: string; openPalette: (q?: string) => void; close: () => void; setQuery: (q: string) => void }`;
  - `<SearchTrigger variant: 'hero' | 'pill' | 'icon'; placeholder?: string; className?: string />`;
  - `WikiIndexEntry = Pick<EntityEntry, 'slug' | 'title' | 'aliases' | 'category' | 'universe' | 'status' | 'image' | 'imagePosition' | 'description' | 'richness'>`, de modo que `getWikiIndex()` devuelve `EntityEntry[]` sin el campo `linkable` (o con él; da igual), y **sin** `stats` ni `infobox`.

- [ ] **Step 1:** `getWikiIndex()` pasa a `(await getEntityIndex()).entries.map(({ linkable, ...e }) => e)`. Elimina de `WikiIndexEntry` los campos `stats` e `infobox` añadidos en la Ola A.
- [ ] **Step 2:** `getWikiArticles`:
  - si hay `search`, ordena y filtra con `search(search, index.entries)` y mapea los slugs a artículos, conservando el orden de la búsqueda;
  - sin `search`, conserva `compareDiscovery`;
  - los filtros de universo y categoría se aplican después;
  - si `total === 0`, añade al resultado `suggestion: suggest(search, entries)` y `popular: search('', entries).slice(0, 6).map(h → resumen del artículo)`. Extiende `GetWikiArticlesResult` con `suggestion?: { slug: string; title: string } | null` y `popular?: WikiArticleSummary[]`.
- [ ] **Step 3:** `WikiEmptyState` recibe `query`, `suggestion`, `popular` y `onClear` y muestra:
  - "Sin coincidencias para «query»";
  - "¿Quisiste decir <Link>título</Link>?" si hay sugerencia;
  - una fila de 6 populares, como enlaces con miniatura y título;
  - un botón "Limpiar filtros" (44 px) que llama a `onClear`, el cual limpia la búsqueda y los filtros en `WikiList`.
- [ ] **Step 4:** `useSearchPalette.ts`, store de Zustand sin `persist`.
- [ ] **Step 5:** `SearchPalette.tsx`, que cumple la spec §8:
  - Usa `Dialog` de `@/components/ui/dialog`, como hacía `WikiCommandPalette`.
  - **Disposición:**
    - en móvil, `fixed inset-0`, sin bordes redondeados, campo arriba con `h-14` y botón "Cerrar" de 44 px;
    - desde md, `max-w-xl` centrado.
  - **Atajo:** listener global de ⌘K / Ctrl+K (`keydown`) que abre o cierra la paleta.
  - **Datos:** `useQuery({ queryKey: ['wiki-index'], queryFn: () => getWikiIndex(), staleTime: Infinity, enabled: open })`.
  - **Resultados:** `search(query, index, { limit: 10 })`. Con la consulta vacía, rótulo "Populares" y los 8 primeros.
  - **Cada fila:**
    - miniatura de 40 px (o el icono por categoría con `CategoryPlaceholder` si no hay portada, o es de marca);
    - título;
    - "Universo · Categoría";
    - "también: \<alias\>" si `matchedAlias`;
    - `ProximamenteChip size="compact"` si `status === 'proximamente'`.
  - **Teclado:** ↑ ↓ y Enter, como la paleta anterior.
  - **Última fila:** "Ver todos en el explorador →", que lleva a `/wiki?search=<q>#explorar` (`as Route`). Solo aparece si la consulta no está vacía.
  - **Sin resultados:** "Sin coincidencias para «q»", "¿Quisiste decir X?" (`suggest`; al pulsarlo pone `query = X.title`) y 6 populares.
  - **Al navegar:** `router.push` y `close()`.
- [ ] **Step 6:** `SearchTrigger.tsx` (`'use client'`):
  - **`hero`:** `<button type="button">` con el aspecto actual de `SearchBar` (campo redondeado con icono de lupa, el texto del placeholder en `text-white/50` y el botón naranja "Buscar"). Al pulsarlo, `openPalette()`.
  - **`pill`:** "Buscar ⌘K" (o "Ctrl K" si `navigator.platform` no es Mac; para evitar desajustes de hidratación, decídelo en un efecto).
  - **`icon`:** lupa de 44 px con `aria-label="Buscar en el archivo"`.
- [ ] **Step 7:** `SearchBar` renderiza `<SearchTrigger variant="hero" placeholder={placeholder} />`. Comprueba sus dos usos: `HomeMosaic` y `WikiHomeMosaic`.
- [ ] **Step 8:** Borra `WikiCommandPalette.tsx`. Con `grep -rn "WikiCommandPalette" src`, comprueba que no quedan referencias.
- [ ] **Step 9: Validar.** `npx tsc --noEmit && npm run lint && npm test && npm run check:content`. En el informe, mide el tamaño en JSON de `getWikiIndex()` con un script desechable sobre el contenido real (`JSON.stringify(...).length`). Debe ser < 30 000.
- [ ] **Step 10: Commit** `feat(search): paleta de búsqueda global con apodos y erratas, también en la landing`.

---

### Task 4: Orientación en artículos largos y carrusel de relacionados

**Files:**
- Create: `src/features/monsters/components/wiki/article/ArticleProgress.tsx`, `SectionChip.tsx` y `RelatedCarousel.tsx`.
- Modify: `src/features/monsters/components/wiki/article/WikiArticleFooter.tsx`, `src/features/monsters/components/wiki/WikiArticleCard.tsx` (solo la variante `compact`, que hoy solo usa el pie de artículo), `src/features/monsters/components/wiki/mdx/WikiTOC.tsx`.
- **No toques `page.tsx` ni `WikiArticleContent.tsx`:** el orquestador monta los componentes.

**Interfaces:**
- Consumes:
  - el atributo `data-article-body` del contenedor del cuerpo (tarea 2);
  - `extractHeadings` y `WikiHeading` (`src/utils/headings.ts`);
  - `useActiveHeading(ids, offset)` (`src/features/monsters/hooks/useActiveHeading.ts`);
  - `Drawer` (`src/components/ui/drawer.tsx`, `vaul`).
- Produces:
  - `<ArticleProgress />`, sin props;
  - `<SectionChip headings={WikiHeading[]} />`;
  - `<RelatedCarousel related={WikiArticleSummary[]} />`;
  - `WikiTOC variant="inline"` añade `data-toc="inline"` a su raíz;
  - `WikiArticleFooter` añade `data-related` a su `<section>`.

- [ ] **Step 1: `ArticleProgress`** (`'use client'`):
  - `fixed left-0 right-0 top-16 z-40 h-0.5`;
  - el relleno es `bg-primary` con `transform: scaleX(p)` y `origin-left`;
  - `p` = progreso del scroll entre `top` y `bottom` de `[data-article-body]` respecto a la ventana (`requestAnimationFrame` en el evento `scroll`, `passive`);
  - `aria-hidden`;
  - `motion-reduce:` no aplica, porque no hay animación.
- [ ] **Step 2: `SectionChip`** (`'use client'`):
  - Solo `h2` (`level === 2`). Si hay menos de 3, `return null`.
  - **Visible** si, y solo si:
    - existe `[data-toc="inline"]` con `offsetParent !== null` (no hay rail);
    - su `getBoundingClientRect().bottom < 0` (ya pasó);
    - y `[data-related]` no ha entrado en la ventana.
    - Escucha `scroll` y `resize` con `requestAnimationFrame`.
  - **Botón:** `fixed left-1/2 -translate-x-1/2 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 h-11 max-w-[calc(100%-2rem)] rounded-full border border-white/15 bg-[#061a2e] px-4 shadow-[0_20px_50px_rgba(0,0,0,0.55)]`. Contenido: icono `ListTree`, el apartado actual (de `useActiveHeading`, `truncate`) y "· n/N" en `text-white/60`. `aria-label`: "Apartado actual: X. Abrir índice".
  - **Al pulsarlo:** abre un `Drawer` con el título "Contenido" y la lista de `h2`. El actual lleva `text-primary` + `aria-current="true"`.
  - **Al elegir un apartado:** cierra el `Drawer` y hace `document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })` (`reduce` = `matchMedia('(prefers-reduced-motion: reduce)')`).
- [ ] **Step 3: `WikiTOC.tsx`:** añade `data-toc={variant}` al elemento raíz.
- [ ] **Step 4: `WikiArticleCard compact`:**
  - imagen `aspect-video`;
  - eyebrow = universo;
  - título;
  - chip de categoría;
  - `ProximamenteChip` si procede;
  - sin descripción ni "Ver detalles".
  - La variante normal (explorador) no cambia; compruébalo con un diff visual de clases.
- [ ] **Step 5: `RelatedCarousel`** (server component):
  - `<ul>` con `flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0`;
  - cada `<li>` con `w-[75%] shrink-0 snap-start md:w-auto`, dentro un `WikiArticleCard compact`;
  - la barra de scroll se oculta con `[scrollbar-width:none]` sin perder el scroll.
- [ ] **Step 6: `WikiArticleFooter`:** usa `RelatedCarousel` (hasta 6) y añade `data-related` a la `<section>`.
- [ ] **Step 7: Validar.** `npx tsc --noEmit && npm run lint && npm test`.
- [ ] **Step 8: Commit** `feat(wiki): barra de progreso, chip de apartado y carrusel de relacionados en móvil`.

---

### Task 5: Visor de imágenes de la ficha

**Files:**
- Create: `src/features/monsters/components/wiki/mdx/ArticleImages.tsx` (contexto y proveedor) y `src/features/monsters/components/wiki/mdx/ImageViewer.tsx`.
- Modify: `src/features/monsters/components/wiki/mdx/WikiGallery.tsx` (`WikiImage` y las imágenes de `WikiGallery`).
- **No toques `page.tsx` ni `WikiArticleContent.tsx`:** el orquestador envuelve el contenido con el proveedor.

**Interfaces:**
- Produces:
  - `<ArticleImagesProvider>{children}</ArticleImagesProvider>` (`'use client'`), que renderiza también el `ImageViewer`;
  - `<ViewerLink src alt caption className>{children}</ViewerLink>` (`'use client'`), que sustituye al `<a href={src} target="_blank">` de `WikiImage` y `WikiGallery`. Sin proveedor (fuera de una ficha), se comporta como el enlace actual.

- [ ] **Step 1: `ArticleImages.tsx`:**
  - contexto `{ open: (src: string) => void } | null`;
  - el proveedor guarda `index: number | null`;
  - al abrir, reúne las imágenes en orden del DOM con `document.querySelectorAll('[data-viewer-src]')` dentro de su contenedor (`ref` en un `<div className="contents">`): `{ src, alt, caption }` desde los atributos `data-viewer-src`, `data-viewer-alt` y `data-viewer-caption`;
  - busca el índice del `src` pulsado y guarda el elemento que tenía el foco.
- [ ] **Step 2: `ViewerLink`:**
  - renderiza el `<a href={src} target="_blank" rel="noopener noreferrer">` actual, con `data-viewer-src`, `data-viewer-alt` y `data-viewer-caption`;
  - `onClick`: si hay contexto, `preventDefault()` + `open(src)`;
  - `aria-label`: "Ampliar imagen: \<alt\>".
- [ ] **Step 3: `ImageViewer`:**
  - **Contenedor:**
    - `Dialog` de `@/components/ui/dialog`, abierto si `index !== null`, a pantalla completa con `bg-[#00122E]/95`;
    - `DialogTitle` en `sr-only`, "Imagen n de N".
  - **Pista:**
    - `<div className="flex h-full snap-x snap-mandatory overflow-x-auto">`, con una diapositiva `w-full shrink-0 snap-center flex flex-col items-center justify-center p-4` por imagen;
    - dentro, `next/image` con `fill` en un contenedor `relative h-[70svh] w-full`, `object-contain` y `sizes="100vw"`;
    - debajo, `figcaption` `text-[13px] text-white/70` y "n / N" en `font-mono text-[12px]`.
  - **Al abrir,** hace scroll a la diapositiva del índice: `scrollLeft = index * clientWidth`, sin suavizado. Al hacer scroll, actualiza `index` con `Math.round(scrollLeft / clientWidth)`.
  - **Controles:**
    - botón cerrar de 44 px, arriba a la derecha, con `aria-label="Cerrar"`;
    - desde md, botones "Anterior" y "Siguiente" de 44 px a los lados;
    - teclas ← → mueven una diapositiva;
    - Esc lo gestiona `Dialog`.
  - **Historial:**
    - al abrir, `history.pushState({ wbViewer: true }, '')` y un listener de `popstate` que cierra;
    - al cerrar con el botón o con Esc, si `history.state?.wbViewer`, `history.back()` (que dispara `popstate` y cierra); si no, cierra directamente;
    - al cerrar, se devuelve el foco al elemento guardado.
  - **"Abrir original":** enlace `text-[11px]` a `src` con `target="_blank"`.
  - **Movimiento reducido:** sin transiciones de entrada.
- [ ] **Step 4:** En `WikiGallery.tsx`, sustituye el `<a href={src} …>` de `WikiImage` y el de cada imagen de `WikiGallery` por `ViewerLink`, con las mismas clases y los mismos hijos.
- [ ] **Step 5: Validar.** `npx tsc --noEmit && npm run lint && npm test`.
- [ ] **Step 6: Commit** `feat(wiki): visor de imágenes dentro de la ficha (deslizar, teclado, atrás)`.

---

### Task 6: Cableado, QA y entrega (orquestador)

- [ ] **Step 1:** En `src/app/(wiki)/wiki/[slug]/page.tsx`:
  - envuelve `<WikiArticleContent …/>` con `<ArticleImagesProvider>`;
  - monta `<ArticleProgress />` y `<SectionChip headings={extractHeadings(content)} />` dentro del `<article>`.
  - Commit `feat(wiki): monta orientación y visor en la ficha`.
- [ ] **Step 2:** `npm run lint && npm test && npm run check:content && npm run build`, y después `npx next start -p 3131`.
- [ ] **Step 3:** QA con Chrome DevTools a 390 y 1440, según la spec §13. Hay 10 puntos; guarda las capturas en `docs/audits/2026-10-18-experiencia-fan/ola-b/` (WebP) con un `README.md` de resultados.
- [ ] **Step 4:** Push, PR "Closes #50", CI en verde, squash merge, borrar la rama y marcar #50 en la épica #52.

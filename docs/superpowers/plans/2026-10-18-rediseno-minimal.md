# Rediseño minimalista (#55) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** quitar el ruido del estilo de consola. Hay que dejar una tarjeta única y sobria, secciones con un solo propósito y caminos directos a criatura, personaje o universo en la landing, la wiki, la ficha y /comunidad.

**Architecture:**
- Tres primitivas nuevas en `src/components/content/`:
  - `ContentCard`, la única tarjeta;
  - `Section`, con `h2` y "Ver todo";
  - `FactsLine`, con los datos en línea.
- Dos funciones puras en `src/core/search/`:
  - `tipos`, la agrupación de categorías;
  - `catalog`, el filtro del catálogo.
- Cada página se recompone con ellas por separado, en tareas paralelas sobre archivos disjuntos.
- Una tarea final borra los componentes que quedan huérfanos: mosaicos, tiles teaser, `CrystalTile`, `IconChip` y `BubbleTrail`.

**Tech Stack:** Next.js 16 (App Router, RSC, ISR), React 19, TypeScript, Tailwind v4, `next/image`, Base UI y `node:test` con strip-types.

**Spec:** `docs/superpowers/specs/2026-10-18-rediseno-minimal-design.md` (§ = sección de la spec).

## Global Constraints

- **Solo canon:** no se escribe lore nuevo. Los textos de interfaz sí se pueden escribir. Los textos de personajes salen de `FEATURED_CHARACTERS`, sin parafrasear.
- **Sin dependencias nuevas.**
- **Reglas visuales (spec §1):**
  - una sección es un `h2` y su contenido, sin eyebrows de sección ni de tarjeta;
  - `ContentCard` es la única tarjeta;
  - iconos solo funcionales;
  - naranja solo para el CTA primario, enlaces, hover e indicadores;
  - sin resplandores difuminados decorativos;
  - `.glass-liquid` solo en navbar, footer y botón secundario;
  - superficie sólida `#061a2e` bajo el texto.
- **Accesibilidad:**
  - un solo `h1` por página;
  - texto ≥ 11 px y objetivos táctiles ≥ 44 px;
  - foco visible con `focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary`, nunca `outline-none`;
  - `motion-reduce:` sin animaciones;
  - contraste ≥ 4.5:1;
  - Lighthouse 100.
- **Next 16:**
  - hrefs con query o plantilla → `as Route` (`import type { Route } from 'next'`);
  - imagen LCP con `fetchPriority="high"` + `loading="eager"`, nunca `priority`.
- **`src/core/search/*.ts`:** sin imports con alias `@/` en tiempo de ejecución (solo `import type`). Entre ellos se importan con rutas relativas y extensión `.ts`, y los tests también importan por ruta relativa.
- **Validación de cada tarea:** `npx tsc --noEmit`, `npm run lint` (0 errores; el aviso previo en `.remember/` no es nuestro), `npm test` y `npm run check:content`. `npm run build` solo lo ejecuta el orquestador.
- **Commits:** en español, Conventional Commits, terminados con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Borrado de archivos:** solo la tarea 6. Las tareas 2 a 5 dejan de usar los componentes viejos, pero no los borran (salvo los que la tarea dice explícitamente).

## File Structure

| Archivo | Tarea | Responsabilidad |
|---|---|---|
| `src/components/content/ContentCard.tsx` | 1 | Tarjeta sobria única |
| `src/components/content/Section.tsx` | 1 | Sección con `h2` y "Ver todo" |
| `src/components/content/FactsLine.tsx` | 1 | Datos en línea |
| `src/components/content/index.ts` | 1 | Barrel |
| `src/core/search/tipos.ts` + `tests/search/tipos.test.ts` | 1 | Grupos de categorías |
| `src/core/search/catalog.ts` + `tests/search/catalog.test.ts` | 1 | Filtro puro del catálogo |
| `CLAUDE.md` | 1 | Estándares de diseño (spec §10) |
| `src/app/(marketing)/layout.tsx`, `src/app/(wiki)/wiki/layout.tsx` | 1 | Desmontar `BubbleTrail` |
| `src/app/(marketing)/page.tsx`, `src/features/marketing/sections/*`, `src/features/marketing/components/hero/SearchBar.tsx` | 2 | Landing |
| `src/app/(wiki)/wiki/page.tsx`, `src/features/monsters/components/WikiList.tsx`, `src/features/monsters/components/wiki/{WikiExplorerSection,WikiSearch,WikiFilters,WikiEmptyState}.tsx`, `src/features/monsters/actions/get-wiki-articles.ts` | 3 | Portada de la wiki y catálogo |
| `src/features/monsters/components/wiki/article/*`, `src/features/monsters/components/wiki/mdx/{WikiInfobox,WikiInfoboxCompact,WikiTOC}.tsx`, `src/app/(wiki)/wiki/[slug]/page.tsx` | 4 | Ficha |
| `src/app/(marketing)/comunidad/page.tsx`, `src/features/community/components/{PollTile,CommunityCreatureRow,NewsList}.tsx` | 5 | Comunidad |
| (borrados de huérfanos) | 6 | Limpieza |

**Lotes de ejecución:**
1. Tarea 1.
2. Tareas 2, 3, 4 y 5 en paralelo (archivos disjuntos).
3. Tarea 6.
4. Tarea 7 (orquestador).

**Interfaces que producen las tareas (las demás las consumen):**
- `ContentCard(props: ContentCardProps)`, con:

  ```ts
  interface ContentCardProps {
    href?: string;            // sin href → <div> (p. ej. universo sin página)
    external?: boolean;
    title: string;
    meta?: string;            // línea gris: "Coloso · Colosos", "Era contemporánea", "Último vídeo"
    description?: string;
    lines?: 1 | 2 | 3;        // recorte de description; por defecto 2
    image?: string;
    imagePosition?: string;
    category?: string;        // placeholder si no hay imagen
    aspect?: 'video' | 'portrait'; // 16:9 por defecto · 4:5
    pending?: boolean;        // Próximamente
    headingLevel?: 2 | 3;     // por defecto 3
    sizes?: string;
    eager?: boolean;          // LCP
    className?: string;
  }
  ```

- `Section({ id?, title, action?: { href: string; label: string; external?: boolean }, className?, children })`.
- `FactsLine({ items: { label: string; value: string; tone?: ThreatTone }[] })`.
- `TIPOS: readonly { id: TipoId; label: string; categories: readonly string[] }[]`, `type TipoId = 'criaturas' | 'personajes' | 'especies' | 'organizaciones' | 'vehiculos' | 'historia'`, `tipoOf(category?: string): TipoId | null` y `isTipoId(v: string): v is TipoId`.
- `catalogFilter<T extends { frontmatter: { category?: string; universe: string } }>(items: readonly T[], f: { tipo?: TipoId; universe?: string }): T[]`, que excluye siempre `category === 'Directorio'`, y `tipoCounts(items): { id: TipoId; label: string; count: number }[]`, que devuelve solo los grupos con contenido, en el orden de `TIPOS`, también sin directorios.

---

### Task 1: Base — primitivas, tipos/catálogo puros, documentación

**Files:**
- Create: `src/components/content/{ContentCard,Section,FactsLine}.tsx`, `src/components/content/index.ts`, `src/core/search/tipos.ts`, `src/core/search/catalog.ts`, `tests/search/tipos.test.ts` y `tests/search/catalog.test.ts`.
- Modify: `CLAUDE.md`, `src/app/(marketing)/layout.tsx` y `src/app/(wiki)/wiki/layout.tsx`: quitar `<BubbleTrail />` y su import; **no** borres `src/components/ui/bubble-trail.tsx`, eso lo hace la tarea 6.

- [ ] **Step 1: Test que falla de `tipos`** (`tests/search/tipos.test.ts`):

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { TIPOS, tipoOf, isTipoId } from '../../src/core/search/tipos.ts';

test('grupos en el orden de la spec y con ids únicos', () => {
  assert.deepEqual(TIPOS.map((t) => t.id), ['criaturas', 'personajes', 'especies', 'organizaciones', 'vehiculos', 'historia']);
  assert.equal(new Set(TIPOS.map((t) => t.id)).size, TIPOS.length);
});

test('tipoOf', () => {
  assert.equal(tipoOf('Coloso'), 'criaturas');
  assert.equal(tipoOf('Titán'), 'criaturas');
  assert.equal(tipoOf('Humano'), 'personajes');
  assert.equal(tipoOf('Libro'), 'historia');
  assert.equal(tipoOf('Directorio'), null);
  assert.equal(tipoOf('Categoría'), null);
  assert.equal(tipoOf(undefined), null);
  assert.ok(isTipoId('especies'));
  assert.ok(!isTipoId('zzz'));
});

test('cada categoría del contenido pertenece como mucho a un grupo', () => {
  const cats = new Set<string>();
  for (const f of readdirSync('src/content').filter((n) => n.endsWith('.mdx'))) {
    const m = readFileSync(`src/content/${f}`, 'utf8').match(/^category:\s*["']?([^"'\n]+)["']?/m);
    if (m) cats.add(m[1].trim());
  }
  for (const c of cats) {
    const owners = TIPOS.filter((t) => t.categories.includes(c));
    assert.ok(owners.length <= 1, `${c} está en ${owners.length} grupos`);
    if (c !== 'Directorio' && c !== 'Categoría') assert.equal(owners.length, 1, `${c} no tiene grupo`);
  }
});
```

- [ ] **Step 2: Ejecutar `npm test`.** Esperado: `ERR_MODULE_NOT_FOUND` en `tipos.ts`.

- [ ] **Step 3: Implementar `src/core/search/tipos.ts`**

```ts
/** Agrupación de categorías del frontmatter para la navegación por tipo (spec #55 §2). Puro. */
export type TipoId = 'criaturas' | 'personajes' | 'especies' | 'organizaciones' | 'vehiculos' | 'historia';

export const TIPOS: readonly { id: TipoId; label: string; categories: readonly string[] }[] = [
  { id: 'criaturas', label: 'Criaturas', categories: ['Coloso', 'Titán', 'Animal'] },
  { id: 'personajes', label: 'Personajes', categories: ['Humano', 'Entidad'] },
  { id: 'especies', label: 'Especies', categories: ['Especie'] },
  { id: 'organizaciones', label: 'Organizaciones', categories: ['Organización'] },
  { id: 'vehiculos', label: 'Vehículos', categories: ['Vehículo'] },
  { id: 'historia', label: 'Historia', categories: ['Historia', 'Libro'] },
];

export function tipoOf(category?: string): TipoId | null {
  if (!category) return null;
  return TIPOS.find((t) => t.categories.includes(category))?.id ?? null;
}

export function isTipoId(v: string): v is TipoId {
  return TIPOS.some((t) => t.id === v);
}
```

- [ ] **Step 4: Test que falla de `catalog`** (`tests/search/catalog.test.ts`):

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogFilter, tipoCounts } from '../../src/core/search/catalog.ts';

const a = (slug: string, category: string, universe = 'Colosos') => ({ slug, frontmatter: { category, universe } });
const ITEMS = [
  a('maja', 'Coloso'),
  a('lemug', 'Titán'),
  a('phillip', 'Humano'),
  a('animales', 'Directorio'),
  a('colosos', 'Categoría'),
  a('galeon', 'Historia', 'Capitán de Galeón'),
];

test('sin filtros: todo menos los directorios', () => {
  assert.deepEqual(catalogFilter(ITEMS, {}).map((i) => i.slug), ['maja', 'lemug', 'phillip', 'colosos', 'galeon']);
});

test('por tipo y por universo', () => {
  assert.deepEqual(catalogFilter(ITEMS, { tipo: 'criaturas' }).map((i) => i.slug), ['maja', 'lemug']);
  assert.deepEqual(catalogFilter(ITEMS, { universe: 'Capitán de Galeón' }).map((i) => i.slug), ['galeon']);
  assert.deepEqual(catalogFilter(ITEMS, { tipo: 'criaturas', universe: 'Capitán de Galeón' }), []);
});

test('tipoCounts: solo grupos con contenido, en orden, sin directorios', () => {
  assert.deepEqual(tipoCounts(ITEMS), [
    { id: 'criaturas', label: 'Criaturas', count: 2 },
    { id: 'personajes', label: 'Personajes', count: 1 },
    { id: 'historia', label: 'Historia', count: 1 },
  ]);
});
```

- [ ] **Step 5: Implementar `src/core/search/catalog.ts`**

```ts
/** Filtro puro del catálogo de la wiki (spec #55 §4). */
import { TIPOS, tipoOf, type TipoId } from './tipos.ts';

type Item = { frontmatter: { category?: string; universe: string } };

const isDirectory = (i: Item) => i.frontmatter.category === 'Directorio';

export function catalogFilter<T extends Item>(items: readonly T[], f: { tipo?: TipoId; universe?: string }): T[] {
  return items.filter(
    (i) =>
      !isDirectory(i) &&
      (!f.tipo || tipoOf(i.frontmatter.category) === f.tipo) &&
      (!f.universe || i.frontmatter.universe === f.universe),
  );
}

export function tipoCounts(items: readonly Item[]): { id: TipoId; label: string; count: number }[] {
  return TIPOS.map((t) => ({
    id: t.id,
    label: t.label,
    count: items.filter((i) => !isDirectory(i) && tipoOf(i.frontmatter.category) === t.id).length,
  })).filter((t) => t.count > 0);
}
```

Ejecuta `npm test`. Esperado: todo en verde (los 52 actuales + los nuevos).

- [ ] **Step 6: `ContentCard`** (server component; sin `'use client'`):

```tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';

export interface ContentCardProps {
  href?: string;
  external?: boolean;
  title: string;
  meta?: string;
  description?: string;
  lines?: 1 | 2 | 3;
  image?: string;
  imagePosition?: string;
  category?: string;
  aspect?: 'video' | 'portrait';
  pending?: boolean;
  headingLevel?: 2 | 3;
  sizes?: string;
  eager?: boolean;
  className?: string;
}

const CLAMP = { 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3' } as const;

/** Tarjeta sobria única del sitio (spec #55 §1–§2): imagen a sangre, título, una o dos líneas. Toda la tarjeta es el enlace. */
export function ContentCard({
  href, external = false, title, meta, description, lines = 2, image, imagePosition, category,
  aspect = 'video', pending = false, headingLevel = 3, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  eager = false, className,
}: ContentCardProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  const cover = image && !isBrandPlaceholder(image) ? image : undefined;
  const classes = cn(
    'crystal-surface group flex h-full flex-col overflow-hidden rounded-2xl',
    href && 'transition-colors duration-200 hover:border-primary/40 focus-visible:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none',
    className,
  );
  const body = (
    <>
      <div className={cn('relative w-full overflow-hidden bg-[#00122E]', aspect === 'portrait' ? 'aspect-[4/5]' : 'aspect-video')}>
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes={sizes}
            fetchPriority={eager ? 'high' : undefined}
            loading={eager ? 'eager' : undefined}
            className={cn('object-cover', pending && 'opacity-70 grayscale')}
            style={{ objectPosition: imagePosition ?? '50% 50%' }}
          />
        ) : (
          <CategoryPlaceholder category={category} variant="corner" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 md:p-5">
        <Heading className="font-display text-xl font-black uppercase italic leading-tight tracking-tight text-white">
          {title}
          {pending && <span className="sr-only"> (próximamente)</span>}
        </Heading>
        {pending && <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Próximamente</p>}
        {meta && <p className="text-[12px] font-semibold text-white/55">{meta}</p>}
        {description && <p className={cn('text-sm leading-relaxed text-white/70', CLAMP[lines])}>{description}</p>}
      </div>
    </>
  );
  if (!href) return <div className={classes}>{body}</div>;
  if (external) {
    const isYoutube = /youtu\.?be/.test(href);
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {body}
        <span className="sr-only">{isYoutube ? ' (se abre en YouTube)' : ' (se abre en una pestaña nueva)'}</span>
      </a>
    );
  }
  return <Link href={href as Route} className={classes}>{body}</Link>;
}
```

Si `CategoryPlaceholder variant="corner"` necesita un contenedor `relative` con altura, ya lo tiene (`relative aspect-…`). Comprueba visualmente en la QA que el icono queda en la esquina.

- [ ] **Step 7: `Section`**

```tsx
import Link from 'next/link';
import type { Route } from 'next';
import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  id?: string;
  title: string;
  action?: { href: string; label: string; external?: boolean };
  className?: string;
  children: ReactNode;
}

const ACTION = 'inline-flex min-h-11 items-center text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm';

/** Una sección = un propósito (spec #55 §1): h2, contenido y como mucho un "Ver todo". */
export function Section({ id, title, action, className, children }: SectionProps) {
  const headingId = useId();
  return (
    <section id={id} aria-labelledby={headingId} className={cn('container mx-auto px-6 py-16 md:py-24', className)}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id={headingId} className="section-title text-white">{title}</h2>
        {action &&
          (action.external ? (
            <a href={action.href} target="_blank" rel="noopener noreferrer" className={ACTION}>{action.label} ›</a>
          ) : (
            <Link href={action.href as Route} className={ACTION}>{action.label} ›</Link>
          ))}
      </div>
      {children}
    </section>
  );
}
```

`useId` funciona en server components en React 19. Si `tsc` o el build se quejan, pasa `title` a un id con slug (`section-${id ?? slug(title)}`).

- [ ] **Step 8: `FactsLine`**

```tsx
import type { ThreatTone } from '@/features/monsters/lib/stats';
import { cn } from '@/utils/cn';

const TONE: Record<ThreatTone, string> = { green: 'text-emerald-300', amber: 'text-amber-300', red: 'text-red-300' };

/** Datos clave en una línea, sin caja (spec #55 §5). */
export function FactsLine({ items }: { items: { label: string; value: string; tone?: ThreatTone }[] }) {
  if (items.length === 0) return null;
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-3">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-white/45">{it.label}</dt>
          <dd className={cn('text-base font-semibold text-white', it.tone && TONE[it.tone])}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

Comprueba el contraste de `text-emerald-300`, `text-amber-300` y `text-red-300` sobre `#00122E`: los tres superan 4.5:1.

- [ ] **Step 9: `index.ts`** con `export { ContentCard, type ContentCardProps } from './ContentCard'; export { Section } from './Section'; export { FactsLine } from './FactsLine';`.

- [ ] **Step 10: Desmontar `BubbleTrail`** de los dos layouts (import y JSX).

- [ ] **Step 11: `CLAUDE.md`** según la spec §10:
  - en "Estándares de diseño", sustituye la viñeta de "Superficies" por: `- Tarjetas: \`ContentCard\`; secciones: \`Section\`; datos: \`FactsLine\` (\`src/components/content/\`). Una sección = un propósito (h2 + contenido + como mucho "Ver todo"); sin eyebrows por tarjeta ni por sección; iconos solo funcionales. Superficie \`crystal-surface\`; \`.glass-liquid\` solo en navbar, footer y botón secundario; superficie sólida \`#061a2e\` bajo texto largo.`;
  - en "Otras piezas", sustituye la viñeta de `src/components/crystal/` por: `- \`src/components/content/\` — primitivas del rediseño minimalista (#55): \`ContentCard\`, \`Section\`, \`FactsLine\`.`

- [ ] **Step 12: Validar.** `npx tsc --noEmit && npm run lint && npm test && npm run check:content`.

- [ ] **Step 13: Commit** `feat(diseño): primitivas ContentCard/Section/FactsLine, tipos y catálogo puros; fuera BubbleTrail`.

---

### Task 2: Landing (`/`)

**Files:**
- Create: `src/features/marketing/sections/HeroBleed.tsx`, `src/features/marketing/sections/CommunityStrip.tsx`, `src/features/marketing/sections/AboutContactSection.tsx`.
- Modify: `src/app/(marketing)/page.tsx`, `src/features/marketing/sections/FeaturedCharactersSection.tsx`, `src/features/marketing/sections/FeaturedVideosSection.tsx`, `src/features/marketing/components/hero/SearchBar.tsx` (solo estilos: sin `glass-liquid`/`backdrop-blur`, superficie `bg-[#061a2e] border border-white/15`, mismo comportamiento).
- Puedes reutilizar el contenido de `AboutBorisSection.tsx` y `ContactSection.tsx` dentro de `AboutContactSection`. **No borres** archivos: lo hace la tarea 6.
- **No toques** `src/features/community/*` ni `src/features/monsters/*`.

**Interfaces:**
- Consumes: `ContentCard`, `Section` (tarea 1), `pickFeatured`, `getWeeklyPoll`, `getLatestVideo`, `UNIVERSES`, `FEATURED_CHARACTERS`, `FEATURED_VIDEOS`, `SOCIAL_LINKS` y `getContentRepository`.

- [ ] **Step 1: `HeroBleed`** (async server component; spec §3.1):
  - **Datos:** `articles = await getContentRepository().getArticles()` y `creature = pickFeatured(articles)`.
  - **Contenedor:** `<section className="relative isolate overflow-hidden">`.
  - **Imagen de fondo:** `next/image` `fill` con `object-cover`, `objectPosition = creature.frontmatter.imagePosition`, `fetchPriority="high"`, `loading="eager"`, `alt=""`, `sizes="100vw"` y `className="-z-10"`. Solo si hay portada que no es de marca.
  - **Capa de degradado:** `-z-10 absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,18,46,0.55)_0%,rgba(0,18,46,0.85)_45%,#00122E_78%)]`. Ajústala midiendo el contraste en la QA: todo el texto ≥ 4.5:1.
  - **Contenido** en `container mx-auto px-6 pt-32 md:pt-40 pb-10`, en este orden:
    - `h1.page-title`: "Explora la inmensidad" + `<span className="block italic text-primary">de mis universos</span>`;
    - `p.text-lg.text-white/80`: "Todo el lore oficial de BorisaoBlois en un solo archivo.";
    - `<div className="mt-6 max-w-xl"><SearchBar /></div>`;
    - la píldora `Link` a `/wiki/<slug>` (`as Route`), con `mt-4 inline-flex min-h-11 items-center rounded-full border border-white/15 bg-[#061a2e]/90 px-4 text-sm text-white hover:border-primary/40`. El texto es "Criatura de la semana: **\<Nombre\>** ›".
  - **Universos:** `<div id="universos" className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">` con un `ContentCard` por `UNIVERSES`:
    - `href = universeKey ? /wiki?universe=<encodeURIComponent(universeKey)>#catalogo : undefined`;
    - `title`, `meta = era`, `image`, `imagePosition` y `pending = comingSoon`;
    - `headingLevel = 2`;
    - `sizes = "(min-width: 768px) 25vw, 50vw"`.
  - **Encaje:** en la QA se mide que la fila de universos quede visible entera a 1440×900 y 1280×800. Si no cabe, reduce el `pt` o el tamaño del `h1` solo con la variante `short-screen:` que ya existe en `globals.css`.
- [ ] **Step 2: `FeaturedCharactersSection`** reescrita como `<Section id="personajes" title="Personajes destacados">`:
  - la rejilla es `grid gap-4 md:grid-cols-3`, con un `ContentCard` por `FEATURED_CHARACTERS`;
  - `href = /wiki/<slug>`, `title = name`, `description` (texto de Boris), `lines = 3`, `aspect = 'portrait'`, y `image`/`imagePosition`/`category` del frontmatter del artículo (léelos de `getContentRepository().getArticles()` por slug);
  - el componente pasa a async si hace falta.
  - Quita el eyebrow "Expedientes abiertos".
- [ ] **Step 3: `FeaturedVideosSection`** reescrita como `<Section id="videos" title="Vídeos" action={{ href: SOCIAL_LINKS.youtube, label: 'Ver canal', external: true }}>`:
  - las tarjetas son el último vídeo (`await getLatestVideo()`) seguido de los 3 de `FEATURED_VIDEOS`, sin duplicados por `id` y con un máximo de 4;
  - cada una es un `ContentCard` con `external`, `href = https://www.youtube.com/watch?v=<id>`, `image = https://i.ytimg.com/vi/<id>/mqdefault.jpg`, `title` y `meta` (`'Último vídeo'` para el primero si viene del RSS; para el resto, `video.category` en *sentence case*);
  - la rejilla es `grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4`;
  - se eliminan los iframes, si los hay.
- [ ] **Step 4: `CommunityStrip`** (async), dentro de `container mx-auto px-6`:
  - `<div className="crystal-surface flex flex-col gap-3 rounded-2xl px-6 py-5 md:flex-row md:items-center md:justify-between">`.
  - Con `getWeeklyPoll()` con encuesta: `<p className="text-white">Duelo de la semana: <strong>A</strong> vs <strong>B</strong></p>` + `Link` "Votar ›" → `/comunidad`, y a la derecha `Link` "Abrir la Arena ›" → `/wiki/arena`.
  - Sin encuesta: "Versus Arena: enfrenta a los colosos" + "Abrir la Arena ›".
  - Los enlaces llevan `min-h-11`, color `text-primary` y foco visible.
  - Los nombres salen de `weekly.fighters`.
- [ ] **Step 5: `AboutContactSection`:**
  - `<Section title="Sobre Boris">` con `grid gap-12 lg:grid-cols-2`;
  - a la izquierda, el contenido factual de `AboutBorisSection`: el texto de universos generado desde `UNIVERSES`, la lista de universos como enlaces de texto (no chips), "Biografía: Próximamente" como línea de texto, el canal, "Ver canal en YouTube" y "Escribir a Boris";
  - el logo `Logo2.webp` a 64 px junto al título, sin el resplandor ni la columna enorme de logo;
  - a la derecha, `<div id="contacto">` con el formulario de `ContactSection`: extrae el componente del formulario que ya existe (`src/features/marketing/components/contact/*`) y reutilízalo tal cual;
  - en el móvil, apilado.
- [ ] **Step 6: `page.tsx`:** `HeroBleed`, `FeaturedCharactersSection`, `FeaturedVideosSection`, `CommunityStrip`, `AboutContactSection`. Mantén `revalidate = 3600` y quita `HomeMosaic` y `UniversePreviewSection` de los imports.
- [ ] **Step 7: Validar** (`tsc`, `lint`, `test`) y escribe en el informe las líneas de cada sección y qué componentes viejos quedan sin uso.
- [ ] **Step 8: Commit** `feat(landing): hero con la criatura de fondo, universos en la primera pantalla y secciones sobrias`.

---

### Task 3: Portada de la wiki y catálogo (`/wiki`)

**Files:**
- Modify: `src/app/(wiki)/wiki/page.tsx`, `src/features/monsters/components/wiki/WikiExplorerSection.tsx`, `src/features/monsters/components/WikiList.tsx`, `src/features/monsters/components/wiki/WikiSearch.tsx`, `src/features/monsters/components/wiki/WikiFilters.tsx`, `src/features/monsters/components/wiki/WikiEmptyState.tsx`, `src/features/monsters/actions/get-wiki-articles.ts`.
- No toques `WikiArticleCard.tsx`: deja de usarlo, pero no lo borres. No toques el artículo, la landing ni /comunidad.

**Interfaces:**
- Consumes: `ContentCard` (tarea 1), `catalogFilter`, `tipoCounts`, `isTipoId`, `TipoId` (tarea 1) y `compareDiscovery` (Ola A, `src/features/monsters/lib/discovery-order.ts`).
- Produces:
  - `getWikiArticles({ page, pageSize = 12, search, universe, tipo })`, donde `tipo?: string` se valida con `isTipoId`;
  - `getFilterOptions(): Promise<{ universes: string[]; tipos: { id: TipoId; label: string; count: number }[]; total: number }>`, donde `total` = fichas sin directorios.

- [ ] **Step 1:** En `get-wiki-articles.ts`:
  - sustituye `category` por `tipo`;
  - aplica `catalogFilter(articles, { tipo, universe })` después de la búsqueda de texto, que se mantiene igual que ahora;
  - mantén el orden `compareDiscovery`;
  - pon `pageSize` a 12 por defecto;
  - haz que `getFilterOptions` use `tipoCounts` y devuelva `total`.

  `getWikiIndex` no cambia.
- [ ] **Step 2:** En `page.tsx` va solo `<WikiExplorerSection />` dentro de `wiki-container`. Se elimina `WikiHomeMosaic` y se mantiene `revalidate = 3600`.
- [ ] **Step 3:** `WikiExplorerSection` y `WikiList` componen la portada (spec §4), en este orden:
  1. **Cabecera:** `h1.page-title` "Archivo" y `p.text-lg.text-white/70`: "Criaturas, personajes, organizaciones e historia de los universos de BorisaoBlois.". Es el único `h1` de la página.
  2. **Buscador** (`WikiSearch`): grande, `h-14`, a todo el ancho y `max-w-2xl`, con el placeholder "Buscar criaturas, personajes, especies…". Mantiene el debounce de 400 ms y la sincronización con la URL (`?search=`) que ya existen.
  3. **Pestañas** (`WikiFilters`): un `<nav aria-label="Tipos de expediente">` con una fila de enlaces-píldora.
     - "Todo · {total}" y luego cada `tipos[i]`: "{label} · {count}".
     - La activa lleva `bg-primary text-[#00122E]` y `aria-current="page"`; las inactivas, `border border-white/15 text-white/80 hover:border-primary/40`.
     - Todas miden `min-h-11 px-4`.
     - Al pulsar cambian `?tipo=` (con "Todo" se quita) con la misma técnica de URL que usa hoy el filtro (`window.history.replaceState`, ver la memoria del proyecto) y reinician la página a 1.
     - En el móvil: `flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-4 px-4`.
     - A la derecha, o debajo en el móvil, el desplegable de universo actual. El de categoría se elimina.
  4. **Catálogo** con `id="catalogo"`. Añade un `<span id="explorar" />` justo antes como alias de ancla.
     - Rejilla `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`.
     - Cada artículo es un `ContentCard` con:
       - `href = /wiki/<slug>`;
       - `title`;
       - `meta = [category, universe].filter(Boolean).join(' · ')`;
       - `description`, `image`, `imagePosition` y `category`;
       - `pending = status === 'proximamente'`.
     - La paginación actual se mantiene.
  5. **Estado vacío** (`WikiEmptyState`): "Ningún registro coincide" y un botón "Limpiar filtros" de `min-h-11` que borra la búsqueda, el tipo y el universo.
- [ ] **Step 4:** Los enlaces existentes a `/wiki?universe=…#explorar` siguen funcionando gracias al alias. Comprueba con `grep -rn "category=" src` que nada enlaza con `?category=`; si algo lo hace, cámbialo a `?tipo=` o quita el parámetro.
- [ ] **Step 5: Validar** y anotar en el informe los números de las pestañas con el contenido real.
- [ ] **Step 6: Commit** `feat(wiki): portada "Archivo" con buscador, pestañas por tipo y catálogo sobrio`.

---

### Task 4: Ficha (`/wiki/<slug>`)

**Files:**
- Modify: `src/features/monsters/components/wiki/article/WikiArticleHeader.tsx`, `WikiArticleContent.tsx`, `WikiArticleFooter.tsx` y `WikiArticleActions.tsx`; `src/features/monsters/components/wiki/mdx/WikiInfobox.tsx`, `WikiInfoboxCompact.tsx` y `WikiTOC.tsx` (solo lo necesario); `src/app/(wiki)/wiki/[slug]/page.tsx`.
- No toques `WikiArticleCard.tsx` (solo deja de usarse), ni la landing, ni la wiki, ni /comunidad.

**Interfaces:**
- Consumes: `ContentCard`, `Section`, `FactsLine` (tarea 1), `hasStats`, `getThreatLevel` y `isBrandPlaceholder`.
- Produces: `WikiArticleHeader` con las props `{ title, universe, category?, status?, arenaSlug?, image?, imagePosition?, description?, stats?, imageInBody?: boolean }`.

- [ ] **Step 1: `page.tsx`.**
  - Pasa a `WikiArticleHeader` las props `image`, `imagePosition`, `description` y `stats` del frontmatter.
  - Pasa también `imageInBody = !!image && content.includes(image)`.
  - Mantén `arenaSlug` como en la Ola A.
- [ ] **Step 2: `WikiArticleHeader`** (spec §5.1), dentro de `wiki-container`:
  1. **Imagen de portada:** solo si `image && !isBrandPlaceholder(image) && !imageInBody`. Va en `<div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 md:aspect-[21/9]">` con `next/image` `fill`, `object-cover`, `objectPosition`, `fetchPriority="high"`, `loading="eager"`, `alt={title}` y `sizes="(min-width: 1280px) 1100px, 100vw"`.
  2. **Migas:** las actuales (`WikiBreadcrumbs`).
  3. **`h1.page-title`.**
  4. **`FactsLine`:** solo si `hasStats({ stats })`. Lleva, en este orden y omitiendo los que falten:
     - Longitud: `${stats.length} m`;
     - Amenaza: `getThreatLevel(stats.hostility)` con su `label` y su `tone`;
     - Peso: `stats.weight`.
  5. **Fila de acciones:**
     - "Arena" con el estilo primario actual, solo si `arenaSlug`;
     - "Compartir", el botón actual de `WikiArticleActions`;
     - un botón "⋯" (`aria-label="Más acciones"`, 44 px) que abre un menú con "Historial" e "Imprimir", las acciones que hoy son iconos sueltos. Usa el `Popover` o el `Menu` de `@base-ui/react`, como en otros componentes del repo; si no hay ninguno, usa un `<details>` accesible.
  6. **Entradilla:** `description` como `<p className="max-w-3xl text-lg leading-relaxed text-white/85">`.
  7. Se mantiene el chip Próximamente cuando `status`.
- [ ] **Step 3: `WikiArticleContent`:**
  - Quita la caja de descripción, que ya va en la cabecera.
  - Quita el "retrato arriba" de la Ola A (`showHero`), que ahora lo cubre la cabecera.
  - **Sin rail:** sustituye los dos bloques apilados (`WikiInfoboxCompact` + `WikiTOC inline`) por una sola fila `flex flex-wrap gap-2` con dos disclosure buttons de 44 px, "Ficha completa ▾" y "Contenido ▾". Cada uno abre su panel debajo (la infobox completa y la lista del índice), y solo uno está abierto a la vez. Usa `aria-expanded`/`aria-controls`.
  - **Con rail:** la infobox no muestra su imagen; añade una prop `hideImage` a `WikiInfobox` si hace falta. Se quitan sus resplandores e iconos decorativos de sección, si los tiene.
  - El cuerpo MDX no cambia.
- [ ] **Step 4: `WikiArticleFooter`:** `<Section title="Archivos relacionados">` con `grid gap-4 grid-cols-2 md:grid-cols-3` de `ContentCard`. Cada tarjeta lleva:
  - `href`, `title`, `image`, `imagePosition` y `category`;
  - `meta = category`;
  - `pending`;
  - `lines = 1`, sin descripción en el móvil: no pases `description`.
  - Quita el eyebrow "Navegación cruzada". Ojo: `Section` añade `container px-6 py-16`; si dentro de la ficha duplica el padding con `wiki-container`, pasa `className="px-0"` o envuelve según convenga.
- [ ] **Step 5: Validar** y anotar en el informe cómo queda la cabecera de El Gran Majá (stats), Phillip Forte (sin stats), Cael Cortés (sellada) y una ficha sin portada.
- [ ] **Step 6: Commit** `feat(ficha): imagen arriba, datos en línea, acciones mínimas y ficha/índice plegados en una fila`.

---

### Task 5: Comunidad (`/comunidad`)

**Files:**
- Modify: `src/app/(marketing)/comunidad/page.tsx` y `src/features/community/components/PollTile.tsx`.
- Create: `src/features/community/components/CommunityCreatureRow.tsx` y `src/features/community/components/NewsList.tsx`.
- No borres `CreatureOfWeekTile`, `LatestVideoTile` ni `NewsTile` (tarea 6). No toques la landing, la wiki ni el artículo.

**Interfaces:**
- Consumes: `ContentCard` (tarea 1), `pickFeatured`, `getWeeklyPoll`, `getLatestVideo`, `getContentRepository().getNews(5)` y la API de voto existente (sin cambios).

- [ ] **Step 1: `page.tsx`** (spec §6): `<main className="pt-32 pb-16"><div className="mx-auto max-w-3xl px-6 space-y-14">` con:
  1. **Cabecera:** `h1.page-title` "Comunidad" (sin eyebrow) y la línea `INTRO` actual.
  2. **`PollTile`:** sus props y datos no cambian.
  3. **Criatura de la semana:** `<section aria-labelledby>` con `h2.section-title` y `CommunityCreatureRow`.
  4. **Último vídeo:** `h2` y un `ContentCard` con `external` (miniatura `mqdefault`, `meta` = fecha si es válida).
  5. **Novedades:** `h2` y `NewsList`.
  - Conserva la `metadata` y `revalidate`.
- [ ] **Step 2: `PollTile` aligerado.**
  - Quita el `CrystalTile` exterior y el `IconChip`/eyebrow. El exterior pasa a ser `<section aria-labelledby className="crystal-surface rounded-2xl p-6 md:p-8">` y su título "¿Quién gana?" (o la pregunta curada) va como `h2.section-title`.
  - Conserva tal cual toda la lógica y todos los estados: carga, votación no disponible, votado, límite y error, resultados con porcentaje y `aria-live`, enlace "Ver el duelo en la Arena" y "Tu voto es anónimo".
  - Ejecuta `npm test` (los tests de encuesta deben seguir en verde).
- [ ] **Step 3: `CommunityCreatureRow`.**
  - Recibe `creature` (`WikiArticleSummary`).
  - Renderiza un `Link` a la ficha con `flex items-center gap-4 rounded-2xl crystal-surface p-3 hover:border-primary/40` y foco visible, que contiene:
    - una miniatura de 64×64 (`rounded-xl`, `object-cover`) o el placeholder;
    - el nombre (font-display) y "Categoría · Universo" en `text-white/55`;
    - "Ver ficha ›" a la derecha, en `text-primary`.
- [ ] **Step 4: `NewsList`.**
  - Recibe `news`.
  - Es un `<ul className="divide-y divide-white/10">` con un `<li className="py-4">` por novedad:
    - `<time dateTime>` con la fecha formateada en español, en 12 px `text-white/55`;
    - el título enlazado (interno con `Link` o externo con `target=_blank`), con el mismo criterio que `NewsTile`;
    - el `resumen` en una línea (`line-clamp-1` en el móvil, `line-clamp-2` desde md).
- [ ] **Step 5: Validar** (`tsc`, `lint`, `test`).
- [ ] **Step 6: Commit** `feat(comunidad): una columna — encuesta protagonista, criatura, vídeo y novedades en lista`.

---

### Task 6: Limpieza de huérfanos

- [ ] **Step 1:** Para cada candidato de la spec §2, comprueba con `grep -rn "<Nombre>" src --include=*.ts --include=*.tsx` (o `grep -rln`) que no le quedan consumidores. Si no hay ninguno, bórralo:
  - `HomeMosaic`, `UniversePreviewSection`, `FlipCard`, `UniverseTile`, `AboutBorisSection` y `ContactSection` (si `AboutContactSection` ya no los importa);
  - `WikiHomeMosaic`, `CategoryTile` y `WikiArticleCard`;
  - `ArenaTile`, `PollTeaserTile`, `LatestVideoTeaserTile`, `CreatureOfWeekTile`, `LatestVideoTile` y `NewsTile`;
  - `src/components/crystal/*` (`CrystalTile`, `Mosaic`, `IconChip`, `index.ts`);
  - `src/components/ui/bubble-trail.tsx`;
  - `getFeaturedMatchup` / `featured-matchup.ts`, si ya nadie lo usa.
- [ ] **Step 2:** Comprueba que no quedan clases `crystal-glow` sin uso. Si `crystal-glow` ya no se usa, quítalo de `globals.css`; `crystal-surface` se queda.
- [ ] **Step 3: Validar** (`tsc`, `lint`, `test`, `check:content`).
- [ ] **Step 4: Commit** `chore(diseño): retira mosaicos, tiles de consola, CrystalTile, IconChip y BubbleTrail`.

---

### Task 7: QA y entrega (orquestador)

- [ ] **Step 1:** Antes de empezar, desde `main`, toma las capturas "antes" de `/`, `/wiki`, `/wiki/el-gran-maja` y `/comunidad` a 390 y 1440 (WebP).
- [ ] **Step 2:** `npm run lint && npm test && npm run check:content && npm run build`, y después `npx next start -p 3131`.
- [ ] **Step 3:** QA de la spec §9 con Chrome DevTools: los 7 puntos, a 390 y 1440 (1280×800 para la primera pantalla). Corrige lo que falle y luego toma las capturas "después" y escribe un README en `docs/audits/2026-10-18-rediseno-minimal/`.
- [ ] **Step 4:** Push, PR "Closes #55", CI en verde, squash merge y borrar la rama. Actualiza #50 y #51 con lo que cambia (spec §7).

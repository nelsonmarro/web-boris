# Hero abisal de la landing y sección de universos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la primera pantalla de la landing «atrape»: un expediente de una lista curada (`HERO_POOL`), distinto en cada visita, emerge de la oscuridad con animación solo CSS, con el buscador y un chip al expediente; debajo, una sección propia con los cuatro universos, su sinopsis canónica y cuántos expedientes tiene cada uno.

**Architecture:** Lógica pura y probada con node:test en `src/features/marketing/lib/` (`hero-pick.ts`: `pickHeroCreature` + `resolveHeroSlug`; `universe-counts.ts`: `countByUniverse` + `expedientesLabel`) y un validador puro nuevo en `src/core/content/validate.ts` (`crossCheckHeroPool`) que `check:content` aplica a `HERO_POOL`. Un helper de servidor (`src/features/marketing/data/hero-creature.ts`) hace `await connection()` y el sorteo (con eso la landing pasa a dinámica); `HeroAbisal` (servidor) pinta las capas y el contenido con clases CSS nuevas de `globals.css`; `UniversesSection` (servidor) usa `Section` y `ContentCard`. `HeroBleed` se borra.

**Tech Stack:** Next.js 16 (App Router, `connection()` de `next/server`, `next/image`), React 19, Tailwind CSS v4 (`@layer components`, `@keyframes`, `@custom-variant short-screen`), lucide-react, node:test con `--experimental-strip-types`.

**Spec:** `docs/superpowers/specs/2026-10-27-landing-hero-abisal-design.md` (manda sobre este plan; léela antes de empezar).

## Global Constraints

- Todo texto visible y todo comentario en **español**, con la densidad de comentarios del archivo que se toca.
- Solo canon: ningún texto de lore nuevo. Los únicos textos nuevos son los de la spec, copiados literalmente:
  - h1: «Explora la inmensidad» + `<span className="block italic text-primary">de mis universos</span>` (igual que hoy).
  - Frase: «Todo el lore oficial de BorisaoBlois en un solo archivo.»
  - Chip: «En pantalla: **{título}** · Ver expediente ›» (el `›` con `aria-hidden`).
  - Flecha: «Sumérgete».
  - Sección: título «Explora los universos»; frase «Cada universo tiene sus propias reglas, criaturas y misterios.»
  - Meta de cada universo: «{era} · {N} expedientes» («1 expediente» si N = 1); universo `comingSoon`: solo «{era}» y `pending`.
- `HERO_POOL` exacto: `['the-bloop', 'el-gran-maja', 'bogbo', 'vlad-julia', 'phillip-forte']`.
- Ley Abisal: `ContentCard` y `Section` (`src/components/content`); una sección = un propósito; sin eyebrows ni chips decorativos; iconos solo funcionales.
- Los velos de contraste del hero son los de `HeroBleed` **sin tocar un solo alfa ni una parada** (calibrados por la auditoría #66: ≥ 4.5:1 bajo el h1 naranja y la frase).
- Los módulos puros (`src/features/marketing/lib/**`, `src/core/**`) usan **solo imports relativos con extensión `.ts`** (también los `import type`); nunca `@/`, y nunca importan `CategoryPlaceholder.tsx` (arrastra React y lucide).
- `Math.random()` **nunca** dentro del cuerpo de un componente: la regla `react-hooks/purity` de ESLint lo rechaza («Cannot call impure function during render», comprobado). Va en `getHeroCreature` (función de datos, no componente).
- `next/image`: `priority` está obsoleto en Next 16 (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`): la imagen del hero usa `fetchPriority="high"` + `loading="eager"`, como hoy `HeroBleed`.
- Un elemento enfocable nuevo lleva `focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary` y mide al menos 44 px (`min-h-11`, y `min-w-11` si es estrecho).
- Sin dependencias nuevas, sin cambios en Prisma.
- Tests: `npm test` (= `node --experimental-strip-types --no-warnings --test 'tests/**/*.test.ts'`); un archivo suelto: `node --experimental-strip-types --no-warnings --test tests/<carpeta>/<archivo>.test.ts`. Los tests también pasan por el chequeo de tipos de `next build` (el `tsconfig` incluye `**/*.ts`).
- Rama: `feat/landing-hero-abisal` (ya creada). Un commit por tarea; todos terminan con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/features/marketing/config/hero-pool.ts` | Crear | `HERO_POOL` (solo datos; lo lee también `check:content`). |
| `src/features/marketing/lib/hero-pick.ts` | Crear | `pickHeroCreature`, `resolveHeroSlug` (puro). |
| `tests/marketing/hero-pick.test.ts` | Crear | Pruebas del sorteo y del forzado. |
| `src/features/marketing/lib/universe-counts.ts` | Crear | `countByUniverse`, `expedientesLabel` (puro). |
| `tests/marketing/universe-counts.test.ts` | Crear | Pruebas del recuento. |
| `src/core/content/validate.ts` | Modificar | `crossCheckHeroPool` (puro). |
| `tests/content/validate.test.ts` | Modificar | Pruebas de `crossCheckHeroPool`. |
| `scripts/check-content.mts` | Modificar | Regla 10: `HERO_POOL`. |
| `src/app/globals.css` | Modificar | `--caustic-noise`; bloque «Hero abisal» (clases + `@keyframes` + reduced-motion). |
| `src/features/marketing/data/hero-creature.ts` | Crear | `getHeroCreature()`: `connection()`, forzado de QA y sorteo (servidor). |
| `src/features/marketing/sections/HeroAbisal.tsx` | Crear | Hero: capas, contenido, chip y flecha. |
| `src/features/marketing/sections/HeroBleed.tsx` | Borrar | Sustituido por `HeroAbisal`. |
| `src/features/marketing/sections/UniversesSection.tsx` | Crear | Sección `#universos`. |
| `src/app/(marketing)/page.tsx` | Modificar | `HeroAbisal` + `UniversesSection`; sin `revalidate`. |
| `CLAUDE.md` | Modificar | Landing dinámica, `HERO_POOL` y su regla, `HERO_FORCE_SLUG`. |

## Decisiones tomadas al planificar (ambigüedades de la spec)

- **D1 — `coverOf` llega como predicado.** `pickHeroCreature(pool, articles, rand, hasCover)` recibe `hasCover: (image: string | undefined) => boolean`; en la app es `(src) => coverOf(src) !== undefined` (en `getHeroCreature`), en los tests una copia sin React (falta o `/assets/Branding/` → sin portada). Así el módulo puro no importa `CategoryPlaceholder.tsx`.
- **D2 — `connection()` y `Math.random()` viven en `getHeroCreature()`** (`src/features/marketing/data/hero-creature.ts`, como `src/features/community/data/*`), no en el cuerpo de `HeroAbisal`: `react-hooks/purity` rechaza `Math.random()` en un componente (comprobado con ESLint sobre un componente de prueba; en una función de datos no salta). El efecto es el de la spec §4: la landing se renderiza en cada petición.
- **D3 (ruling del controlador) — `HERO_FORCE_SLUG` se lee en cualquier entorno**, también en `next start` y Docker (en producción no se define; si alguien la define, solo fija el hero: sin riesgo). Así la QA de contraste y el Lighthouse antes/después se hacen sobre el build de producción, como pide la spec §7. El párrafo que sigue describía la variante restringida a `next dev` y queda superado: **`HERO_FORCE_SLUG` se lee solo si `process.env.NODE_ENV !== 'production'`**, y `resolveHeroSlug(pool, forced)` solo lo acepta si es un slug de `HERO_POOL` (recortado; si no, se ignora y se sortea). Next sustituye `process.env.NODE_ENV` al compilar, así que **en el build de producción (`next start`, `make start`, Docker) la rama desaparece y el forzado no existe**: el forzado sirve en `next dev`. Esto choca con la spec §7, que pide forzar «sobre el build de producción» para el contraste por imagen y para el Lighthouse antes/después: el contraste por imagen se mide en `next dev` (velos, imagen y CSS son idénticos); el Lighthouse sobre el build de producción no puede forzar (ver «Notas de QA»).
- **D4 — `priority` → `fetchPriority="high"` + `loading="eager"`** (ver Global Constraints).
- **D5 — Orden de candidatos = orden de `HERO_POOL`, sin repetidos.** `rand` 0 da el primer slug válido del pool; un slug repetido no pesa doble.
- **D6 — Acotado de `rand`:** NaN o negativo → el primero; 1, más o `Infinity` → el último. Reutiliza `pickRandom` de `src/core/search/random-pick.ts` (ya acota por arriba).
- **D7 — `countByUniverse(articles)` devuelve una función de consulta `(universe: string) => number`** (0 si no hay fichas). Usa el mismo criterio que `registro.ts` (`isIndexCategory` de `catalog.ts` + `status !== 'proximamente'`) en vez de `registroSlugs`, que pide la forma de `EntityEntry` y no agrupa por universo. `expedientesLabel(n)` da «1 expediente» / «N expedientes».
- **D8 — Estilos como clases planas en `@layer components`** (como `.crystal-surface`), no `@utility`: se emiten siempre y el bloque `prefers-reduced-motion` queda explícito. En reduced-motion se pone `animation: none` (además de `filter: none; transform: none` en `.hero-creature`): una animación con `fill-mode: both` pisa las declaraciones estáticas, y el retardo escalonado (hasta 1.2 s) dejaría el texto invisible porque el bloque global acorta la duración pero no el retardo. Se añade `.hero-bob` para la flecha.
- **D9 — Ruido cáustico compartido:** el `url("data:…")` de `.caustics-layer` pasa a la variable `--caustic-noise` en `:root`; `.caustics-layer` y `.hero-caustics` la usan. `.hero-caustics` reutiliza `@keyframes caustic-flow` (60 s, bucle).
- **D10 — Burbujas dentro de la capa `aria-hidden` del fondo** (detrás del texto, después de velos y cáustica, como pide el orden de §5). La subida se expresa en `svh` (`-70svh`): el hero mide `88svh`, así que acaban hacia el 20 % superior.
- **D11 — Maquetación:** contenido con `pb-24` (hueco para la flecha) y `short-screen:pb-10` (la flecha se oculta ahí); el chip lleva `self-start` para no estirarse en la columna flex. La flecha va en un contenedor `pointer-events-none absolute inset-x-0 bottom-6 flex justify-center`, con el enlace `pointer-events-auto`.
- **D12 — `check:content`: «tiene `image`» = frontmatter `image` no vacío.** Una imagen de marca ya la rechaza la regla 5 («Imagen que no es lore»).
- **D13 — Entre la tarea 5 y la 6 no existe `#universos`** (se borra con `HeroBleed` y vuelve con `UniversesSection`); es un estado intermedio de la rama, no se publica.

---

### Task 1: `HERO_POOL` y el sorteo puro (`hero-pick.ts`)

**Files:**
- Create: `src/features/marketing/config/hero-pool.ts`
- Create: `src/features/marketing/lib/hero-pick.ts`
- Test: `tests/marketing/hero-pick.test.ts`

**Interfaces:**
- Consumes: `pickRandom<T>(items: readonly T[], rng: () => number): T | undefined` de `src/core/search/random-pick.ts`; tipo `WikiArticleSummary = { slug: string; frontmatter: WikiFrontmatter }` de `src/core/types/wiki.ts`.
- Produces (los usan las tareas 3 y 5):
  - `HERO_POOL: readonly string[]`
  - `pickHeroCreature(pool: readonly string[], articles: readonly WikiArticleSummary[], rand: number, hasCover: (image: string | undefined) => boolean): WikiArticleSummary | null`
  - `resolveHeroSlug(pool: readonly string[], forced: string | undefined): string | undefined`

- [ ] **Step 1: Escribir el test que falla**

`tests/marketing/hero-pick.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { WikiArticle, WikiFrontmatter } from '../../src/core/types/wiki.ts';
import { pickHeroCreature, resolveHeroSlug } from '../../src/features/marketing/lib/hero-pick.ts';

const art = (slug: string, fm: Partial<WikiFrontmatter> = {}): WikiArticle => ({
  slug,
  content: 'cuerpo',
  frontmatter: { title: slug, universe: 'Colosos', image: `/assets/${slug}.webp`, ...fm },
});

/** Lo que hace `coverOf` en la app, sin React: sin imagen o con una de marca no hay portada. */
const hasCover = (src?: string) => !!src && !src.includes('/assets/Branding/');

const ARTICLES = [
  art('the-bloop'),
  art('el-gran-maja'),
  art('sin-imagen', { image: undefined }),
  art('de-marca', { image: '/assets/Branding/logo.webp' }),
  art('sellada', { status: 'proximamente' }),
  art('bogbo'),
  art('fuera-del-pool'),
];

const POOL = ['the-bloop', 'el-gran-maja', 'bogbo'];
const slugOf = (pool: readonly string[], rand: number) => pickHeroCreature(pool, ARTICLES, rand, hasCover)?.slug;

test('pool vacío → null', () => {
  assert.equal(pickHeroCreature([], ARTICLES, 0.5, hasCover), null);
});

test('sin candidatos válidos → null', () => {
  assert.equal(pickHeroCreature(['no-existe', 'sin-imagen', 'de-marca', 'sellada'], ARTICLES, 0.5, hasCover), null);
});

test('descarta slugs inexistentes, sin portada (falta o de marca) y sellados; el orden es el del pool', () => {
  const pool = ['no-existe', 'bogbo', 'sin-imagen', 'the-bloop', 'de-marca', 'sellada', 'el-gran-maja'];
  assert.equal(slugOf(pool, 0), 'bogbo');
  assert.equal(slugOf(pool, 0.5), 'the-bloop');
  assert.equal(slugOf(pool, 0.999), 'el-gran-maja');
});

test('rand 0 da el primero y 0.999 el último', () => {
  assert.equal(slugOf(POOL, 0), 'the-bloop');
  assert.equal(slugOf(POOL, 0.999), 'bogbo');
});

test('rand fuera de rango se acota: negativo o NaN → primero; 1 o más → último', () => {
  assert.equal(slugOf(POOL, -0.5), 'the-bloop');
  assert.equal(slugOf(POOL, Number.NaN), 'the-bloop');
  assert.equal(slugOf(POOL, 1), 'bogbo');
  assert.equal(slugOf(POOL, 7), 'bogbo');
  assert.equal(slugOf(POOL, Number.POSITIVE_INFINITY), 'bogbo');
});

test('un slug repetido en el pool no pesa doble', () => {
  // Sin repetidos: [the-bloop, bogbo] → 0.6 · 2 = 1.2 → bogbo (con repetidos saldría the-bloop).
  assert.equal(slugOf(['the-bloop', 'the-bloop', 'bogbo'], 0.6), 'bogbo');
});

test('devuelve el resumen (slug + frontmatter), sin content', () => {
  const pick = pickHeroCreature(['the-bloop'], ARTICLES, 0, hasCover);
  assert.deepEqual(pick, { slug: 'the-bloop', frontmatter: ARTICLES[0].frontmatter });
  assert.equal(pick !== null && 'content' in pick, false);
});

test('resolveHeroSlug: solo un slug del pool, recortado; si no, undefined', () => {
  assert.equal(resolveHeroSlug(POOL, 'bogbo'), 'bogbo');
  assert.equal(resolveHeroSlug(POOL, '  bogbo '), 'bogbo');
  assert.equal(resolveHeroSlug(POOL, 'fuera-del-pool'), undefined);
  assert.equal(resolveHeroSlug(POOL, ''), undefined);
  assert.equal(resolveHeroSlug(POOL, undefined), undefined);
});
```

- [ ] **Step 2: Ejecutar el test y ver que falla**

Run: `node --experimental-strip-types --no-warnings --test tests/marketing/hero-pick.test.ts`
Expected: FAIL con `ERR_MODULE_NOT_FOUND` (no existe `src/features/marketing/lib/hero-pick.ts`).

- [ ] **Step 3: Crear `HERO_POOL`**

`src/features/marketing/config/hero-pool.ts`:

```ts
/** Expedientes que pueden abrir la landing: fichas con arte que luce a pantalla completa. Orden sin importancia. */
export const HERO_POOL: readonly string[] = ['the-bloop', 'el-gran-maja', 'bogbo', 'vlad-julia', 'phillip-forte'];
```

- [ ] **Step 4: Implementar `hero-pick.ts`**

`src/features/marketing/lib/hero-pick.ts`:

```ts
/**
 * Expediente que abre la landing (spec 2026-10-27 §4). Puro (imports relativos `.ts`): el azar (`rand`) y el criterio
 * de portada (`hasCover`; en la app, `coverOf`, que vive en un componente con React) llegan por parámetro.
 */
import { pickRandom } from '../../../core/search/random-pick.ts';
import type { WikiArticleSummary } from '../../../core/types/wiki.ts';

/**
 * Candidatos: los slugs de `pool` (en su orden y sin repetir) que existen en `articles`, tienen portada y no están
 * sellados (sin `status`). Con `rand` ∈ [0, 1) devuelve el candidato `floor(rand · n)`; un `rand` fuera de rango se
 * acota (negativo o NaN → el primero; 1 o más → el último). `null` si no queda ningún candidato.
 */
export function pickHeroCreature(
  pool: readonly string[],
  articles: readonly WikiArticleSummary[],
  rand: number,
  hasCover: (image: string | undefined) => boolean,
): WikiArticleSummary | null {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const candidates = [...new Set(pool)]
    .map((slug) => bySlug.get(slug))
    .filter((a): a is WikiArticleSummary => !!a && !a.frontmatter.status && hasCover(a.frontmatter.image));
  // `pickRandom` ya acota por arriba (≥ 1 → el último); aquí se acota por abajo.
  const r = Number.isNaN(rand) ? 0 : Math.max(0, rand);
  const pick = pickRandom(candidates, () => r);
  return pick ? { slug: pick.slug, frontmatter: pick.frontmatter } : null;
}

/** `HERO_FORCE_SLUG` (solo QA): el slug sin espacios, y solo si está en el pool; si no, se ignora y se sortea. */
export function resolveHeroSlug(pool: readonly string[], forced: string | undefined): string | undefined {
  const slug = forced?.trim();
  return slug && pool.includes(slug) ? slug : undefined;
}
```

- [ ] **Step 5: Ejecutar el test y ver que pasa**

Run: `node --experimental-strip-types --no-warnings --test tests/marketing/hero-pick.test.ts`
Expected: PASS (8 tests, 0 fallos).

- [ ] **Step 6: Comprobar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/features/marketing/config/hero-pool.ts src/features/marketing/lib/hero-pick.ts tests/marketing/hero-pick.test.ts
git commit -m "$(cat <<'EOF'
feat(landing): HERO_POOL y sorteo puro del expediente del hero

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Recuento de expedientes por universo (`universe-counts.ts`)

**Files:**
- Create: `src/features/marketing/lib/universe-counts.ts`
- Test: `tests/marketing/universe-counts.test.ts`

**Interfaces:**
- Consumes: `isIndexCategory(category?: string): boolean` de `src/core/search/catalog.ts`.
- Produces (los usa la tarea 6):
  - `countByUniverse(articles: readonly UniverseCountItem[]): (universe: string) => number`, con `UniverseCountItem = { frontmatter: { universe: string; category?: string; status?: string } }` (un `WikiArticle` encaja).
  - `expedientesLabel(n: number): string`

- [ ] **Step 1: Escribir el test que falla**

`tests/marketing/universe-counts.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countByUniverse, expedientesLabel } from '../../src/features/marketing/lib/universe-counts.ts';

const a = (universe: string, extra: { category?: string; status?: 'proximamente' } = {}) => ({
  frontmatter: { universe, ...extra },
});

const ARTICLES = [
  a('Colosos', { category: 'Coloso' }),
  a('Colosos', { category: 'Humano' }),
  a('Colosos', { category: 'Directorio' }),
  a('Colosos', { category: 'Categoría' }),
  a('Colosos', { category: 'Coloso', status: 'proximamente' }),
  a('Capitán de Galeón', { category: 'Historia' }),
  a('Ellos Llegaron'), // sin categoría: cuenta
];

test('cuenta por universo sin índices (Directorio/Categoría) ni sellados', () => {
  const countOf = countByUniverse(ARTICLES);
  assert.equal(countOf('Colosos'), 2);
  assert.equal(countOf('Capitán de Galeón'), 1);
  assert.equal(countOf('Ellos Llegaron'), 1);
});

test('un universo sin fichas (o solo con selladas) da 0', () => {
  assert.equal(countByUniverse(ARTICLES)('La Hecatombe del Lapeón'), 0);
  assert.equal(countByUniverse([a('X', { status: 'proximamente' })])('X'), 0);
  assert.equal(countByUniverse([])('Colosos'), 0);
});

test('expedientesLabel: singular solo con 1', () => {
  assert.equal(expedientesLabel(0), '0 expedientes');
  assert.equal(expedientesLabel(1), '1 expediente');
  assert.equal(expedientesLabel(17), '17 expedientes');
});
```

- [ ] **Step 2: Ejecutar el test y ver que falla**

Run: `node --experimental-strip-types --no-warnings --test tests/marketing/universe-counts.test.ts`
Expected: FAIL con `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implementar `universe-counts.ts`**

`src/features/marketing/lib/universe-counts.ts`:

```ts
/**
 * Expedientes por universo para la sección «Explora los universos» (spec 2026-10-27 §6). Puro (imports relativos `.ts`).
 * Cuenta lo mismo que el registro (`registro.ts`): ni índices (Directorio/Categoría) ni sellados (`proximamente`).
 */
import { isIndexCategory } from '../../../core/search/catalog.ts';

export type UniverseCountItem = { frontmatter: { universe: string; category?: string; status?: string } };

/** Devuelve una consulta `universo → nº de expedientes`; un universo sin fichas que cuenten da 0. */
export function countByUniverse(articles: readonly UniverseCountItem[]): (universe: string) => number {
  const counts = new Map<string, number>();
  for (const { frontmatter: fm } of articles) {
    if (fm.status === 'proximamente' || isIndexCategory(fm.category)) continue;
    counts.set(fm.universe, (counts.get(fm.universe) ?? 0) + 1);
  }
  return (universe) => counts.get(universe) ?? 0;
}

/** «1 expediente», «N expedientes». */
export const expedientesLabel = (n: number): string => (n === 1 ? '1 expediente' : `${n} expedientes`);
```

- [ ] **Step 4: Ejecutar el test y ver que pasa**

Run: `node --experimental-strip-types --no-warnings --test tests/marketing/universe-counts.test.ts`
Expected: PASS (3 tests, 0 fallos).

- [ ] **Step 5: Comprobar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/features/marketing/lib/universe-counts.ts tests/marketing/universe-counts.test.ts
git commit -m "$(cat <<'EOF'
feat(landing): recuento puro de expedientes por universo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `check:content` valida `HERO_POOL`

**Files:**
- Modify: `src/core/content/validate.ts` (añadir `crossCheckHeroPool` tras `crossCheckPollIdSlugs`)
- Modify: `tests/content/validate.test.ts` (import y dos tests al final)
- Modify: `scripts/check-content.mts` (comentario de cabecera, imports, `problems`, recogida de `imageSlugs`, regla 10)

**Interfaces:**
- Consumes: `HERO_POOL: readonly string[]` de `src/features/marketing/config/hero-pool.ts` (tarea 1).
- Produces: `crossCheckHeroPool(pool: readonly string[], articleSlugs: ReadonlySet<string>, imageSlugs: ReadonlySet<string>, sealedSlugs: ReadonlySet<string>): string[]`.

- [ ] **Step 1: Escribir los tests que fallan**

En `tests/content/validate.test.ts`, sustituir el bloque de import:

```ts
import {
  crossCheckEntities,
  crossCheckNews,
  crossCheckPollIdSlugs,
  crossCheckPolls,
  crossCheckReservedSlugs,
  crossCheckVideoLinks,
} from '../../src/core/content/validate.ts';
```

por:

```ts
import {
  crossCheckEntities,
  crossCheckHeroPool,
  crossCheckNews,
  crossCheckPollIdSlugs,
  crossCheckPolls,
  crossCheckReservedSlugs,
  crossCheckVideoLinks,
} from '../../src/core/content/validate.ts';
```

y añadir al final del archivo (usa las constantes `ARTICLES` y `SEALED` que ya define el archivo arriba):

```ts
test('HERO_POOL: cada slug existe, tiene image y no está sellado', () => {
  const errors = crossCheckHeroPool(
    ['the-bloop', 'no-existe', 'sin-imagen', 'cael-cortes'],
    new Set(['the-bloop', 'sin-imagen', 'cael-cortes']),
    new Set(['the-bloop', 'cael-cortes']),
    new Set(['cael-cortes']),
  );
  assert.equal(errors.length, 3);
  assert.match(errors[0], /"no-existe" no existe/);
  assert.match(errors[1], /"sin-imagen" no tiene `image`/);
  assert.match(errors[2], /"cael-cortes" es un expediente sellado/);
});

test('HERO_POOL válido: sin errores', () => {
  assert.deepEqual(
    crossCheckHeroPool(['the-bloop', 'el-gran-maja'], ARTICLES, new Set(['the-bloop', 'el-gran-maja']), SEALED),
    [],
  );
});
```

- [ ] **Step 2: Ejecutar los tests y ver que fallan**

Run: `node --experimental-strip-types --no-warnings --test tests/content/validate.test.ts`
Expected: FAIL con `SyntaxError: The requested module '../../src/core/content/validate.ts' does not provide an export named 'crossCheckHeroPool'`.

- [ ] **Step 3: Implementar `crossCheckHeroPool`**

En `src/core/content/validate.ts`, justo después de la función `crossCheckPollIdSlugs` (antes del comentario `/** \`duelo\`: a y b deben existir…`), añadir:

```ts
/**
 * `HERO_POOL` (expedientes que pueden abrir la landing, spec 2026-10-27 §3): cada slug debe existir, tener `image`
 * (el hero la pinta a pantalla completa) y no estar sellado (`status: proximamente`).
 */
export function crossCheckHeroPool(
  pool: readonly string[],
  articleSlugs: ReadonlySet<string>,
  imageSlugs: ReadonlySet<string>,
  sealedSlugs: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  for (const slug of pool) {
    if (!articleSlugs.has(slug)) {
      errors.push(`hero-pool.ts: "${slug}" no existe en src/content`);
      continue;
    }
    if (!imageSlugs.has(slug)) errors.push(`hero-pool.ts: "${slug}" no tiene \`image\` (el hero necesita una portada)`);
    if (sealedSlugs.has(slug)) {
      errors.push(`hero-pool.ts: "${slug}" es un expediente sellado (status: proximamente) y no puede abrir la landing`);
    }
  }
  return errors;
}
```

- [ ] **Step 4: Ejecutar los tests y ver que pasan**

Run: `node --experimental-strip-types --no-warnings --test tests/content/validate.test.ts`
Expected: PASS (todos, incluidos los dos nuevos).

- [ ] **Step 5: Conectar la regla en `scripts/check-content.mts`**

5a. En el comentario de cabecera, después del punto 9 (la línea que acaba en `` que rompería el id de sus encuestas (`<semana>-<a>-vs-<b>`). ``), añadir:

```ts
 * 10. Un slug de HERO_POOL (src/features/marketing/config/hero-pool.ts) no existe en src/content, su ficha no tiene
 *     `image` o está sellada (`status: proximamente`).
```

5b. Sustituir el bloque de import de `validate.ts`:

```ts
import {
  crossCheckEntities,
  crossCheckNews,
  crossCheckPollIdSlugs,
  crossCheckPolls,
  crossCheckReservedSlugs,
  crossCheckVideoLinks,
} from '../src/core/content/validate.ts';
// Solo datos, sin dependencias de servidor: se pueden leer desde el script.
import { FEATURED_VIDEOS } from '../src/features/marketing/config/videos.ts';
```

por:

```ts
import {
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
```

5c. En el objeto `problems`, después de `'Slugs reservados': [],` añadir:

```ts
  'Hero de la landing (HERO_POOL)': [],
```

5d. Después de `const sealedSlugs = new Set<string>();` añadir:

```ts
const imageSlugs = new Set<string>();
```

5e. Dentro del bucle de MDX, después de la línea `if (parsed.data.status === 'proximamente') sealedSlugs.add(file.replace(/\.mdx$/, ''));` añadir:

```ts
    if (parsed.data.image) imageSlugs.add(file.replace(/\.mdx$/, ''));
```

5f. Después de la línea `problems['Slugs reservados'].push(...crossCheckReservedSlugs(slugs), ...crossCheckPollIdSlugs(slugs));` añadir:

```ts

// 10: expedientes que pueden abrir la landing
problems['Hero de la landing (HERO_POOL)'].push(...crossCheckHeroPool(HERO_POOL, slugs, imageSlugs, sealedSlugs));
```

- [ ] **Step 6: Ejecutar `check:content`**

Run: `npm run check:content`
Expected: termina con `✓ Todo en orden.` (los cinco slugs del pool existen, tienen `image` y no están sellados).

- [ ] **Step 7: Comprobar que la regla muerde (y deshacer)**

Run: `sed -i "s/'phillip-forte'\]/'phillip-forte', 'no-existe']/" src/features/marketing/config/hero-pool.ts && npm run check:content; git checkout src/features/marketing/config/hero-pool.ts`
Expected: sale con código 1 y lista `✗ Hero de la landing (HERO_POOL) (1)` con `hero-pool.ts: "no-existe" no existe en src/content`; tras el `git checkout`, `git status --short src/features/marketing/config/hero-pool.ts` no muestra nada.

- [ ] **Step 8: Tests completos y tipos**

Run: `npm test && npx tsc --noEmit`
Expected: todos los tests pasan; `tsc` sin errores.

- [ ] **Step 9: Commit**

```bash
git add src/core/content/validate.ts tests/content/validate.test.ts scripts/check-content.mts
git commit -m "$(cat <<'EOF'
feat(check:content): HERO_POOL con fichas existentes, con imagen y no selladas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: CSS del hero abisal (`globals.css`)

**Files:**
- Modify: `src/app/globals.css` (`:root`, `.caustics-layer`, bloque nuevo al final)

**Interfaces:**
- Consumes: `@keyframes caustic-flow` (ya existe, dentro de `@layer utilities`).
- Produces (los usa la tarea 5): clases `.hero-creature`, `.hero-caustics`, `.hero-bubble`, `.hero-rise`, `.hero-bob`; `@keyframes hero-emerge`, `hero-drift`, `hero-rise`, `hero-bob`, `hero-bubble-rise`; variable `--caustic-noise`. Contrato de uso: el retardo de `.hero-rise` y la duración/retardo de `.hero-bubble` se ponen con `style` en línea (`animationDelay`, `animationDuration`); `.hero-bubble` necesita además `left`, `width` y `height` en línea.

- [ ] **Step 1: Variable del ruido cáustico en `:root`**

Sustituir:

```css
:root {
  --background: oklch(0.2 0.12 250);
```

por:

```css
:root {
  /* Ruido fractal de la luz cáustica: lo comparten el fondo de la landing (.caustics-layer) y el hero (.hero-caustics). */
  --caustic-noise: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E");
  --background: oklch(0.2 0.12 250);
```

- [ ] **Step 2: `.caustics-layer` usa la variable**

En el bloque `.caustics-layer`, sustituir la línea:

```css
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E");
```

por:

```css
    background-image: var(--caustic-noise);
```

- [ ] **Step 3: Bloque «Hero abisal» al final del archivo**

Añadir al final de `src/app/globals.css` (después del `@layer components { … }` de `.crystal-surface`):

```css

/* ---------- Hero abisal (spec 2026-10-27 §5) ----------
 * Solo CSS: la criatura emerge de la oscuridad y deriva despacio, la luz cáustica se desplaza, suben burbujas y el
 * texto asciende escalonado (el retardo de cada pieza va en `style`). La imagen se pinta desde el primer frame
 * (oscura): `filter` no retrasa su carga ni el LCP.
 * Con `prefers-reduced-motion` todo queda estático: el bloque global acorta duraciones pero no retardos ni
 * `fill-mode`, así que aquí se quitan las animaciones del todo (si no, el texto seguiría invisible durante su retardo). */
@layer components {
  .hero-creature {
    animation:
      hero-emerge 1.6s cubic-bezier(0.2, 0.7, 0.2, 1) both,
      hero-drift 30s ease-in-out 1.6s infinite alternate;
  }

  .hero-caustics {
    background-image: var(--caustic-noise);
    mix-blend-mode: screen;
    opacity: 0.2; /* bajo los velos: solo asoma donde la imagen se ve */
    pointer-events: none;
    animation: caustic-flow 60s linear infinite;
  }

  /* Posición, tamaño, duración (12–18 s) y retardo (0–9 s) de cada burbuja: `style` en línea. */
  .hero-bubble {
    position: absolute;
    bottom: -1rem;
    border-radius: 9999px;
    background: rgb(255 255 255 / 0.25);
    opacity: 0;
    pointer-events: none;
    animation: hero-bubble-rise 15s linear infinite;
  }

  .hero-rise {
    animation: hero-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  .hero-bob {
    animation: hero-bob 2s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-creature,
    .hero-caustics,
    .hero-rise,
    .hero-bob {
      animation: none;
    }

    .hero-creature {
      filter: none;
      transform: none;
    }

    .hero-bubble {
      display: none;
    }
  }
}

@keyframes hero-emerge {
  from {
    filter: brightness(0.25) blur(14px);
    transform: scale(1.1);
  }
  to {
    filter: brightness(1) blur(0);
    transform: scale(1.04);
  }
}

@keyframes hero-drift {
  from {
    transform: scale(1.04) translate(0, 0);
  }
  to {
    transform: scale(1.08) translate(-1.5%, -1%);
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* La flecha «Sumérgete» sube y baja 6 px. */
@keyframes hero-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

/* De debajo del hero (88svh) hasta ~el 20 % superior, con un leve vaivén lateral. */
@keyframes hero-bubble-rise {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }
  10% {
    opacity: 1;
  }
  25% {
    transform: translate(4px, -17.5svh);
  }
  50% {
    transform: translate(-4px, -35svh);
  }
  75% {
    transform: translate(4px, -52.5svh);
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(0, -70svh);
  }
}
```

- [ ] **Step 4: Compilar (Tailwind y Lightning CSS aceptan el bloque)**

Run: `npm run build`
Expected: el build termina sin errores.

- [ ] **Step 5: Comprobar que el CSS emitido trae las piezas**

Run: `grep -rlE 'hero-bubble-rise' .next/static | head -1 | xargs grep -oE 'hero-(emerge|drift|rise|bob|bubble-rise)|--caustic-noise' | sort -u`
Expected (6 líneas):

```
--caustic-noise
hero-bob
hero-bubble-rise
hero-drift
hero-emerge
hero-rise
```

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
feat(landing): estilos del hero abisal (emerger, deriva, cáustica, burbujas) con reduced-motion

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `HeroAbisal` en la landing (dinámica) y adiós a `HeroBleed`

**Files:**
- Create: `src/features/marketing/data/hero-creature.ts`
- Create: `src/features/marketing/sections/HeroAbisal.tsx`
- Delete: `src/features/marketing/sections/HeroBleed.tsx`
- Modify: `src/app/(marketing)/page.tsx` (archivo completo abajo)

**Interfaces:**
- Consumes: `HERO_POOL`, `pickHeroCreature`, `resolveHeroSlug` (tarea 1); clases `.hero-creature`, `.hero-caustics`, `.hero-bubble`, `.hero-rise`, `.hero-bob` (tarea 4); `coverOf(src?: string): string | undefined` de `@/components/content/CategoryPlaceholder`; `getContentRepository().getArticles(): Promise<WikiArticle[]>` de `@/core/content`; `SearchTrigger` (`variant="hero"`) de `@/components/search/SearchTrigger`; `connection()` de `next/server`.
- Produces: `getHeroCreature(): Promise<WikiArticleSummary | null>`; componente `HeroAbisal()` (async, sin props).

- [ ] **Step 1: Helper de datos `getHeroCreature`**

`src/features/marketing/data/hero-creature.ts`:

```ts
import { connection } from 'next/server';
import type { WikiArticleSummary } from '@/core/types/wiki';
import { getContentRepository } from '@/core/content';
import { coverOf } from '@/components/content/CategoryPlaceholder';
import { HERO_POOL } from '../config/hero-pool';
import { pickHeroCreature, resolveHeroSlug } from '../lib/hero-pick';

const hasCover = (src?: string) => coverOf(src) !== undefined;

/**
 * Expediente que abre la landing (spec 2026-10-27 §4). `connection()` saca la página del prerender: cada visita sortea
 * de nuevo y la imagen elegida viaja ya en el HTML (sin parpadeo). El sorteo vive aquí y no en `HeroAbisal` porque
 * `react-hooks/purity` no admite `Math.random()` durante el render de un componente.
 */
export async function getHeroCreature(): Promise<WikiArticleSummary | null> {
  await connection();
  const articles = await getContentRepository().getArticles();
  // `HERO_FORCE_SLUG=<slug del pool>` fija el expediente para la QA (contraste por imagen, Lighthouse). Es una variable
  // de ejecución: se lee en cualquier entorno, también en `next start`; en producción simplemente no se define.
  const forced = resolveHeroSlug(HERO_POOL, process.env.HERO_FORCE_SLUG);
  return pickHeroCreature(forced ? [forced] : HERO_POOL, articles, Math.random(), hasCover);
}
```

- [ ] **Step 2: Componente `HeroAbisal`**

`src/features/marketing/sections/HeroAbisal.tsx`:

```tsx
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { ChevronDown } from 'lucide-react';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { coverOf } from '@/components/content/CategoryPlaceholder';
import { getHeroCreature } from '../data/hero-creature';

/** Burbujas colocadas a mano (spec §5): `left` 8–92 %, 6–14 px, retardo 0–9 s, subida de 12–18 s. */
const BUBBLES = [
  { left: '8%', size: 8, delay: 0, duration: 14 },
  { left: '19%', size: 12, delay: 4.5, duration: 17 },
  { left: '33%', size: 6, delay: 2, duration: 12 },
  { left: '51%', size: 10, delay: 7, duration: 16 },
  { left: '66%', size: 14, delay: 1, duration: 18 },
  { left: '79%', size: 7, delay: 5.5, duration: 13 },
  { left: '92%', size: 9, delay: 9, duration: 15 },
] as const;

/** Retardo de la entrada escalonada (`.hero-rise`). */
const rise = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

/**
 * Primera pantalla de la landing (spec 2026-10-27 §5): un expediente de `HERO_POOL`, distinto en cada visita, emerge de
 * la oscuridad detrás del título, el buscador y el chip que lleva a su ficha. Capas (de atrás hacia delante, todas
 * `aria-hidden`): criatura, velos de contraste, luz cáustica y burbujas.
 *
 * Contraste (≥ 4.5:1 detrás de todo el texto, sea cual sea la imagen, incluso una de fondo blanco como el boceto de
 * El Gran Majá). Los velos son los de `HeroBleed` (auditoría #66), sin cambios. Las paradas del degradado móvil están
 * en px desde arriba:
 *  - 0–90 px (navbar) y primera línea blanca del h1: alfa 0.70 → sobre blanco puro, blanco ≥ 4.5:1 (necesita ≥ 0.58).
 *  - 170–380 px (línea naranja del h1 y la frase blanca/80): alfa 0.88 → sobre blanco puro, #FF7300 da 4.99:1
 *    (necesita ≥ 0.85) y la frase ≥ 0.66.
 *  - de 380 px a 78 %: hasta #00122E sólido.
 * El contenido va centrado en vertical, pero con el mismo `pt-32`/`md:pt-40` que antes: nunca queda más arriba que
 * cuando estaba anclado arriba, y por debajo de 170 px el velo solo se oscurece.
 * En escritorio el velo es horizontal y el corte depende del breakpoint, porque el `container` mide 1024 px de ancho
 * hasta 1279 px y el h1 (60 px, 797 px de ancho) ocupa más del viewport cuanto menos ancho es este:
 *  - lg (1024–1279 px): el h1 llega al 80 % del ancho a 1024 px (78 % a 1100 px) → 0.92 hasta el 82 %.
 *  - xl (≥ 1280 px): el h1 llega como máximo al 64 % → 0.92 hasta el 60 % y alfa ≥ 0.84 en su último carácter.
 * La capa se desvanece en su borde inferior para fundirse con el fondo fijo del layout en vez de cortarse en seco.
 * Sin expediente (pool vacío o sin candidatos), el hero se pinta solo con el degradado y sin chip.
 */
export async function HeroAbisal() {
  const creature = await getHeroCreature();
  const fm = creature?.frontmatter;
  const cover = coverOf(fm?.image);

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_88%,transparent)]"
      >
        {cover && (
          <div className="hero-creature absolute inset-0">
            <Image
              src={cover}
              alt=""
              fill
              sizes="100vw"
              fetchPriority="high"
              loading="eager"
              className="object-cover"
              style={{ objectPosition: fm?.imagePosition ?? '50% 50%' }}
            />
          </div>
        )}
        {/* Luz cáustica DEBAJO de los velos (ruling del controlador): así no toca el contraste calibrado en #66. */}
        <div className="hero-caustics absolute inset-0" />
        {/* Móvil: el texto ocupa todo el ancho → velo vertical (≥ 0.85 bajo el texto naranja). */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,18,46,0.7)_0,rgba(0,18,46,0.7)_90px,rgba(0,18,46,0.88)_170px,rgba(0,18,46,0.88)_380px,#00122E_78%)] lg:hidden" />
        {/* lg (1024–1279 px): el h1 llega al 80 % del ancho → 0.92 hasta el 82 %; la criatura queda en el borde derecho. */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(0,18,46,0.94)_0%,rgba(0,18,46,0.92)_82%,rgba(0,18,46,0.45)_100%)] lg:block xl:hidden" />
        {/* xl (≥ 1280 px): el texto vive en el 60 % izquierdo → velo horizontal; la criatura se ve en el tercio derecho. */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(0,18,46,0.94)_0%,rgba(0,18,46,0.92)_60%,rgba(0,18,46,0.45)_85%,rgba(0,18,46,0.25)_100%)] xl:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-1/2 bg-[linear-gradient(to_top,#00122E_0%,rgba(0,18,46,0.8)_45%,transparent_100%)] lg:block" />
        {BUBBLES.map((b) => (
          <span
            key={b.left}
            className="hero-bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto flex min-h-[88svh] flex-col justify-center px-6 pb-24 pt-32 md:pt-40 short-screen:pb-10 short-screen:pt-28">
        <h1 className="page-title hero-rise" style={rise(0.25)}>
          Explora la inmensidad <span className="block italic text-primary">de mis universos</span>
        </h1>
        <p className="hero-rise mt-4 text-lg text-white/80" style={rise(0.4)}>
          Todo el lore oficial de BorisaoBlois en un solo archivo.
        </p>
        <div className="hero-rise mt-6 max-w-xl" style={rise(0.55)}>
          <SearchTrigger variant="hero" />
        </div>
        {creature && fm && (
          <Link
            href={`/wiki/${creature.slug}` as Route}
            className="hero-rise mt-4 inline-flex min-h-11 items-center self-start rounded-full border border-white/15 bg-[#061a2e]/90 px-4 text-sm text-white transition-colors hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
            style={rise(0.7)}
          >
            <span>
              En pantalla: <strong className="font-bold">{fm.title}</strong> · Ver expediente{' '}
              <span aria-hidden="true">›</span>
            </span>
          </Link>
        )}
      </div>

      {/* «Sumérgete»: baja a los universos. Oculta en escritorio bajo (short-screen), donde no cabe sin pisar el chip. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center short-screen:hidden">
        <a
          href="#universos"
          className="hero-rise pointer-events-auto inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-sm px-3 text-[11px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
          style={rise(1.2)}
        >
          Sumérgete
          <ChevronDown aria-hidden="true" className="hero-bob h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: La landing usa `HeroAbisal` y deja de ser ISR**

Sustituir el contenido completo de `src/app/(marketing)/page.tsx` por:

```tsx
import type { Metadata } from 'next';
import { pageMetadata, SITE_NAME } from '@/lib/seo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HeroAbisal } from '@/features/marketing/sections/HeroAbisal';
import { FeaturedCharactersSection } from '@/features/marketing/sections/FeaturedCharactersSection';
import { FeaturedVideosSection } from '@/features/marketing/sections/FeaturedVideosSection';
import { CommunityStrip } from '@/features/marketing/sections/CommunityStrip';
import { AboutContactSection } from '@/features/marketing/sections/AboutContactSection';

// Sin `revalidate`: la landing es dinámica porque el hero sortea un expediente en cada visita (`connection()` en
// `getHeroCreature`). Los artículos se leen por petición y el RSS de vídeos sigue en la caché de `fetch` (1 h).

export const metadata: Metadata = pageMetadata({
  title: SITE_NAME,
  description: 'Explora la inmensidad de mis universos y sus historias',
  path: '/',
});

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <HeroAbisal />
        <FeaturedCharactersSection />
        <FeaturedVideosSection />
        <CommunityStrip />
        <AboutContactSection />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Borrar `HeroBleed`**

Run: `git rm src/features/marketing/sections/HeroBleed.tsx && grep -rn "HeroBleed" src; echo "exit=$?"`
Expected: `grep` no encuentra nada (`exit=1`).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: sin errores (en particular, ningún `react-hooks/purity`).

- [ ] **Step 6: Build: la landing sale dinámica (ƒ)**

Run: `npm run build 2>&1 | grep -E '[○ƒ●◐] /(\s|$)'`
Expected: una línea con `ƒ /` (p. ej. `┌ ƒ /`), no `○ /`.

- [ ] **Step 7: Cada visita sortea (build de producción)**

Run:

```bash
node_modules/.bin/next start -p 3131 >/dev/null 2>&1 & SERVER=$!
for i in $(seq 1 10); do
  curl -s --retry 10 --retry-connrefused --retry-delay 1 http://localhost:3131/ \
    | grep -o 'En pantalla: <strong[^>]*>[^<]*' | sed 's/.*>//'
done | sort | uniq -c
kill $SERVER; pkill -f 'next start -p 3131' || true
```

Expected: 10 títulos en total repartidos en **al menos 2** distintos, todos de entre `The Bloop Ojo Solo`, `El Gran Majá`, `Bogbo`, `Vlad Julia`, `Phillip Forte` (la probabilidad de que salgan 10 iguales es ~5·10⁻⁷).

- [ ] **Step 8: El forzado de QA funciona en desarrollo**

Run:

```bash
HERO_FORCE_SLUG=bogbo node_modules/.bin/next start -p 3132 >/dev/null 2>&1 & SERVER=$!
for i in 1 2 3; do
  curl -s --retry 60 --retry-connrefused --retry-delay 1 http://localhost:3132/ \
    | grep -o 'En pantalla: <strong[^>]*>[^<]*' | sed 's/.*>//'
done
kill $SERVER; pkill -f 'next dev -p 3132' || true
```

Expected: tres líneas `Bogbo`.

- [ ] **Step 9: Commit**

```bash
git add src/features/marketing/data/hero-creature.ts src/features/marketing/sections/HeroAbisal.tsx "src/app/(marketing)/page.tsx"
git commit -m "$(cat <<'EOF'
feat(landing): hero abisal con un expediente aleatorio de HERO_POOL en cada visita

La landing pasa a dinámica (connection() en getHeroCreature); HeroBleed se borra.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

(El `git rm` del paso 4 ya dejó el borrado de `HeroBleed.tsx` preparado para este commit.)

---

### Task 6: Sección «Explora los universos» (`#universos`)

**Files:**
- Create: `src/features/marketing/sections/UniversesSection.tsx`
- Modify: `src/app/(marketing)/page.tsx` (import y montaje bajo el hero)

**Interfaces:**
- Consumes: `countByUniverse`, `expedientesLabel` (tarea 2); `UNIVERSES: readonly UniverseDef[]` de `src/features/marketing/config/universes.ts` (`id`, `title`, `universeKey?`, `era`, `description`, `image?`, `imagePosition?`, `comingSoon?`); `ContentCard`, `Section` del barril `@/components/content`; `getContentRepository()`.
- Produces: componente `UniversesSection()` (async, sin props), con `id="universos"`.

- [ ] **Step 1: Componente `UniversesSection`**

`src/features/marketing/sections/UniversesSection.tsx`:

```tsx
import { ContentCard, Section } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { UNIVERSES } from '../config/universes';
import { countByUniverse, expedientesLabel } from '../lib/universe-counts';

/**
 * Puerta de entrada al archivo por universo (spec 2026-10-27 §6): sinopsis canónica de Boris y cuántos expedientes
 * abiertos tiene cada uno (sin índices ni sellados). La navbar y el footer enlazan aquí (`/#universos`).
 */
export async function UniversesSection() {
  const articles = await getContentRepository().getArticles();
  const countOf = countByUniverse(articles);

  return (
    <Section id="universos" title="Explora los universos" className="scroll-mt-24">
      <p className="-mt-4 mb-8 max-w-2xl text-white/70">Cada universo tiene sus propias reglas, criaturas y misterios.</p>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {UNIVERSES.map((u, i) => (
          <ContentCard
            key={u.id}
            href={u.universeKey ? `/wiki?universe=${encodeURIComponent(u.universeKey)}#catalogo` : undefined}
            title={u.title}
            meta={u.comingSoon || !u.universeKey ? u.era : `${u.era} · ${expedientesLabel(countOf(u.universeKey))}`}
            description={u.description}
            lines={3}
            image={u.image}
            imagePosition={u.imagePosition}
            pending={u.comingSoon}
            aspect="video"
            headingLevel={3}
            sizes="(min-width: 768px) 50vw, 100vw"
            // Si el hero sale sin imagen, la primera tarjeta puede ser el LCP en móvil.
            eager={i === 0}
          />
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Montarla bajo el hero**

En `src/app/(marketing)/page.tsx`, sustituir:

```tsx
import { HeroAbisal } from '@/features/marketing/sections/HeroAbisal';
```

por:

```tsx
import { HeroAbisal } from '@/features/marketing/sections/HeroAbisal';
import { UniversesSection } from '@/features/marketing/sections/UniversesSection';
```

y sustituir:

```tsx
        <HeroAbisal />
        <FeaturedCharactersSection />
```

por:

```tsx
        <HeroAbisal />
        <UniversesSection />
        <FeaturedCharactersSection />
```

- [ ] **Step 3: Lint y build**

Run: `npm run lint && npm run build 2>&1 | grep -E '[○ƒ●◐] /(\s|$)'`
Expected: lint sin errores; una línea con `ƒ /`.

- [ ] **Step 4: La sección sale con sus cuatro tarjetas y los recuentos**

Run:

```bash
node_modules/.bin/next start -p 3131 >/dev/null 2>&1 & SERVER=$!
HTML=$(curl -s --retry 10 --retry-connrefused --retry-delay 1 http://localhost:3131/)
echo "$HTML" | grep -o 'id="universos"' | wc -l
echo "$HTML" | grep -oE 'Explora los universos|Cada universo tiene sus propias reglas, criaturas y misterios\.'
echo "$HTML" | grep -oE '(Era contemporánea|Siglo XVIII|Años 40) · [0-9]+ expedientes?'
echo "$HTML" | grep -oE '<h3[^>]*>(<a[^>]*>)?(Colosos|Capitán de Galeón|Ellos Llegaron|La Hecatombe del Lapeón)' | wc -l
kill $SERVER; pkill -f 'next start -p 3131' || true
```

Expected (con el contenido de hoy: 17 / 2 / 2):

```
1
Explora los universos
Cada universo tiene sus propias reglas, criaturas y misterios.
Era contemporánea · 17 expedientes
Siglo XVIII · 2 expedientes
Años 40 · 2 expedientes
4
```

(Si el contenido cambió desde que se escribió este plan, los números pueden variar; lo que importa es que cada universo publicado muestre «{era} · N expediente(s)» y que La Hecatombe del Lapeón no lleve recuento.)

- [ ] **Step 5: Commit**

```bash
git add src/features/marketing/sections/UniversesSection.tsx "src/app/(marketing)/page.tsx"
git commit -m "$(cat <<'EOF'
feat(landing): sección «Explora los universos» con sinopsis y número de expedientes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `CLAUDE.md` y validación completa

**Files:**
- Modify: `CLAUDE.md` (comando `check:content`, criatura de la semana, nueva viñeta «Landing» en «Otras piezas»)

**Interfaces:**
- Consumes: todo lo anterior (solo se documenta).
- Produces: nada de código.

- [ ] **Step 1: Comando `check:content`**

Sustituir:

```
npm run check:content  # valida MDX, navegación, assets, novedades y encuestas
```

por:

```
npm run check:content  # valida MDX, navegación, assets, novedades, encuestas y HERO_POOL
```

- [ ] **Step 2: La criatura de la semana ya no está en la landing**

Sustituir:

```
La criatura de la semana (`pickFeatured`, en la landing y el hub) y la encuesta cambian a la vez
```

por:

```
La criatura de la semana (`pickFeatured`, en el hub) y la encuesta cambian a la vez
```

- [ ] **Step 3: Viñeta de la landing en «Otras piezas»**

Justo antes de la línea que empieza por `- Páginas de sistema y SEO:`, añadir:

```markdown
- Landing `(marketing)/page.tsx` — **dinámica** (ƒ, sin `revalidate`): `HeroAbisal` sortea en cada visita un expediente de `HERO_POOL` (`src/features/marketing/config/hero-pool.ts`) con `pickHeroCreature` (`lib/hero-pick.ts`, puro) tras `await connection()`, todo en `getHeroCreature` (`data/hero-creature.ts`): el `Math.random()` va ahí y no en el componente, porque `react-hooks/purity` lo rechaza durante el render. Cada slug de `HERO_POOL` debe existir, tener `image` y no estar sellado: lo exige `check:content`. `HERO_FORCE_SLUG=<slug del pool>` fija el expediente **solo para QA y solo fuera de producción** (se lee si `NODE_ENV !== 'production'`, así que sirve en `next dev`, no en `next start`). La animación es solo CSS (bloque «Hero abisal» de `globals.css`; con `prefers-reduced-motion`, estática) y los velos de contraste son los calibrados en #66: no tocar sus alfas. Debajo, `UniversesSection` (`#universos`, el ancla de la navbar y el footer): los cuatro universos de `universes.ts` con su sinopsis y su número de expedientes (`countByUniverse`: sin índices ni sellados).
```

- [ ] **Step 4: Validación completa (lo mismo que el CI)**

Run: `npm run lint && npm test && npm run check:content && npm run build`
Expected: lint sin errores; todos los tests pasan (incluidos `tests/marketing/hero-pick.test.ts`, `tests/marketing/universe-counts.test.ts` y los dos nuevos de `validate.test.ts`); `check:content` termina con `✓ Todo en orden.`; el build termina y lista `ƒ /`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(claude): landing dinámica por el hero, HERO_POOL y HERO_FORCE_SLUG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

## Notas de QA (las hace el controlador, no son pasos de una tarea)

- QA con Chrome DevTools sobre el build de producción con `RESEND_API_KEY=re_qa_invalida CONTACT_EMAIL=qa-sin-envio@example.invalid make start`: 320 / 390 / 768 / 1024 / 1280 px; sin desbordes horizontales; el chip no se estira y su texto no se corta; la flecha «Sumérgete» baja a `#universos` (y queda bajo la navbar gracias a `scroll-mt-24`); con `prefers-reduced-motion: reduce` emulado, la criatura sale nítida sin `filter`, el texto visible desde el primer frame y sin burbujas.
- Contraste del h1 (línea blanca y naranja) y de la frase sobre cada una de las 5 imágenes del pool, **incluida la capa cáustica** (`mix-blend-mode: screen` al 12 % aclara un poco el fondo): con `HERO_FORCE_SLUG=<slug> npm run dev` (D3: el forzado no existe en `next start`). Si algún caso baja de 4.5:1, la salida mínima es mover `<div className="hero-caustics …" />` delante de los velos (debajo de ellos), sin tocar los alfas.
- Lighthouse en la landing (móvil): accesibilidad / buenas prácticas / SEO 100 y LCP no peor que hoy. Medir «antes» en `main` y «después» en esta rama con `make start`; como el forzado no existe en producción (D3), repetir la auditoría hasta que el chip muestre «The Bloop Ojo Solo» (o comparar la mediana de 3 ejecuciones por lado).

## Autorrevisión

- **Cobertura de la spec:** §2 estructura (tareas 5 y 6: orden Navbar → HeroAbisal → UniversesSection → resto; sin `revalidate`; `HeroBleed` borrado; `#universos` con `scroll-mt-24`). §3 `HERO_POOL` y su regla (tareas 1 y 3). §4 `pickHeroCreature`, `connection()`, `null` → hero sin imagen ni chip (tareas 1 y 5; D1–D3, D5, D6). §5 capas, velos sin cambios, cáustica, 7 burbujas, emerger/deriva, entrada escalonada 0.25/0.4/0.55/0.7/1.2 s, reduced-motion, contenido, chip y flecha (tareas 4 y 5; D8–D11). §6 sección de universos, `countByUniverse` probado (tareas 2 y 6; D7). §7 tests, `check:content`, lint/test/check/build (tareas 1–3 y 7); QA de navegador y Lighthouse en «Notas de QA». §9 `CLAUDE.md` (tarea 7).
- **Placeholders:** ninguno; todo paso de código lleva el código completo.
- **Tipos y nombres:** `pickHeroCreature(pool, articles, rand, hasCover)`, `resolveHeroSlug(pool, forced)`, `HERO_POOL`, `getHeroCreature()`, `countByUniverse(articles)(universe)`, `expedientesLabel(n)`, `crossCheckHeroPool(pool, articleSlugs, imageSlugs, sealedSlugs)` y las clases `.hero-creature` / `.hero-caustics` / `.hero-bubble` / `.hero-rise` / `.hero-bob` se usan con la misma firma en todas las tareas.

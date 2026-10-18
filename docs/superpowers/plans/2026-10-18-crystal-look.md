# Rediseño "crystal look" — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Material "cristal sutil" compartido en todo el sitio y primera pantalla tipo "inicio de consola" (mosaico de tiles) en la landing y en la portada de la wiki, conservando la identidad abisal.

**Architecture:** Primitivas en `src/components/crystal/` (`CrystalTile`, `IconChip`, `Mosaic`) más dos clases de material (`crystal-surface`, `crystal-glow`) en `@layer components`. Tiles de dominio reutilizables (criatura, encuesta, vídeo, Arena, universo, categoría) que reciben datos resueltos en el servidor. Dos composiciones nuevas (`HomeMosaic`, `WikiHomeMosaic`) sustituyen el hero/teaser de la landing y el banner/categorías/destacado de la wiki.

**Tech Stack:** Next.js 16 (App Router, `typedRoutes`), React 19 (Server Components), Tailwind v4, lucide-react, `next/image`.

**Spec:** `docs/superpowers/specs/2026-10-18-crystal-look-design.md`

## Global Constraints

- Sin dependencias npm nuevas.
- Material C: superficie sólida `#061a2e`, borde `white/10`, hilo de brillo superior (gradiente blanco/30), sombra profunda; **sin `backdrop-filter` en las tiles**. `.glass-liquid` solo en navbar, footer y botón secundario (no se toca).
- Radios: `rounded-3xl` tiles/hero; `rounded-2xl` tarjetas; `rounded-xl` controles; `rounded-full` chips.
- Texto ≥ 11 px; secundario ≥ `text-white/60`; superficies naranja sólidas con texto `#00122E`; foco visible `ring-primary`.
- `prefers-reduced-motion`: sin traslación (`motion-reduce:`), además de la regla global de `globals.css`.
- `next/image`: usar `fetchPriority="high"` + `loading="eager"` (no `priority`, obsoleto en Next 16).
- `typedRoutes: true`: rutas con query/hash o plantillas → `as Route` (`import type { Route } from 'next'`).
- Copy en español y **solo canon** (CLAUDE.md): ningún texto nuevo inventa lore.
- Una sola `h1` por página.
- Validación por tarea: `npx tsc --noEmit`, `npm run lint` (0 errores), `npm test`, `npm run build`. (Si `tsc` marca una ruta tipada desconocida, correr `npm run build` primero: genera los tipos de rutas.)
- Componentes visuales sin lógica pura nueva: no hay tests unitarios nuevos; la verificación visual es la QA con Chrome DevTools de la Tarea 6.
- Commits terminan con:
  ```
  Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01XWwdBECjKje9Q7zMvFK3J1
  ```

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/app/globals.css` | Clases `crystal-surface` y `crystal-glow` (`@layer components`) |
| `src/components/crystal/CrystalTile.tsx` | Tile base (variantes `default` / `media` / `hero`, enlace, selección) |
| `src/components/crystal/IconChip.tsx` | Icono en cuadrado teñido |
| `src/components/crystal/Mosaic.tsx` | Contenedor de rejilla |
| `src/components/crystal/index.ts` | Exportaciones |
| `src/features/community/data/weekly-poll.ts` | Encuesta de la semana + luchadores (sin base de datos) |
| `src/features/community/components/PollTeaserTile.tsx` | Teaser estático del duelo |
| `src/features/community/components/LatestVideoTeaserTile.tsx` | Teaser del último vídeo |
| `src/features/monsters/data/featured-matchup.ts` | Duelo canónico de la Arena |
| `src/features/monsters/components/arena/ArenaTile.tsx` | Tile de la Arena |
| `src/features/marketing/components/UniverseTile.tsx` | Tile de universo |
| `src/features/monsters/components/wiki/CategoryTile.tsx` | Tile de categoría |
| `src/features/marketing/sections/HomeMosaic.tsx` | Primera pantalla de la landing |
| `src/features/monsters/components/wiki/WikiHomeMosaic.tsx` | Primera pantalla de la wiki |

---

### Task 1: Material y primitivas `crystal` + migración de /comunidad

**Files:**
- Modify: `src/app/globals.css` (añadir bloque al final)
- Create: `src/components/crystal/CrystalTile.tsx`, `src/components/crystal/IconChip.tsx`, `src/components/crystal/Mosaic.tsx`, `src/components/crystal/index.ts`
- Delete: `src/features/community/components/CrystalTile.tsx`
- Modify (import): `src/features/community/components/PollTile.tsx`, `NewsTile.tsx`, `LatestVideoTile.tsx`, `CreatureOfWeekTile.tsx`

**Interfaces:**
- Produces (desde `@/components/crystal`):
  - `CrystalTile(props: CrystalTileProps)` con `CrystalTileProps = { eyebrow: string; title: ReactNode; icon?: LucideIcon; iconTone?: IconTone; headingLevel?: 1 | 2 | 3; titleSize?: 'page' | 'tile' | 'compact'; titleClassName?: string; className?: string; children?: ReactNode; variant?: 'default' | 'media' | 'hero'; image?: string; imagePosition?: string; category?: string; sizes?: string; priority?: boolean; href?: Route; externalHref?: string }`
  - `IconChip({ icon, tone?, className? })`, `type IconTone = 'primary' | 'cyan'`
  - `Mosaic({ fitViewport?, className?, children })`
  - Clases CSS `crystal-surface`, `crystal-glow` y variable `--crystal-line`.

- [ ] **Step 1: Clases de material** — al final de `src/app/globals.css`:

```css
/* ---------- Material "cristal sutil" (#11) ----------
 * En @layer components: cualquier utilidad (border-*, shadow-*, bg-*) las sobrescribe.
 * --crystal-line es el color del hilo de brillo superior (las tiles enlazables lo cambian en hover/foco). */
@layer components {
  .crystal-surface {
    --crystal-line: rgb(255 255 255 / 0.3);
    background:
      linear-gradient(90deg, transparent, var(--crystal-line), transparent) top / 100% 1px no-repeat,
      #061a2e;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(255 255 255 / 0.1);
    box-shadow: 0 20px 50px rgb(0 0 0 / 0.45);
  }

  .crystal-glow {
    --crystal-line: rgb(255 255 255 / 0.3);
    background:
      linear-gradient(90deg, transparent, var(--crystal-line), transparent) top / 100% 1px no-repeat,
      radial-gradient(60% 70% at 90% 0%, rgb(0 140 220 / 0.22), transparent 70%),
      radial-gradient(50% 60% at 0% 100%, rgb(255 115 0 / 0.12), transparent 70%),
      #061a2e;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(255 255 255 / 0.1);
    box-shadow: 0 20px 50px rgb(0 0 0 / 0.45);
  }
}
```

- [ ] **Step 2: `IconChip`** — `src/components/crystal/IconChip.tsx`

```tsx
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type IconTone = 'primary' | 'cyan';

const TONES: Record<IconTone, string> = {
  primary: 'border-primary/35 bg-primary/10 text-primary',
  cyan: 'border-sky-400/40 bg-[#0064A0]/20 text-sky-300',
};

/** Icono en un cuadrado redondeado teñido (material "cristal sutil"). Decorativo. */
export function IconChip({ icon: Icon, tone = 'primary', className }: { icon: LucideIcon; tone?: IconTone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border', TONES[tone], className)}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
```

- [ ] **Step 3: `Mosaic`** — `src/components/crystal/Mosaic.tsx`

```tsx
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface MosaicProps {
  /** En escritorio, alto mínimo de una pantalla (descontando navbar y márgenes); crece si no cabe. */
  fitViewport?: boolean;
  className?: string;
  children: ReactNode;
}

/** Rejilla de tiles. Columnas y colocación las define cada página con clases literales de Tailwind. */
export function Mosaic({ fitViewport = false, className, children }: MosaicProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:gap-5', fitViewport && 'lg:min-h-[calc(100svh-9rem)]', className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: `CrystalTile`** — `src/components/crystal/CrystalTile.tsx`

```tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { IconChip, type IconTone } from './IconChip';

export interface CrystalTileProps {
  eyebrow: string;
  title: ReactNode;
  icon?: LucideIcon;
  iconTone?: IconTone;
  /** Nivel del título: 1 solo en la tile principal de la página. */
  headingLevel?: 1 | 2 | 3;
  titleSize?: 'page' | 'tile' | 'compact';
  /** Clases extra para el título (p. ej. `line-clamp-2`); no usar para cambiar fuente o tamaño. */
  titleClassName?: string;
  className?: string;
  children?: ReactNode;
  variant?: 'default' | 'media' | 'hero';
  /** Solo `media`: portada; sin imagen (o con el logo) se pinta el placeholder de `category`. */
  image?: string;
  imagePosition?: string;
  category?: string;
  sizes?: string;
  /** Solo `media`: imagen prioritaria (LCP). */
  priority?: boolean;
  /** Toda la tile es un enlace interno. No anidar enlaces en `children`. */
  href?: Route;
  /** Toda la tile es un enlace externo (pestaña nueva). */
  externalHref?: string;
}

const SURFACE = { default: 'crystal-surface', media: 'crystal-surface', hero: 'crystal-glow' } as const;

const TITLE_SIZE = {
  page: 'font-display-wide text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl xl:text-5xl',
  tile: 'font-display text-2xl font-black uppercase italic leading-[1.05] tracking-tight text-white md:text-3xl',
  compact: 'font-display text-xl font-black uppercase italic leading-[1.05] tracking-tight text-white md:text-2xl',
} as const;

/** Estado de selección "consola" para tiles enlazables. */
const INTERACTIVE =
  'transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] hover:[--crystal-line:rgba(255,180,120,0.85)] focus-visible:-translate-y-0.5 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:[--crystal-line:rgba(255,180,120,0.85)] motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0';

/**
 * Tile del material "cristal sutil" (#11): superficie sólida, hilo de brillo superior y sombra profunda.
 * Cambiar el look del sitio = cambiar este componente y las clases `crystal-*` de globals.css.
 */
export function CrystalTile({
  eyebrow,
  title,
  icon,
  iconTone = 'primary',
  headingLevel = 2,
  titleSize = 'tile',
  titleClassName,
  className,
  children,
  variant = 'default',
  image,
  imagePosition,
  category,
  sizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
  priority = false,
  href,
  externalHref,
}: CrystalTileProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  const isMedia = variant === 'media';
  const isLink = Boolean(href || externalHref);
  const cover = image && !isBrandPlaceholder(image) ? image : undefined;

  const classes = cn(
    'group/tile relative flex h-full flex-col overflow-hidden rounded-3xl p-6 md:p-7',
    SURFACE[variant],
    isMedia && 'min-h-[180px] justify-end',
    isLink && INTERACTIVE,
    className,
  );

  const body = (
    <>
      {isMedia && (
        <>
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              sizes={sizes}
              fetchPriority={priority ? 'high' : undefined}
              loading={priority ? 'eager' : undefined}
              className="object-cover transition-transform duration-700 group-hover/tile:scale-105 motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100"
              style={{ objectPosition: imagePosition ?? '50% 50%' }}
            />
          ) : (
            <CategoryPlaceholder category={category} className="pb-16 [&_span]:hidden" />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061a2e] via-[#061a2e]/80 via-40% to-transparent" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--crystal-line),transparent)]" />
        </>
      )}
      <header className="relative z-10">
        <p className="eyebrow flex items-center gap-2 text-primary">
          {icon && <IconChip icon={icon} tone={iconTone} />}
          {eyebrow}
        </p>
        <Heading className={cn('mt-2', TITLE_SIZE[titleSize], titleClassName)}>{title}</Heading>
      </header>
      {children && <div className={cn('relative z-10 mt-4 flex flex-col', !isMedia && 'flex-1')}>{children}</div>}
    </>
  );

  if (externalHref) {
    return (
      <a href={externalHref} target="_blank" rel="noopener noreferrer" className={classes}>
        {body}
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return <section className={classes}>{body}</section>;
}
```

- [ ] **Step 5: Índice** — `src/components/crystal/index.ts`

```ts
export { CrystalTile, type CrystalTileProps } from './CrystalTile';
export { IconChip, type IconTone } from './IconChip';
export { Mosaic } from './Mosaic';
```

- [ ] **Step 6: Migrar /comunidad** — borrar `src/features/community/components/CrystalTile.tsx` (`git rm`) y, en `PollTile.tsx`, `NewsTile.tsx`, `LatestVideoTile.tsx` y `CreatureOfWeekTile.tsx`, sustituir la línea `import { CrystalTile } from './CrystalTile';` por:

```ts
import { CrystalTile } from '@/components/crystal';
```

Nada más cambia en esos archivos (sus props `eyebrow`/`title`/`icon`/`className`/`children` son compatibles). Su eyebrow pasa a mostrar el icono dentro de `IconChip` automáticamente.

- [ ] **Step 7: Validar y commit**

Run: `npm run build` (verde), `npx tsc --noEmit`, `npm run lint` (0 errores), `npm test`. Comprobar con `grep -rn "community/components/CrystalTile\|from './CrystalTile'" src` → sin resultados.

```bash
git add src/app/globals.css src/components/crystal src/features/community/components
git commit -m "feat(crystal): material cristal sutil y primitivas CrystalTile, IconChip y Mosaic"
```

---

### Task 2: El material en las tarjetas existentes

**Files (solo cambian clases; ninguna lógica):**
- Modify: `src/features/monsters/components/wiki/WikiArticleCard.tsx`
- Modify: `src/features/marketing/sections/FeaturedCharactersSection.tsx`
- Modify: `src/features/marketing/components/FlipCard.tsx`
- Modify: `src/features/marketing/sections/AboutBorisSection.tsx`
- Modify: `src/features/marketing/sections/ContactSection.tsx`
- Modify: `src/features/monsters/components/arena/components/FighterCard.tsx`

**Interfaces:**
- Consumes: clases `crystal-surface` y `--crystal-line` (Task 1).

- [ ] **Step 1: `WikiArticleCard.tsx`** — en el `className` del `<Link>` raíz, sustituir la cadena

`'group glass-liquid bg-[#061a2e] border-white/10 overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-refractive'`

por

`'group crystal-surface overflow-hidden flex flex-col transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] hover:[--crystal-line:rgba(255,180,120,0.85)] focus-visible:border-primary/50 motion-reduce:hover:translate-y-0'`

y borrar la línea `<div className="glass-reflection opacity-20" />` dentro de la cabecera de imagen. `rounded-2xl` se queda.

- [ ] **Step 2: `FeaturedCharactersSection.tsx`** — en el `<article>`, sustituir

`"group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#061a2e] shadow-[0_30px_60px_rgba(0,0,0,0.5)]"`

por

`"group crystal-surface flex flex-col overflow-hidden rounded-2xl"`

- [ ] **Step 3: `FlipCard.tsx`** —
  1. En la constante `FACE`, quitar `border border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.5)]` y añadir `crystal-surface`:
     ```ts
     const FACE =
       'absolute inset-0 h-full w-full backface-hidden overflow-hidden rounded-3xl crystal-surface';
     ```
  2. Cara delantera: `className={\`${FACE} glass-liquid\`}` → `className={FACE}` y borrar la línea `<div className="glass-reflection opacity-40" />`.
  3. Cara trasera: `` className={`${FACE} flex flex-col bg-[#061a2e] p-8 focus-visible:outline-none`} `` → `` className={`${FACE} flex flex-col p-8 focus-visible:outline-none`} ``.

- [ ] **Step 4: `AboutBorisSection.tsx`** — sustituir

`"rounded-3xl border border-white/10 bg-[#061a2e] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden relative"`

por

`"crystal-surface rounded-3xl overflow-hidden relative"`

- [ ] **Step 5: `ContactSection.tsx`** — sustituir

`"p-8 md:p-16 rounded-3xl border border-white/10 bg-[#061a2e] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group"`

por

`"crystal-surface p-8 md:p-16 rounded-3xl relative group"`

- [ ] **Step 6: `FighterCard.tsx`** — en el `cn(...)` del `<article>`, sustituir

`'relative flex flex-col overflow-hidden rounded-2xl border bg-[#061a2e] shadow-2xl transition-all duration-500'`

por

`'crystal-surface relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500'`

(las clases condicionales `winner ? ring : 'border-white/10'` y la sombra del ganador se quedan: son utilidades y sobrescriben a `crystal-surface`).

- [ ] **Step 7: Validar y commit**

Run: `npm run build`, `npx tsc --noEmit`, `npm run lint`. `grep -n "glass-reflection\|border-refractive" src/features/monsters/components/wiki/WikiArticleCard.tsx src/features/marketing/components/FlipCard.tsx` → sin resultados.

```bash
git add src/features/monsters/components/wiki/WikiArticleCard.tsx src/features/marketing/sections/FeaturedCharactersSection.tsx src/features/marketing/components/FlipCard.tsx src/features/marketing/sections/AboutBorisSection.tsx src/features/marketing/sections/ContactSection.tsx src/features/monsters/components/arena/components/FighterCard.tsx
git commit -m "feat(crystal): tarjetas de la wiki, la landing y la Arena con el material cristal sutil"
```

---

### Task 3: Tiles de dominio y sus datos

**Files:**
- Create: `src/features/community/data/weekly-poll.ts`
- Modify: `src/features/community/server/poll-state.ts` (`getActivePoll` usa `getWeeklyPoll`)
- Modify: `src/app/(marketing)/comunidad/page.tsx` (usa `getWeeklyPoll`)
- Modify: `src/features/community/components/CreatureOfWeekTile.tsx` (variante `media`)
- Create: `src/features/community/components/PollTeaserTile.tsx`, `src/features/community/components/LatestVideoTeaserTile.tsx`
- Modify: `next.config.ts` (miniaturas de YouTube)
- Create: `src/features/monsters/data/featured-matchup.ts`, `src/features/monsters/components/arena/ArenaTile.tsx`
- Create: `src/features/marketing/components/UniverseTile.tsx`
- Create: `src/features/monsters/components/wiki/CategoryTile.tsx`

**Interfaces:**
- Consumes: `CrystalTile` (Task 1); `getContentRepository` (`@/core/content`); `getCurrentPoll`, `type PollDef` (`@/features/community/lib/poll-schedule`); `type LatestVideo` (`@/features/community/data/latest-video`); `computeMatchup`, `scoreFighter`, `type Fighter`, `type Matchup` (`@/features/monsters/lib/arena`); `hasStats`, `getThreatLevel`, `THREAT_TONE_CLASSES` (`@/features/monsters/lib/stats`); `ProximamenteChip` (`@/features/monsters/components/wiki/mdx/Proximamente`); `type UniverseDef` (`@/features/marketing/config/universes`).
- Produces:
  - `getWeeklyPoll(date?: Date): Promise<{ poll: PollDef | null; fighters: WikiArticle[] }>`
  - `CreatureOfWeekTile({ creature, className?, variant?: 'card' | 'media' })`
  - `PollTeaserTile({ poll: PollDef | null; names: Record<string, string>; className? })`
  - `LatestVideoTeaserTile({ video: LatestVideo; className? })`
  - `getFeaturedMatchup(): Promise<{ a: Fighter; b: Fighter; matchup: Matchup } | null>`
  - `ArenaTile({ a: Fighter; b: Fighter; probA: number; className? })`
  - `UniverseTile({ universe: UniverseDef; count: number; priority?: boolean; className? })`
  - `CategoryTile({ tile: CategoryTileData; className? })`, `interface CategoryTileData { title: string; slug: string; category: string; count: number; image?: string; imagePosition?: string; description?: string; comingSoon?: boolean }`

- [ ] **Step 1: `getWeeklyPoll`** — `src/features/community/data/weekly-poll.ts`

```ts
import type { WikiArticle } from '@/core/types/wiki';
import { getContentRepository } from '@/core/content';
import { hasStats } from '@/features/monsters/lib/stats';
import { getCurrentPoll, type PollDef } from '../lib/poll-schedule';

export interface WeeklyPoll {
  poll: PollDef | null;
  /** Artículos con stats (posibles luchadores). */
  fighters: WikiArticle[];
}

/** Encuesta de la semana y luchadores disponibles. Solo contenido: no toca la base de datos. */
export async function getWeeklyPoll(date: Date = new Date()): Promise<WeeklyPoll> {
  const repo = getContentRepository();
  const [curated, articles] = await Promise.all([repo.getCuratedPolls(), repo.getArticles()]);
  const fighters = articles.filter((a) => hasStats(a.frontmatter));
  return { poll: getCurrentPoll(curated, fighters.map((a) => a.slug), date), fighters };
}
```

En `src/features/community/server/poll-state.ts`: sustituir el cuerpo de `getActivePoll` por `return (await getWeeklyPoll(date)).poll;`, importar `import { getWeeklyPoll } from '../data/weekly-poll';` y quitar los imports que queden sin uso (`getContentRepository`, `hasStats` y el import de valor `getCurrentPoll`; `type PollDef` se mantiene).

En `src/app/(marketing)/comunidad/page.tsx`: importar `getWeeklyPoll` desde `@/features/community/data/weekly-poll`; en el `Promise.all` sustituir `repo.getCuratedPolls()` por `getWeeklyPoll()` (desestructurar como `weekly`); sustituir las líneas que calculan `fighters` y `poll` por `const { poll, fighters } = weekly;`; quitar los imports sin uso (`hasStats`, `getCurrentPoll`). El resto de la página no cambia.

- [ ] **Step 2: `CreatureOfWeekTile` variante `media`** — en `src/features/community/components/CreatureOfWeekTile.tsx`:
  1. Añadir `import type { Route } from 'next';`.
  2. Cambiar la firma a `export function CreatureOfWeekTile({ creature, className, variant = 'card' }: { creature: WikiArticleSummary | null; className?: string; variant?: 'card' | 'media' })`.
  3. Justo después de calcular `threat` y `cover`, insertar:

```tsx
  if (variant === 'media') {
    return (
      <CrystalTile
        variant="media"
        href={`/wiki/${creature.slug}` as Route}
        image={image}
        imagePosition={imagePosition}
        category={category}
        priority
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
        eyebrow="Criatura de la semana"
        title={title}
        icon={Sparkles}
        className={className}
      >
        {threat && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.15em]',
              THREAT_TONE_CLASSES[threat.tone].badge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} aria-hidden="true" />
            Amenaza {threat.label}
          </span>
        )}
        <p className="eyebrow mt-3 text-white/60">
          {universe}
          {category ? ` · ${category}` : ''}
        </p>
      </CrystalTile>
    );
  }
```

La variante `card` (por defecto) queda exactamente como está: /comunidad no cambia.

- [ ] **Step 3: `PollTeaserTile`** — `src/features/community/components/PollTeaserTile.tsx`

```tsx
import { ArrowRight, Swords } from 'lucide-react';
import { CrystalTile } from '@/components/crystal';
import type { PollDef } from '../lib/poll-schedule';

interface PollTeaserTileProps {
  poll: PollDef | null;
  /** slug → título del artículo, para mostrar los nombres del duelo. */
  names: Record<string, string>;
  className?: string;
}

/** Duelo de la semana, estático: la votación vive en /comunidad. Sin encuesta no se pinta. */
export function PollTeaserTile({ poll, names, className }: PollTeaserTileProps) {
  if (!poll) return null;
  const a = names[poll.a] ?? poll.a;
  const b = names[poll.b] ?? poll.b;
  return (
    <CrystalTile
      href="/comunidad"
      eyebrow="Encuesta semanal"
      title={poll.question}
      titleSize="compact"
      icon={Swords}
      iconTone="cyan"
      className={className}
    >
      <p className="flex flex-wrap items-baseline gap-x-2 font-display text-lg font-black uppercase italic leading-tight text-white">
        <span>{a}</span>
        <span className="text-primary">vs</span>
        <span>{b}</span>
      </p>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-primary">
        Votar en Comunidad
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </CrystalTile>
  );
}
```

- [ ] **Step 4: Miniaturas de YouTube** — en `next.config.ts`, añadir a `images.remotePatterns`:

```ts
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
```

- [ ] **Step 5: `LatestVideoTeaserTile`** — `src/features/community/components/LatestVideoTeaserTile.tsx`

```tsx
import { Clapperboard, Play } from 'lucide-react';
import { CrystalTile } from '@/components/crystal';
import type { LatestVideo } from '../data/latest-video';

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Último vídeo del canal: la tile entera abre el vídeo en YouTube. */
export function LatestVideoTeaserTile({ video, className }: { video: LatestVideo; className?: string }) {
  return (
    <CrystalTile
      variant="media"
      externalHref={`https://www.youtube.com/watch?v=${video.id}`}
      image={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
      eyebrow="Último vídeo"
      title={video.title}
      titleSize="compact"
      titleClassName="line-clamp-2"
      icon={Clapperboard}
      iconTone="cyan"
      className={className}
    >
      <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/75">
        <Play className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        Ver en YouTube
        {video.published ? ` · ${dateFormat.format(new Date(video.published))}` : ''}
      </span>
    </CrystalTile>
  );
}
```

- [ ] **Step 6: Duelo canónico de la Arena** — `src/features/monsters/data/featured-matchup.ts` (la lógica sale tal cual de `ArenaTeaserSection.tsx`, que se borra en la Task 4):

```ts
import type { WikiArticle } from '@/core/types/wiki';
import { getAllArticles, getArticleBySlug } from '@/utils/mdx';
import { hasStats } from '@/features/monsters/lib/stats';
import { computeMatchup, scoreFighter, type Fighter, type Matchup } from '@/features/monsters/lib/arena';

/** Enfrentamiento canónico del lore: la batalla del Atlántico. */
const CANON_PAIR = ['el-gran-maja', 'the-bloop'] as const;

export interface FeaturedMatchup {
  a: Fighter;
  b: Fighter;
  matchup: Matchup;
}

const toFighter = (article: WikiArticle | null): Fighter | null =>
  article && hasStats(article.frontmatter) ? { slug: article.slug, frontmatter: article.frontmatter } : null;

/** Pareja canónica; si alguna ficha falta, los dos combatientes de mayor puntaje del archivo. */
export async function getFeaturedMatchup(): Promise<FeaturedMatchup | null> {
  const [a, b] = (await Promise.all(CANON_PAIR.map((slug) => getArticleBySlug(slug)))).map(toFighter);
  let pair: [Fighter, Fighter] | null = a && b ? [a, b] : null;
  if (!pair) {
    const ranked = (await getAllArticles())
      .map(toFighter)
      .filter((f): f is Fighter => f !== null)
      .sort((x, y) => scoreFighter(y.frontmatter.stats) - scoreFighter(x.frontmatter.stats));
    pair = ranked.length >= 2 ? [ranked[0], ranked[1]] : null;
  }
  if (!pair) return null;
  return { a: pair[0], b: pair[1], matchup: computeMatchup(pair[0].frontmatter.stats, pair[1].frontmatter.stats) };
}
```

- [ ] **Step 7: `ArenaTile`** — `src/features/monsters/components/arena/ArenaTile.tsx`

```tsx
import type { Route } from 'next';
import { ArrowRight, Swords } from 'lucide-react';
import { CrystalTile } from '@/components/crystal';
import type { Fighter } from '@/features/monsters/lib/arena';

interface ArenaTileProps {
  a: Fighter;
  b: Fighter;
  /** Probabilidad de victoria de `a` (0-1). */
  probA: number;
  className?: string;
}

/** Duelo de la Arena con su barra de probabilidad; la tile abre ese mismo duelo. */
export function ArenaTile({ a, b, probA, className }: ArenaTileProps) {
  const pctA = Math.round(probA * 100);
  const pctB = 100 - pctA;
  return (
    <CrystalTile
      href={`/wiki/arena?a=${a.slug}&b=${b.slug}` as Route}
      eyebrow="Versus Arena"
      title="Enfrenta a los colosos"
      titleSize="compact"
      icon={Swords}
      className={className}
    >
      <p className="flex flex-wrap items-baseline justify-between gap-2 font-display text-base font-black uppercase italic leading-tight text-white">
        <span>{a.frontmatter.title}</span>
        <span className="text-primary">vs</span>
        <span>{b.frontmatter.title}</span>
      </p>
      <div
        role="img"
        aria-label={`Probabilidad de victoria: ${a.frontmatter.title} ${pctA} %, ${b.frontmatter.title} ${pctB} %`}
        className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-white/10"
      >
        <span className="h-full bg-primary" style={{ width: `${pctA}%` }} />
        <span className="h-full bg-cyan-400" style={{ width: `${pctB}%` }} />
      </div>
      <div aria-hidden="true" className="mt-1 flex justify-between font-mono text-[12px] font-bold tabular-nums">
        <span className="text-primary">{pctA}%</span>
        <span className="text-cyan-300">{pctB}%</span>
      </div>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-primary">
        Abrir la Arena
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </CrystalTile>
  );
}
```

- [ ] **Step 8: `UniverseTile`** — `src/features/marketing/components/UniverseTile.tsx`

```tsx
import type { Route } from 'next';
import { CrystalTile } from '@/components/crystal';
import { ProximamenteChip } from '@/features/monsters/components/wiki/mdx/Proximamente';
import type { UniverseDef } from '../config/universes';

interface UniverseTileProps {
  universe: UniverseDef;
  /** Artículos de la wiki con `universe` = `universeKey`. */
  count: number;
  priority?: boolean;
  className?: string;
}

/** Universo en el mosaico de la landing; enlaza a la wiki filtrada por universo. */
export function UniverseTile({ universe, count, priority = false, className }: UniverseTileProps) {
  const href = universe.universeKey
    ? (`/wiki?universe=${encodeURIComponent(universe.universeKey)}#explorar` as Route)
    : undefined;
  return (
    <CrystalTile
      variant="media"
      href={href}
      image={universe.image}
      imagePosition={universe.imagePosition}
      priority={priority}
      sizes="(min-width: 1024px) 25vw, 50vw"
      eyebrow={universe.era}
      title={universe.title}
      titleSize="compact"
      titleClassName="break-words hyphens-auto"
      className={className}
    >
      {universe.comingSoon ? (
        <ProximamenteChip className="self-start" />
      ) : (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
          {count} {count === 1 ? 'artículo' : 'artículos'}
        </span>
      )}
    </CrystalTile>
  );
}
```

- [ ] **Step 9: `CategoryTile`** — `src/features/monsters/components/wiki/CategoryTile.tsx`

```tsx
import type { Route } from 'next';
import { CrystalTile } from '@/components/crystal';
import { cn } from '@/utils/cn';
import { ProximamenteChip } from './mdx/Proximamente';

export interface CategoryTileData {
  title: string;
  slug: string;
  /** Valor exacto de `category` en el frontmatter. */
  category: string;
  count: number;
  image?: string;
  imagePosition?: string;
  /** Solo canon o factual (regla "solo canon"). */
  description?: string;
  /** Categoría sin lore canónico todavía. */
  comingSoon?: boolean;
}

/** Categoría de la wiki en el mosaico de la portada. */
export function CategoryTile({ tile, className }: { tile: CategoryTileData; className?: string }) {
  return (
    <CrystalTile
      variant="media"
      href={`/wiki/${tile.slug}` as Route}
      image={tile.image}
      imagePosition={tile.imagePosition}
      category={tile.category}
      sizes="(min-width: 1024px) 25vw, 50vw"
      eyebrow={tile.count > 0 ? `${tile.count} registro${tile.count === 1 ? '' : 's'}` : 'Sin registros'}
      title={tile.title}
      titleSize="compact"
      titleClassName="break-words hyphens-auto"
      className={cn('min-h-[160px] sm:min-h-[200px]', className)}
    >
      {tile.comingSoon ? (
        <ProximamenteChip className="self-start" />
      ) : tile.description ? (
        <p className="line-clamp-2 text-[13px] leading-snug text-white/70 sm:text-sm">{tile.description}</p>
      ) : null}
    </CrystalTile>
  );
}
```

- [ ] **Step 10: Validar y commit**

Run: `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm test` (las 27 pruebas siguen pasando: `poll-state` solo delega).

```bash
git add src/features/community src/features/monsters/data src/features/monsters/components/arena/ArenaTile.tsx src/features/marketing/components/UniverseTile.tsx src/features/monsters/components/wiki/CategoryTile.tsx next.config.ts "src/app/(marketing)/comunidad/page.tsx"
git commit -m "feat(crystal): tiles de criatura, encuesta, vídeo, Arena, universo y categoría"
```

---

### Task 4: Landing — mosaico de inicio

**Files:**
- Create: `src/features/marketing/sections/HomeMosaic.tsx`
- Modify: `src/app/(marketing)/page.tsx`
- Delete: `src/features/marketing/sections/HeroSection.tsx`, `src/features/marketing/components/hero/HeroVisual.tsx`, `src/features/marketing/components/hero/BrandCapsule.tsx`, `src/features/marketing/sections/ArenaTeaserSection.tsx`

**Interfaces:**
- Consumes: `CrystalTile`, `Mosaic` (Task 1); `getWeeklyPoll`, `CreatureOfWeekTile` (`variant="media"`), `PollTeaserTile`, `LatestVideoTeaserTile`, `getFeaturedMatchup`, `ArenaTile`, `UniverseTile` (Task 3); `getLatestVideo` (`@/features/community/data/latest-video`); `getLoreStats` (`@/features/marketing/actions/get-lore-stats`); `SearchBar` (`@/features/marketing/components/hero/SearchBar`); `UNIVERSES`; `pickFeatured`.
- Produces: `HomeMosaic()` (Server Component async).

- [ ] **Step 1: `HomeMosaic`** — `src/features/marketing/sections/HomeMosaic.tsx`

```tsx
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { CrystalTile, Mosaic } from '@/components/crystal';
import { getContentRepository } from '@/core/content';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { getLatestVideo } from '@/features/community/data/latest-video';
import { CreatureOfWeekTile } from '@/features/community/components/CreatureOfWeekTile';
import { PollTeaserTile } from '@/features/community/components/PollTeaserTile';
import { LatestVideoTeaserTile } from '@/features/community/components/LatestVideoTeaserTile';
import { ArenaTile } from '@/features/monsters/components/arena/ArenaTile';
import { getFeaturedMatchup } from '@/features/monsters/data/featured-matchup';
import { cn } from '@/utils/cn';
import { getLoreStats } from '../actions/get-lore-stats';
import { SearchBar } from '../components/hero/SearchBar';
import { UniverseTile } from '../components/UniverseTile';
import { UNIVERSES } from '../config/universes';

/**
 * Primera pantalla de la landing: "inicio de consola" (#11).
 * lg: [hero 2 filas | criatura | encuesta] / [hero | vídeo | Arena] / [universos ×4].
 * md: hero a lo ancho; criatura | encuesta; Arena | vídeo; universos 2×2. Móvil: una columna en orden del DOM.
 */
export async function HomeMosaic() {
  const repo = getContentRepository();
  const [articles, weekly, video, featuredMatchup, lore] = await Promise.all([
    repo.getArticles(),
    getWeeklyPoll(),
    getLatestVideo(),
    getFeaturedMatchup(),
    getLoreStats(),
  ]);

  const names = Object.fromEntries(weekly.fighters.map((a) => [a.slug, a.frontmatter.title]));
  const countByUniverse = new Map<string, number>();
  for (const a of articles) {
    countByUniverse.set(a.frontmatter.universe, (countByUniverse.get(a.frontmatter.universe) ?? 0) + 1);
  }
  const hasPoll = weekly.poll !== null;

  return (
    <section className="container mx-auto px-6 pb-12 pt-28 md:pt-32">
      <Mosaic fitViewport className="md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[1fr_1fr_auto]">
        <CrystalTile
          variant="hero"
          headingLevel={1}
          titleSize="page"
          eyebrow="Universos de BorisaoBlois"
          icon={Sparkles}
          title={
            <>
              Explora la inmensidad <span className="block italic text-primary">de mis universos</span>
            </>
          }
          className="md:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1"
        >
          <p className="max-w-lg text-base leading-relaxed text-white/70">
            Y sus historias: colosos abisales, capitanes del siglo XVIII y una Segunda Guerra Mundial interrumpida
            por un enemigo salido de la nada. Todo el lore oficial de BorisaoBlois en un solo archivo.
          </p>
          <div className="mt-6">
            <SearchBar />
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-6">
            <Link
              href="/wiki"
              className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-[11px] font-bold uppercase tracking-wider text-[#00122E] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:hover:scale-100"
            >
              Acceder a la wiki
            </Link>
            <p className="font-mono text-[12px] text-white/60">
              {lore.loreEntries} expedientes · {lore.creaturesWithStats} fichas biométricas · {lore.universes} universos
            </p>
          </div>
        </CrystalTile>

        <CreatureOfWeekTile
          variant="media"
          creature={pickFeatured(articles)}
          className="min-h-[260px] lg:col-start-2 lg:row-start-1 lg:min-h-0"
        />

        <PollTeaserTile poll={weekly.poll} names={names} className="lg:col-start-3 lg:row-start-1" />

        {featuredMatchup && (
          <ArenaTile
            a={featuredMatchup.a}
            b={featuredMatchup.b}
            probA={featuredMatchup.matchup.probA}
            className={cn('lg:col-start-3', hasPoll ? 'lg:row-start-2' : 'lg:row-span-2 lg:row-start-1')}
          />
        )}

        <LatestVideoTeaserTile video={video} className="min-h-[220px] lg:col-start-2 lg:row-start-2 lg:min-h-0" />

        <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-3 lg:row-start-3 lg:grid-cols-4 lg:gap-5">
          {UNIVERSES.map((universe, i) => (
            <UniverseTile
              key={universe.id}
              universe={universe}
              count={universe.universeKey ? (countByUniverse.get(universe.universeKey) ?? 0) : 0}
              priority={i === 0}
              className="min-h-[150px]"
            />
          ))}
        </div>
      </Mosaic>
    </section>
  );
}
```

- [ ] **Step 2: Página** — reemplazar `src/app/(marketing)/page.tsx` por:

```tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HomeMosaic } from '@/features/marketing/sections/HomeMosaic';
import { UniversePreviewSection } from '@/features/marketing/sections/UniversePreviewSection';
import { FeaturedCharactersSection } from '@/features/marketing/sections/FeaturedCharactersSection';
import { FeaturedVideosSection } from '@/features/marketing/sections/FeaturedVideosSection';
import { AboutBorisSection } from '@/features/marketing/sections/AboutBorisSection';
import { ContactSection } from '@/features/marketing/sections/ContactSection';

/** Criatura, duelo de la semana y último vídeo cambian sin rebuild. */
export const revalidate = 3600;

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <HomeMosaic />
        <UniversePreviewSection />
        <FeaturedCharactersSection />
        <FeaturedVideosSection />
        <AboutBorisSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Retirar lo sustituido** — `git rm src/features/marketing/sections/HeroSection.tsx src/features/marketing/components/hero/HeroVisual.tsx src/features/marketing/components/hero/BrandCapsule.tsx src/features/marketing/sections/ArenaTeaserSection.tsx`. Comprobar: `grep -rn "HeroSection\|HeroVisual\|BrandCapsule\|ArenaTeaserSection" src` → sin resultados.

- [ ] **Step 4: Validar y commit**

Run: `npm run build` (debe listar `/` con revalidate `1h`), `npx tsc --noEmit`, `npm run lint`, `npm test`.

```bash
git add src/features/marketing "src/app/(marketing)/page.tsx"
git commit -m "feat(crystal): landing con mosaico de inicio tipo consola"
```

---

### Task 5: Portada de la wiki — mosaico

**Files:**
- Create: `src/features/monsters/components/wiki/WikiHomeMosaic.tsx`
- Modify: `src/app/(wiki)/wiki/page.tsx`
- Delete: `src/features/monsters/components/wiki/WikiBanner.tsx`, `src/features/monsters/components/wiki/CategoryTiles.tsx`, `src/features/monsters/components/wiki/FeaturedCreature.tsx`

**Interfaces:**
- Consumes: `CrystalTile`, `Mosaic` (Task 1); `getWeeklyPoll`, `CreatureOfWeekTile`, `PollTeaserTile`, `getFeaturedMatchup`, `ArenaTile`, `CategoryTile`, `type CategoryTileData` (Task 3); `SearchBar`; `isBrandPlaceholder`; `pickFeatured`; `WikiExplorerSection` (sin cambios).
- Produces: `WikiHomeMosaic()` (Server Component async).

- [ ] **Step 1: `WikiHomeMosaic`** — `src/features/monsters/components/wiki/WikiHomeMosaic.tsx`

```tsx
import { Database } from 'lucide-react';
import type { WikiArticle } from '@/core/types/wiki';
import { CrystalTile, Mosaic } from '@/components/crystal';
import { getContentRepository } from '@/core/content';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { CreatureOfWeekTile } from '@/features/community/components/CreatureOfWeekTile';
import { PollTeaserTile } from '@/features/community/components/PollTeaserTile';
import { ArenaTile } from '@/features/monsters/components/arena/ArenaTile';
import { getFeaturedMatchup } from '@/features/monsters/data/featured-matchup';
import { SearchBar } from '@/features/marketing/components/hero/SearchBar';
import { cn } from '@/utils/cn';
import { isBrandPlaceholder } from './CategoryPlaceholder';
import { CategoryTile, type CategoryTileData } from './CategoryTile';

/** Descripciones solo canon o factuales (regla "solo canon" de CLAUDE.md). */
const CATEGORY_DEFS: Array<Omit<CategoryTileData, 'count' | 'image' | 'imagePosition'>> = [
  { title: 'Colosos', slug: 'colosos', category: 'Coloso', description: 'Más de 200 metros de longitud y más de 20 mil toneladas de peso.' },
  { title: 'Titanes', slug: 'titanes', category: 'Titán', description: "Le'Mug y los garddiodon pertenecen a esta categoría." },
  { title: 'Medianos', slug: 'medianos', category: 'Mediano', comingSoon: true },
  { title: 'Especies', slug: 'especies', category: 'Especie', description: 'Especies identificadas del universo Colosos.' },
  { title: 'Humanos', slug: 'humanos-colosos', category: 'Humano', description: 'Phillip Forte y los demás personajes humanos del universo Colosos.' },
  { title: 'Organi­zaciones', slug: 'organizaciones', category: 'Organización', description: 'DELIRIUM, IPCARO y las Naciones Rebeldes.' },
];

function coverFor(articles: WikiArticle[], category: string): Pick<CategoryTileData, 'image' | 'imagePosition'> {
  const withImage = articles.find(
    (a) => a.frontmatter.category === category && a.frontmatter.image && !isBrandPlaceholder(a.frontmatter.image),
  );
  return withImage ? { image: withImage.frontmatter.image, imagePosition: withImage.frontmatter.imagePosition } : {};
}

/**
 * Primera pantalla de /wiki (#11).
 * lg: [archivo 2 filas | criatura 2 filas | Arena] / [archivo | criatura | encuesta] / [categorías 3×2].
 * Móvil y md: archivo, criatura, categorías, Arena, encuesta (orden del DOM).
 */
export async function WikiHomeMosaic() {
  const repo = getContentRepository();
  const [articles, weekly, featuredMatchup] = await Promise.all([
    repo.getArticles(),
    getWeeklyPoll(),
    getFeaturedMatchup(),
  ]);

  const tiles: CategoryTileData[] = CATEGORY_DEFS.map((def) => ({
    ...def,
    count: articles.filter((a) => a.frontmatter.category === def.category).length,
    ...coverFor(articles, def.category),
  }));
  const names = Object.fromEntries(weekly.fighters.map((a) => [a.slug, a.frontmatter.title]));
  const hasPoll = weekly.poll !== null;

  return (
    <Mosaic fitViewport className="md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[1fr_1fr_auto]">
      <CrystalTile
        variant="hero"
        headingLevel={1}
        titleSize="page"
        eyebrow="Base de datos DELIRIUM"
        icon={Database}
        title={
          <>
            Archivo Central <span className="block italic text-primary">de Universos</span>
          </>
        }
        className="md:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1"
      >
        <p className="max-w-xl text-base leading-relaxed text-white/75">
          El repositorio oficial de lore: criaturas, organizaciones, vehículos e historia de los universos de BorisaoBlois.
        </p>
        <div className="mt-6">
          <SearchBar placeholder="Buscar en el archivo…" />
        </div>
      </CrystalTile>

      <CreatureOfWeekTile
        variant="media"
        creature={pickFeatured(articles)}
        className="min-h-[260px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0"
      />

      <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-3 lg:row-start-3 lg:grid-cols-3 lg:gap-5">
        {tiles.map((tile) => (
          <CategoryTile key={tile.slug} tile={tile} />
        ))}
      </div>

      {featuredMatchup && (
        <ArenaTile
          a={featuredMatchup.a}
          b={featuredMatchup.b}
          probA={featuredMatchup.matchup.probA}
          className={cn('lg:col-start-3 lg:row-start-1', !hasPoll && 'lg:row-span-2')}
        />
      )}

      <PollTeaserTile poll={weekly.poll} names={names} className="lg:col-start-3 lg:row-start-2" />
    </Mosaic>
  );
}
```

- [ ] **Step 2: Página** — reemplazar `src/app/(wiki)/wiki/page.tsx` por:

```tsx
import { WikiHomeMosaic } from '@/features/monsters/components/wiki/WikiHomeMosaic';
import { WikiExplorerSection } from '@/features/monsters/components/wiki/WikiExplorerSection';

/** Criatura y duelo de la semana cambian sin rebuild. */
export const revalidate = 3600;

export default function WikiIndex() {
  return (
    <div className="wiki-container flex-1 space-y-12 py-10 lg:space-y-16 lg:py-14">
      <WikiHomeMosaic />
      <WikiExplorerSection />
    </div>
  );
}
```

- [ ] **Step 3: Retirar lo sustituido** — `git rm src/features/monsters/components/wiki/WikiBanner.tsx src/features/monsters/components/wiki/CategoryTiles.tsx src/features/monsters/components/wiki/FeaturedCreature.tsx`. Comprobar: `grep -rn "WikiBanner\|CategoryTiles\|FeaturedCreature\b" src` → sin resultados.

- [ ] **Step 4: Validar y commit**

Run: `npm run build` (debe listar `/wiki` con revalidate `1h`), `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run check:content`.

```bash
git add src/features/monsters/components/wiki "src/app/(wiki)/wiki/page.tsx"
git commit -m "feat(crystal): portada de la wiki con mosaico y categorías con descripción canónica"
```

---

### Task 6: QA con Chrome DevTools, PR (orquestador)

**Files:**
- Create: `docs/audits/2026-10-18-crystal-look/README.md` + capturas `.webp`

- [ ] **Step 1: Capturas "antes"** — antes de la Task 4 (o desde `main`): `/`, `/wiki`, `/comunidad` a 1440 y 390, para la comparación.
- [ ] **Step 2: Build de producción** — `npm run build && npx next start -p 3131` (fondo; parar con `kill $(lsof -t -i:3131)`).
- [ ] **Step 3: Casos** (390, 768, 1024, 1440; `/`, `/wiki`, `/comunidad`, `/wiki/the-bloop`, `/wiki/arena`):
  1. El mosaico cabe en la primera pantalla a 1440 × 900 y 1280 × 800 (landing y wiki).
  2. Sin scroll horizontal (`document.documentElement.scrollWidth === innerWidth`).
  3. Tab por las tiles: foco visible, hilo superior naranja, orden lógico (hero → criatura → encuesta → Arena → vídeo → universos).
  4. `emulate` con `prefers-reduced-motion: reduce`: las tiles no se desplazan.
  5. Enlaces: criatura → ficha; encuesta → `/comunidad`; Arena → `/wiki/arena?a=el-gran-maja&b=the-bloop` con el duelo cargado; vídeo → YouTube en pestaña nueva; universo → `/wiki?universe=…#explorar` filtrado; categoría → artículo.
  6. Una sola `h1` por página.
  7. `/comunidad` igual que antes (salvo el icono del eyebrow en cuadrado).
  8. Consola sin errores; red sin 4xx/5xx (incluida la miniatura de `i.ytimg.com`).
  9. Lighthouse accesibilidad 100 en `/`, `/wiki`, `/comunidad` (móvil y escritorio).
- [ ] **Step 4: Evidencias** — capturas "antes/después" a WebP en `docs/audits/2026-10-18-crystal-look/` + README con la tabla de casos.
- [ ] **Step 5: Revisión final y PR** — revisión de toda la rama (opus); `gh pr create` con `Closes #11`; CI verde; `gh pr merge --squash --delete-branch`; `main` actualizado y `npm run build` en main.

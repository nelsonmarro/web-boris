# UX alta prioridad (épica #30, ola 1) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolver los cinco issues de prioridad alta de la auditoría UI/UX (#15, #16, #17, #18, #19) y cerrar #6 y #8, sin perder la estética Abisal.

**Architecture:** Orquestador + 4 workers en paralelo con archivos disjuntos (A: imágenes MDX; B: shell móvil del artículo; C: hero + búsqueda; D: footer de la wiki). Los workers no hacen commit; el orquestador revisa (spec + calidad), ejecuta QA con Chrome DevTools, commitea y abre el PR.

**Tech Stack:** Next.js 16 App Router (`typedRoutes: true`), React 19, Tailwind v4, Base UI, lucide-react 1.7.

**Spec:** issues de GitHub #15–#19 (texto de cada issue = requisitos) + `docs/audits/2026-10-17-ui-ux/README.md` (evidencia). Rama: `feat/ux-alta-prioridad`.

## Global Constraints

- Texto visible en español. Mínimo 11 px. Paleta Abisal: primario `#FF7300`, fondo `#00122E`, sólido bajo texto `#061a2e`; glass solo en chrome/hero/cards; nunca blur bajo párrafos.
- Radios: `rounded-3xl` hero/featured, `rounded-2xl` cards/paneles, `rounded-xl` controles, `rounded-full` chips.
- Headers MDX h2/h3 conservan `clear-both`. Las imágenes llenan su contenedor sin padding interno.
- `typedRoutes: true`: enlaces con query como objeto `{ pathname, query, hash }`.
- Sin suite de tests: cada worker valida con `npx tsc --noEmit` filtrado a sus archivos; **no** ejecuta `npm run build`/`dev`/`next start` ni hace commit (varios agentes comparten el árbol). El orquestador hace build, QA y commits.
- No inventar lore ni copy sobre Boris; los textos nuevos deben ser descriptivos o venir del PDF/docx.

---

### Task A: Imágenes de artículo sin float en móvil y captions legibles (#15)

**Files:**
- Modify: `src/features/monsters/components/wiki/mdx/WikiGallery.tsx`

**Interfaces:** `WikiImage {src, alt, caption?, align?}` y `WikiGallery` no cambian de API.

- [ ] **Step 1: Clases de alineación responsivas.** Sustituir `alignClasses` por:
```ts
const alignClasses = {
  right: 'w-full mb-8 mt-0 md:float-right md:ml-8 md:mb-6 md:w-80 lg:w-96 md:clear-right',
  left: 'w-full mb-8 mt-0 md:float-left md:mr-8 md:mb-6 md:w-80 lg:w-96 md:clear-left',
  center: 'mx-auto mb-12 mt-0 w-full max-w-4xl clear-both',
  none: 'w-full mb-8 mt-0',
};
```
y el aspect del enlace: `align === 'none' || align === 'center' ? 'aspect-video' : 'aspect-[4/3] md:aspect-[4/5]'` (en móvil una imagen flotada pasa a ancho completo; 4/3 evita un bloque vertical gigante).

- [ ] **Step 2: Caption legible.** Reemplazar el bloque de caption por:
```tsx
{caption && (
  <figcaption className="mt-3 px-1 text-[12px] leading-snug text-white/55 md:text-[13px]">
    {caption}
  </figcaption>
)}
```
Convertir el contenedor raíz en `<figure>` (mantener clases) y quitar la línea decorativa y el `uppercase italic tracking-[0.2em]`. Mantener el overlay de zoom en hover.

- [ ] **Step 3: Validar.** `npx tsc --noEmit 2>&1 | grep WikiGallery` → vacío. Comprobar que `MdxRenderer.tsx` no estiliza `figure`/`figcaption` de forma que rompa esto (`grep -n "figure\|figcaption" src/features/monsters/components/wiki/mdx/MdxRenderer.tsx src/app/globals.css`); si hubiera reglas `prose` que añadan márgenes, el `not-prose` ya presente las neutraliza.

---

### Task B: Ficha compacta en móvil y TOC colapsado (#16)

**Files:**
- Create: `src/features/monsters/components/wiki/mdx/WikiInfoboxCompact.tsx`
- Modify: `src/features/monsters/components/wiki/article/WikiArticleContent.tsx`
- Modify: `src/features/monsters/components/wiki/mdx/WikiTOC.tsx` (solo el estado inicial)

**Interfaces:**
- Consumes: `WikiFrontmatter` (`title, image, imageCaption, category, universe, infobox?, stats?`), `getThreatLevel`, `THREAT_TONE_CLASSES` de `lib/stats`, `WikiInfobox/InfoSection/InfoField`, `InfoStats`.
- Produces: `WikiInfoboxCompact({ frontmatter, children })` — server component; `children` es el contenido completo de la infobox que se muestra dentro de un `<details>`.

Diseño: tarjeta sólida `#061a2e` `rounded-2xl` con fila horizontal (miniatura 96×96 `rounded-xl` + título + chips `universo · categoría`) y una rejilla de 2–4 datos clave (Longitud, Amenaza con badge, Peso, Mordida — solo los que existan). Debajo, `<details>` nativo con `<summary>` "Ficha completa" (44 px de alto, chevron Lucide que rota con `group-open:rotate-180`) que contiene la `WikiInfobox` completa. Sin JS propio.

- [ ] **Step 1: Crear `WikiInfoboxCompact.tsx`**
```tsx
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { WikiFrontmatter } from '@/core/types/wiki';
import { getThreatLevel, THREAT_TONE_CLASSES } from '@/features/monsters/lib/stats';
import { cn } from '@/utils/cn';

interface WikiInfoboxCompactProps {
  frontmatter: WikiFrontmatter;
  /** Infobox completa (se muestra dentro de "Ficha completa"). */
  children: React.ReactNode;
}

/** Ficha resumida para < md: lo esencial arriba, la infobox completa plegada. */
export function WikiInfoboxCompact({ frontmatter, children }: WikiInfoboxCompactProps) {
  const { title, image, category, universe, stats } = frontmatter;
  const threat = getThreatLevel(stats?.hostility);
  const facts: Array<{ label: string; value: React.ReactNode }> = [];
  if (stats?.length !== undefined) facts.push({ label: 'Longitud', value: `${stats.length.toLocaleString('es-ES')} m` });
  if (threat) {
    facts.push({
      label: 'Amenaza',
      value: (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.12em]', THREAT_TONE_CLASSES[threat.tone].badge)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} />
          {threat.label}
        </span>
      ),
    });
  }
  if (stats?.weight) facts.push({ label: 'Peso', value: stats.weight });
  if (stats?.biteType) facts.push({ label: 'Mordida', value: stats.biteType });

  return (
    <section aria-label={`Ficha de ${title}`} className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#061a2e] shadow-2xl">
      <div className="flex items-center gap-4 p-4">
        {image ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10">
            <Image src={image} alt="" fill sizes="96px" className="object-cover" />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="eyebrow text-primary">{universe}{category ? ` · ${category}` : ''}</p>
          <p className="mt-1 truncate text-lg font-black uppercase italic tracking-tight text-white">{title}</p>
        </div>
      </div>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5">
          {facts.slice(0, 4).map((f) => (
            <div key={f.label} className="bg-[#061a2e] px-4 py-3">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-white/40">{f.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-white/85">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <details className="group border-t border-white/10">
        <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary marker:hidden [&::-webkit-details-marker]:hidden">
          Ficha completa
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-white/5 [&>aside]:mb-0 [&>aside]:rounded-none [&>aside]:border-0 [&>aside]:shadow-none">
          {children}
        </div>
      </details>
    </section>
  );
}
```

- [ ] **Step 2: Integrar en `WikiArticleContent.tsx`.** Extraer el contenido de la infobox a una variable para usarlo dos veces:
```tsx
const infoboxFull = showRail ? (
  <WikiInfobox title={title} image={image} imageCaption={imageCaption} className="w-full md:w-full md:float-none md:ml-0 mb-0 md:mb-0">
    {hasInfobox && Object.entries(infobox).map(([sectionTitle, fields]) => (
      <InfoSection key={sectionTitle} title={sectionTitle}>
        {Object.entries(fields).map(([label, value]) => (<InfoField key={label} label={label} value={value} />))}
      </InfoSection>
    ))}
    {showStats && <InfoStats stats={frontmatter.stats} />}
  </WikiInfobox>
) : null;
```
Render:
```tsx
{/* < md: ficha compacta tras la descripción */}
{infoboxFull && (
  <div className="md:hidden">
    <WikiInfoboxCompact frontmatter={frontmatter}>{infoboxFull}</WikiInfoboxCompact>
  </div>
)}

{/* md: infobox flotante; lg: columna 2 */}
<aside className="hidden md:block md:float-right md:ml-8 md:w-[350px] md:mb-4 clear-right lg:float-none lg:ml-0 lg:w-auto lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:mb-0">
  {infoboxFull}
  {headings.length > 0 && (
    <div className="hidden lg:block lg:sticky lg:top-20 mt-6">
      <WikiTOC headings={headings} variant="rail" />
    </div>
  )}
</aside>
```
El TOC inline (`lg:hidden`) se mantiene donde está (después de la ficha compacta).

- [ ] **Step 3: TOC inline colapsado por defecto.** En `WikiTOC.tsx`: `const [isOpen, setIsOpen] = React.useState(variant === 'rail');` (rail abierto, inline cerrado). Añadir `aria-controls` opcional no es necesario.

- [ ] **Step 4: Validar.** `npx tsc --noEmit 2>&1 | grep -E "WikiInfoboxCompact|WikiArticleContent|WikiTOC"` → vacío. Nota: `WikiInfobox` es `'use client'`; pasarlo como `children` desde un server component es válido.

---

### Task C: Hero con la frase de Boris, buscador funcional, orden móvil y expediente rotativo (#17, #18)

**Files:**
- Create: `src/features/monsters/lib/featured.ts`
- Modify: `src/app/(wiki)/wiki/page.tsx` (usar la lib; quitar `isoWeek` local)
- Modify: `src/app/(marketing)/page.tsx` (obtener `featured` y pasarlo al hero)
- Modify: `src/features/marketing/sections/HeroSection.tsx` (server component)
- Modify: `src/features/marketing/components/hero/HeroVisual.tsx`
- Modify: `src/features/marketing/components/hero/SearchBar.tsx`
- Modify: `src/features/marketing/components/hero/BrandCapsule.tsx` (texto 11 px)
- Modify: `src/features/monsters/components/WikiList.tsx` y `src/features/monsters/components/wiki/WikiFilters.tsx` (+ `WikiSearch.tsx` si hace falta `defaultValue`) para leer `?search=` de la URL

**Interfaces:**
- Produces: `pickFeatured(articles: WikiArticle[], date?: Date): WikiArticleSummary | null` e `isoWeek(date: Date): number` en `lib/featured.ts`.
- `HeroSection({ featured }: { featured: WikiArticleSummary | null })`.
- `HeroVisual({ imageSrc, alt, badge: { href: Route, label, title, thumb?: string } | null })`.

- [ ] **Step 1: `lib/featured.ts`**
```ts
import type { WikiArticle, WikiArticleSummary } from '@/core/types/wiki';
import { toSummary } from '@/core/types/wiki';
import { hasStats } from './stats';

/** Semana ISO (1–53) para rotar contenido sin rebuild. */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Criatura destacada de la semana: misma elección en landing y hub. */
export function pickFeatured(articles: WikiArticle[], date = new Date()): WikiArticleSummary | null {
  const candidates = articles.filter((a) => hasStats(a.frontmatter));
  if (candidates.length === 0) return null;
  return toSummary(candidates[isoWeek(date) % candidates.length]);
}
```
En `wiki/page.tsx`: borrar `isoWeek` local y `candidates/featured`, usar `const featured = pickFeatured(articles);` (importar de `@/features/monsters/lib/featured`; quitar imports que queden sin uso: `toSummary`, `hasStats` si ya no se usan).

- [ ] **Step 2: `(marketing)/page.tsx`** → `export default async function Home()`, `const featured = pickFeatured(await getAllArticles());` y `<HeroSection featured={featured} />`. Añadir `export const revalidate = 86400;` (igual que el hub) para que la rotación semanal no requiera rebuild.

- [ ] **Step 3: `HeroSection.tsx`** (quitar `'use client'`):
```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { WikiArticleSummary } from '@/core/types/wiki';
import { BrandCapsule } from '../components/hero/BrandCapsule';
import { SearchBar } from '../components/hero/SearchBar';
import { HeroVisual } from '../components/hero/HeroVisual';

export function HeroSection({ featured }: { featured: WikiArticleSummary | null }) {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-transparent pt-28 pb-16 md:pt-32 md:pb-24 lg:pt-28 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-[5%] top-[5%] h-[700px] w-[700px] rounded-full bg-primary/5 opacity-30 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[5%] h-[800px] w-[800px] rounded-full bg-blue-600/5 opacity-20 blur-[180px] mix-blend-screen" />
      </div>

      <div className="container relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-8 text-left">
          <BrandCapsule>Universos de BorisaoBlois</BrandCapsule>

          <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] sm:text-5xl md:text-7xl">
            EXPLORA LA INMENSIDAD
            <span className="block bg-gradient-to-r from-primary to-orange-400 bg-clip-text italic text-transparent drop-shadow-[0_8px_20px_rgba(255,115,0,0.4)]">
              DE MIS UNIVERSOS
            </span>
          </h1>

          <p className="max-w-lg text-base font-medium leading-relaxed text-white/70 drop-shadow-md md:text-lg">
            Y sus historias: colosos abisales, capitanes del siglo XVIII y la guerra que detuvo al
            mundo. Todo el lore oficial de BorisaoBlois en un solo archivo.
          </p>

          <SearchBar />

          <div className="flex flex-col items-stretch gap-4 pt-4 sm:flex-row sm:items-center">
            <Link href="/wiki" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 w-full rounded-full border-t border-white/20 bg-primary px-10 text-[11px] font-bold uppercase italic tracking-wider shadow-[0_15px_30px_rgba(255,115,0,0.4)] transition-all hover:scale-[1.03]">
                Acceder a la wiki
              </Button>
            </Link>
            <Link href="#universos" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="glass-liquid h-14 w-full rounded-full border-white/20 px-10 text-[11px] font-bold uppercase italic tracking-wider text-white shadow-[0_15px_25px_rgba(0,0,0,0.3)] transition-all hover:border-white/40 hover:bg-white/10">
                Ver universos
              </Button>
            </Link>
          </div>
        </div>

        <HeroVisual
          imageSrc="/assets/Universo_Colosos/The_Bloop/The_Bloop_cuerpo_completo.webp"
          alt="Estudio a lápiz de The Bloop Ojo Solo"
          badge={
            featured
              ? { href: `/wiki/${featured.slug}`, label: 'Expediente de la semana', title: featured.frontmatter.title, thumb: featured.frontmatter.image }
              : null
          }
        />
      </div>
    </section>
  );
}
```
(El texto va primero en el DOM: en móvil el H1 queda arriba; en `lg` el grid lo mantiene a la izquierda. El padding superior móvil pasa de 96 a 112 px para despejar la navbar fija.)

- [ ] **Step 4: `HeroVisual.tsx`** — props `{ imageSrc, alt, badge }`. Mantener la imagen con `animate-float motion-reduce:animate-none` y `priority`. El badge pasa a ser un `<Link href={badge.href}>` con: miniatura (`next/image` 56×56 `rounded-xl` si `thumb`, si no un icono `Fish` de lucide), eyebrow `text-[11px]` (`badge.label`) y título `text-lg md:text-2xl` **sin `h3`** (usar `<span className="block …">`). Quitar `badgeEmoji`. Posición: en móvil debajo de la imagen en flujo (`relative mt-4`), en `lg` superpuesto (`lg:absolute lg:bottom-5 lg:-left-[8%]`). `focus-visible:ring-2 focus-visible:ring-primary`.

- [ ] **Step 5: `SearchBar.tsx`** — formulario que navega:
```tsx
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function SearchBar({ placeholder = '¿Qué criatura buscas?' }: { placeholder?: string }) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push({ pathname: '/wiki', query: q ? { search: q } : {}, hash: 'explorar' });
  };
  return (
    <form role="search" onSubmit={submit} className="group relative max-w-lg">
      <label htmlFor="hero-search" className="sr-only">Buscar en la wiki</label>
      <div className="glass-liquid flex items-center rounded-full border-white/10 bg-black/40 p-1 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all group-focus-within:border-primary/40 group-focus-within:ring-4 group-focus-within:ring-primary/5">
        <Search className="ml-4 mr-2 h-5 w-5 shrink-0 text-white/30 transition-colors group-focus-within:text-primary" />
        <input id="hero-search" type="search" placeholder={placeholder} value={search} onChange={(e) => setSearch(e.target.value)}
          className="h-12 min-w-0 flex-1 bg-transparent text-base font-bold tracking-tight text-white outline-none placeholder:text-white/30" />
        {search && (
          <button type="button" onClick={() => setSearch('')} aria-label="Limpiar búsqueda" className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button type="submit" className="flex h-10 shrink-0 items-center gap-2 rounded-full border-t border-white/20 bg-gradient-to-r from-primary to-orange-600 px-4 text-[11px] font-bold uppercase italic tracking-wider text-white shadow-[0_8px_20px_rgba(255,115,0,0.3)] transition-transform active:scale-95 sm:px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
          <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">Buscar</span>
          <span className="sr-only sm:hidden">Buscar</span>
        </button>
      </div>
    </form>
  );
}
```
Si `router.push` no acepta el objeto bajo typedRoutes, usar `` router.push(`/wiki?search=${encodeURIComponent(q)}#explorar` as Route) `` (import type `Route` de `next`).

- [ ] **Step 6: `WikiList.tsx` lee `?search=`.** `const initialSearch = searchParams.get('search') ?? '';` → `useState(initialSearch)` para `search` y `debouncedSearch`. Pasar `initialSearch` a `WikiFilters` (`initialSearch?: string`) y de ahí a `WikiSearch` como `defaultValue` (añadir la prop a `WikiSearch` si no existe; leer `src/features/monsters/components/wiki/WikiSearch.tsx`).

- [ ] **Step 7: `BrandCapsule.tsx`**: texto `text-[11px]`; quitar `animate-pulse` del icono (ruido) o dejarlo con `motion-reduce:animate-none`.

- [ ] **Step 8: Validar.** `npx tsc --noEmit 2>&1 | grep -E "featured|HeroSection|HeroVisual|SearchBar|BrandCapsule|WikiList|WikiFilters|WikiSearch|\(marketing\)/page|\(wiki\)/wiki/page"` → vacío.

---

### Task D: Un solo footer (#19, cierra #6)

**Files:**
- Delete: `src/features/monsters/components/wiki/WikiFooter.tsx`
- Modify: `src/app/(wiki)/wiki/layout.tsx` (importar y usar `Footer` de `@/components/Footer`)
- Modify: `src/components/Footer.tsx` (encabezados de columna y tamaños)

- [ ] **Step 1:** En `layout.tsx` sustituir `import { WikiFooter } …` por `import Footer from '@/components/Footer';` y `<WikiFooter />` por `<Footer />`. Borrar `WikiFooter.tsx` (`git rm`). Comprobar con `grep -rn "WikiFooter" src` que no queda ninguna referencia.
- [ ] **Step 2:** En `Footer.tsx`: los tres `<h4 …>` de columna pasan a `<p className="eyebrow mb-6 text-white/70">…</p>` (no son encabezados de documento → corrige `heading-order`); los enlaces de columna `text-white/50` → `text-white/60`; el eyebrow de "Contacto Oficial" igual que los otros.
- [ ] **Step 3: Validar.** `npx tsc --noEmit 2>&1 | grep -E "Footer|wiki/layout"` → vacío.

---

### Task E (orquestador): build, QA con Chrome DevTools, PR

- [ ] `npm run build && npm run lint`; `npx next start -p 3131`.
- [ ] QA 390×844: `/wiki/the-bloop` (ningún párrafo < 300 px; ficha compacta tras la descripción; primer párrafo antes de 900 px de scroll; `details` abre la ficha completa); `/` (H1 visible sin scroll, sin solape con la navbar, buscar "majá" navega a `/wiki?search=maj%C3%A1#explorar` y la lista queda filtrada; badge de expediente enlaza al artículo); `/wiki` footer sin `a[href="#"]`.
- [ ] QA 1440×900: artículo igual que antes (rail intacto); hero; Lighthouse `/wiki` ≥ 92 accesibilidad.
- [ ] Commits por bloque, PR con `Closes #15, #16, #17, #18, #19, #6`; comentario en #8 (resuelto en PR #31) y cerrarlo.

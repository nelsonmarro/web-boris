# UX prioridad media (épica #30, ola 2) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolver #20, #21, #22, #23, #24 y #25 de la auditoría UI/UX manteniendo la estética Abisal. #26 queda abierto (necesita la bio de Boris).

**Architecture:** Orquestador + 6 workers en paralelo con archivos disjuntos (A cabecera, B hub, C explorador, D teaser de Arena, E videos, F sistema visual). Los workers no hacen commit; el orquestador revisa, ejecuta QA con Chrome DevTools, commitea y abre el PR.

**Tech Stack:** Next.js 16 App Router (`typedRoutes: true`), React 19, Tailwind v4 (container queries disponibles), Base UI (Select, Tabs, Dialog), lucide-react 1.7, `@next/third-parties` (`YouTubeEmbed` → `<lite-youtube>`), TanStack Query v5.

**Spec:** issues #20–#25 + `docs/audits/2026-10-17-ui-ux/README.md`. Rama: `feat/ux-prioridad-media`.

## Global Constraints

- Texto visible en español; mínimo 11 px; contraste AA (texto de apoyo ≥ `text-white/60`).
- Paleta Abisal: primario `#FF7300`, fondo `#00122E`, sólido bajo texto `#061a2e`; glass (`.glass-liquid`) solo en navbar, hero, tarjetas y footer; **texto largo y formularios sobre sólido**.
- Radios: `rounded-3xl` hero/featured/footer, `rounded-2xl` cards/paneles, `rounded-xl` controles (≥ 44 px), `rounded-full` chips/pills. Nada de `rounded-[Nrem]` arbitrarios nuevos.
- `typedRoutes: true`: href con query como objeto `{ pathname, query, hash }` o template con `as Route` + `encodeURIComponent`.
- Sin suite de tests: cada worker valida con `npx tsc --noEmit` filtrado a sus archivos y **no** ejecuta `npm run build`/`dev`/`next start` ni hace commit. El orquestador hace build, QA y commits.
- Sin copy inventado sobre Boris; textos descriptivos o del PDF/docx.

---

### Task A: Cabecera con la marca siempre visible y nombres accesibles (#20)

**Files:**
- Modify: `src/app/(wiki)/wiki/layout.tsx`
- Modify: `src/components/sidebar/components/SidebarBranding.tsx`
- Modify: `src/features/monsters/components/wiki/WikiCommandPalette.tsx` (solo el botón disparador)
- Modify: `src/components/navbar/components/NavLogo.tsx` (prop `size`)

**Interfaces:** `NavLogo({ hideLogoOnDesktop?, size?: 'md' | 'sm' })` — `sm` = logo 36 px y texto `text-lg`.

- [ ] **Step 1: `NavLogo` con tamaño compacto.** Añadir prop `size` (default `'md'`); con `'sm'`: contenedor `h-9 w-9`, `Image` 36×36, texto `text-lg`. Mantener el resto.
- [ ] **Step 2: Cabecera de la wiki.** En `layout.tsx` sustituir el bloque "Terminal / Acceso Lore" por `<NavLogo size="sm" />` (visible en todos los anchos, a la derecha del `SidebarTrigger`). Mantener `NavLinks`/`NavActions` en `md+` y el botón ⌘K. Eliminar el separador vertical si queda huérfano en móvil (`hidden md:block` ya lo oculta).
- [ ] **Step 3: Sidebar branding coherente.** En `SidebarBranding.tsx`: textos → `BorisaoBlois` (con `Blois` en `text-primary`, como `NavLogo`) y debajo `Wiki oficial` en `eyebrow text-white/60`; **quitar `aria-label="Ir al inicio"`** (el texto visible nombra el enlace; Lighthouse `label-content-name-mismatch`). En modo icono se mantiene solo el logo con `aria-label="BorisaoBlois, inicio"` **únicamente** cuando el texto está oculto: usar `<span className="sr-only group-data-[collapsible=icon]:not-sr-only …">`? Más simple: dejar el texto siempre en el DOM y ocultarlo visualmente con `group-data-[collapsible=icon]:sr-only` en vez de `hidden`, así el nombre accesible es siempre el texto visible.
- [ ] **Step 4: Botón de búsqueda.** En `WikiCommandPalette.tsx` el botón: quitar `aria-label`; texto visible `Buscar en la wiki` (`sm:inline`); para `< sm` añadir `<span className="sr-only">Buscar en la wiki</span>` junto al icono. Mantener el `kbd` ⌘K.
- [ ] **Step 5: Validar.** `npx tsc --noEmit 2>&1 | grep -E "wiki/layout|SidebarBranding|WikiCommandPalette|NavLogo"` → vacío; `grep -rn "Acceso Lore\|Terminal" "src/app/(wiki)"` → vacío.

---

### Task B: Hub móvil — banner corto, categorías compactas, explorador antes (#21)

**Files:**
- Modify: `src/app/(wiki)/wiki/page.tsx` (orden y textos)
- Modify: `src/features/monsters/components/wiki/WikiBanner.tsx`
- Modify: `src/features/monsters/components/wiki/CategoryTiles.tsx`

**Interfaces:** `WikiBanner({ label, title, gradientTitle, description, ctaHref?: Route | string, ctaLabel? })`.

- [ ] **Step 1: Banner corto con CTA.** `WikiBanner`: descripción a una línea (`text-base md:text-lg`, `max-w-xl`); añadir un enlace CTA `<Link href="#explorar">` estilo pill naranja (`h-11 rounded-full bg-primary px-5 text-[11px] font-bold uppercase tracking-wider`) con texto `Buscar en el archivo` y un `Search` de lucide; padding del banner `p-6 md:p-10 lg:p-12`. En `page.tsx` la descripción pasa a: `"El repositorio oficial de lore: criaturas, organizaciones, vehículos e historia de los universos de BorisaoBlois."`
- [ ] **Step 2: Orden en móvil.** En `page.tsx` renderizar: Banner → `CategoryTiles` → `WikiExplorerSection` → `FeaturedCreature`. (El explorador sube; la destacada queda como cierre.) Reducir `space-y-16` a `space-y-12 lg:space-y-16`.
- [ ] **Step 3: Tiles compactos en móvil.** En `CategoryTiles.tsx`: grid `grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3`; `TileCard` con `h-28 sm:h-56 p-4 sm:p-6`; descripción `hidden sm:block`; título `text-base sm:text-xl md:text-2xl`; el chip de conteo `text-[11px]` con `top-3 right-3 sm:top-5 sm:right-5`. Asegurar que el `Link` entero sigue siendo el objetivo táctil (≥ 44 px ✓).
- [ ] **Step 4: Validar.** `npx tsc --noEmit 2>&1 | grep -E "wiki/page|WikiBanner|CategoryTiles"` → vacío.

---

### Task C: Explorador — estado en la URL, 9 por página, placeholders de marca, selects accesibles (#22, parte de #21)

**Files:**
- Modify: `src/features/monsters/components/WikiList.tsx` (estado derivado de la URL)
- Delete: `src/features/monsters/components/WikiListFromUrl.tsx`
- Modify: `src/features/monsters/components/wiki/WikiExplorerSection.tsx` (vuelve a renderizar `WikiList` dentro del `Suspense`)
- Modify: `src/features/monsters/components/wiki/WikiFilters.tsx` (controlado, `aria-label`, altura)
- Modify: `src/features/monsters/components/wiki/WikiSearch.tsx` (controlado: `value` + `onSearch`)
- Modify: `src/features/monsters/components/wiki/WikiArticleCard.tsx` (placeholder de marca)
- Create: `src/features/monsters/components/wiki/CategoryPlaceholder.tsx`
- Modify: `src/features/monsters/actions/get-wiki-articles.ts` (`pageSize` por defecto 9)

**Interfaces:**
- URL = fuente de verdad: `?search=&universe=&category=&page=` (valores ausentes = `''`/`all`/`1`).
- `CategoryPlaceholder({ category?: string, title: string, className? })` — degradado abisal + icono Lucide por categoría + nombre.
- `isBrandPlaceholder(src?: string)` → `true` si `src` incluye `/assets/Branding/` (los directorios/organizaciones usan el logo como portada; se trata como "sin imagen").

- [ ] **Step 1: `WikiList` derivado de la URL (sin remount, sin perder foco).**
```tsx
const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();
const urlSearch = searchParams.get('search') ?? '';
const universe = pickFilter(searchParams.get('universe'), options.universes);
const category = pickFilter(searchParams.get('category'), options.categories);
const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
const [search, setSearch] = React.useState(urlSearch);           // lo que se escribe
const [debouncedSearch, setDebouncedSearch] = React.useState(urlSearch);

// Sincroniza el input si la URL cambia desde fuera (footer, hero)
React.useEffect(() => { setSearch(urlSearch); setDebouncedSearch(urlSearch); }, [urlSearch]);

const replaceQuery = React.useCallback((patch: Record<string, string | null>) => {
  const next = new URLSearchParams(searchParams.toString());
  for (const [k, v] of Object.entries(patch)) { if (v === null || v === '' || v === 'all' || (k === 'page' && v === '1')) next.delete(k); else next.set(k, v); }
  const qs = next.toString();
  router.replace((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false });
}, [router, pathname, searchParams]);

// Debounce del texto → URL (solo si difiere)
React.useEffect(() => {
  const t = setTimeout(() => { if (search !== urlSearch) replaceQuery({ search, page: null }); setDebouncedSearch(search); }, 400);
  return () => clearTimeout(t);
}, [search]);  // eslint-disable-line react-hooks/exhaustive-deps
```
Handlers: `onUniverseChange(v) → replaceQuery({ universe: v ?? 'all', page: null })`, igual para categoría; `setPage(p) → replaceQuery({ page: String(p) })` y luego `document.getElementById('explorar')?.scrollIntoView({ block: 'start', behavior: 'smooth' })`. La query de React Query usa `[page, debouncedSearch, universe, category]` como ahora. `WikiSearch` recibe `value={search}` y `onSearch={setSearch}` (controlado). `Route` importado de `next`. Eliminar `WikiListFromUrl.tsx` y volver a `<WikiList options={options} />` dentro del `Suspense` de `WikiExplorerSection`.
- [ ] **Step 2: `WikiSearch` controlado.** Props `{ value: string; onSearch(v): void; placeholder?; className?; inputClassName? }` (sin estado interno; quitar `defaultValue`).
- [ ] **Step 3: Selects accesibles y altos.** En `WikiFilters.tsx`: `triggerClass` añade `data-[size=default]:h-12` (el `ui/select` fuerza `h-8` vía `data-size`), y cada `SelectTrigger` lleva `aria-label="Universo"` / `aria-label="Categoría"`. Prop `initialSearch` → `search: string` (controlada) y `onSearchChange`.
- [ ] **Step 4: 9 por página.** `getWikiArticles` default `pageSize = 9`; `PAGE_SIZE = 9` en `WikiList`.
- [ ] **Step 5: Placeholder de marca.** `CategoryPlaceholder.tsx`:
```tsx
import { Waves, Mountain, Fish, Dna, User, Building2, Ship, BookOpen, Book, Ghost, Layers, FolderOpen, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
const ICONS: Record<string, LucideIcon> = { Coloso: Waves, Titán: Mountain, Mediano: Fish, Animal: Fish, Especie: Dna, Humano: User, Organización: Building2, Vehículo: Ship, Historia: BookOpen, Libro: Book, Entidad: Ghost, Categoría: Layers, Directorio: FolderOpen };
export const isBrandPlaceholder = (src?: string) => !!src && src.includes('/assets/Branding/');
export function CategoryPlaceholder({ category, title, className }: { category?: string; title: string; className?: string }) {
  const Icon = (category && ICONS[category]) || Layers;
  return (
    <div aria-hidden="true" className={cn('absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_55%,#00122E_100%)]', className)}>
      <Icon className="h-10 w-10 text-primary/80 drop-shadow-[0_0_18px_rgba(255,115,0,0.5)]" />
      <span className="eyebrow text-white/60">{category ?? 'Archivo'}</span>
    </div>
  );
}
```
En `WikiArticleCard.tsx`: `const showImage = frontmatter.image && !isBrandPlaceholder(frontmatter.image);` → si no, `<CategoryPlaceholder category={frontmatter.category} title={frontmatter.title} />` (eliminar el bloque "Sin Imagen"). `alt` de la imagen → `""` (el h3 lleva el nombre).
- [ ] **Step 6: Validar.** `npx tsc --noEmit 2>&1 | grep -E "WikiList|WikiExplorerSection|WikiFilters|WikiSearch|WikiArticleCard|CategoryPlaceholder|get-wiki-articles"` → vacío; `grep -rn "WikiListFromUrl" src` → vacío. Comprobar que `src/features/monsters/components/WikiList.tsx` ya no usa `useState` para universe/category/page.

---

### Task D: Teaser de la Arena en lugar de la banda de contadores (#23)

**Files:**
- Create: `src/features/marketing/sections/ArenaTeaserSection.tsx`
- Delete: `src/features/marketing/sections/LoreStatsSection.tsx`
- Modify: `src/app/(marketing)/page.tsx` (sustituir `LoreStatsSection` por `ArenaTeaserSection`)

**Interfaces:**
- Consumes: `getAllArticles()`, `hasStats`, `computeMatchup`, `scoreFighter` de `@/features/monsters/lib/arena`, `getLoreStats()` (los 4 números), `StatRow` de `@/features/monsters/components/wiki/StatRow`.
- Pareja fija y canónica: `el-gran-maja` vs `the-bloop` (la batalla del lore); si alguno no tiene `stats`, usar los dos de mayor `scoreFighter`.

- [ ] **Step 1: Sección.** Server component async. Estructura: cabecera centrada (eyebrow "Versus Arena", título `Enfrenta a los <span class=text-primary>colosos</span>`, una línea: "Simulación determinista a partir de las fichas biométricas del archivo."). Tarjeta **sólida** `rounded-3xl border border-white/10 bg-[#061a2e]` con grid `md:grid-cols-[1fr_auto_1fr]`: retrato A (imagen `aspect-[4/3] rounded-2xl`, nombre `text-2xl font-black uppercase italic`, universo eyebrow, `StatRow` Poder/Defensa), centro `VS` en `font-mono text-primary` con la barra de probabilidad (dos spans `bg-primary` / `bg-cyan-400` con anchos `probA*100%`/resto, `h-2 rounded-full`), retrato B. Debajo: texto "El Gran Majá parte como favorito · factor decisivo: Hostilidad" calculado con `computeMatchup` (usar `decisiveAxis.label` y quién tiene mayor score). CTA `Link href="/wiki/arena"` pill naranja `Abrir la Arena`. Línea discreta final en `font-mono text-[12px] text-white/60`: `{loreEntries} expedientes · {creaturesWithStats} fichas biométricas · {visualFiles} archivos visuales · {universes} universos`.
- [ ] **Step 2: Montar.** `page.tsx`: import y `<ArenaTeaserSection />` donde estaba `<LoreStatsSection />`; `git rm` de `LoreStatsSection.tsx`. `get-lore-stats.ts` se conserva.
- [ ] **Step 3: Validar.** `npx tsc --noEmit 2>&1 | grep -E "ArenaTeaserSection|LoreStatsSection|\(marketing\)/page"` → vacío; `grep -rn "LoreStatsSection" src` → vacío.

---

### Task E: Shorts en 9:16 y enlace al canal legible (#24)

**Files:**
- Modify: `src/features/marketing/sections/FeaturedVideosSection.tsx`

- [ ] **Step 1:** Campo `orientation: 'landscape' | 'short'` en `VIDEOS` (la batalla = landscape; "Extinción masiva" y "El Blitz" = short). Grid `lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] items-start gap-8`; en `< lg`: el principal a ancho completo y los shorts en `grid-cols-2`. Contenedores: landscape `aspect-video rounded-2xl`; short `aspect-[9/16] rounded-2xl mx-auto w-full max-w-[280px]` con `[&_lite-youtube]:h-full [&_lite-youtube]:max-w-none [&_lite-youtube]:aspect-auto` para que `<lite-youtube>` llene el 9:16 (comprobar en `node_modules/@next/third-parties` cómo aplica el `aspect-ratio`; si usa `style` inline con `padding-bottom`, añadir `[&_lite-youtube]:!pb-0 [&_lite-youtube]:!h-full`).
- [ ] **Step 2:** Enlace al canal: `YoutubeIcon` + "Ver canal" en `text-[11px] text-white/70 hover:text-white`; chip "Archivo Multimedia" y categorías a `text-[11px]`; quitar el overlay de play falso (`lite-youtube` ya trae su botón) o dejarlo `pointer-events-none` solo decorativo — **quitarlo** (duplica el botón real).
- [ ] **Step 3: Validar.** `npx tsc --noEmit 2>&1 | grep FeaturedVideosSection` → vacío.

---

### Task F: Sistema visual de la landing — radios, tamaños mínimos, sólido bajo texto (#25)

**Files:**
- Modify: `src/features/marketing/sections/AboutBorisSection.tsx`
- Modify: `src/features/marketing/sections/ContactSection.tsx`
- Modify: `src/features/marketing/components/contact/ContactFields.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/features/marketing/components/hero/HeroVisual.tsx`
- Modify: `src/features/marketing/sections/UniversePreviewSection.tsx` y `FeaturedCharactersSection.tsx` (solo cabeceras → utilidades)

- [ ] **Step 1: Radios.** `AboutBorisSection` `rounded-[4rem]` → `rounded-3xl`; `ContactSection` `rounded-[3rem]` → `rounded-3xl` y `rounded-[2rem]` del textarea → `rounded-xl`; `Footer` `rounded-[3rem]` → `rounded-3xl`; `HeroVisual` `rounded-[2.5rem] md:rounded-[3.5rem]` → `rounded-3xl`, badge `rounded-[1.5rem] md:rounded-[2.5rem]` → `rounded-2xl`, icono `rounded-[1rem] md:rounded-[1.5rem]` → `rounded-xl`.
- [ ] **Step 2: Texto mínimo 11 px.** Todos los `text-[10px]`, `text-[9px]`, `text-[8px]` de los archivos de esta tarea → `text-[11px]` (o `eyebrow` cuando sean etiquetas en mayúsculas). El badge "Documentación Autorizada // Código 343-B" de About se **elimina** (copy inventado).
- [ ] **Step 3: Sólido bajo texto y formularios.** About: la tarjeta pasa de `glass-liquid` a `bg-[#061a2e] border border-white/10` (la imagen sigue en su columna); Contact: la tarjeta del formulario `glass-liquid` → `bg-[#061a2e] border border-white/10`; inputs `bg-white/5` → `bg-black/20`. Quitar `glass-reflection` de esas dos tarjetas.
- [ ] **Step 4: Cabeceras con utilidades.** En `UniversePreviewSection` y `FeaturedCharactersSection`: eyebrows con `eyebrow text-primary`; títulos `h2` con `section-title` + `md:text-4xl lg:text-5xl` (mantener el `<span class=text-primary>`); párrafos de apoyo `text-base md:text-lg text-white/70`.
- [ ] **Step 5: Validar.** `npx tsc --noEmit 2>&1 | grep -E "AboutBorisSection|ContactSection|ContactFields|Footer|HeroVisual|UniversePreviewSection|FeaturedCharactersSection"` → vacío; `grep -rn --include='*.tsx' -E "text-\[(10|9|8|7)px\]|rounded-\[[0-9.]+rem\]" src/features/marketing src/components` → solo lo que no toque esta tarea (idealmente vacío).

---

### Task G (orquestador): build, QA con Chrome DevTools, PR

- [ ] `npm run build && npm run lint`; `npx next start -p 3131`.
- [ ] QA 390×844: `/wiki` (marca visible en la cabecera; banner corto con CTA que lleva a `#explorar`; tiles 2 columnas; filtros ≥ 44 px con nombre accesible; cards sin "Sin imagen" ni logo; 9 por página; cambiar filtro actualiza `?universe=` y la lista; escribir en el buscador **no pierde el foco** y la URL se actualiza tras 400 ms; recargar conserva el filtro); `/` (teaser de Arena con probabilidad, shorts verticales 2 columnas, About y Contacto sólidos, sin texto < 11 px).
- [ ] QA 1440: hub; `/` grid de videos 2fr/1fr/1fr; footer; Lighthouse `/wiki` ≥ 95 y `/` ≥ 96 (accesibilidad).
- [ ] Commits por bloque; PR con `Closes #20, #21, #22, #23, #24, #25`.

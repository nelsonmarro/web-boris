# Landing vs. PDF + assets de Drive — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alinear la landing con el PDF de requerimientos de Boris (descripciones reales de universos, videos correctos, redes reales, sección de personajes) e incorporar a la wiki las 14 imágenes de Drive que nunca se importaron.

**Architecture:** Orquestador + workers en paralelo (fan-out/fan-in). Cada tarea toca un conjunto de archivos disjunto para que los workers corran simultáneamente en el mismo árbol de trabajo. Las interfaces compartidas (`config/universes.ts`, `config/social.ts`) las crea el orquestador antes de despachar. Los workers **no hacen commit**; el orquestador revisa (spec + calidad) y commitea por bloque.

**Tech Stack:** Next.js 16 App Router (RSC, `typedRoutes: true`), React 19, Tailwind v4, lucide-react 1.7 (sin iconos de marca), MDX vía next-mdx-remote-client.

**Spec:** Conversación 2026-10-17 (aprobada por Nelson): `docs/Requerimientos Pagina.pdf` (secciones "Sección de Universos", "Videos", "Descripciones Personajes", "Sección de Contacto") + doc de Drive "Link Redes Sociales" (solo YouTube) + `docs/Frases y descripciones.docx` (texto de La Hecatombe del Lapeón).

## Global Constraints

- Todo el texto visible en **español**. Las descripciones de Boris se copian **textualmente** (solo se corrigen comillas tipográficas).
- Paleta Abisal: primario `#FF7300`, fondo `#00122E`, sólido bajo texto largo `#061a2e`. Glass (`.glass-liquid`) solo en chrome/cards; **nunca blur bajo párrafos largos**.
- Radios: `rounded-3xl` hero/featured, `rounded-2xl` cards, `rounded-xl` controles, `rounded-full` chips. Texto mínimo 11px.
- Assets en `public/assets/` con guiones bajos, nunca espacios. Ya convertidos a WebP (no volver a convertir).
- `typedRoutes: true`: los `href` con query string se escriben como objeto `{ pathname: '/wiki', query: {...}, hash: 'explorar' }` o se castean; preferir el objeto.
- No existe suite de tests. **Validación obligatoria por tarea:** `npx tsc --noEmit` (rápido) y, al final, `npm run build`.
- Redes sociales: **solo YouTube** (`https://youtube.com/@borisaoblois`) y el email `borisaoblois343@gmail.com`. No inventar Instagram/TikTok/Discord ni cifras de suscriptores.
- Los workers no ejecutan `git commit`. Reportan archivos tocados y el resultado de `npx tsc --noEmit`.

## Interfaces compartidas (ya existen, creadas por el orquestador)

`src/features/marketing/config/social.ts`
```ts
export const SOCIAL_LINKS = { youtube: 'https://youtube.com/@borisaoblois' } as const;
export const YOUTUBE_HANDLE = '@BorisaoBlois';
export const CONTACT_EMAIL = 'borisaoblois343@gmail.com';
```

`src/features/marketing/config/universes.ts`
```ts
export interface UniverseDef {
  id: string;             // slug estable: 'colosos' | 'capitan-de-galeon' | 'ellos-llegaron' | 'hecatombe-del-lapeon'
  title: string;          // nombre visible
  universeKey?: string;   // valor EXACTO de `universe:` en el frontmatter; undefined si aún no hay artículos
  era: string;            // eyebrow corto: 'Era contemporánea', 'Siglo XVIII', 'Años 40', 'Vía Láctea'
  description: string;    // texto de Boris, textual
  image?: string;         // portada; undefined para 'Próximamente'
  comingSoon?: boolean;
}
export const UNIVERSES: readonly UniverseDef[];
```

`src/features/marketing/components/icons/YoutubeIcon.tsx` (lo crea la Tarea 3; la Tarea 3 también es la única que lo consume además del Footer).

---

### Task 1: Asignar los assets importados de Drive a los artículos MDX

**Files:**
- Modify: `src/content/bogbo.mdx`
- Modify: `src/content/breegard.mdx`
- Modify: `src/content/aodos-ay01.mdx`
- Modify: `src/content/vehiculos.mdx`
- Modify: `src/content/the-bloop.mdx` (sección `## Historia conocida`, antes de `## La batalla contra El Gran Majá`)
- Modify: `src/content/el-gran-maja.mdx` (sección `## Descubrimiento`)

**Interfaces:**
- Consumes: componentes MDX registrados en `src/features/monsters/components/wiki/mdx/MdxRenderer.tsx`: `WikiImage {src, alt, caption?, align?: 'left'|'right'|'center'|'none'}` y `WikiGallery` (grid de 3; sus hijos son `WikiImage` sin `align`).
- Produces: nada para otras tareas.

Assets disponibles (todos ya en disco, rutas desde `/assets/...`):
```
Universo_Colosos/Vehiculos/Aodos_AY01.webp                 sumergible naranja con logo DELIRIUM (render 3D, fondo blanco)
Universo_Colosos/Vehiculos/Breegard.webp                   submarino negro con franja naranja (render 3D, fondo blanco)
Universo_Colosos/Vehiculos/Submarino_patrulla_abisal.webp  submarino solo, aguas abiertas
Universo_Colosos/Vehiculos/Submarinos_combate_torpedos.webp dos submarinos y estelas de torpedos
Universo_Colosos/Vehiculos/Submarino_impacto_torpedo.webp  submarino con explosión de torpedo
Universo_Colosos/Vehiculos/Flota_submarina_ventanilla.webp flota de submarinos vista desde una ventanilla
Universo_Colosos/Bogbo/Bogbo_emergiendo_frontal.webp       lomo del labodótipo emergiendo, visto de frente
Universo_Colosos/Bogbo/Bogbo_emergiendo_lateral.webp       lomo del labodótipo emergiendo, visto de lado
Universo_Colosos/The_Bloop/The_Bloop_sombra_barco_pequeno.webp  lancha sobre la sombra del coloso (ojo visible)
Universo_Colosos/The_Bloop/The_Bloop_sombra_carguero.webp        portacontenedores sobre la sombra del coloso
Universo_Colosos/The_Bloop/The_Bloop_sombra_petrolero.webp       petrolero sobre la sombra del coloso
Universo_Colosos/The_Bloop/The_Bloop_estudio_lapiz.webp          dibujo a lápiz del labodótipo completo
Universo_Colosos/Otros/Criatura_desde_sumergible.webp            criatura abisal vista desde un sumergible
Universo_Colosos/Otros/Superficie_desde_el_abismo.webp           la superficie vista desde el fondo
```

- [ ] **Step 1: Bogbo — portada real y segunda imagen**

En `src/content/bogbo.mdx` reemplazar en el frontmatter:
```yaml
image: "/assets/Universo_Colosos/Bogbo/Bogbo_emergiendo_frontal.webp"
imageCaption: "Bogbo emergiendo; con 382 m es el labodótipo más grande registrado"
```
y añadir tras el primer párrafo del cuerpo:
```mdx
<WikiImage
  src="/assets/Universo_Colosos/Bogbo/Bogbo_emergiendo_lateral.webp"
  alt="Bogbo visto de costado al emerger"
  caption="Vista lateral del lomo de Bogbo durante un ascenso a superficie"
  align="right"
/>
```

- [ ] **Step 2: Breegard — portada real y galería de operaciones**

En `src/content/breegard.mdx` frontmatter:
```yaml
image: "/assets/Universo_Colosos/Vehiculos/Breegard.webp"
imageCaption: "Submarino clase Breegard: casco negro con franja naranja de DELIRIUM"
```
Añadir al final del cuerpo (antes no hay secciones `##`; crear una):
```mdx
## Registro operativo

<WikiGallery>
  <WikiImage src="/assets/Universo_Colosos/Vehiculos/Submarino_patrulla_abisal.webp" alt="Breegard en patrulla" caption="Patrulla abisal en aguas abiertas" />
  <WikiImage src="/assets/Universo_Colosos/Vehiculos/Submarinos_combate_torpedos.webp" alt="Breegard disparando torpedos" caption="Andanada de torpedos durante un ejercicio" />
  <WikiImage src="/assets/Universo_Colosos/Vehiculos/Submarino_impacto_torpedo.webp" alt="Impacto de torpedo" caption="Impacto registrado por un dron de escolta" />
</WikiGallery>
```

- [ ] **Step 3: Aodos AY01 — portada real**

En `src/content/aodos-ay01.mdx` frontmatter:
```yaml
image: '/assets/Universo_Colosos/Vehiculos/Aodos_AY01.webp'
imageCaption: 'Sumergible Aodos AY01 con librea de DELIRIUM'
```
No inventar lore: el cuerpo se mantiene (solo se dispone de la imagen).

- [ ] **Step 4: Directorio de vehículos — portada**

En `src/content/vehiculos.mdx` frontmatter:
```yaml
image: "/assets/Universo_Colosos/Vehiculos/Flota_submarina_ventanilla.webp"
imageCaption: "Flota de DELIRIUM vista desde la ventanilla de un sumergible"
```

- [ ] **Step 5: The Bloop — galería de las "fotografías" y el estudio a lápiz**

En `src/content/the-bloop.mdx`, insertar inmediatamente antes de la línea `## La batalla contra El Gran Majá`:
```mdx
<WikiGallery>
  <WikiImage src="/assets/Universo_Colosos/The_Bloop/The_Bloop_sombra_barco_pequeno.webp" alt="Lancha sobre la sombra de The Bloop" caption="Avistamiento desde una lancha: el ojo del coloso bajo el casco" />
  <WikiImage src="/assets/Universo_Colosos/The_Bloop/The_Bloop_sombra_carguero.webp" alt="Carguero sobre la sombra de The Bloop" caption="The Bloop escoltando un portacontenedores" />
  <WikiImage src="/assets/Universo_Colosos/The_Bloop/The_Bloop_sombra_petrolero.webp" alt="Petrolero sobre la sombra de The Bloop" caption="Sombra del coloso bajo un petrolero" />
</WikiGallery>
```
Y dentro de `## Características`, sustituir la `WikiImage` existente **solo si** su `src` es `The_Bloop_cuerpo_completo.webp`; en caso contrario añadir al final de esa sección:
```mdx
<WikiImage
  src="/assets/Universo_Colosos/The_Bloop/The_Bloop_estudio_lapiz.webp"
  alt="Estudio a lápiz de un labodótipo"
  caption="Estudio anatómico a lápiz (archivo DELIRIUM)"
  align="left"
/>
```

- [ ] **Step 6: El Gran Majá — ilustrar el incidente del Golios 7**

En `src/content/el-gran-maja.mdx`, en `## Descubrimiento`, después del párrafo que termina en "Los cuatro Breegard 10 lograron huir y registrar el catastrófico evento." insertar:
```mdx
<WikiImage
  src="/assets/Universo_Colosos/Vehiculos/Submarino_impacto_torpedo.webp"
  alt="Impacto de torpedo durante el incidente del Golios 7"
  caption="Recreación del intercambio de torpedos registrado por los Breegard 10"
  align="left"
/>
```

- [ ] **Step 7: Verificar**

Run: `npx tsc --noEmit && npm run build 2>&1 | tail -5`
Expected: sin errores; los 36 slugs se prerenderizan. Si un MDX falla, el build imprime el slug.

---

### Task 2: Sección de universos fiel al PDF (4 tarjetas, conteos reales, filtro funcional)

**Files:**
- Modify: `src/features/marketing/sections/UniversePreviewSection.tsx` (reescribir como Server Component async)
- Modify: `src/features/marketing/components/FlipCard.tsx` (reescribir)

**Interfaces:**
- Consumes: `UNIVERSES`, `UniverseDef` de `@/features/marketing/config/universes`; `getAllArticles()` de `@/utils/mdx` (devuelve `WikiArticle[]` con `frontmatter.universe: string`).
- Produces: `FlipCard` acepta `{ universe: UniverseDef; count: number }`.

Diseño del FlipCard (el texto de Boris es largo, ~90 palabras):
- Grid de la sección: `grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto` (2×2; con 4 columnas no cabe el texto).
- Altura `h-[520px]`, padding `p-8`.
- Cara frontal: imagen edge-to-edge + degradado + eyebrow (`era`) + título. Si `comingSoon`, en vez de imagen un fondo `bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_45%,#00122E_100%)]` y el chip "Próximamente".
- Cara trasera: fondo sólido `bg-[#061a2e]` (texto largo → nunca glass), eyebrow `era`, título `text-2xl`, descripción `text-[15px] leading-relaxed text-white/80`, y abajo el link "Explorar lore" → `{ pathname: '/wiki', query: { universe: universe.universeKey }, hash: 'explorar' }` cuando `universeKey` existe; si `comingSoon`, texto "Arte y lore en producción" sin link.
- Chip frontal de conteo: `{count} artículos` (singular `1 artículo`); para `comingSoon`, "Próximamente".

- [ ] **Step 1: Reescribir `FlipCard.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Hourglass } from 'lucide-react';
import type { UniverseDef } from '../config/universes';

interface FlipCardProps {
  universe: UniverseDef;
  count: number;
}

const FACE =
  'absolute inset-0 h-full w-full backface-hidden overflow-hidden rounded-3xl border border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.5)]';

export function FlipCard({ universe, count }: FlipCardProps) {
  const label = universe.comingSoon
    ? 'Próximamente'
    : `${count} ${count === 1 ? 'artículo' : 'artículos'}`;

  return (
    <div className="group h-[520px] w-full [perspective:2000px]">
      <div className="preserve-3d relative h-full w-full rotate-y-0 transition-transform duration-700 will-change-transform group-hover:rotate-y-180 group-focus-within:rotate-y-180">
        {/* Cara frontal: portada */}
        <div className={`${FACE} glass-liquid`} style={{ transform: 'translateZ(1px)' }}>
          <div className="glass-reflection opacity-40" />
          {universe.image ? (
            <Image
              src={universe.image}
              alt={universe.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_45%,#00122E_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-8">
            <span className="eyebrow mb-2 text-primary drop-shadow-md">{universe.era}</span>
            <h3 className="text-3xl font-bold uppercase italic leading-none tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {universe.title}
            </h3>
            <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80">
              {universe.comingSoon && <Hourglass className="h-3 w-3 text-primary" />}
              {label}
            </span>
          </div>
        </div>

        {/* Cara trasera: texto de Boris sobre fondo sólido */}
        <div
          className={`${FACE} flex flex-col bg-[#061a2e] p-8`}
          style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
        >
          <span className="eyebrow text-primary">{universe.era}</span>
          <h3 className="mt-2 text-2xl font-bold uppercase italic tracking-tight text-white">{universe.title}</h3>
          <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-5 text-[15px] leading-relaxed text-white/80">{universe.description}</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            {universe.universeKey ? (
              <Link
                href={{ pathname: '/wiki', query: { universe: universe.universeKey }, hash: 'explorar' }}
                className="group/link flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Explorar lore
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover/link:translate-x-1" />
              </Link>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Arte y lore en producción</span>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/30">{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Reescribir `UniversePreviewSection.tsx` como Server Component**

```tsx
import { FlipCard } from '../components/FlipCard';
import { UNIVERSES } from '../config/universes';
import { getAllArticles } from '@/utils/mdx';

export async function UniversePreviewSection() {
  const articles = await getAllArticles();
  const countByUniverse = new Map<string, number>();
  for (const article of articles) {
    const key = article.frontmatter.universe;
    countByUniverse.set(key, (countByUniverse.get(key) ?? 0) + 1);
  }

  return (
    <section id="universos" className="relative scroll-mt-24 bg-transparent py-24">
      <div className="pointer-events-none absolute left-[-10%] top-[20%] z-0 h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[80px] mix-blend-screen" />
      <div className="pointer-events-none absolute bottom-[10%] right-[-5%] z-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] mix-blend-screen" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-20 max-w-3xl space-y-6 text-center">
          <h2 className="text-4xl font-bold uppercase italic tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] md:text-5xl">
            Explora los Universos
          </h2>
          <p className="text-lg font-medium leading-relaxed text-white/70 drop-shadow-md">
            Cada universo tiene sus propias reglas, criaturas y misterios. Pasa el cursor sobre una
            tarjeta para leer su sinopsis y entra a su archivo.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {UNIVERSES.map((universe) => (
            <FlipCard
              key={universe.id}
              universe={universe}
              count={universe.universeKey ? (countByUniverse.get(universe.universeKey) ?? 0) : 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores. Si `typedRoutes` rechaza el `href` objeto, usar `href={{ pathname: '/wiki', query: {...} }}` sin `hash` y añadir `#explorar` vía `hash` solo si el tipo lo permite; como último recurso `href={`/wiki?universe=${encodeURIComponent(key)}#explorar` as Route}` importando `Route` de `next`.

---

### Task 3: Icono de YouTube propio, sección "Sobre Boris" honesta y Footer compilando

**Files:**
- Create: `src/features/marketing/components/icons/YoutubeIcon.tsx`
- Modify: `src/features/marketing/sections/AboutBorisSection.tsx` (reescribir)
- Modify: `src/components/Footer.tsx` (solo cambiar el import/uso de `Youtube` de lucide por `YoutubeIcon`)

**Interfaces:**
- Consumes: `SOCIAL_LINKS`, `YOUTUBE_HANDLE`, `CONTACT_EMAIL` de `@/features/marketing/config/social`.
- Produces: `YoutubeIcon(props: React.SVGProps<SVGSVGElement>)`.

Contexto: lucide-react 1.7 ya **no exporta** iconos de marca (`Youtube` no existe). El Footer actual importa `Youtube` de lucide y no compila.

- [ ] **Step 1: Crear `YoutubeIcon.tsx`**

```tsx
import type { SVGProps } from 'react';

/** Logotipo de YouTube (lucide 1.x retiró los iconos de marca). Hereda `currentColor`. */
export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
```

- [ ] **Step 2: Footer — sustituir el icono de lucide**

En `src/components/Footer.tsx`: cambiar `import { Mail, Youtube } from "lucide-react";` por
```tsx
import { Mail } from "lucide-react";
import { YoutubeIcon } from "@/features/marketing/components/icons/YoutubeIcon";
```
y las dos apariciones de `<Youtube className=...>` por `<YoutubeIcon className=...>` (mismas clases).

- [ ] **Step 3: Reescribir `AboutBorisSection.tsx`**

Quitar `'use client'` (no usa hooks). Mantener la estructura visual (card glass con columna de imagen + columna de texto) y reemplazar el bloque de métricas y el bloque de 4 iconos por:

```tsx
<div className="grid grid-cols-2 gap-6">
  <div className="space-y-2">
    <p className="eyebrow text-white/30">Canal</p>
    <a
      href={SOCIAL_LINKS.youtube}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-2xl font-bold uppercase italic tracking-tight text-white transition-colors hover:text-primary md:text-3xl"
    >
      {YOUTUBE_HANDLE}
    </a>
  </div>
  <div className="space-y-2">
    <p className="eyebrow text-white/30">Contenido</p>
    <p className="text-2xl font-bold uppercase italic tracking-tight text-white md:text-3xl">Lore original</p>
  </div>
</div>

<div className="flex flex-wrap gap-4 pt-6">
  <a
    href={SOCIAL_LINKS.youtube}
    target="_blank"
    rel="noopener noreferrer"
    className="glass-liquid inline-flex h-14 items-center gap-3 rounded-2xl border border-white/10 px-6 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.03] hover:bg-red-600/20 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <YoutubeIcon className="h-5 w-5" />
    Ver canal en YouTube
  </a>
  <a
    href={`mailto:${CONTACT_EMAIL}`}
    className="glass-liquid inline-flex h-14 items-center gap-3 rounded-2xl border border-white/10 px-6 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.03] hover:bg-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <Mail className="h-5 w-5" />
    Escribir a Boris
  </a>
</div>
```
Imports necesarios: `Mail`, `Sparkles` de lucide; `YoutubeIcon`; `SOCIAL_LINKS`, `YOUTUBE_HANDLE`, `CONTACT_EMAIL`. Eliminar la función interna `SocialLink` y los imports `Video, Camera, Send, MessageCircle, Link`. El texto "+2M Exploradores" desaparece (no hay fuente).

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores (en particular ya no debe fallar `Footer.tsx` por `Youtube`).

---

### Task 4: Métricas de la landing con datos reales

**Files:**
- Modify: `src/features/marketing/actions/get-lore-stats.ts` (reescribir)
- Modify: `src/features/marketing/sections/LoreStatsSection.tsx` (solo el array `STATS`)

**Interfaces:**
- Consumes: `getAllArticles()`; `hasStats(frontmatter)` de `@/features/monsters/lib/stats`; `UNIVERSES` de `@/features/marketing/config/universes`.
- Produces: `getLoreStats(): Promise<LoreStats>` con `{ loreEntries: number; creaturesWithStats: number; visualFiles: number; universes: number }`.

Contexto: hoy `explorers = "2.4M"` es un valor fijo sin fuente y `visualFiles` suma una constante `+15`. Se reemplazan por conteos reales.

- [ ] **Step 1: Reescribir `get-lore-stats.ts`**

```ts
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { getAllArticles } from '@/utils/mdx';
import { hasStats } from '@/features/monsters/lib/stats';
import { UNIVERSES } from '../config/universes';

export interface LoreStats {
  /** Artículos MDX publicados. */
  loreEntries: number;
  /** Criaturas con ficha de stats (aparecen en Arena y hub). */
  creaturesWithStats: number;
  /** Imágenes físicas en public/assets. */
  visualFiles: number;
  /** Universos narrativos de Boris (incluye los anunciados). */
  universes: number;
}

const IMAGE_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg', '.avif', '.gif']);

async function countImages(dir: string): Promise<number> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase())).length;
}

/** Métricas calculadas a partir del contenido real del proyecto. */
export async function getLoreStats(): Promise<LoreStats> {
  const [articles, visualFiles] = await Promise.all([
    getAllArticles(),
    countImages(path.join(process.cwd(), 'public', 'assets')).catch(() => 0),
  ]);

  return {
    loreEntries: articles.length,
    creaturesWithStats: articles.filter((a) => hasStats(a.frontmatter)).length,
    visualFiles,
    universes: UNIVERSES.length,
  };
}
```
Nota: `readdir(..., { recursive: true })` existe en Node ≥ 20; verificar `node -v`. Si es menor, implementar la recursión a mano con una función `walk(dir)`.

- [ ] **Step 2: Actualizar `STATS` en `LoreStatsSection.tsx`**

```tsx
import { BookOpen, Skull, ImageIcon, Globe } from 'lucide-react';
// ...
const STATS = [
  { label: 'Entradas de lore', value: `${statsData.loreEntries}`, icon: BookOpen, color: 'text-primary' },
  { label: 'Criaturas con ficha', value: `${statsData.creaturesWithStats}`, icon: Skull, color: 'text-blue-400' },
  { label: 'Archivos visuales', value: `${statsData.visualFiles}`, icon: ImageIcon, color: 'text-red-500' },
  { label: 'Universos narrativos', value: `${statsData.universes}`, icon: Globe, color: 'text-emerald-400' },
];
```
Quitar los sufijos `+` (los números son exactos). Confirmar que `ImageIcon` y `Skull` existen en lucide 1.7 con `grep -o "ImageIcon\|Skull" node_modules/lucide-react/dist/lucide-react.d.ts | sort -u`; si `ImageIcon` no existe usar `Image as ImageIcon`.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores.

---

### Task 5: Sección "Personajes destacados" con los textos del PDF

**Files:**
- Create: `src/features/marketing/config/featured-characters.ts`
- Create: `src/features/marketing/sections/FeaturedCharactersSection.tsx`
- Modify: `src/app/(marketing)/page.tsx` (insertar la sección entre `UniversePreviewSection` y `FeaturedVideosSection`)

**Interfaces:**
- Consumes: `getArticleBySlug(slug): Promise<WikiArticle | null>` de `@/utils/mdx` (`frontmatter.image?: string`, `frontmatter.stats?.length?: number`, `frontmatter.category?: string`).
- Produces: `FeaturedCharactersSection` (async Server Component, sin props).

Diseño ("expedientes"): tres tarjetas en `grid md:grid-cols-3 gap-8`. Cada tarjeta `rounded-2xl overflow-hidden border border-white/10`: arriba la imagen del frontmatter edge-to-edge (`aspect-[4/5]`, `object-cover`), abajo un panel **sólido** `bg-[#061a2e] p-6` (texto → sin glass) con: eyebrow `categoría · dato` (el dato es `${stats.length} m` si existe, si no `DELIRIUM`), nombre `text-2xl font-bold uppercase italic`, descripción `text-[15px] leading-relaxed text-white/80`, y link "Abrir expediente" → `/wiki/${slug}` (`Route` tipada, literal permitida). Cabecera centrada como la de universos: eyebrow "Expedientes abiertos", título "Personajes <span class=text-primary>destacados</span>".

- [ ] **Step 1: Crear `featured-characters.ts`** (texto textual del PDF, sección "Descripciones Personajes")

```ts
export interface FeaturedCharacterDef {
  slug: 'the-bloop' | 'el-gran-maja' | 'phillip-forte';
  name: string;
  description: string;
}

/** Copys de Boris en "Requerimientos Pagina" → "Descripciones Personajes". No parafrasear. */
export const FEATURED_CHARACTERS: readonly FeaturedCharacterDef[] = [
  {
    slug: 'the-bloop',
    name: 'The Bloop Ojo Solo',
    description:
      'Súper cetáceo dentado, mamífero y de los ejemplares de labodótipo más grandes jamás visto. Es un depredador natural. Su especie es endémica del océano Pacífico. Protagonizó una de las batallas más tenaces de la historia, cuando se enfrentó contra El Gran Majá.',
  },
  {
    slug: 'el-gran-maja',
    name: 'El Gran Majá',
    description:
      'Especie de anguila, de comportamiento hostil con los humanos. Apareció por primera vez en el año 2022. Es el único miembro conocido de la especie Supperbial anguilla. Por sus características y naturaleza se trata de un depredador.',
  },
  {
    slug: 'phillip-forte',
    name: 'Phillip Forte',
    description:
      'Biólogo marino, líder actual de la organización llamada DELIRIUM; antiguo miembro de la organización IPCARO. La madre es puertorriqueña, el padre es estadounidense. Lidera a cabo la investigación más importante sobre la nueva fauna marina y su repercusión en el ecosistema.',
  },
];
```

- [ ] **Step 2: Crear `FeaturedCharactersSection.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { FEATURED_CHARACTERS } from '../config/featured-characters';
import { getArticleBySlug } from '@/utils/mdx';

export async function FeaturedCharactersSection() {
  const entries = await Promise.all(
    FEATURED_CHARACTERS.map(async (def) => ({ def, article: await getArticleBySlug(def.slug) })),
  );

  return (
    <section id="personajes" className="relative scroll-mt-24 py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <FolderOpen className="h-3.5 w-3.5" />
            Expedientes abiertos
          </div>
          <h2 className="text-4xl font-bold uppercase italic tracking-tight text-white md:text-5xl">
            Personajes <span className="text-primary">destacados</span>
          </h2>
          <p className="text-lg font-medium leading-relaxed text-white/70">
            Los tres nombres que marcaron el primer contacto entre la humanidad y los colosos.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {entries.map(({ def, article }) => {
            const fm = article?.frontmatter;
            const figure = fm?.stats?.length ? `${fm.stats.length} m` : 'DELIRIUM';
            return (
              <article
                key={def.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#061a2e] shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {fm?.image ? (
                    <Image
                      src={fm.image}
                      alt={def.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_45%,#00122E_100%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061a2e] via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="eyebrow text-primary">
                    {fm?.category ?? 'Expediente'} · {figure}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold uppercase italic tracking-tight text-white">{def.name}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-white/80">{def.description}</p>
                  <Link
                    href={`/wiki/${def.slug}`}
                    className="group/link mt-auto inline-flex items-center gap-2 pt-6 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Abrir expediente
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```
Si `typedRoutes` rechaza `` `/wiki/${def.slug}` ``, usar `href={{ pathname: '/wiki/[slug]', params: { slug: def.slug } }}`.

- [ ] **Step 3: Montar en `page.tsx`**

Añadir `import { FeaturedCharactersSection } from '@/features/marketing/sections/FeaturedCharactersSection';` y renderizar `<FeaturedCharactersSection />` justo después de `<UniversePreviewSection />`.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores.

---

### Task 6 (orquestador): integración, build, revisión visual y commits

**Files:** ninguno nuevo.

- [ ] **Step 1:** `npm run lint && npm run build` → sin errores; 36 slugs prerenderizados.
- [ ] **Step 2:** `npx next start -p 3131` y revisar con Chrome DevTools: landing (4 tarjetas, flip legible, sección personajes, videos, about, footer) a 1440 px y 390 px; `/wiki?universe=Colosos#explorar` arranca filtrado; `/wiki/bogbo`, `/wiki/breegard`, `/wiki/aodos-ay01`, `/wiki/the-bloop` muestran las imágenes nuevas. Parar con `kill $(lsof -t -i:3131)`.
- [ ] **Step 3:** Commits por bloque:
  - `feat(assets): importar 14 renders de Drive (Bogbo, Aodos AY01, Breegard, fotografías de The Bloop)` → `public/assets/**`, `src/content/*.mdx`
  - `fix(wiki): el explorador lee ?universe= y ?category= de la URL`
  - `feat(landing): universos y personajes con los textos del PDF, videos y redes reales, métricas calculadas` → resto.
- [ ] **Step 4:** Actualizar memoria (`drive-web-boris.md`) si cambió algo del proceso.

---

### Task 7 (QA): Pruebas de UI con Chrome DevTools (obligatoria antes del commit final)

**Files:** ninguno (solo lectura). Evidencia en `.superpowers/sdd/<plan>/qa/` (capturas + `qa-report.md`).

**Interfaces:**
- Consumes: servidor de producción local `npm run build && npx next start -p 3131` (el dev server bloquea orígenes externos y no refleja `@utility` nuevos). Herramientas MCP `chrome-devtools` (`new_page`, `navigate_page`, `take_screenshot`, `take_snapshot`, `list_console_messages`, `list_network_requests`, `resize_page`, `hover`, `click`, `press_key`, `evaluate_script`).
- Produces: `qa-report.md` con veredicto PASS/FAIL por check y rutas de las capturas.

Checklist (cada ítem = un check con captura o evidencia textual):

- [ ] **Step 1: Arrancar producción local** — `npm run build` ya hecho por el orquestador; `npx next start -p 3131 &`; esperar a que responda `curl -sI http://localhost:3131 | head -1` = 200. Al terminar la QA: `kill $(lsof -t -i:3131)` (nunca `pkill -f`).
- [ ] **Step 2: Landing a 1440×900** — `navigate_page http://localhost:3131`; captura de página completa; `list_console_messages` debe estar vacío de errores (warnings de hidratación cuentan como FAIL).
- [ ] **Step 3: Sección Universos** — scroll a `#universos`: 4 tarjetas visibles en 2×2; `hover` sobre cada una y captura de la cara trasera: el texto completo de Boris cabe sin recorte (comprobar con `evaluate_script` que `scrollHeight <= clientHeight` del panel trasero); la cuarta dice "Próximamente" y no tiene enlace; `press_key Tab` hasta el enlace "Explorar lore" debe girar la tarjeta (focus-within).
- [ ] **Step 4: Enlace de universo → filtro** — `click` en "Explorar lore" de Colosos: la URL contiene `universe=Colosos` y `#explorar`; el selector de universo muestra "Colosos" y todas las cards listadas son de ese universo (snapshot).
- [ ] **Step 5: Personajes destacados** — scroll a `#personajes`: 3 tarjetas con imagen cargada (`list_network_requests` filtrando `/assets/` sin 404), eyebrow con "351 m", "675 m" y el de Phillip; `click` en "Abrir expediente" de The Bloop → `/wiki/the-bloop` carga.
- [ ] **Step 6: Videos** — 3 embeds presentes; los IDs en el DOM son `hedUAqopPBg`, `XurjKHinBIY`, `BP6fwpSuR7I` (`evaluate_script` sobre los iframes/`lite-youtube`).
- [ ] **Step 7: Sobre Boris + Footer** — no existe ningún `a[href="#"]` en la página (`evaluate_script: document.querySelectorAll('a[href="#"]').length === 0`); el botón de YouTube abre `youtube.com/@borisaoblois` en pestaña nueva (atributo `target`); el footer enlaza Inicio/La Wiki/Universos/Versus Arena a rutas reales.
- [ ] **Step 8: Métricas** — los 4 números de la sección de stats coinciden con: nº de `.mdx` en `src/content`, nº de artículos con `stats:`, nº de imágenes en `public/assets`, 4 universos.
- [ ] **Step 9: Móvil 390×844** — `resize_page 390 844`; capturas de hero, universos (1 columna, tarjeta legible), personajes (1 columna) y footer; sin scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] **Step 10: Wiki con assets nuevos** — `/wiki/bogbo`, `/wiki/breegard`, `/wiki/aodos-ay01`, `/wiki/the-bloop` (galería), `/wiki/el-gran-maja` (Descubrimiento): capturas; todas las imágenes nuevas responden 200; ningún heading solapado con una imagen flotada.
- [ ] **Step 11: Reporte** — escribir `qa-report.md` (tabla check → PASS/FAIL → evidencia) y parar el servidor.

Criterio de salida: todos PASS. Un FAIL abre una ronda de corrección (fix round) antes del commit final.

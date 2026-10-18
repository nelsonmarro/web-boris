# Rediseño "crystal look" — diseño

**Issue:** #11 · **Fecha:** 2026-10-18 · **Estado:** aprobado en conversación (alcance, material, landing, wiki y enfoque elegidos con el companion visual); pendiente de revisión del documento.

## 1. Objetivo

Llevar el sitio hacia la estética de las referencias de `docs/crystal look/` (inicio de consola con mosaicos de cristal, estilo Wii/Switch/Frutiger Aero) **sin perder la identidad abisal de BorisaoBlois**: fondo azul profundo, acentos naranja, legibilidad del lore.

### Decisiones tomadas (Nelson, 2026-10-18)

| Tema | Decisión |
|---|---|
| Alcance | Material nuevo en todo el chrome + landing y portada de la wiki como mosaicos. Los artículos conservan su lectura sobre superficie sólida |
| Material | **C · Cristal sutil**: superficie sólida `#061a2e`, hilo de brillo superior, iconos en cuadrado teñido, botón primario plano. No hay brillo especular grande ni orbes |
| Landing | **A · Mosaico arriba + secciones abajo**: la primera pantalla es un "inicio de consola"; las secciones del PDF siguen debajo |
| Portada de la wiki | **A · Mosaico arriba + explorador debajo** |
| Arquitectura | **Enfoque 1 · Primitivas compartidas** (`CrystalTile`, `Mosaic`, `IconChip`) que componen landing, wiki y /comunidad |

### Fuera de alcance

Cuerpo de los artículos de la wiki, Arena (más allá de su tile y el material de sus tarjetas), sidebar de la wiki, navbar y footer (ya son chrome de cristal), tipografía (se conserva Unbounded + Barlow Condensed + Inter), contenido nuevo (todo texto sigue la regla "solo canon").

## 2. Contexto existente

- `src/features/community/components/CrystalTile.tsx` (PR #43): piel actual, ya pensada como piloto de #11.
- Contrato de estilo aprobado: cristal (`.glass-liquid`) solo en chrome/hero/cards; superficie sólida `#061a2e` bajo cualquier texto largo; naranja solo para indicadores/activo; texto ≥ 11 px; secundario ≥ `text-white/60`; superficies naranja sólidas con texto `#00122E`.
- Landing (`src/app/(marketing)/page.tsx`): `HeroSection` → `ArenaTeaserSection` → `UniversePreviewSection` → `FeaturedCharactersSection` → `FeaturedVideosSection` → `AboutBorisSection` → `ContactSection`.
- Portada de la wiki (`src/app/(wiki)/wiki/page.tsx`): `WikiBanner` → `CategoryTiles` → `WikiExplorerSection` → `FeaturedCreature`.
- Usos únicos (se pueden retirar al sustituirlos): `HeroSection`, `HeroVisual`, `BrandCapsule` (solo en el hero), `ArenaTeaserSection`, `WikiBanner`, `FeaturedCreature`, `CategoryTiles`. `SearchBar` y `getLoreStats` se reutilizan.

## 3. Material y primitivas (`src/components/crystal/`)

Módulo nuevo y único donde vive el look. Ninguna página define su propio contenedor de tarjeta.

### `CrystalTile`

Se mueve desde `features/community/components/` (se actualizan sus importadores).

Props: `eyebrow`, `title`, `icon?` (LucideIcon), `variant?: 'default' | 'media' | 'hero'` (por defecto `default`), `image?` + `imagePosition?` (solo `media`), `href?` (la tile entera es un enlace), `headingLevel?: 2 | 3` (por defecto 2), `className?`, `children?`.

- **Base (todas):** `rounded-3xl`, `border-white/10`, sombra profunda, **hilo de brillo superior** (1 px, gradiente blanco/30 → transparente). Sin `backdrop-filter`.
- **`default`:** superficie sólida `#061a2e`.
- **`media`:** la imagen (`next/image`, `fill`, `object-cover`, `objectPosition`) llena la tile de borde a borde; un degradado inferior hacia `#061a2e` (≥ 55 % opaco donde está el texto) garantiza contraste; sin imagen o con imagen de marca → `CategoryPlaceholder`.
- **`hero`:** `default` + resplandor radial tenue (cian arriba a la derecha, naranja abajo a la izquierda).
- **Estado de selección "consola"** (solo si `href`): hover y `focus-visible` → borde `primary/50`, `-translate-y-0.5`, el hilo superior pasa a tono naranja claro; foco con `ring-2 ring-primary`. `motion-reduce:` sin traslación ni transiciones.
- **Semántica:** con `href` el contenedor es un `<Link>` (sin enlaces anidados dentro); sin `href`, un `<section>`. El título usa `h2`/`h3` según `headingLevel`.

### `IconChip`

`icon` (LucideIcon) + `tone?: 'primary' | 'cyan'`: cuadrado `rounded-lg` 22–28 px, fondo `primary/12` o `[#0064A0]/18`, borde del mismo tono, icono `aria-hidden`. Lo usan los eyebrows de las tiles.

### `Mosaic`

Contenedor `<div>` de rejilla con `gap` uniforme (`gap-4 lg:gap-5`) y la opción `fitViewport` (en `lg`: `lg:min-h-[calc(100svh-9rem)]` —7rem de navbar fija + 2rem de margen— con las filas en `auto`/`1fr`; es un mínimo, no un alto fijo: si el contenido no cabe, crece) para que el mosaico de la primera pantalla quepa en escritorio. Columnas y colocación las define cada página con clases literales de Tailwind (no se genera layout en tiempo de ejecución).

### Adopción del material

Pasan a renderizar su contenedor con `CrystalTile` (o, si son tarjetas compuestas, adoptan sus mismas clases a través de una utilidad compartida `crystal-surface` definida en `globals.css` con `@utility`):
`WikiArticleCard`, tarjetas de `FeaturedCharactersSection`, `FlipCard` (cara delantera y trasera), `AboutBorisSection`, `ContactSection` (panel del formulario), `FighterCard` de la Arena y las tiles de `/comunidad`.
No cambian: navbar, footer, botones (`.glass-liquid` y primario plano se quedan), artículos.

## 4. Landing (`/`)

### Primera pantalla — mosaico

Escritorio (`lg`, 3 columnas `2fr 1fr 1fr`):

```
┌──────────────────────────┬──────────────┬──────────────┐
│ HERO (2 filas)           │ Criatura     │ ¿Quién gana? │
│ frase (h1) · texto       │ de la semana │ → /comunidad │
│ buscador · "Acceder…"    ├──────────────┼──────────────┤
│ 37 expedientes · …       │ Último vídeo │ Versus Arena │
├────────┬────────┬────────┴─┬────────────┴──────────────┤
│Colosos │ Galeón │ Ellos    │ La Hecatombe (Próximamente)│
└────────┴────────┴──────────┴───────────────────────────┘
```

| Tile | Contenido | Datos |
|---|---|---|
| Hero (`variant="hero"`) | Eyebrow "Universos de BorisaoBlois", h1 "Explora la inmensidad de mis universos" (frase canónica del PDF), texto actual del hero, `SearchBar`, botón "Acceder a la wiki", línea de estadísticas | `getLoreStats()` |
| Criatura de la semana | `CreatureOfWeekTile` (ya existe) en variante `media` | `pickFeatured()` |
| ¿Quién gana? | **`PollTeaserTile`** (nuevo, estático): duelo de la semana "A vs B" y "Votar en Comunidad →" (`href="/comunidad"`); sin votación en la landing. Si no hay encuesta (menos de 2 luchadores), la tile no se pinta y la Arena ocupa las dos filas de esa columna | `getCurrentPoll()` |
| Último vídeo | **`LatestVideoTeaserTile`** (nuevo): miniatura `https://i.ytimg.com/vi/<id>/hqdefault.jpg` (servida con `next/image`, host añadido a `images.remotePatterns`), título; la tile entera enlaza a `https://www.youtube.com/watch?v=<id>` en pestaña nueva (`rel="noopener noreferrer"` + texto `sr-only` "(se abre en una pestaña nueva)") | `getLatestVideo()` |
| Versus Arena | **`ArenaTile`** (nuevo): duelo canónico El Gran Majá vs The Bloop, barra de probabilidad y "Abrir la Arena →" (`href="/wiki/arena?a=el-gran-maja&b=the-bloop"`) | lógica actual de `ArenaTeaserSection` (`pickFighters`, `computeMatchup`) movida a `ArenaTile` |
| Universos ×4 | **`UniverseTile`** (nuevo, `variant="media"`): era, título, portada; enlaza a `/wiki?universe=<key>#explorar`; los `comingSoon` sin portada muestran el chip Próximamente | `UNIVERSES` |

Tablet (`md`, 2 columnas): hero a lo ancho; criatura | encuesta; vídeo | Arena; universos 2 × 2.
Móvil (1 columna): hero, criatura, encuesta, Arena, vídeo, universos 2 × 2. Sin `fitViewport`.

### Debajo del mosaico (mismo orden y contenido, nuevo material)

`FeaturedVideosSection` (los 3 vídeos del PDF), `UniversePreviewSection` (sinopsis en tarjetas que giran, `id="universos"`), `FeaturedCharactersSection`, `AboutBorisSection`, `ContactSection`.

### Retirado

`HeroSection`, `HeroVisual`, `BrandCapsule`, `ArenaTeaserSection` (su lógica pasa a `ArenaTile`).

## 5. Portada de la wiki (`/wiki`)

El menú lateral no cambia. En el área de contenido:

```
┌──────────────────────────┬──────────────┬──────────────┐
│ ARCHIVO CENTRAL (h1)     │ Criatura     │ Versus Arena │
│ descripción · buscador   │ de la semana ├──────────────┤
│                          │ (media)      │ ¿Quién gana? │
├────────────┬─────────────┴──┬───────────┴──────────────┤
│ Colosos    │ Titanes        │ Medianos                  │
├────────────┼────────────────┼───────────────────────────┤
│ Especies   │ Humanos        │ Organizaciones            │
└────────────┴────────────────┴───────────────────────────┘
        ↓ WikiExplorerSection (sin cambios, id="explorar")
```

- **Tile del archivo** (`variant="hero"`): eyebrow "Base de datos DELIRIUM", h1 "Archivo Central · Universos", la descripción actual, `SearchBar` (lleva a `/wiki?search=…#explorar`).
- **Criatura, Arena, ¿Quién gana?:** las mismas tiles de la landing.
- **`CategoryTile` ×6** (`variant="media"`, `headingLevel={2}`): portada real de la categoría, número de artículos y descripción **solo canon o factual**:

| Categoría | Descripción |
|---|---|
| Colosos | "Más de 200 metros de longitud y más de 20 mil toneladas de peso." (PDF, apartado de The Bloop) |
| Titanes | "Le'Mug y los garddiodon pertenecen a esta categoría." (docx) |
| Medianos | sin descripción; chip **Próximamente** |
| Especies | "Especies identificadas del universo Colosos." |
| Humanos | "Phillip Forte y los demás personajes humanos del universo Colosos." |
| Organizaciones | "DELIRIUM, IPCARO y las Naciones Rebeldes." |

Tablet: 2 columnas. Móvil: archivo, criatura, categorías 2 × 3, Arena, encuesta.
**Retirado:** `WikiBanner`, `CategoryTiles` (sustituido por `CategoryTile`), `FeaturedCreature` (sube al mosaico).

## 6. `/comunidad`

Solo cambia el origen de `CrystalTile` (`@/components/crystal`) y adopta `IconChip` en los eyebrows. El aspecto se mantiene.

## 7. Organización del código

```
src/components/crystal/   CrystalTile, IconChip, Mosaic, index.ts
src/features/community/components/   CreatureOfWeekTile (+ variante media), PollTile, PollTeaserTile, LatestVideoTile, LatestVideoTeaserTile, NewsTile
src/features/monsters/components/arena/ArenaTile.tsx
src/features/monsters/components/wiki/CategoryTile.tsx
src/features/marketing/components/UniverseTile.tsx
src/features/marketing/sections/HomeMosaic.tsx     (compone la primera pantalla de la landing)
src/features/monsters/components/wiki/WikiHomeMosaic.tsx
```

Las tiles reciben datos ya resueltos por la página (Server Components); ninguna tile nueva es de cliente salvo las que ya lo son (`PollTile`, `LatestVideoTile`).

## 8. Accesibilidad y rendimiento

- Una sola `h1` por página (la tile hero); las demás tiles usan `h2`.
- Tiles enlazables: un solo `<Link>` por tile, nombre accesible = título; foco visible.
- `prefers-reduced-motion`: sin traslación ni transiciones.
- Imágenes: `sizes` acordes al ancho de cada tile; solo la portada de la criatura y la del primer universo con `fetchPriority="high"` en escritorio.
- Sin `backdrop-filter` en las tiles (coste en móvil); el cristal con blur sigue solo en el chrome.

## 9. Verificación

- `npm run lint`, `npm test`, `npm run check:content`, `npm run build`.
- QA con Chrome DevTools sobre build de producción en `/`, `/wiki`, `/comunidad`, un artículo y la Arena, a 390, 768, 1024 y 1440 px:
  - el mosaico cabe en la primera pantalla a 1440 × 900 y 1280 × 800;
  - sin scroll horizontal;
  - recorrido con teclado por las tiles (foco visible, orden lógico);
  - `prefers-reduced-motion` emulado;
  - capturas antes/después en `docs/audits/2026-10-18-crystal-look/`.
- Lighthouse accesibilidad 100 en `/`, `/wiki` y `/comunidad` (móvil y escritorio).

## 10. Entrega

Rama `feat/crystal-look`, un PR que cierra #11. Tareas: (1) primitivas + migración de `/comunidad`; (2) material en las tarjetas existentes; (3) mosaico de la landing; (4) mosaico de la wiki + descripciones canónicas; (5) QA y PR.

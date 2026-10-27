# Hero abisal de la landing y sección de universos — diseño

Fecha: 2026-10-27. Pedido por Nelson: una primera pantalla más bonita, con un hero dedicado que muestre un monstruo aleatorio entre los más populares, una animación que atrape «en las profundidades del lore», el buscador dentro del hero y, debajo, una sección propia para los universos. Decisiones de Nelson: la lista de populares es una lista curada en config; el monstruo cambia en cada visita; animación solo CSS (opción 1).

Amplía la spec del rediseño minimalista (`2026-10-18-rediseno-minimal-design.md`, #55) sin romper la ley Abisal: `ContentCard` y `Section`, una sección = un propósito, sin eyebrows ni chips decorativos.

## 1. Objetivo

Que la primera pantalla «atrape»: una criatura a pantalla casi completa que emerge de la oscuridad al cargar, con el buscador a mano y el nombre del expediente visible. Debajo, los cuatro universos con su sinopsis canónica como puerta de entrada al archivo. Todo sin JavaScript nuevo en el primer pliegue y sin empeorar el LCP ni el contraste que calibró la auditoría #66.

## 2. Estructura de la landing

`src/app/(marketing)/page.tsx`:

1. `Navbar`
2. **`HeroAbisal`** (nuevo, sustituye a `HeroBleed`)
3. **`UniversesSection`** (nuevo, `id="universos"`)
4. `FeaturedCharactersSection`, `FeaturedVideosSection`, `CommunityStrip`, `AboutContactSection`, `Footer` (sin cambios)

Se quita `export const revalidate = 3600` de la página: el hero la vuelve dinámica (ver §4). `HeroBleed.tsx` se borra. Los enlaces de la navbar y el footer que apuntan a `#universos` siguen funcionando (la sección conserva ese id y `scroll-mt-24`).

## 3. Lista curada: `HERO_POOL`

`src/features/marketing/config/hero-pool.ts`:

```ts
/** Expedientes que pueden abrir la landing: fichas con arte que luce a pantalla completa. Orden sin importancia. */
export const HERO_POOL: readonly string[] = ['the-bloop', 'el-gran-maja', 'bogbo', 'vlad-julia', 'phillip-forte'];
```

Regla: un slug de `HERO_POOL` debe existir como MDX y tener `image`; `check:content` lo comprueba (error si no existe o no tiene `image`). Una ficha sellada (`status: proximamente`) no puede estar en la lista (error).

## 4. Elección del monstruo

Función pura `pickHeroCreature(pool, articles, rand)` en `src/features/marketing/lib/hero-pick.ts` (imports relativos `.ts`, probada con node:test):

- candidatos = artículos cuyo slug está en `pool`, con `coverOf(frontmatter.image)` no nulo (`coverOf` vive en un componente; la función recibe ya un predicado o la lista filtrada: ver plan) y sin `status`;
- `rand` ∈ [0, 1): índice `Math.floor(rand * candidatos.length)`; con `rand` fuera de rango se acota;
- `null` sin candidatos. Devuelve `WikiArticleSummary`.

`HeroAbisal` es un server component `async`: `await connection()` (`next/server`), luego `pickHeroCreature(HERO_POOL, articles, Math.random())`. Con eso la landing se renderiza en cada petición (dinámica): la imagen elegida viaja en el HTML (LCP con `priority`), sin parpadeo. Los artículos se leen por petición (caché de React por petición), y el RSS de vídeos sigue en la caché de `fetch` (1 h). Si `pickHeroCreature` devuelve `null`, el hero se pinta sin imagen de fondo (solo el degradado) y sin chip.

## 5. Hero: capas y contenido

`src/features/marketing/sections/HeroAbisal.tsx` (servidor) con estilos en `globals.css` (`@utility`/`@keyframes` bajo un comentario «Hero abisal»).

### Capas (de atrás hacia delante), todas `aria-hidden`
1. **Criatura**: `next/image` `fill`, `sizes="100vw"`, `priority`, `object-cover`, `objectPosition` del frontmatter. Envuelta en `div.hero-creature` que lleva la animación de emerger.
2. **Velos de contraste**: los mismos tres degradados de `HeroBleed` (móvil vertical; `lg` y `xl` horizontales) y el fundido inferior, sin cambios de alfa: ya garantizan ≥ 4.5:1 bajo el h1 naranja y la frase.
3. **Luz cáustica**: `div.hero-caustics`, reutiliza el ruido de `caustic-flow` con `mix-blend-mode: screen`, opacidad 0.12; se desplaza 60 s en bucle.
4. **Burbujas**: 7 `span.hero-bubble` posicionados a mano (`left` 8–92 %, tamaños 6–14 px, `animation-delay` 0–9 s), blancas al 25 %, suben desde abajo del hero hasta el 20 % en 12–18 s con un leve vaivén; `pointer-events: none`.

### Animación «emerger» (solo CSS)
- `.hero-creature`: `animation: hero-emerge 1.6s cubic-bezier(.2,.7,.2,1) both, hero-drift 30s ease-in-out 1.6s infinite alternate`. `hero-emerge`: de `filter: brightness(.25) blur(14px); transform: scale(1.1)` a `filter: brightness(1) blur(0); transform: scale(1.04)`. `hero-drift`: `transform` entre `scale(1.04) translate(0,0)` y `scale(1.08) translate(-1.5%,-1%)`.
- Texto: h1, frase, buscador, chip y flecha con `.hero-rise` y `animation-delay` escalonado (0.25 s, 0.4 s, 0.55 s, 0.7 s, 1.2 s): de `opacity: 0; translateY(16px)` a visible en 0.7 s.
- `@media (prefers-reduced-motion: reduce)`: el bloque global ya acorta todas las animaciones a 0.01 ms; además `.hero-creature` fija `filter: none; transform: none` y las burbujas se ocultan (`display: none`).
- La animación no afecta al LCP: la imagen se pinta desde el primer frame (oscura), y `filter` no retrasa la carga.

### Contenido (`container mx-auto px-6`, `min-h-[88svh]`, `pt-32 md:pt-40 short-screen:pt-28`, centrado verticalmente con `flex flex-col justify-center`)
- `h1.page-title`: «Explora la inmensidad» + `<span class="block italic text-primary">de mis universos</span>` (igual que hoy).
- `p`: «Todo el lore oficial de BorisaoBlois en un solo archivo.»
- `SearchTrigger variant="hero"` dentro de `div.max-w-xl`.
- **Chip del expediente** (si hay criatura): `Link` a `/wiki/<slug>`, mismo estilo de píldora que el chip actual (`min-h-11 rounded-full border border-white/15 bg-[#061a2e]/90`), texto: «En pantalla: **{título}** · Ver expediente ›». Sustituye al chip «Criatura de la semana», que sigue en `/comunidad`.
- **Flecha «Sumérgete»**: `a[href="#universos"]` al pie del hero (`absolute inset-x-0 bottom-6`, centrado), texto «Sumérgete» en `text-[11px] font-bold uppercase tracking-wider text-white/70` y un chevron `lucide-react` `ChevronDown` con `animation: hero-bob 2s ease-in-out infinite` (sube y baja 6 px); objetivo táctil ≥ 44 px. Oculta en `short-screen`.

## 6. Sección «Universos»

`src/features/marketing/sections/UniversesSection.tsx` (servidor):

- `Section id="universos" title="Explora los universos"` con `scroll-mt-24` (añadir `className`), `contained`.
- Bajo el título, `p.text-white/70`: «Cada universo tiene sus propias reglas, criaturas y misterios.» (frase de la sección anterior al rediseño, sin la instrucción de «toca o pasa el cursor»).
- Rejilla `grid gap-4 md:grid-cols-2 md:gap-6`, cuatro `ContentCard` (`aspect="video"`, `headingLevel={3}`, `sizes="(min-width: 768px) 50vw, 100vw"`):
  - `title` = `u.title`; `meta` = «{era} · {N} expedientes» («1 expediente»); para `comingSoon`, `meta` = `era` y `pending`;
  - `description` = `u.description` (sinopsis canónica de `universes.ts`), `lines={3}`;
  - `href` = `/wiki?universe=<key>#catalogo` cuando hay `universeKey`;
  - `image`/`imagePosition` de `universes.ts`; la primera tarjeta `eager` (puede ser LCP en móvil si el hero no tiene imagen).
- N expedientes = artículos con `frontmatter.universe === universeKey` que no son índice (`Directorio`/`Categoría`) ni `proximamente` (reutiliza `registroSlugs` por universo o un filtro equivalente: ver plan). Función pura `countByUniverse(articles)` en `src/features/marketing/lib/universe-counts.ts`, probada.

## 7. Validación y pruebas

- node:test: `hero-pick.test.ts` (pool vacío → null; descarta slugs inexistentes, sin portada y sellados; `rand` 0 y 0.999 dan primero y último; `rand` fuera de rango se acota), `universe-counts.test.ts` (excluye índices y sellados; universo sin fichas = 0).
- `check:content`: `HERO_POOL` válido (existe, con `image`, no sellado).
- QA con Chrome DevTools sobre el build de producción (`RESEND_API_KEY=re_qa_invalida CONTACT_EMAIL=qa-sin-envio@example.invalid`): 320/390/768/1024/1280 px; contraste del h1 y la frase sobre cada una de las 5 imágenes del pool (forzar el slug con una variable de entorno de QA `HERO_FORCE_SLUG`, solo leída fuera de producción); sin desbordes; `prefers-reduced-motion` estático; la flecha baja a `#universos`; Lighthouse en la landing (móvil): accesibilidad/buenas prácticas/SEO 100 y LCP no peor que hoy (medir antes y después con el mismo `HERO_FORCE_SLUG=the-bloop`).
- `npm run lint`, `npm test`, `npm run check:content`, `npm run build`. En el build la landing sale como dinámica (ƒ).

## 8. Fuera de alcance

Parallax con ratón o scroll (opción 2, se puede añadir encima), vídeo de fondo, cambio de la paleta o de las demás secciones, rotación por hora.

## 9. Seguimiento

Issue «Landing: hero abisal con monstruo aleatorio y sección de universos» con esta spec; un PR; `CLAUDE.md`: la landing es dinámica por el hero (`connection()`), `HERO_POOL` y su regla en `check:content`, `HERO_FORCE_SLUG` solo para QA.

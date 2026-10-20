# Pendientes menores (#57 y #58): plan de implementación

> **Para agentes:** se ejecuta con superpowers:subagent-driven-development. Las tareas T1–T5 tocan conjuntos de archivos disjuntos y van en paralelo. Los implementadores **no hacen commit**: el orquestador revisa cada tarea y hace el commit con `git commit -- <rutas>`.

**Objetivo:** cerrar los pendientes menores que dejaron las revisiones finales del rediseño minimalista (#57) y de la Ola B (#58). Son cuatro tipos de cambio:
- quitar duplicados;
- arreglar el foco en modo de colores forzados;
- mejorar la accesibilidad de la paleta, el visor y el chip de apartado;
- pulir el motor de enlaces y cargar la paleta solo al abrirla.

**Arquitectura:** no se crean piezas nuevas salvo `SearchPaletteHost`, el cargador diferido de la paleta. Los helpers compartidos ya están en la rama (commit `57c0e10`) y las tareas los consumen:
- `coverOf` (en `CategoryPlaceholder.tsx`);
- `PendingLabel` (en `src/components/content/`);
- `youtubeWatchUrl` y `youtubeThumbUrl` (en `src/utils/youtube.ts`);
- `formatFecha` (en `src/utils/format-date.ts`).

**Stack:** Next 16 (App Router), React 19, Tailwind v4, Base UI Dialog, Zustand v5, `node:test`.

**Issues:** #57 y #58. No hay spec: son listas de pendientes. Las issues son la fuente, y las decisiones van en «Decisiones» más abajo.

## Restricciones globales

- **Validación:** `npm run lint`, `npm test`, `npm run check:content` y `npm run build`, los cuatro en verde.
- **Sin cambios visuales:** salvo lo que pida cada punto, ningún cambio debe alterar el aspecto. Las clases resultantes son las mismas que hoy.
- **Capas:** `src/core/**` no importa de `src/features/**` ni de `src/utils/**`. Los módulos puros de `src/core/search/` usan imports relativos con `.ts`.
- **Comentarios:** en español, con la densidad del código de alrededor.
- **Contenido:** no se toca ningún `src/content/**`.
- **Implementadores:** no hacen commit ni lanzan subagentes.

## Decisiones

- **D1. Relacionados y páginas «Categoría» (#57, último punto): se mantienen.** Las migas de pan (`WikiBreadcrumbs`) muestran la categoría como texto, sin enlace. Así, el relacionado es el único camino de una criatura a su página de categoría aparte del menú. `rankRelated` ya excluye los `Directorio`. Si fuera un error, el coste es un hueco de relacionados ocupado por un índice.
- **D2. `sizes` de la portada:** se calcula con el menú lateral desplegado (16rem), que es el estado por defecto en escritorio. Si fuera un error, con el menú plegado y DPR 1 la portada se ve algo más blanda.
- **D3. Contracciones:** «del» o «al» seguidos del nombre sin su «El» inicial. Cuentan solo si la primera palabra tras la contracción empieza en mayúscula, así que «del ángel» genérico no enlaza. El enlace cubre el nombre sin la contracción: «del [Ángel]», «al [Gran Majá]».
- **D4. `WikiCommandPalette`** (citado en #57) ya no existe. Se cubren los mismos archivos que hoy tienen `outline-none`.

---

### Tarea 1: quitar duplicados, `sizes` de la portada y el shim `SearchBar` (#57, #58)

**Archivos (solo estos):**
- `src/components/content/ContentCard.tsx`
- `src/features/monsters/components/wiki/article/WikiArticleHeader.tsx`
- `src/features/monsters/components/arena/components/FighterCard.tsx`
- `src/features/monsters/components/wiki/article/EntityPreview.tsx`
- `src/features/community/components/CommunityCreatureRow.tsx`
- `src/features/marketing/sections/HeroBleed.tsx`
- `src/features/marketing/components/hero/SearchBar.tsx` (borrar)
- `src/features/community/components/PollTile.tsx`
- `src/app/(marketing)/comunidad/page.tsx`
- `src/features/community/components/NewsList.tsx`
- `src/features/marketing/sections/FeaturedVideosSection.tsx`
- `src/features/monsters/components/wiki/article/ApareceEn.tsx`
- `src/features/marketing/sections/AboutContactSection.tsx`
- `src/features/monsters/components/wiki/WikiEmptyState.tsx`

**Consume:**
- `coverOf(src?: string): string | undefined`, de `@/features/monsters/components/wiki/CategoryPlaceholder`;
- `PendingLabel(props: React.HTMLAttributes<HTMLSpanElement>)`, de `@/components/content`; renderiza un `<span>` con `text-[11px] font-bold uppercase tracking-wider text-primary` y el texto «Próximamente»;
- `youtubeWatchUrl(id)` y `youtubeThumbUrl(id)`, de `@/utils/youtube`;
- `formatFecha(date: Date)`, de `@/utils/format-date`.

**Pasos:**

1. **Portadas:** sustituye cada `X && !isBrandPlaceholder(X) ? X : undefined` por `coverOf(X)`. En `WikiArticleHeader`, la condición queda así: `const cover = !imageInBody && !isIndexCategory(category) ? coverOf(image) : undefined;`. En `FighterCard`, el ternario JSX `fm.image && !isBrandPlaceholder(fm.image) ? (…)` pasa a calcular antes `const cover = coverOf(fm.image)` y a usar `cover`. Quita los imports de `isBrandPlaceholder` que queden sin uso. `SearchPalette.tsx` es de la Tarea 3: no la toques.
2. **Rótulo «Próximamente»:** sustituye los rótulos de texto por `PendingLabel`. Cuando hoy sea un `<p>`, usa `className="block"` y conserva los atributos (por ejemplo, el `aria-hidden="true"` de `ContentCard`); los márgenes (`ml-2`, `mt-0.5`) van en `className`. Afecta a `ContentCard`, `EntityPreview`, `NewsList`, `WikiEmptyState`, `AboutContactSection` (y su constante `PENDING`) y `PollTile` (y su constante `PENDING_LABEL`). Las clases resultantes deben ser las mismas que hoy (con `block` donde había `<p>` o `block`).
3. **YouTube:** en `comunidad/page.tsx`, `FeaturedVideosSection` y `ApareceEn`, las URL `https://www.youtube.com/watch?v=…` y `https://i.ytimg.com/vi/…/mqdefault.jpg` pasan a `youtubeWatchUrl(video.id)` y `youtubeThumbUrl(video.id)`.
4. **Fechas:** en `comunidad/page.tsx` y `NewsList.tsx`, borra la constante local `dateFormat` y usa `formatFecha(...)` con el mismo `Date` de hoy.
5. **`sizes` de la portada (decisión D2):** en `WikiArticleHeader`, el contenedor es `wiki-container` (`max-w-6xl`, que son 72rem; `px-4`, `sm:px-6` y `lg:px-8`) dentro de `SidebarInset`. El menú lateral mide 16rem desplegado desde md, y en móvil es una hoja. El valor es exactamente `sizes="(min-width: 1408px) 1088px, (min-width: 1024px) calc(100vw - 20rem), (min-width: 768px) calc(100vw - 19rem), calc(100vw - 2rem)"`.
6. **Shim `SearchBar`:** borra `src/features/marketing/components/hero/SearchBar.tsx`. En `HeroBleed.tsx`, importa `SearchTrigger` de `@/components/search/SearchTrigger` y pinta `<SearchTrigger variant="hero" />`, con el mismo placeholder por defecto.
7. **Verifica:** `grep -rn "isBrandPlaceholder(" src` solo debe dar la definición de `coverOf` y `SearchPalette.tsx`. `grep -rn "DateTimeFormat\|i.ytimg.com\|youtube.com/watch" src` solo debe dar los helpers. Después, `npm run lint` y `npx tsc --noEmit`.

### Tarea 2: foco en colores forzados, dependencia sin uso y shim `discovery-order` (#57, #58)

**Archivos (solo estos):**
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/dialog.tsx`
- `src/features/monsters/components/wiki/mdx/WikiTabs.tsx`
- `package.json`
- `package-lock.json`
- `src/features/monsters/actions/get-wiki-articles.ts`
- `src/features/monsters/lib/discovery-order.ts` (borrar)

**Pasos:**

1. En esos siete componentes, cada `outline-none` pasa a `outline-hidden`, con su variante si la tiene: `focus:`, `focus-visible:`, etc. En Tailwind v4, `outline-hidden` deja un contorno transparente que se ve en modo de colores forzados; en modo normal no cambia nada. Comprueba que `grep -rn "outline-none" src` no devuelve nada.
2. Ejecuta `npm uninstall @next/third-parties`. Comprueba antes, con `grep -rn "third-parties" src`, que no se importa en ningún sitio.
3. En `get-wiki-articles.ts`, importa `compareDiscovery` de `@/core/search/discovery-order`. Después borra `src/features/monsters/lib/discovery-order.ts` y comprueba que `grep -rn "lib/discovery-order" src tests` no devuelve nada.
4. Ejecuta `npm run lint`, `npx tsc --noEmit` y `npm test`.

### Tarea 3: paleta (accesibilidad, debounce y carga diferida) (#58)

**Archivos (solo estos):**
- `src/components/search/SearchPalette.tsx`
- `src/components/search/useSearchPalette.ts`
- `src/components/search/SearchTrigger.tsx`
- `src/components/search/SearchPaletteHost.tsx` (nuevo)
- `src/app/layout.tsx`

**Consume:** `coverOf` y `PendingLabel`, igual que la Tarea 1.

**Pasos:**

1. **Grupos con rótulo:** hoy el rótulo «Populares» es un `<li role="presentation">` dentro del `listbox`. Usa el patrón de APG de *listbox* con opciones agrupadas:
   - el contenedor `role="listbox"` conserva `id={listId}` y su `aria-label`;
   - cada tramo con rótulo es un `<ul role="group" aria-labelledby={idDelRótulo}>`, cuyo primer hijo es `<li role="presentation" id={idDelRótulo}>Populares</li>`, seguido de las `role="option"`;
   - los tramos sin rótulo (resultados, «Ver todos», «¿Quisiste decir…?») van en un `<ul role="presentation">`.

   El rótulo aparece donde hoy: al principio sin consulta, y antes de la primera entrada cuando no hay coincidencias. Los `id={`${listId}-${i}`}`, `data-row`, `aria-selected`, `aria-activedescendant`, el `onMouseDown` que evita robar el foco y el aspecto no cambian. El índice `i` sigue siendo el de la lista plana `rows`.
2. **Debounce del estado:** el texto de `<p role="status">` se actualiza 300 ms después del último cambio. Usa un hook local `useDebouncedValue(value, 300)` en el mismo archivo, con `setTimeout` y limpieza en el efecto. El texto visible no se retrasa.
3. **Portada y rótulo:** en `Thumb`, `coverOf(entry.image)`. En `EntryRow`, `<PendingLabel className="mr-2" />`.
4. **Sin `initialQuery`:** `openPalette: () => void` pone `{ open: true, query: '' }`. Actualiza el comentario de la interfaz, porque la nota «nunca como handler directo» deja de tener sentido. Los `onClick={() => openPalette()}` de `SearchTrigger` pueden pasar a `onClick={openPalette}`.
5. **Carga diferida:** crea `SearchPaletteHost.tsx` (`'use client'`), que se monta en el layout en lugar de `SearchPalette`.
   - **Atajo:** contiene el `useEffect` del atajo ⌘K / Ctrl+K, movido tal cual desde `SearchPalette`, con `OTHER_MODAL` y el comentario. Así el atajo funciona antes de cargar la paleta.
   - **Carga:** importa la paleta con `next/dynamic` (`dynamic(() => import('./SearchPalette').then((m) => m.SearchPalette), { ssr: false })`) y solo la pinta tras la primera apertura. La señal es `const opened = useSearchPalette((s) => s.open)`, más un estado que se queda en `true` desde la primera vez: ajuste durante el render, como el `resetKey` de la paleta, sin efecto.
   - **Precarga:** exporta `preloadSearchPalette = () => void import('./SearchPalette')`. `SearchTrigger` la llama en `onPointerEnter` y `onFocus` de sus tres variantes.
   - **Layout:** en `src/app/layout.tsx`, importa y monta `SearchPaletteHost`, y actualiza el comentario.
   - **Comprobación:** consulta `node_modules/next/dist/docs/` sobre `next/dynamic` / lazy loading en Next 16 antes de escribirlo.
6. **Comportamiento a conservar:** la paleta debe abrirse con el foco en el campo también la primera vez, cuando el chunk llega con `open` ya en `true` (Base UI `Dialog` con `initialFocus={inputRef}`). Si no lo hace, arréglalo en `SearchPalette`, no en el host.
7. Ejecuta `npm run lint` y `npx tsc --noEmit`.

### Tarea 4: foco del visor y nombre del chip de apartado (#58)

**Archivos (solo estos):**
- `src/features/monsters/components/wiki/mdx/ImageViewer.tsx`
- `src/features/monsters/components/wiki/article/SectionChip.tsx`

**Pasos:**

1. **Visor:** cuando cambia la diapositiva mostrada (por ←/→, botones o deslizar) y el foco estaba en el «Abrir original» de la anterior, el foco pasa al «Abrir original» de la nueva. Pasos:
   - marca cada enlace con `data-viewer-original={i}`;
   - en `onScroll`, cuando `next !== indexRef.current`, comprueba si `document.activeElement` es un `[data-viewer-original]` dentro de la pista y guarda esa intención en un ref;
   - en un `useEffect` sobre `index`, si el ref está activo, enfoca `trackRef.current?.querySelector(`[data-viewer-original="${index}"]`)` con `focus({ preventScroll: true })` (para no mover la pista con el scroll del foco) y limpia el ref.

   Si el foco estaba en otro sitio (por ejemplo, en el botón «Siguiente»), no se mueve.
2. **Chip (WCAG 2.5.3):** quita el `aria-label` del botón. El nombre accesible sale del contenido:
   - `<span className="sr-only">Apartado actual: </span>`;
   - el título visible y `· n/N` (los spans de hoy);
   - `<span className="sr-only">. Abrir índice</span>`.

   El nombre resultante contiene el texto visible, «{título} · {n}/{N}», seguido. El aspecto no cambia.
3. Ejecuta `npm run lint` y `npx tsc --noEmit`.

### Tarea 5: motor de enlaces (#58)

**Archivos (solo estos):**
- `src/core/search/wiki-routes.ts`
- `src/core/search/entity-index.ts`
- `src/core/search/extract-body-text.ts`
- `src/utils/remark-entity-links.ts`
- `src/features/monsters/components/wiki/mdx/MdxRenderer.tsx`
- `tests/search/entity-index.test.ts`
- `tests/search/extract-body-text.test.ts`
- `tests/search/remark-entity-links.test.ts`

**Pasos (TDD: primero el test que falla, luego el código):**

1. **`WIKI_LINK` compartido:** mueve la regex `WIKI_LINK = /^\/wiki\/([a-z0-9-]+)(?:[/?#]|$)/` de `remark-entity-links.ts` a `src/core/search/wiki-routes.ts`. Allí se exporta con un comentario: «URL interna de una ficha: el slug va en el grupo 1; admite `/`, `?` o `#` detrás». El plugin la importa por ruta relativa: `../core/search/wiki-routes.ts`.
2. **`extractWikiLinks`:** acepta los sufijos. Recorre los destinos de los enlaces markdown (`/\]\(([^)\s]+)/g`) y aplica `WIKI_LINK` a cada uno (import relativo `./wiki-routes.ts`). Tests: `[A](/wiki/the-bloop#anatomia)`, `[B](/wiki/bogbo/)` y `[C](/wiki/el-angel?x=1)` dan `the-bloop`, `bogbo` y `el-angel`; `/wiki/x-y` sigue funcionando; `[D](https://otro/wiki/no)` y `/wikipedia/foo` no cuentan.
3. **Contracciones en `findMentions` (decisión D3):**
   - si en la posición `i` no hay coincidencia normal y `words[i].norm` es `del` o `al`, se prueban los nombres cuyo `tokens[0] === 'el'` y que tienen al menos 2 tokens;
   - los `tokens.slice(1)` deben casar con `words[i+1…]`, y `words[i+1].raw` debe empezar en mayúscula;
   - la mención va de `words[i+1].start` al final de la última palabra, con `name` igual al nombre de la entrada;
   - se consumen `1 + (tokens.length - 1)` palabras, y la regla `self` (consume sin emitir) se aplica igual.

   Tests en `entity-index.test.ts`, con un índice de prueba que tenga «El Ángel» y «El Gran Majá» linkables:
   - «la llegada del Ángel» da `el-angel`, y el texto entre `start` y `end` es «Ángel»;
   - «se enfrentó al Gran Majá» da `el-gran-maja` («Gran Majá»);
   - «del ángel» en minúscula no da nada;
   - «el Ángel» sin contracción sigue funcionando como hoy;
   - con `self: 'el-angel'` no se emite.
4. **`a` de `MdxRenderer`:** un `href` que empiece por `//` es externo y abre pestaña nueva, igual que los `http(s)`; ya no se trata como interno. Para eso, la rama `startsWith('/')` excluye `//`, y la rama externa acepta `/^(https?:)?\/\//i`.
5. **Tests del plugin** (`remark-entity-links.test.ts`, solo tests; si alguno falla, arregla el plugin). Lee primero cómo construye los árboles el archivo actual:
   - desplazamientos con tildes y apóstrofos: un texto como «Según O’Brien, el Ángel…» o «Majá y Ángel» parte el nodo en los puntos correctos;
   - recorrido de `listItem`, `blockquote` y un `mdxJsxFlowElement` `WikiQuote`: las menciones dentro se enlazan;
   - dos menciones distintas en un mismo nodo de texto: los dos enlaces, con el texto intermedio intacto.
6. Ejecuta `npm test` (todo en verde) y `npm run lint`.

---

### Tarea 6 (orquestador): integración, documentación y QA

1. Commit de cada tarea revisada (`git commit -- <rutas>`). Después, `npm run lint && npm test && npm run check:content && npm run build`.
2. **`CLAUDE.md`:**
   - la paleta la monta `SearchPaletteHost` y carga `SearchPalette` en la primera apertura;
   - helpers `coverOf` y `PendingLabel`;
   - `WIKI_LINK` en `wiki-routes`;
   - contracciones en `findMentions`.
3. **QA con Chrome DevTools** (`next start -p 3131`, 1440 y 390 px). Capturas en `docs/audits/2026-10-18-experiencia-fan/pendientes/`.
   - **Paleta:** el chunk no se pide hasta abrirla o pasar el ratón por un disparador. ⌘K funciona antes de cargarla, y la primera apertura deja el foco en el campo.
   - **Paleta, árbol de accesibilidad:** un grupo «Populares» con sus opciones; el estado se anuncia una vez tras escribir.
   - **Visor:** al pulsar → con el foco en «Abrir original», el foco va al enlace de la siguiente.
   - **Chip:** su nombre contiene «… · n/N».
   - **Contorno de foco:** `outline-hidden` en un `input` con foco, con contorno transparente.
   - **Portadas:** se ven igual en `/`, `/wiki`, `/comunidad` y una ficha. Lighthouse 100 en las páginas tocadas.
4. Push, PR («Closes #57, Closes #58»), CI en verde, squash merge y borrar la rama.

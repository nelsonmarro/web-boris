# QA Task E - ux-alta-prioridad (build de produccion en :3131, branch feat/ux-alta-prioridad)

Herramienta: Chrome real via chrome-devtools MCP. Sin cambios de codigo. Capturas y reportes Lighthouse en este directorio.
Viewports: movil 390x844x2 (mobile,touch), escritorio 1440x900x1, tablet 768x1024x1.

Resultado: 2 FAIL (3d busqueda del hero intermitente en escritorio; 6a Lighthouse /wiki 91 < 92), resto PASS. Estado: DONE_WITH_CONCERNS.

## Resultados

| Step | Check | Result | Evidence |
|------|-------|--------|----------|
| 1a | Movil /wiki/the-bloop: ningun parrafo de cuerpo < 300 px | PASS (con nota) | 23 elementos `text-[17px]`. Parrafos MDX de cuerpo: ancho 358 px (todos). Minimo literal = 258 px, que es el texto del `WikiQuote` (blockquote con `px-10` + `pl`), no un parrafo de cuerpo. Items de lista de infobox/referencias 317-332 px. `scrollWidth` 390 = viewport (sin overflow horizontal). |
| 1b | Ningun elemento con `float` left/right a 390 px | PASS | Recorrido de todos los nodos: lista de floats vacia. |
| 1c | Ficha compacta tras la descripcion y antes del primer parrafo; Y del primer parrafo < 900 | PASS | Orden Y: h1 132, descripcion ~290-405, ficha compacta region "Ficha de The Bloop Ojo Solo" ~469 (details/summary en y=690), TOC inline "Contenido [mostrar]" y=775, primer `text-[17px]` y=860 (< 900). Captura `1-mobile-the-bloop-top.png`. |
| 1d | Tap "Ficha completa" abre la infobox completa; segundo tap cierra | PASS | `details.open` false -> true (alto 44 -> 1902 px, infobox completa visible con titulo naranja, imagen 4:3 y "Informacion biologica"); segundo tap -> `open=false`, alto 45 px. Captura `1-mobile-the-bloop-details-open.png`. |
| 1e | TOC "Contenido" colapsado por defecto y abre al tocar | PASS | Inicial: boton "[mostrar]", `aria-expanded=false`, alto 46 px, 0 enlaces renderizados. Tras tap: "[ocultar]", `aria-expanded=true`, alto 298 px, 7 enlaces. Captura `1-mobile-the-bloop-toc-open.png`. |
| 1f | Captions >= 12 px, sentence case; imagenes ancho completo 4:3 | PASS | `figcaption` font-size 12px, `text-transform: none` (3 muestras). Primera imagen 357x267 (4:3), x=16, ancho = columna. Captura `1-mobile-the-bloop-first-image.png`. |
| 1 | Consola /wiki/the-bloop movil (incluye interacciones) | PASS | Sin mensajes. |
| 2a | Movil `/`: `h1` count === 1 y texto | PASS | 1 h1: "EXPLORA LA INMENSIDAD / DE MIS UNIVERSOS" (dos lineas via salto). Texto antes que la imagen en el DOM. |
| 2b | h1 visible sin scroll y sin solape con la navbar | PASS | h1 rect top 178, bottom 288 (<= 844). Navbar fija `nav.fixed` bottom 117 (<= 178). Captura `2-mobile-home-hero.png`. |
| 2c | Buscar "maja" + Enter -> `/wiki?search=maj%C3%A1#explorar`, lista filtrada | PASS | URL final `http://localhost:3131/wiki?search=maj%C3%A1#explorar`; input = "maja"; lista del explorador = 2 tarjetas: `/wiki/el-gran-maja` y `/wiki/supperbial-anguilla` (su descripcion menciona a El Gran Maja). Captura `2-mobile-search-maja-result.png`. |
| 2d | Badge "Expediente de la semana" es enlace a `/wiki/<slug>` | PASS | `<a href="/wiki/bogbo">` "Expediente de la semana Bogbo"; `/wiki/bogbo` responde 200. |
| 2e | Boton de busqueda no recortado | PASS | Boton right = 361 <= 390; formulario right = 366; sin overflow horizontal (scrollWidth 390). |
| 2 | Consola `/` y `/wiki?search=...` movil | PASS | Solo 1 `warn` (no error, no hidratacion): "The resource .../_next/static/chunks/0fl1y1yb_2yow.css was preloaded using link preload but not used within a few seconds ..." |
| 3a | Escritorio 1440 `/`: captura del hero | PASS | `3-desktop-home-hero.png`. |
| 3b | h1 unico | PASS | 1 h1, top 178, bottom 471; navbar bottom 118. |
| 3c | Badge solapando la parte inferior-izquierda de la imagen | PASS | Badge rect L706 T537 R1026 B626; imagen hero (alt "Estudio a lapiz de The Bloop Ojo Solo") L753 T250 R1327 B645: el badge sobresale 47 px por la izquierda y termina 18 px sobre el borde inferior. |
| 3d | La busqueda funciona igual (una corrida) | FAIL (intermitente) | Primera corrida en escritorio (click en BUSCAR tras escribir "maja"): navego a `/wiki?search=maj%C3%A1#explorar` pero el explorador mostro el input VACIO ("Filtrar por nombre...") y la lista SIN filtrar (Animales del universo, Aodos AY01, Bogbo, ...). Captura `3-desktop-search-maja-run1-UNFILTERED-intermittent.png`. No reproducible despues: recarga dura de esa URL OK; 2 corridas reales (Enter, click) OK; 4 consultas con `requestSubmit` (majá, bloop, bogbo + history.back) OK; 8 cargas duras en iframe OK; 8 flujos `/` -> submit en iframe (retardo 300 y 1500 ms) OK. Captura de exito: `3-desktop-search-maja-filtered.png`. Consola del fallo: solo 1 `warn` de preload de imagen. |
| 4a | Escritorio `/wiki/the-bloop`: rail con infobox + TOC sticky intactos | PASS | Infobox en la columna derecha (340 px) arriba; TOC `position: sticky`, fijo en top=80 al hacer scroll (scrollY 2600 y 3600), 7 enlaces, item activo resaltado. Capturas `4-desktop-the-bloop-top.png`, `4-desktop-the-bloop-sticky-toc-floats.png`. |
| 4b | Ficha compacta no visible (`md:hidden`) | PASS | Region "Ficha de ..." `display:none` (ancestro `md:hidden`); `details` no visible. |
| 4c | Floats desde md | PASS | 5 `figure` visibles con `float` right/left (ancho 384 px), parrafos de cuerpo >= 560 px de ancho. |
| 4 | Consola | PASS | Solo 1 `warn` de preload de imagen (The_Bloop_fauces.png); sin errores. |
| 5a | `footer a[href="#"]` === 0 en `/wiki`, `/wiki/the-bloop`, `/wiki/arena` (desktop) y `/wiki` (movil) | PASS | 0 en las 4 paginas; tampoco hay ningun `a[href="#"]` en toda la pagina. Enlaces del footer: youtube, mailto:borisaoblois343@gmail.com, `/`, `/wiki`, `/#universos`, `/wiki/arena`, `/wiki?universe=...#explorar`. |
| 5b | Sin "nelsonmarro@dev.com", "Privacidad", "Terminos" | PASS | Ausentes en las 4 paginas (busqueda sobre `document.body.innerText`). |
| 5c | Footer centrado dentro del area de contenido, no recortado | PASS | Desktop: footer 256-1425 = `main` 256-1425; tarjeta con 24 px de margen a cada lado (gapL 24 / gapR 24) en `/wiki`, `/wiki/the-bloop`, `/wiki/arena`. Movil: tarjeta 24-366 en 390 (24/24). Hay un unico footer de sitio por pagina (otros `<footer>` son el pie de cita, el pie de "navegacion cruzada" y el de puntaje de la arena). Capturas `5-desktop-wiki-footer.png`, `5-desktop-the-bloop-footer.png`, `5-desktop-arena-footer.png`, `5-mobile-wiki-footer.png`. |
| 5 | Consola `/wiki`, `/wiki/arena`, `/wiki` movil | PASS | Sin mensajes. |
| 6a | Lighthouse desktop navegacion `/wiki`: accesibilidad >= 92 | FAIL | Accesibilidad 91 (Best Practices 100, SEO 100, Agentic Browsing 50). Reporte `lh-wiki/report.html`. Auditorias fallidas, ver abajo. |
| 6b | Lighthouse desktop navegacion `/`: accesibilidad >= 95 | PASS | Accesibilidad 95 (Best Practices 100, SEO 100, Agentic 100). Reporte `lh-home/report.html`. Fallidas: color-contrast y heading-order, ver abajo. |
| 7 | Tablet 768x1024 `/wiki/the-bloop`: infobox flota a la derecha (version completa), ficha compacta oculta | PASS (con concern) | `aside` flotante `float:right` 350 px (L394-R744), ficha compacta y `details` ocultos, 5 figuras flotantes, sin overflow horizontal. Captura `7-tablet-768-the-bloop.png`. Concern: ver Defecto 3. |

## Lighthouse - auditorias fallidas

`/wiki` (accesibilidad 91):
- button-name: los dos `SelectTrigger` de filtros (`button#base-ui-_r_1_`, `button#base-ui-_r_4_`, `role="combobox"`, `data-slot="select-trigger"`; selector `div.space-y-10 > div.flex > div.flex > button`) sin nombre accesible.
- color-contrast: `<span class="text-[11px] font-bold uppercase tracking-wider text-white/30 leading-none">` (selector `header.sticky > div.flex > div.flex > span.text-[11px]`, el rotulo "TERMINAL") contraste 2.68 (#515f6d sobre #061a2e), requerido 4.5.
- label-content-name-mismatch: `<a aria-label="Ir al inicio" class="group flex items-center gap-3 ..." href="/">` (logo "Borisao Wiki / Oficial Lore") y `<button aria-label="Buscar en la wiki (⌘K)" class="group flex h-10 items-center gap-3 rounded-xl border ...">` (texto visible "Buscar archivo... ⌘K").
- agent-accessibility-tree (categoria Agentic Browsing, no cuenta en accesibilidad): "Accessibility tree is not well-formed".

`/` (accesibilidad 95):
- color-contrast: (1) `<span class="relative z-10 flex items-center justify-center gap-2">` dentro de `div.flex > a.w-full > button.inline-flex` (texto blanco 11px bold sobre #fe6a00, 2.88); (2) `<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border ...">` en `div.container > header.flex > div.space-y-4` (rojo #fb2c36 sobre #222439, 3.99, 10px); (3) `<a target="_blank" class="text-white/40 hover:text-white text-[10px] font-bold ..." href="https://youtube.com/@borisaoblois">` en `section#videos > div.container > header.flex` (3.67).
- heading-order: `<h3 class="text-5xl md:text-6xl font-bold text-white tracking-tight italic uppercase ...">` en `div.grid > div.flex > div.space-y-2 > h3.text-5xl` (orden de encabezados no descendente secuencial).

## Defects

1. Lighthouse `/wiki` accesibilidad 91 (objetivo >= 92) - menor, falta 1 punto.
   - Repro: `/wiki`, escritorio 1440x900, Lighthouse navegacion desktop.
   - Selector: `button[data-slot="select-trigger"]` (2 filtros universo/categoria en `WikiFilters`), `header.sticky span.text-[11px].text-white/30`, `a[aria-label="Ir al inicio"]`, `button[aria-label^="Buscar en la wiki"]`.
   - Esperado: >= 92. Actual: 91. La correccion mas barata es `aria-label` en los dos `SelectTrigger` ("Filtrar por universo", "Filtrar por categoria"); el `SelectTrigger` de filtros ya existia antes de este PR (el diff solo toco `WikiFilters` para pasar `initialSearch`), por lo que probablemente es una deuda previa y no una regresion de este PR.
   - Viewport: 1440x900.

2. Busqueda del hero: filtro no aplicado en una corrida (intermitente, no reproducido).
   - Repro (1 de 24 intentos; los otros 23 filtraron bien): escritorio 1440x900, `navigate_page` a `/`, click en `searchbox "Buscar en la wiki"`, escribir "maja", click en boton BUSCAR. Se navega a `/wiki?search=maj%C3%A1#explorar` pero `WikiList` arranca con `search=''`.
   - Selector: `#explorar input[type=search]` (esperado value "maja", real ""), y las tarjetas de `#explorar a[href^="/wiki/"]` (esperado 2: `el-gran-maja`, `supperbial-anguilla`; real: lista completa paginada).
   - Causa probable (sin confirmar): `WikiList` inicializa `useState(searchParams.get('search') ?? '')` solo en el montaje; si el componente se monta con `useSearchParams()` aun vacio, el estado queda desfasado de la URL y no se resincroniza (no hay `useEffect` que lo actualice cuando cambian los params).
   - Viewport: 1440x900 (en movil 390x844 funciono en su unica corrida).

3. Tablet 768 con sidebar abierto: el cuerpo del articulo cae debajo de la infobox flotante (no introducido por este PR).
   - Repro: `/wiki/the-bloop` a 768x1024. El area de contenido mide 512 px (768 - sidebar 256); `aside.md:float-right md:w-[350px]` ocupa y=456-2112, deja ~114 px de ancho libre, y el primer parrafo `[class*="text-[17px]"]` empieza en y=2221 (parrafo de 464 px). Hay ~1650 px de hueco vacio a la izquierda de la infobox. Capturas `7-tablet-768-the-bloop.png`, `7-tablet-768-the-bloop-body-below-float.png`.
   - Esperado: texto de cuerpo fluyendo junto o encima de la infobox. Actual: texto bajo la infobox.
   - Nota: las clases del `aside` (`md:float-right md:w-[350px]`) no cambiaron respecto a `main`; el breakpoint `md` no descuenta el sidebar. Considerar usar el modo compacto hasta `lg` o reducir el ancho flotante.

4. Cosmetico (bajo): titulo de la ficha compacta movil recortado a la derecha.
   - Repro: movil 390 `/wiki/the-bloop`, `p.truncate.italic` "THE BLOOP OJO SOLO" (189 px de ancho, `scrollWidth == clientWidth`); la "O" final en cursiva queda recortada ~2-3 px por `overflow:hidden` de `truncate`. Captura `1-mobile-the-bloop-top.png`.

5. Observaciones sin fallo:
   - Hero de escritorio: imagen "Estudio a lapiz de The Bloop Ojo Solo" con badge "Expediente de la semana: Bogbo" (articulo y arte no coinciden; revisar si es intencional).
   - Consola: todas las paginas sin errores ni avisos de hidratacion; solo `warn` de recursos precargados sin uso (`0fl1y1yb_2yow.css` en `/`, `The_Bloop_cuerpo_completo.webp`/`The_Bloop_fauces.png` en `/` y el articulo en escritorio/tablet).
   - La infobox completa se renderiza dos veces en el DOM del articulo (dentro del `details` movil y en el `aside` de escritorio; una de las dos siempre oculta).

## Re-check (tras dos olas de correcciones; servidor :3131 reconstruido)

Mismo enfoque (Chrome real, chrome-devtools MCP). Capturas con prefijo `rc-`; reportes Lighthouse en `rc-lh-*`.
Resultado: 1 FAIL marginal (2: primer parrafo de /wiki/el-gran-maja en Y=906, limite < 900), 1 hallazgo nuevo de layout a 1024 (Defecto R2), resto PASS.

| Item | Check | Result | Evidence |
|------|-------|--------|----------|
| 1a | Tablet 768x1024 `/wiki/the-bloop`, sidebar EXPANDIDO: ficha compacta visible, sin infobox flotante, primer parrafo Y < 1000, sin hueco >= 1000 px | PASS | `data-state=expanded`, area de contenido 497 px. Ficha compacta visible (y=456), `details` visible, 0 elementos con `float` left/right, `aside` del rail `display:none` (`hidden lg:block`). Primer parrafo de cuerpo Y=887, ancho 449 px; ancho minimo de `text-[17px]` 301 px (cita). Sin hueco grande (flujo continuo, sin floats). Consola sin mensajes. Captura `rc-1-tablet-768-sidebar-expanded.png`. |
| 1b | Tablet 768 con sidebar COLAPSADO (click en TOGGLE SIDEBAR) | PASS | `data-state=collapsed`, `main` x=64 ancho 689 px. Ficha compacta visible, 0 floats, primer parrafo Y=837, ancho 641 px, minimo 493 px. Captura `rc-1-tablet-768-sidebar-collapsed.png`. (Titulo h1 se parte en 2 lineas con los botones Compartir/Historial/Imprimir al lado; sin problema funcional.) |
| 1c | `1024x768x1` `/wiki/the-bloop` (sidebar expandido): aparece el rail (aside visible, compacta oculta) | PASS (con concern, ver R2) | Ficha compacta `display:none`; `aside` rail visible (340 px, left 637, top 331) con infobox completa; TOC `position:sticky` visible; TOC inline oculto. Primer parrafo Y=473. Consola sin mensajes. Captura `rc-1-desktop-1024-the-bloop.png`. |
| 2a | Movil `/wiki/the-bloop`: sin floats; ancho minimo de parrafo >= 300; primer parrafo Y < 900 | PASS | 0 floats; 15 parrafos de cuerpo, minimo 358 px (la cita `WikiQuote` sigue en 258 px por su padding; no es parrafo de cuerpo); primer parrafo Y=860; `scrollWidth` 390; captions 12px; consola limpia. |
| 2b | Movil `/wiki/el-gran-maja`: igual | FAIL (marginal) | 0 floats; parrafos de cuerpo minimo 358 px; `scrollWidth` 390; consola limpia. Primer parrafo Y=906 (limite < 900): descripcion de 4 lineas (255-430) + ficha compacta 455-781 (el valor "Fauces trituradoras (dientes faringeos)" en Mordida ocupa 2 lineas) + TOC inline 821-867. Captura `rc-2-mobile-el-gran-maja-top.png`. |
| 2c | "Ficha completa" alterna (movil, ambas paginas) | PASS | the-bloop: `details.open` false -> true (alto 1902) -> false (alto 45) con 2 taps. el-gran-maja: false -> true (alto 1954) -> false. |
| 2d | Titulo de la ficha compacta no recortado (scrollWidth vs clientWidth) | PASS | `<p class="mt-1 truncate pr-1 ...">`: the-bloop scrollWidth 193 = clientWidth 193, `padding-right` 4px; borde derecho del texto 333.8 = borde derecho de contenido 333.8 (la O final cursiva ya no se corta; antes 189/189 sin padding). el-gran-maja: 145/145, texto termina en 277.5 < contenido 285.2. |
| 2e | Tab hasta el `summary` muestra outline naranja visible | PASS | Tab desde el boton Imprimir: foco en `SUMMARY "Ficha completa"`, `:focus-visible` true, `outline: solid 1.875px rgba(255,115,0,0.9)`, offset -1.875px (naranja de marca). Captura `rc-2-mobile-the-bloop-summary-focus.png` (contorno naranja redondeado alrededor del summary). |
| 3a | Escritorio `/wiki`: link de footer "Colosos" -> `?universe=Colosos#explorar` y la lista filtra sin recargar | PASS | URL `http://localhost:3131/wiki?universe=Colosos#explorar`; el select muestra "Colosos"; lista: Animales del universo Colosos, Aodos AY01, Bogbo, Breegard, Cael Cortes, Categorias de monstruos (antes de filtrar la 6a era Capitan de Galeon). Sin recarga: `performance.getEntriesByType('navigation')[0].name` sigue siendo `/wiki`. Captura `rc-3-desktop-footer-colosos.png`. |
| 3b | Footer "Capitan de Galeon": la lista se actualiza otra vez | PASS | URL `?universe=Capit%C3%A1n+de+Gale%C3%B3n#explorar`; select "Capitan de Galeon"; 3 tarjetas: capitan-de-galeon, navios-galeon, piratas-galeon; `window.__marker` sigue vivo (sin recarga). Captura `rc-3-desktop-footer-capitan.png`. |
| 3c | Desde `/` buscar "maja" (Enter): lista filtrada al llegar | PASS | `/wiki?search=maj%C3%A1#explorar`, input "maja", 2 tarjetas (`el-gran-maja`, `supperbial-anguilla`). Captura `rc-3-desktop-search-maja-filtered.png`. Una corrida (la intermitencia de la corrida 1 anterior no se observo; no se re-ejecuto el estres de 24 intentos). |
| 4 | Escritorio `/`: nombre accesible del h1, alt de la imagen del hero, parrafo | PASS | `h1.textContent` = "EXPLORA LA INMENSIDAD DE MIS UNIVERSOS" (con espacio, via `<!-- --> `); `innerText` "EXPLORA LA INMENSIDAD\nDE MIS UNIVERSOS"; 1 solo h1; h1 top 178 / bottom 471, navbar bottom 118. Alt hero: "Primer plano de la cabeza de The Bloop Ojo Solo" (coincide con la imagen; `fetchpriority="high"`). Parrafo: "Y sus historias: colosos abisales, capitanes del siglo XVIII y una Segunda Guerra Mundial interrumpida por un enemigo salido de la nada. Todo el lore oficial de BorisaoBlois en un solo archivo." Badge `/wiki/bogbo`. Captura `rc-4-desktop-home-hero.png`. |
| 5a | Lighthouse desktop `/wiki/the-bloop` | Accesibilidad 95 | Best Practices 100, SEO 100, Agentic 100. Fallidas: color-contrast (5 nodos), heading-order (1), label-content-name-mismatch (2). Ver abajo. |
| 5b | Lighthouse desktop `/` | Accesibilidad 96 (antes 95) | Best Practices 100, SEO 100, Agentic 100. Una sola auditoria fallida: color-contrast (3 nodos; heading-order ya no falla). Ver abajo. |
| 5c | Lighthouse movil `/wiki/the-bloop`: color-contrast no marca el `dt` de la ficha compacta | PASS | Accesibilidad 95. 5 nodos de contraste, ninguno es `dt`/ficha compacta (el `dt` es 11px con color blanco/60). Otra fallida: heading-order. Reporte `rc-lh-bloop-mobile/report.html`. |
| 6 | Consola en todas las paginas visitadas: sin errores | PASS | Sin errores ni avisos de hidratacion en ninguna. Mensajes vistos: 0 en the-bloop (768, 1024, movil), el-gran-maja movil; solo 1 `warn` "resource ... was preloaded using link preload but not used within a few seconds" (`_next/static/chunks/0n79zye8ub9fo.css`) en `/`, `/wiki?universe=...` y `/wiki?search=...`. |

### Lighthouse - auditorias fallidas (re-check)

Desktop `/wiki/the-bloop` (95):
- color-contrast: `span.text-[11px].text-white/30` "TERMINAL" (`header.sticky > div.flex > div.flex > span.text-[11px]`, 2.68); `a[href="/wiki"]` del breadcrumb (`header.relative > div.wiki-container > nav.eyebrow > a.transition-colors`, 4.28); 3x `span.text-xs.font-bold.text-white/40.uppercase.tracking-widest` (`div.px-4 > div.flex > div.sm:w-1/3 > span.text-xs`, etiquetas de la infobox del rail, 3.78).
- heading-order: `<h4 class="mb-3 text-xs font-black uppercase italic tracking-[0.2em] text-white/80">` "ESTADO DEL EXPEDIENTE: LA BATALLA" (`div.prose > aside.not-prose > div.px-5 > h4.mb-3`; salta de h2 a h4).
- label-content-name-mismatch: `a[aria-label="Ir al inicio"]` (logo "Borisao Wiki / Oficial Lore") y `button[aria-label="Buscar en la wiki (⌘K)"]` (texto visible "Buscar archivo... ⌘K").

Desktop `/` (96):
- color-contrast: `<span class="relative z-10 flex items-center justify-center gap-2">` en `div.flex > a.w-full > button.inline-flex` (blanco 11px sobre #fe6a00, 2.88; boton "Acceder a la wiki"); `div.inline-flex ... bg-red-500/10` en `div.container > header.flex > div.space-y-4` (3.99); `a[href="https://youtube.com/@borisaoblois"].text-white/40.text-[10px]` en `section#videos > div.container > header.flex` (3.67).

Movil `/wiki/the-bloop` (95):
- color-contrast (5 nodos, ninguno en la ficha compacta): `span.text-[11px].text-white/30` "TERMINAL" (2.68); `a[href="/wiki"]` del breadcrumb (4.28); `span.text-white/30.text-[11px].italic` dentro de `blockquote.relative > footer.mt-4 > cite.not-italic` (2.65, fuente "[Archivo Abisal #343]"); `span.text-[11px].uppercase.tracking-[0.2em].text-white/40` en `div.prose > aside.not-prose > header.flex` (3.71, caja "DELIRIUM"); `span.eyebrow.text-white/45` en `div.wiki-container > div.flex > div.flex` (4.28).
- heading-order: el mismo `h4.mb-3` de "ESTADO DEL EXPEDIENTE: LA BATALLA".

### Defects (re-check)

R1. Primer parrafo de `/wiki/el-gran-maja` en Y=906 a 390x844 (limite < 900) - menor (6 px).
   - Repro: movil 390x844, abrir `/wiki/el-gran-maja`, medir `[class*="text-[17px]"]` visible: top = 906.
   - Causa: descripcion de 4 lineas + ficha compacta de 326 px (valor "Fauces trituradoras (dientes faringeos)" en 2 lineas) + TOC inline.
   - Esperado < 900; real 906.

R2. A 1024x768 con sidebar expandido las figuras flotantes (`lg:float-* lg:w-80` = 320 px) son mas anchas que la columna de texto (309 px) - menor/medio.
   - Repro: `/wiki/the-bloop` a 1024x768 con sidebar abierto (por defecto). `main` 753 px; columna `lg:max-w-[800px]` 309 px (el rail de 340 px ocupa el resto); `figure.lg:float-right/left` de 320 px: left=277 vs columna 288 (sobresale 11 px a la izquierda del texto) y el texto no puede fluir al lado (cae debajo de cada figura); la cita `WikiQuote` queda en 162 px de ancho. Capturas `rc-1-desktop-1024-the-bloop.png`, `rc-1-desktop-1024-float-in-narrow-column.png`.
   - Esperado: figuras que no excedan la columna o que no floten cuando la columna < ~600 px. Real: figura de 320 px en columna de 309 px.
   - Selector: `figure.group.not-prose` con `lg:float-right lg:w-80`.
   - Viewport: 1024x768 (sidebar expandido). Con sidebar colapsado la columna es ~ 570 px (no medido).

R3. Contraste restante (no bloquea los objetivos 95/96, pero el movil y el escritorio de `/wiki/the-bloop` quedan en 95): ver listas de Lighthouse arriba; los mas baratos: "TERMINAL" `text-white/30` (2.68, en todas las paginas wiki), etiquetas `text-white/40` de la infobox del rail (3.78), `h4` "Estado del expediente" que salta de h2 a h4.

Observaciones: la imagen del hero (The Bloop) y el badge "Expediente de la semana: Bogbo" siguen sin coincidir (ahora el alt describe correctamente la imagen). El `<img>` del hero tiene `fetchpriority="high"` pero tambien `loading="lazy"` (imagen above-the-fold con carga diferida; no afecta a accesibilidad).

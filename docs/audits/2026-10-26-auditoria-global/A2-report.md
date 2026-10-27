# A2 · Hub de la wiki (/wiki) y navegación de la wiki

Servidor de producción http://localhost:3131 (build de `main`). Playwright + Chrome del sistema. Solo auditoría, sin tocar el repo.
Scripts: `scratchpad/pw/a2-*.mjs`. Capturas: `shots/A2-*.png`.

## 1. Cobertura
- **/wiki** en los 8 viewports (320, 360, 390, 768, 1024, 1280, 1440, 1920) con `/wiki`, `/wiki?tipo=criaturas&universe=Colosos`, `/wiki?search=zzzz` y `/wiki/registro`: desbordamiento horizontal, tamaños táctiles, consola.
- **Buscador del explorador** (escritorio): `bloop`, `maja gran`, `gran maja`, `el ojo`, `blop` (errata), `criyote` (apodo), `xyzzy`, `ñandu`, `THE BLOOP`, texto con espacios, `"`, `%`, `<script>` y 300 caracteres. «¿Quisiste decir…?» y estado vacío.
- **Pestañas `?tipo=`** y sus contadores (Todo/Criaturas/Historia…). **Filtro de universo** (las 4 opciones). **Paginación** (1→2→3, ir a página 2 y 3 por URL). Combinaciones: tipo+universo+búsqueda, `Ellos Llegaron`+Criaturas (0), Capitán de Galeón+Criaturas+`zzzz`, «Limpiar filtros».
- **URL**: params inválidos (`tipo=zzz&universe=nope&page=99`, `page=-3`), recargar con `?page=3`, atrás/adelante entre filtros y enlaces del footer, navegación desde el footer en escritorio y móvil desde 6 rutas de origen (`/`, `/comunidad`, `/wiki/the-bloop`, `/wiki/arena`, `/wiki/registro`, `/wiki`) y atrás/adelante rápidos. Anclas `#explorar` y `#catalogo`.
- **Error `Error in input stream`**: ~60 intentos, ver A2-3.
- **Menú lateral**: escritorio 1280 (plegar/desplegar con botón y Ctrl+B, grupos con ratón y teclado Enter/Espacio, enlace activo, scroll largo, logo de cabecera oculto con el menú abierto, rail de iconos, tooltips, persistencia al recargar). Móvil 390 táctil (abrir, Esc, tocar el overlay, scroll, navegar con 5 enlaces).
- **Paleta ⌘K**: escritorio (Ctrl+K) y móvil (botón Buscar) en 5 rutas: apertura, foco, Esc y devolución del foco, flechas con topes, Enter, sin resultados + «¿Quisiste decir…?», «Expediente aleatorio», «Ver todos en el explorador». Que no se abra sobre la hoja del menú ni sobre el visor de imágenes.
- **/wiki/registro**: vacío, tras visitar 2 fichas y una sellada, `localStorage` corrupto y con slugs inexistentes. **/wiki/aleatorio**: 150 redirecciones con `Referer` y 60 sin él. **404** de ficha inexistente (curl y navegador, 390 px).
- **axe** en `/wiki` a 390 y a 1280.
- **Sin mirar**: Safari/Firefox, lector de pantalla real, y las rutas `/wiki/arena` y fichas (de otros auditores).

## 2. Hallazgos

### A2-1 · La paginación se sale de la pantalla en móvil y en tablet con el menú abierto
- Severidad: alta
- Dónde: `/wiki?page=2` (cualquier lista con más de una página). Móvil 320, 360, 390 y 430 (táctil). También 768×1024 con el menú lateral abierto.
- Esperado: «Anterior», los números y «Siguiente» caben en el ancho útil.
- Observado: el bloque de botones mide 456 px y está centrado en un contenedor más estrecho. «Anterior» queda cortado por la izquierda y «Siguiente» por la derecha, y el contenedor recorta el desborde (`overflow-x-clip`). Medido (left/right de los botones):

  | Viewport | «Anterior» | «Siguiente» |
  |---|---|---|
  | 320 | -68…73 | 245…388 |
  | 360 | -48…93 | 265…408 |
  | 390 | -33…108 | 280…423 |
  | 430 | -13…128 | 300…443 |
  | 768 (menú abierto, contenedor 256–768) | | 710…853: «SIGUIE» cortado |

  En móvil el primer botón de la lista se sale por la izquierda: es el botón para volver a la página anterior. Con menos de 456 px no se ve entero, pese a que el botón sigue siendo tocable.
- Evidencia: `shots/A2-pager-mob.png`, `shots/A2-pager-320.png`, `shots/A2-pager-390.png`, `shots/A2-pager-768.png`.
- Causa probable: `src/features/monsters/components/WikiList.tsx` (bloque de paginación, ~l. 200-260): `flex items-center gap-2` con dos `Button` de `px-5` + `mx-2` + hasta 5 números de 44 px, sin `flex-wrap` ni reducción en móvil. El contenedor `sm:flex-row` (≥640 px) no ayuda cuando el menú ocupa 256 px.
- Arreglo propuesto: `flex-wrap justify-center` en el contenedor; en móvil, «Anterior»/«Siguiente» solo con icono (o `px-3`), y mostrar solo los números `page-1…page+1`; usar `min-w-0` y `max-w-full`.

### A2-2 · En móvil, la hoja del menú no se cierra al navegar
- Severidad: alta
- Dónde: cualquier ficha o `/wiki`, viewport 390 táctil. Abrir «Mostrar u ocultar el menú» y tocar «Registro del archivo», «Wiki», «El Gran Majá» o «Versus».
- Esperado: la hoja se cierra al pasar a la página nueva.
- Observado: la URL cambia (`/wiki/registro`, `/wiki`, `/wiki/el-gran-maja`, `/wiki/arena`) pero la hoja sigue abierta 2,5 s después, tapando el contenido (293 px de ancho × 844). Solo se cierra con Inicio (otro layout, que desmonta todo). El fan tiene que cerrarla a mano en cada navegación.
- Evidencia: `shots/A2-mob-sheet-after-nav.png` (hoja abierta ya en `/wiki/arena`).
- Causa probable: `src/components/sidebar/components/SidebarNavigation.tsx` y `SidebarCollapsibleItem.tsx` no llaman a `setOpenMobile(false)` (`useSidebar`) al navegar, ni hay un efecto sobre `usePathname()`.
- Arreglo propuesto: en `AppSidebar` (o en el layout) añadir `const { setOpenMobile } = useSidebar(); useEffect(() => setOpenMobile(false), [pathname])`.

### A2-3 · `Error in input stream` no se reproduce en producción
- Severidad: baja (sin repro; se anota para que no se dé por cerrado)
- Dónde: `/wiki?universe=La+Hecatombe+del+Lape%C3%B3n` desde el footer.
- Qué se hizo (escritorio 1280 y móvil 390, cuentas nuevas): clic en el enlace del footer desde `/`, `/comunidad`, `/wiki/the-bloop`, `/wiki/arena`, `/wiki/registro` y `/wiki`; recargar; atrás/adelante (rápidos y con esperas); cambiar el filtro; clic y atrás inmediato; dos clics seguidos; red «lenta» (50-200 KB/s, 150-400 ms) con retardos de 0 a 2,5 s; 6 contextos en paralelo. **0 de ~60 intentos** dieron `console.error` o `pageerror`. Solo hay `ERR_ABORTED` de prefetch `_rsc` y de `favicon`, que son normales.
- Hipótesis (no confirmada): el mensaje sale de la lectura de un stream de React Flight cortado (la acción de servidor `getWikiArticles` se envía por POST a `/wiki?universe=…` desde `WikiList`; en producción se ve `POST /wiki?universe=La+Hecatombe+…`). Es probable que sea solo del servidor de desarrollo. Si Nelson lo ve otra vez, pedir si fue justo al navegar mientras cargaba la lista.

### A2-4 · Clic intermitente en el footer que no aplica el universo (2 de ~40 intentos)
- Severidad: media (intermitente, sin causa confirmada)
- Dónde: escritorio 1280. Estando en `/wiki?universe=Colosos&page=2` (cargado con `goto`), clic en footer «La Hecatombe del Lapeón».
- Observado (2 veces, en dos scripts distintos y en la primera interacción de la sesión): la URL pasa a `/wiki?universe=Colosos&page=2#explorar` (solo se añadió el hash), el selector sigue en «Colosos» y no sale ninguna petición de red del destino (ni `POST` ni `_rsc`) en 3 s. Después ya no se reprodujo: 0 de ~35 intentos con 4 viajes de origen, 6 contextos en paralelo y 5 retardos distintos. En los intentos buenos, el mismo clic da `/wiki?universe=La+Hecatombe+del+Lape%C3%B3n#explorar`.
- Evidencia: sin captura (no se pudo repetir). Salida del script `a2-hist2.mjs`, 1.ª iteración.
- Causa probable (sin confirmar): Next resolvió el clic como navegación solo-hash. El hash `#explorar` del footer coincide con el `<span id="explorar">` ya presente. Puede ser una carrera entre el prefetch en curso de ese `Link` y el clic.
- Arreglo propuesto: unificar los enlaces a `#catalogo` (el hero y «Sobre» ya lo usan) y probar con `prefetch={false}` en los enlaces `/wiki?universe=…` del footer. Si se confirma, reproducir con red lenta en el despliegue real.

### A2-5 · Atrás/adelante no deshacen los filtros del Archivo
- Severidad: media
- Dónde: `/` → `/wiki` → pestaña «Criaturas» → universo «Colosos» → buscar «gran» (URL `/wiki?tipo=criaturas&universe=Colosos&search=gran`; `history.length` = 3) → botón Atrás.
- Esperado: Atrás vuelve al estado anterior del explorador (o, como mínimo, se entiende como en cualquier buscador).
- Observado: Atrás salta a `/` (la landing). Todos los cambios de filtro, búsqueda y página usan `history.replaceState`. Un fan que filtra, abre una ficha y vuelve con Atrás recupera su estado sin problemas (la URL lo guarda: reproducido recargando y con atrás desde una ficha), pero no puede retroceder paso a paso una página o un filtro: pasar de la 3 a la 2 con Atrás lo saca del Archivo. Con el footer sí se crean entradas y el estado se restaura bien (verificado con atrás/adelante).
- Evidencia: salida del script `a2-hist6.mjs` y `a2-ex.mjs` (BACK).
- Causa probable: `WikiList.tsx` `replaceQuery` (l. ~70-90), con comentario explícito de que se usa `replaceState` para respuesta instantánea.
- Arreglo propuesto: `pushState` solo para cambios discretos (cambio de pestaña, universo y de página) y `replaceState` para el texto de búsqueda con debounce. El efecto de «adoptar la URL» ya cubre `popstate`.

### A2-6 · El 404 de una ficha inexistente es la página por defecto de Next, en inglés, en blanco y sin salida
- Severidad: alta
- Dónde: `/wiki/no-existe` (y `/zzz`), cualquier viewport. HTTP 404 correcto.
- Esperado: página útil de la marca: mensaje en español, fondo abisal, enlaces a «Archivo», «Registro», «Expediente aleatorio» y al buscador.
- Observado: texto `404 | This page could not be found.` en inglés, fondo **blanco** (`rgb(255,255,255)`; la web es oscura), 0 enlaces (`document.querySelectorAll('a').length === 0`), sin cabecera, menú ni footer. Título de pestaña `404: This page could not be found.` (y un segundo `<title>` «Universos de BorisaoBlois» en el head). El fan que sigue un enlace roto solo puede usar Atrás.
- Evidencia: `shots/A2-404.png`.
- Causa probable: no existe `src/app/not-found.tsx` ni `src/app/(wiki)/wiki/not-found.tsx`; el `[slug]/page.tsx` usa `dynamicParams = false` y Next sirve su 404 interno.
- Arreglo propuesto: añadir `src/app/not-found.tsx` (y/o uno en `(wiki)/wiki/`) con el layout de la wiki y los enlaces de salida; el buscador (`SearchTrigger`) ya sirve. Texto sin lore nuevo.

### A2-7 · Con el menú plegado, el clic en un grupo del menú no hace nada visible
- Severidad: media
- Dónde: escritorio 1280, menú plegado a iconos (botón o Ctrl+B). Pulsar el icono de «Libros», «Personajes», «Especies», «Categorías», «Vehículos» u «Organizaciones».
- Esperado: el menú se expande, o aparece un submenú.
- Observado: `aria-expanded` pasa a `true` pero el número de enlaces visibles es el mismo (12 antes y 12 después) y el menú sigue `collapsed`. Todas las fichas del menú están en esos grupos, así que con el menú plegado no se llega a ninguna ficha salvo «Wiki», «Versus» y «Historia». Solo hay un tooltip con el nombre del grupo.
- Evidencia: salida del script `a2-side3.mjs`; `shots/A2-side-collapsed3.png`.
- Causa probable: `src/components/sidebar/components/SidebarCollapsibleItem.tsx`: `CollapsibleTrigger` no llama a `setOpen(true)` / `toggleSidebar()` cuando `state === 'collapsed'`.
- Arreglo propuesto: en modo icono, el clic del trigger expande el menú (`useSidebar().setOpen(true)`) además de abrir el grupo.

### A2-8 · El estado plegado del menú se guarda en una cookie pero no se restaura
- Severidad: baja
- Dónde: escritorio. Plegar el menú (cookie `sidebar_state=false`), recargar.
- Observado: tras recargar, el menú vuelve a estar desplegado (256 px) aunque la cookie sigue en `false`.
- Causa probable: `WikiLayout` (`src/app/(wiki)/wiki/layout.tsx`) usa `<SidebarProvider>` sin `defaultOpen`; leer la cookie en un layout estático obligaría a hacerlo dinámico, así que quizá sea una decisión consciente.
- Arreglo propuesto: leer la cookie en un efecto de cliente (`setOpen(cookie !== 'false')`), o quitar la escritura de la cookie si no se va a usar.

### A2-9 · Enlaces con nombre repetido en el menú plegado y títulos truncados
- Severidad: baja
- Dónde: menú lateral. Hay dos enlaces «Historia» (`/wiki/capitan-de-galeon` y `/wiki/la-hecatombe-del-lapeon`), con `aria-label="Ir a Historia"` los dos. En el rail de iconos y para un lector de pantalla son indistinguibles. «Slowdown Criyonte» sale como «Slowdown Cri…» (truncado por el ancho de 256 px y la sangría), sin `title`.
- Causa probable: `WIKI_NAVIGATION` (`src/features/monsters/config/wiki-navigation.ts`) y `SidebarSubItem` (`SidebarCollapsibleItem.tsx`, `truncate`).
- Arreglo propuesto: etiquetas únicas («Historia · Capitán de Galeón», «Historia · La Hecatombe») en el `aria-label`/tooltip, y un `title` en los subenlaces truncados.

### A2-10 · Objetivos táctiles y landmarks
- Severidad: baja
- Dónde: móvil. El botón «Mostrar u ocultar el menú» mide 48×36 (alto < 44). En escritorio, axe da `region` (moderate, 9 nodos): el contenido del menú lateral no está en un `<nav>`/`<aside>`. A 390 px axe no da ningún fallo.
- Arreglo propuesto: `h-11` en el `SidebarTrigger` de `WikiLayout`; envolver `SidebarContent` en `<nav aria-label="Menú de la wiki">`.

### A2-11 · El menú móvil no enlaza a «Comunidad» (y la cabecera tampoco)
- Severidad: media
- Dónde: hoja del menú móvil y cabecera de `/wiki` a 390.
- Observado: «Sitio Principal» solo tiene Inicio, Universos y Contacto. La cabecera móvil tiene menú, logo y buscar. `/comunidad` solo se alcanza por el footer (`NavLinks` se oculta por debajo de 2xl y `NavActions` por debajo de lg).
- Causa probable: `SidebarNavigation.tsx` (grupo `md:hidden`).
- Arreglo propuesto: añadir «Comunidad» (`/comunidad`) al grupo «Sitio Principal». «Versus» ya está en el menú.

### A2-12 · Tablet 768: con el menú abierto por defecto, el contenido queda en 512 px y el footer se solapa
- Severidad: media
- Dónde: `/wiki` a 768×1024 (el menú ya no es hoja a partir de `md`). Además del A2-1: en el footer, el logo «BORISAOBLOIS» se solapa con el encabezado «NAVEGACIÓN» de la columna de al lado (ver la parte inferior de `shots/A2-pager-768.png`).
- Evidencia: `shots/A2-pager-768.png`, `shots/A2-vp-768.png`.
- Causa probable: el footer usa un grid de columnas en `md` que no cuenta con los 256 px del menú (`src/components/Footer.tsx`).
- Arreglo propuesto: usar `lg:` para la rejilla en 2-3 columnas dentro de `/wiki`, o que el menú sea hoja hasta `lg`.

### A2-13 · Cookies de Auth.js en cada respuesta pública (transversal, para el despliegue)
- Severidad: media
- Dónde: `curl -sI localhost:3131/wiki` y `/wiki/aleatorio`.
- Observado: cada petición devuelve `Set-Cookie: authjs.csrf-token=…` y `authjs.callback-url=http%3A%2F%2Flocalhost%3A3000`, junto con `Cache-Control: s-maxage=3600`. Una página pública cacheable lleva cookies distintas por petición, y `callback-url` apunta a `localhost:3000`. Detrás de nginx/CDN puede impedir la caché, o peor, repartir el token CSRF de una sola respuesta. No hay login en la web.
- Causa probable: `src/proxy.ts` ejecuta `auth(...)` en todas las rutas salvo `api/_next/static/_next/image/favicon.ico`; falta `AUTH_URL` correcto en el `.env` del servidor.
- Arreglo propuesto: restringir el `matcher` a `/admin` y `/settings` (las únicas rutas protegidas). Revisar `AUTH_URL`/`AUTH_TRUST_HOST` del despliegue.

### A2-14 · Detalles menores del explorador
- Severidad: baja
- (a) Una búsqueda de solo signos de puntuación (`"`, `%`) devuelve las 27 fichas como si no hubiera búsqueda, pero la URL lleva `?search=%22`.
- (b) La pestaña con 0 se marca `aria-disabled="true"` pero es un enlace que funciona; los lectores de pantalla la anuncian como no disponible.
- (c) A 320 px el placeholder del buscador se corta («Buscar criaturas, perso…»).
- (d) `?page=1` se mantiene en la URL al llegar con ese parámetro.
- (e) Los resultados por descripción son amplios: «maja» devuelve «Supperbial anguilla» y «Breegard» (lo menciona su descripción). Está bien ordenado por relevancia; solo se anota.

## 3. Lo que comprobé y está bien
- **Búsqueda del explorador**: palabras en cualquier orden (`maja gran` = `gran maja`), apodos (`criyote` → Slowdown Criyonte), erratas (`blop` → «¿Quisiste decir The Bloop Ojo Solo?») y mayúsculas. Sin errores de consola con `<script>`, `ñandu` ni 300 caracteres (URL con 300 caracteres, mensaje truncado a 80).
- **Pestañas y contadores**: Todo 27 = suma de universos (21+3+2+1). Los contadores se recalculan con búsqueda y universo; con 0 resultados el vacío da «Limpiar filtros» y devuelve el foco al campo.
- **URL ↔ estado**: recargar `?page=3` restaura la página; `tipo`/`universe` inválidos se ignoran; `page=-3` y `page=99` caen a la 1; footer, hero y «Sobre» (enlaces `?universe=…`) aplican el filtro; atrás/adelante entre entradas del footer restaura filtros y texto del buscador.
- **Anclas**: `#explorar` y `#catalogo` dejan el catálogo bajo la cabecera (catTop 128-208 px) en escritorio y móvil.
- **Viewports**: sin scroll horizontal en los 8 (aparte del pager, A2-1) y sin errores ni avisos de consola en `/wiki`, `/wiki/registro`, la paleta y el menú. axe a 390 px: 0 violaciones.
- **Menú lateral escritorio**: plegar/desplegar con botón y Ctrl+B, grupos con Enter/Espacio (`aria-expanded`), enlace activo resaltado y su grupo abierto, scroll interno (1296 > 646 px), logo de cabecera oculto con el menú abierto (ancho 0) y visible plegado, tooltips en el rail.
- **Menú móvil**: se abre con 48×36, se cierra con Esc y tocando el overlay, hace scroll (1490 > 690), sin desborde horizontal.
- **Paleta**: abre con Ctrl+K y el botón en 5 rutas con el foco en el campo; Esc cierra y devuelve el foco (móvil); flechas con topes en 0 y en el último; Enter navega; sin resultados da «¿Quisiste decir…?» + populares + «Expediente aleatorio»; vacía lista populares + aleatorio; pantalla completa en móvil y 576 px en escritorio; no se abre sobre la hoja del menú ni sobre el visor de imágenes.
- **/wiki/registro**: vacío («Abre expedientes para completar tu registro»), tras visitar 2 fichas «Has abierto 2 de 21», las tarjetas pasan a «Abierto/Sin abrir», la ficha sellada no cuenta, y `localStorage` roto (`{garbage`, `null`, `[]`) o con slugs inexistentes no rompe la página.
- **/wiki/aleatorio**: 307 con `Cache-Control: no-store`; 210 sorteos con y sin `Referer`, nunca índices, sellados ni la ficha de origen.

# A5 · Barrido responsive, rastreo y rendimiento

## Cobertura
- 42 rutas (`/`, `/comunidad`, `/wiki`, `/wiki/arena`, `/wiki/registro`, 37 fichas, 404) × 9 viewports (320×640, 360×740, 390×844 táctil, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080, 844×390 táctil apaisado) = 378 mediciones con `page.evaluate` (desbordamiento horizontal, elementos fuera del viewport, texto cortado, solapes en 1.ª pantalla, objetivos táctiles, fuente < 12 px, fixed/sticky). Scripts: `scratchpad/pw/a5-*.mjs`.
- Rastreo: 85 enlaces internos únicos de las 42 páginas, enlaces externos, todas las respuestas de red (img, `/_next/image`, JS, CSS, fuentes) por ruta en móvil 390×844 @2x, metadatos por ruta, peso transferido (CDP), LCP (PerformanceObserver) en móvil y escritorio de 8 rutas.
- No cubierto: interacciones (menús, paleta, visor), eso es de otros auditores. Tiempos de LCP medidos contra localhost: solo valen para identificar el elemento, no las cifras.

## Hallazgos

### A5-1 · Paginación de /wiki recortada en móvil (botón «Siguiente» cortado)
- Severidad: alta
- Dónde: `/wiki`, 320, 360 y 390 px (táctil). Bajar hasta «Mostrando página 1 de 3».
- Esperado / observado: la botonera «Anterior · 1 2 3 · Siguiente» mide más que el ancho disponible; a 390 px el botón «Siguiente» va de x=279,5 a 423 (viewport 390) y «Anterior» queda cortado por la izquierda (a 320 px: de −68 a 388). El `main` tiene `overflow: clip`, así que no hay scroll horizontal y el botón queda inalcanzable en parte; el fan no ve completos ni «Anterior» ni «Siguiente».
- Evidencia: `shots/a5-wiki-paginacion-390.png`, `a5-wiki-paginacion-320.png`.
- Causa probable: `src/features/monsters/components/WikiList.tsx:229-278`: `flex items-center gap-2` sin `flex-wrap`, botones `px-5` con texto + icono y `mx-2` en la lista de páginas.
- Arreglo propuesto: botones con `px-3`, `mx-0`, o `flex-wrap justify-center`, y ocultar el texto «Anterior/Siguiente» (dejar chevron con `aria-label`) bajo `sm`.

### A5-2 · Sin `robots.txt`, `sitemap.xml` ni manifest
- Severidad: media
- Dónde: `GET /robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` → 404 (HTML de la web).
- Esperado: una wiki de 37 fichas con `dynamicParams=false` es ideal para sitemap; sin él y sin robots la indexación depende solo del rastreo. Sin manifest no hay instalación PWA (opcional).
- Causa: no existen `src/app/robots.ts` ni `sitemap.ts`.
- Arreglo propuesto: `src/app/robots.ts` y `src/app/sitemap.ts` (rutas fijas + `getContentRepository().getArticles()` excluyendo nada especial; URLs absolutas con `NEXT_PUBLIC_SITE_URL`). Manifest: baja prioridad.

### A5-3 · Sin `canonical` en ninguna ruta; Open Graph incompleto
- Severidad: media
- Dónde: las 42 rutas: `link[rel=canonical]` ausente en todas. `og:title`/`twitter:card` ausentes en `/`, `/wiki`, `/wiki/arena`, `/wiki/registro` y 404; `og:image` ausente en `/`, `/comunidad`, `/wiki`, `/wiki/arena`, `/wiki/registro` y en 18 fichas sin `image` (cael-cortes, categorias-monstruos, el-destello-de-los-colosos, garddiodon-typus, ipcaro, la-hecatombe-del-lapeon, lampasiteras, le-mug, libros-colosos, medianos, naciones-rebeldes, organizaciones, phiscanula-arcticum, piratas-galeon, slowdown-criyonte, titanes y similares). `og:url` solo en `/comunidad`. Las fichas con imagen sí dan `og:image` absoluto (`http://localhost:3131/assets/...`, correcto con `metadataBase`).
- Observado: compartir `/` o `/wiki` en WhatsApp/Discord sale sin imagen ni título propio; en `/comunidad` `twitter:card=summary` sin imagen.
- Causa: `src/app/layout.tsx:30-35` solo define `title`/`description`/`metadataBase`; `src/app/(wiki)/wiki/[slug]/page.tsx:45-48` solo añade `images` si la ficha tiene `image`; no hay `alternates.canonical`.
- Arreglo propuesto: en el layout raíz `openGraph` (siteName, locale es_ES, imagen por defecto de marca absoluta) y `twitter.card=summary_large_image`; `alternates: { canonical }` en las rutas y en `generateMetadata` de la ficha (fallback de `og:image` a la imagen de marca). Cuidado con «nunca el logo como portada»: aplica a portadas de ficha, la imagen social por defecto sí puede ser de marca.

### A5-4 · Títulos duplicados/genéricos en `/wiki` y en el 404
- Severidad: media
- Dónde: `/`, `/wiki` y el 404 comparten `<title>` «Universos de BorisaoBlois» y la misma meta description. `/wiki` es el explorador y no tiene título propio; el 404 no dice que la página no existe (aunque sí lleva `noindex`).
- Causa: falta `metadata` en `src/app/(wiki)/wiki/page.tsx` y en el `not-found` (solo hereda del layout raíz).
- Arreglo propuesto: `title: 'Wiki | Universos de BorisaoBlois'` + descripción propia; en not-found `title: 'Página no encontrada'`.

### A5-5 · Objetivos táctiles < 44 px en móvil (enlaces sueltos de 24 px de alto)
- Severidad: media
- Dónde (390×844, táctil): `/` (menciones de criaturas «El Gran Majá» 99×24, «The Bloop Ojo Solo» 141×24, «Colosos» 60×24…, 9 enlaces), `/wiki` (13 enlaces de 24 px de alto en las tarjetas: «Bogbo» 44×24, «Le'Mug» 48×24…), fichas (enlaces de relacionados/menciones 20-24 px de alto: «Bogbo» 53×20, «DELIRIUM» 62×24), `/wiki/arena` (selectores 318×32, «Aleatorio» 318×37, «Compartir» 318×36, pestañas 117×37, enlaces de los combatientes 284×30), botón del menú del header 48×36 y logo 176×36, enlaces del pie (correo/YouTube 260×40), «Wiki» del breadcrumb 34×44 (ancho 34). Los enlaces en línea dentro de párrafos están excluidos del recuento.
- Nota: los de la landing y `/wiki` parecen enlaces automáticos de entidades dentro de texto (la excepción WCAG de enlaces en línea puede aplicar) pero están en tarjetas/listas sueltas; revisar cuáles son en línea de verdad. Los selectores y botones de la Arena sí son controles.
- Arreglo propuesto: `min-h-11` en controles de la Arena y en el botón del sidebar/pie; en enlaces de lista padding vertical.

### A5-6 · Tipografía de 11 px muy extendida en móvil
- Severidad: baja
- Dónde: 320-390 px, en casi todas las fichas: eyebrows «Archivo desclasificado», «Borisao Archives», chip «Próximamente», `dt` del infobox («Longitud», «Peso», «Amenaza»), tags de las tarjetas («Coloso», «Especie»…), `label` del formulario de contacto («Nombre», «Correo Electrónico»), «Ver el duelo en la Arena» (enlace de 11 px), etiquetas del sidebar a 768 («Tu archivo», nombres de universo), `kbd` Ctrl K. Ninguna < 11 px; el cuerpo es 16-17 px.
- Arreglo propuesto: subir a 12 px el mínimo en `.eyebrow` y los `text-[11px]`, empezando por el enlace «Ver el duelo en la Arena» y las `label` del formulario (que son controles).

### A5-7 · Landing/comunidad: imágenes del primer pliegue con `loading="lazy"`
- Severidad: baja
- Dónde: LCP medido (sin scroll): `/wiki` móvil y escritorio → `<img loading="lazy">` de El Gran Majá (tarjeta 1); `/comunidad` escritorio → Bogbo con `loading=lazy`; `/wiki/arena` escritorio → El Gran Majá lazy. Las fichas sí están bien (`loading=eager fetchpriority=high`) y `/` y `/wiki/registro` tienen LCP de texto.
- Arreglo propuesto: `priority` (o `loading="eager"`) en la primera/segunda tarjeta de `WikiList` y en la imagen destacada de /comunidad.

### A5-8 · Peso de `/` y `/wiki/registro`
- Severidad: baja
- `/` transfiere 1081 KB en móvil tras recorrerla (de las 42 rutas, el doble de cualquier otra; `/wiki/registro` 571 KB, `/wiki` 417 KB, `/wiki/the-bloop` 445 KB; el resto 100-300 KB; 404 29 KB). En la landing hay un fondo CSS `/assets/Universo_Colosos/Otros/Medusa_Buhonda.webp` (65 KB) servido sin pasar por `/_next/image` (`src/app/(marketing)/layout.tsx:9`, `fixed inset-0 bg-[url(...)]`, se descarga también en `/comunidad`) y imágenes de retrato 390×520 para cajas de 340×425 (razonable; no hay imágenes con más de 2,2× el tamaño de su caja). Sin urgencia.

### A5-9 · Barra lateral permanente a 768 px deja el contenido en 512 px
- Severidad: baja
- Dónde: `/wiki/*` a 768×1024: sidebar 256 px + `main` 512 px (en la ficha `the-bloop` se ve el texto en una columna estrecha; header sticky 512×64). Con los 8 viewports no hay desbordamiento ni solapes reales; el medidor marcó solapes entre etiquetas del sidebar a 768/1024 que son artefactos de texto oculto (`group-data-[collapsible=icon]:hidden`), no visibles.
- Arreglo propuesto: valorar sidebar en modo offcanvas hasta `lg` (1024). Captura: `shots/a5-ficha-768.png`.

## Rastreo: resultado
- 85 enlaces internos únicos, todos 200, salvo `/wiki/aleatorio` → 307 (esperado). 0 enlaces rotos. Externos: `https://youtube.com/@borisaoblois`, 4 vídeos de YouTube; `mailto:borisaoblois343@gmail.com`.
- Recursos (img, `srcset`, `/_next/image`, fuentes, CSS, JS): 0 respuestas ≥ 400 en las 41 páginas válidas (solo los `ERR_ABORTED` de prefetch RSC de `/wiki/arena?_rsc=…`, que son cancelaciones normales de Next, no errores). Única 404 real: la ficha inexistente, esperada.
- `favicon.ico` 200 (26 KB; sirve en todas las páginas). `robots.txt`, `sitemap.xml`, manifest: 404 (A5-2).
- `<title>`+description presentes en todas las rutas; fichas con título propio «X | Wiki BorisaoBlois». `lang="es"`.

## Tabla resumen ruta × viewport → problemas
Leyenda: P = paginación recortada (A5-1); T = objetivos táctiles < 44 px (A5-5, solo táctil: 320/360/390/844); F = fuente 11 px (A5-6); L = LCP lazy (A5-7). «—» = nada medible. Ningún viewport tiene scroll horizontal ni elementos fuera del viewport en ninguna ruta (hscroll = 0 en 378/378).

| Ruta | 320 | 360 | 390 | 844×390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|---|---|
| `/` | T,F | T,F | T,F | T | F | — | F | F | — |
| `/comunidad` | T,F | T,F | T,F | T | — | — | F | — | L(1440) |
| `/wiki` | P,T,F,L | P,T,F,L | P,T,F,L | T | F | — | — | L | — |
| `/wiki/arena` | T,F | T,F | T,F | T | F | — | — | L | — |
| `/wiki/registro` | T,F | T,F | T,F | T | F | — | — | — | — |
| 37 fichas | T,F | T,F | T,F | T | F (sidebar) | — | — | — | — |
| 404 | F | F | F | — | — | — | — | — | — |

Notas: «F» en 768 es el texto de 11 px del sidebar (etiquetas de grupo); A5-9 afecta a las fichas y listados a 768. A 844×390 (apaisado) el header sticky de 64 px ocupa el 16 % de la altura, sin tapar foco. El elemento `fixed` (barra de progreso de lectura de 2 px bajo el header) no tapa contenido. Los `overflow` recortados que el medidor listó (`.glass-liquid p-10` a 320, `div.transition-all duration-700`, `div.relative.min-h-screen` de la Arena, `main` en `/wiki`) son o decoración (`glass-reflection`, blobs) o la consecuencia del A5-1; no hay texto cortado más allá del A5-1 y, a 1024 en la Arena, los nombres de combatiente (`article.crystal-surface` 169>142) y el texto «BorisaoBlois» del sidebar (226>112) están contenidos por `overflow-hidden`; en la captura `a5-arena-1024.png` el sidebar y la cabecera se ven correctos.

## Comprobado y correcto
- Sin scroll horizontal ni elementos fuera de pantalla en ninguna ruta × viewport (378 mediciones).
- Cuerpo de texto ≥ 16 px; sin texto < 11 px.
- Sin recursos rotos; imágenes sin sobredimensionar (> 2,2× su caja); `/_next/image` responde en todas las fichas.
- LCP de las fichas con portada: `loading=eager`, `fetchpriority=high`, y `og:image` absoluto con `metadataBase`.
- `noindex` en el 404; `lang=es`; favicon correcto.

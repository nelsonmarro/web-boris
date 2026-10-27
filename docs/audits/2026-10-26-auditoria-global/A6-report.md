# A6 · Salud en tiempo de ejecución y revisión del código

Auditor A6. Servidor de producción `http://localhost:3131` (build de `main`, Next 16.2.1), log del servidor en
`scratchpad/next-audit.log`. Scripts en `scratchpad/pw/a6-*.mjs`. No se ha tocado el repo.

## 1. Cobertura

| Qué | Cómo |
|---|---|
| Barrido de consola, errores de React, respuestas ≥ 400 y elemento LCP | 46 rutas (`/`, `/comunidad`, `/wiki`, `/wiki?universe=…` ×2, `/wiki/arena`, arena con `a`/`b`, `/wiki/registro`, una ficha inexistente y las 37 fichas) × 390×844 (táctil, DPR 2) y 1440×900, con TZ `America/Guayaquil` (`a6-sweep.mjs`) |
| Hidratación | Lo anterior, más 360×740 (`Asia/Tokyo`, `en-US`) y 1024×768 (`Pacific/Honolulu`, `pt-BR`) con el registro (`wb-registro`) ya relleno: `/wiki/registro`, `/wiki`, `/`, `/comunidad`, una ficha abierta, una sellada y `/wiki/aleatorio` (`a6-hydr.mjs`); reloj del cliente adelantado al año siguiente (`a6-year.mjs`) |
| Fallos inyectados | Acción de servidor con un id que el servidor no reconoce (pestaña abierta durante un deploy), respuesta de acción cortada, stream RSC cortado y conexión reiniciada durante una navegación, buildId distinto en la respuesta RSC, `/api/comunidad/encuesta` con 500, conexión rechazada y `unavailable`, cambio de semana con la página ISR vieja (`a6-faults.mjs`, `a6-action-cut.mjs`, `a6-buildid.mjs`, `a6-weekflip.mjs`) |
| Entrada maliciosa | `getWikiArticles` reenviada con 11 variantes (tipos erróneos, `null`, sin argumentos, `pageSize` 0 / negativo / `1e308` / texto, búsqueda de 900 000 caracteres) (`a6-action.mjs`); URL con escapes `%` mal formados; `/admin`, `/settings`, `/api/auth/*` |
| Cabeceras y caché | `curl -D` sobre las rutas principales, la API y los estáticos; CSP propuesta inyectada con Playwright y probada en 7 rutas, la paleta, el explorador, el visor de imágenes y un iframe ajeno (`a6-csp.mjs`) |
| Fugas | Recuento de listeners de `window` por CDP tras 5 recorridos de scroll y 3 idas y vueltas de navegación (`a6-leak.mjs`); lectura de todos los `addEventListener` de `src/` |
| Código leído | `youtube-rss.ts`, `latest-video.ts`, `channel-videos.ts`, `failure-memo.ts`, `retry.ts`, `cast-vote.ts`, `poll-state.ts`, `voter.ts`, `vote-input.ts`, la ruta de la encuesta, `PollTile.tsx`, `comunidad/page.tsx`, `WikiList.tsx`, `get-wiki-articles.ts`, `[slug]/page.tsx`, `proxy.ts`, la configuración de Auth.js, `next.config.ts`, `Dockerfile`, `docker-compose.prod.yml`, `deploy/deploy.sh`, `deploy/nginx/web-boris.conf`, `layout.tsx`, `providers.tsx` y `ContentCard.tsx` |

Sin mirar: el formulario de contacto (otro auditor), el voto real (no quise ensuciar la base compartida), Safari/Firefox y una parada real de Postgres (se probó la degradación inyectando el fallo en la API y leyendo el código).

## 2. Hallazgos

### A6-1 · Si la consulta del explorador falla, /wiki dice «Ningún registro coincide» con fichas que existen
- Severidad: **alta**
- Dónde: `/wiki`, cualquier viewport. Con la pestaña abierta, despliega una versión nueva (o se corta la red, o el servidor se reinicia) y escribe en el buscador o cambia de tipo o universo.
- Esperado: un aviso de error con «Reintentar» o «Recargar».
- Observado: tras unos 7 s (1 intento y 3 reintentos de TanStack Query), el catálogo muestra **«Ningún registro coincide con «bloop»»**, y las pestañas siguen diciendo «Todo · 27». Lo reproduje dos veces:
  1. con un id de acción desconocido (lo que ve una pestaña abierta tras un deploy, porque Next recalcula los ids de las acciones en cada build, `node_modules/next/dist/docs/01-app/02-guides/data-security.md:276`): 4 POST → 404;
  2. con la respuesta de la acción cortada a la mitad: «Ningún registro coincide con «gran»», y El Gran Majá existe.
- Evidencia: `shots/a6-stale-action-wiki.png`, `shots/a6-action-cut-wiki.png`.
- Causa: `src/features/monsters/components/WikiList.tsx:155-160` no lee `isError`/`error` de `useQuery`, y el render (`:185-213`) muestra `WikiEmptyState` siempre que `articles` está vacío; con un error, `data` es `undefined` y `articles` queda en `[]`.
- Arreglo propuesto:
  - Leer `isError`/`error`/`refetch` y pintar un estado propio: «No se pudo cargar el archivo» con un botón «Reintentar» que llame a `refetch()`.
  - Si `unstable_isUnrecognizedActionError(error)` (de `next/navigation`) es cierto, mostrar «Hay una versión nueva del archivo» con un botón «Recargar» (`location.reload()`) y no reintentar (`retry: (n, e) => !unstable_isUnrecognizedActionError(e) && n < 2`).
  - Complemento: `deploymentId` en `next.config.ts` (el SHA de git, pasado como `ARG` en el `Dockerfile`). A medio plazo, servir las lecturas (`getWikiArticles`, `getWikiIndex`) con un Route Handler GET en lugar de una acción de servidor: su URL no cambia entre builds y se puede cachear.

### A6-2 · No hay `not-found.tsx`: el 404 sale en inglés, sobre blanco y sin ningún enlace
- Severidad: **alta**: cualquier enlace viejo, una errata o un slug renombrado deja al fan en un callejón sin salida.
- Dónde: `/wiki/no-existe-a6`, `/cualquier-cosa`, en todos los viewports.
- Esperado: una página 404 de la marca, en español, con la navegación y enlaces a la wiki, al inicio y a la búsqueda.
- Observado: la página por defecto de Next, «404 | This page could not be found.»: fondo `rgb(255,255,255)`, 0 enlaces, sin navbar ni sidebar, y título «Universos de BorisaoBlois» (el `generateMetadata` «Artículo no encontrado» no llega a aplicarse con `dynamicParams = false`).
- Evidencia: `shots/a6-404-wiki-mobile.png`, `shots/a6-404-wiki-desktop.png`, `shots/a6-404-root-*.png`.
- Causa: no existe `src/app/not-found.tsx` (ni ningún `not-found.tsx` en `src/app`).
- Arreglo propuesto: crear `src/app/not-found.tsx` con `Navbar` y `Footer`, un h1 «Este expediente no existe», `SearchTrigger` y enlaces a `/wiki` y `/`, sobre `#00122E`, y exportar `metadata = { title: 'Página no encontrada | …' }`. Así se mantiene el 404 real.

### A6-3 · No hay `error.tsx` ni `global-error.tsx`: un stream cortado deja la pantalla de error de Next en inglés y sin navegación
- Severidad: **media**
- Dónde: cualquier navegación de cliente. Reproducido de `/wiki/the-bloop` a `/wiki/el-gran-maja` (1440×900) cortando la respuesta RSC al tercio.
- Observado: `pageerror: Error: Connection closed.` y la página entera se sustituye por «This page couldn't load / Reload to try again, or go back. / Reload · Back», en blanco y sin sidebar. Si la conexión se reinicia *antes* de empezar el cuerpo, Next sí lo resuelve bien: «Failed to fetch RSC payload… Falling back to browser navigation». Un buildId distinto en la respuesta también provoca una recarga completa correcta (`a6-buildid.mjs`).
- Sobre el `Uncaught TypeError: Error in input stream` del log de Nelson: es el mismo fallo. El reinicio del dev server cortó a medias el stream de la respuesta (en su log, el POST de `getWikiIndex`/`getWikiArticles` o la navegación RSC). Chrome da ese mensaje cuando la lectura del cuerpo falla por la red, y «Connection closed.» cuando el cuerpo termina antes de tiempo. **No es solo de dev**: en producción pasa cuando `deploy.sh` recrea el contenedor (`compose up -d app`) con peticiones en curso, o cuando el móvil pierde la red a mitad de una navegación.
- Evidencia: `shots/a6-rsc-truncate.png`.
- Causa: faltan `src/app/global-error.tsx`, `src/app/(wiki)/wiki/error.tsx` y `src/app/(marketing)/error.tsx`.
- Arreglo propuesto:
  - `global-error.tsx`, con su propio `<html lang="es"><body>` y estilos en línea `#00122E`/`#FF7300`: «Algo falló al cargar la página», un botón «Reintentar» (`location.reload()`) y un enlace «Volver al inicio».
  - Un `error.tsx` por grupo, que conserva el layout (el sidebar sigue): «Reintentar» llama a `startTransition(() => { router.refresh(); reset(); })`.

### A6-4 · El lunes del cambio de semana, la encuesta muestra los slugs en bruto («CAEL-CORTES», «AODOS-AY01») y sin retratos
- Severidad: **media**: pasará el **lunes 2026-11-02**, cuando entre la votación curada `2026-W45` (`desclasificar`, `cael-cortes` / `aodos-ay01`).
- Dónde: `/comunidad`, desde el lunes a las 00:00 UTC hasta que se regenere la página ISR (`revalidate = 3600`; la primera visita después de que caduque aún recibe la versión vieja). Reproducido devolviendo desde la API el estado de la semana 45 sobre la página actual.
- Observado: el título y la composición cambian bien («¿Qué expediente quieres que se desclasifique?»), pero los botones dicen «CAEL-CORTES» y «AODOS-AY01» y los retratos son el placeholder genérico.
- Evidencia: `shots/a6-poll-week-flip.png`.
- Causa: `src/app/(marketing)/comunidad/page.tsx:35-49` construye `fighterCards` solo con las fichas con `stats` y los lados de la encuesta vigente *en el momento del render ISR*. Después, `PollTile.tsx:101` pinta `fighters[slug] ?? { slug, title: slug }` con la encuesta nueva que devuelve la API.
- Arreglo propuesto: la API (`/api/comunidad/encuesta`) devuelve también las tarjetas de los dos lados (`title`, `image`, `imagePosition`, `category`, `status`) y `PollTile` las prefiere. La alternativa mínima es que la página incluya en `fighterCards` todas las fichas citadas en `encuestas.json`.

### A6-5 · Sin cabeceras de seguridad: la web se puede incrustar en un iframe ajeno y anuncia `X-Powered-By`
- Severidad: **media**
- Dónde: todas las respuestas HTML. `curl -D` de `/`, `/wiki`, `/wiki/the-bloop` y `/comunidad`: no hay `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` ni `Referrer-Policy`, y sí `X-Powered-By: Next.js`. El vhost de nginx solo añade `X-Robots-Tag`.
- Riesgo: clickjacking (la votación y el formulario de contacto se pueden incrustar debajo de un señuelo) y ninguna defensa en profundidad.
- Propuesta probada: inyecté estas cabeceras en las respuestas con Playwright y recorrí `/`, `/comunidad`, `/wiki`, `/wiki/the-bloop`, la arena, `/wiki/registro` y `/wiki/el-angel`, más la paleta ⌘K (encuentra «Bloop»), la búsqueda del explorador (encuentra «Majá») y el visor de imágenes (se abre): **0 violaciones**. La única fue la buscada, porque `frame-ancestors 'none'` bloquea el iframe ajeno.
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://i.ytimg.com; font-src 'self'; connect-src 'self'; frame-ancestors 'none';
    base-uri 'self'; form-action 'self'; object-src 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  ```
- Arreglo propuesto: `async headers()` en `next.config.ts` con `source: '/(.*)'` y `poweredByHeader: false`. La CSP solo en producción (`next dev` necesita `'unsafe-eval'`). `'unsafe-inline'` en `script-src` es inevitable sin nonces, y los nonces obligan a renderizar en cada petición, lo que rompería el ISR. `Strict-Transport-Security` va en el bloque 443 de nginx cuando certbot lo cree.

### A6-6 · Los fallos del RSS imprimen la traza completa y, en `getLatestVideo`, en cada render
- Severidad: **baja** (solo afecta a los logs; el fan ve el vídeo de respaldo).
- Real en producción: sí. Cada regeneración ISR de `/` y `/comunidad` (cada hora) y el build (una vez por worker) imprimen unas 7 líneas por error con `HttpError` y unas 13 con `fetch failed` y su `[cause]`, medido con Node 24 en modo `production` (`scratchpad/a6-log.mjs`). En dev, cada petición renderiza de nuevo y el registro se repite aunque la memoización devuelva el fallo guardado al instante.
- Causa:
  - `src/features/community/data/latest-video.ts:18` hace `console.error(…, error)` con el objeto `Error`, dentro del `catch` de **cada** llamada; la memoización (`failure-memo.ts`) evita repetir la petición, pero no el registro.
  - `channel-videos.ts:23-27` avisa una sola vez **por proceso**, para siempre: `feedWarned` nunca se reinicia, así que en un servidor de larga vida las caídas posteriores y la recuperación no quedan registradas.
- Arreglo propuesto: registrar en un solo punto, en `youtube-rss.ts`, al fallar el intento real. Ese código solo corre una vez por ventana de `FAILURE_TTL_MS` (60 s), porque `memoizeFailure` rechaza las demás llamadas sin ejecutarlo. Una sola línea, por ejemplo `console.warn(`[youtube-rss] feed no disponible (${describe(error)}); respaldo durante 60 s`)`, con `describe` que devuelva `HTTP 404`, `fetch failed: EAI_AGAIN` (`error.cause?.code`) o `tiempo límite`. Quitar el `console.*` de los dos consumidores y la variable `feedWarned`.

### A6-7 · La imagen LCP va en `loading="lazy"` en el explorador, la arena y la encuesta (el aviso de `The_Bloop_fauces.webp`)
- Severidad: **baja**. A1 se encarga del rendimiento; aquí, la causa en el código.
- Medido (el último candidato a LCP):
  - `/wiki` (390 y 1440): `El_Gran_Maja_retrato.webp` **lazy**, la primera tarjeta.
  - `/wiki/arena?a=the-bloop&b=el-gran-maja` (1440): **`The_Bloop_fauces.webp` lazy**, el aviso que vio Nelson.
  - `/wiki/arena` (1440): El Gran Majá, lazy.
  - `/comunidad` (1440): el retrato de Bogbo en la encuesta, lazy.
  - `/wiki/el-angel` (390): una imagen del cuerpo, lazy.
  - Las cabeceras de las fichas y el hero ya llevan `eager` y `fetchPriority="high"`: bien.
- Causa:
  - `WikiList.tsx:197` no pasa `eager` a ninguna `ContentCard` (su valor por defecto es lazy).
  - `src/features/monsters/components/arena/components/FighterCard.tsx:38`: `<Image fill …>` sin `loading`.
  - `PollTile.tsx:46-53` (`Portrait`): sin `loading`.
- Arreglo propuesto: `eager={i < 3}` en el `map` de `WikiList`; `loading="eager" fetchPriority="high"` en `FighterCard` (los dos luchadores están en la primera pantalla); `loading="eager"` en los retratos de `PollTile`.

### A6-8 · Las miniaturas de YouTube pasan por el optimizador de imágenes sin ganar nada y dependen del DNS del servidor
- Severidad: **baja**
- Dónde: `/`, `/comunidad` y «Aparece en» de las fichas. Aquí `GET /_next/image?url=https://i.ytimg.com/vi/hedUAqopPBg/mqdefault.jpg&w=750` responde 200 (0,43 s en frío, 1 ms en caché). El 500 de Nelson viene de su red: `EAI_AGAIN i.ytimg.com` y `ENETUNREACH 216.239.38.120` en la misma ventana en que también fallaba el RSS. En el VPS solo pasaría con un corte de DNS o de salida, pero entonces la tarjeta queda vacía (`alt=""`) durante lo que tarde en resolverse.
- Medido: el original pesa 5780 B (JPEG 320×180). El optimizador devuelve 2782 B (WebP), **siempre de 320×180**, pidas `w=384`, `750` o `828`: no hay variantes, solo una recodificación. El servidor añade un salto, CPU y una dependencia de red, a cambio de unos 3 KB.
- Respuesta a la pregunta: sí, conviene `unoptimized` en esas miniaturas. Por ejemplo, en `ContentCard.tsx:76`: `unoptimized={cover.startsWith('https://i.ytimg.com/')}`, con `img-src https://i.ytimg.com` en la CSP (A6-5). Contrapartida: el navegador del fan contacta con Google directamente; con `Referrer-Policy: strict-origin-when-cross-origin`, solo ve el origen. Para A1: la miniatura `mqdefault` mide 320 px y se pinta hasta a unos 716 px de ancho físico en móvil, así que se ve blanda.

### A6-9 · El proxy de Auth.js corre en cada página aunque no haya login, y pone 2 cookies a cada visitante
- Severidad: **baja**
- Observado: cada respuesta HTML (`/`, `/wiki`, fichas y también el 404), incluidas las servidas desde la caché ISR (`x-nextjs-cache: HIT`), lleva `set-cookie: authjs.csrf-token=…` (distinto en cada petición) y `authjs.callback-url=http%3A%2F%2Flocalhost%3A3000`. `/admin` y `/settings` responden 302 a `/api/auth/signin`, una página de Auth.js sin proveedores (`/api/auth/providers` → `{}`).
- Efecto: cookies para visitantes anónimos sin necesidad, un `Set-Cookie` que impide cachear el HTML en un CDN futuro y trabajo de middleware en cada petición.
- Causa: `src/proxy.ts`, con el matcher `/((?!api|_next/static|_next/image|favicon.ico).*)`, y `src/core/auth/auth.config.ts` con `providers: []`.
- Arreglo propuesto: quitar `src/proxy.ts` mientras no haya cuentas, o reducir el matcher a `['/admin/:path*', '/settings/:path*']`.

### A6-10 · `NavLinks` va acumulando listeners `hashchange` que nunca se quitan
- Severidad: **baja**: una fuga lenta, sin efecto visible.
- Medido por CDP (`getEventListeners(window).hashchange`) en `/` a 1440×900: 1 al cargar, 5 tras un recorrido de scroll arriba y abajo, 27 tras 5 recorridos y 33 tras 3 idas y vueltas a `/comunidad`.
- Causa: `src/components/navbar/components/NavLinks.tsx:57-62`. El listener es una flecha anónima y el `removeEventListener` recibe otra flecha distinta, así que nunca se quita. Además, el efecto depende de `[pathname, activeHash]` y se vuelve a ejecutar cada vez que el scroll cambia la sección activa.
- Arreglo propuesto: nombrar el manejador (`const onHash = () => setActiveHash(location.hash)`), quitar ese mismo y dejar las dependencias en `[pathname]` (dentro de `handleScroll`, `setActiveHash(prev => prev === s ? prev : s)`).

### A6-11 · Error de hidratación del año en la Arena
- Severidad: **baja**
- Dónde: `/wiki/arena…` cuando el año del cliente no es el del servidor (UTC). En América pasa en Nochevieja desde las 19:00 (UTC−5), y también con el reloj del equipo mal puesto.
- Observado (reloj del cliente a 2027-01-01T01:00−05:00): «Borisao Archive // 2027» y `Minified React error #418` (args `text`). React descarta el HTML del servidor y renderiza de nuevo en el cliente. Con el reloj real no hay ningún error.
- Causa: `src/features/monsters/components/VersusArena.tsx:67`, `{new Date().getFullYear()}` en un componente cliente.
- Arreglo propuesto: calcular el año en `arena/page.tsx` y pasarlo como prop, o `suppressHydrationWarning` en ese `<p>`. El `Footer` es un componente de servidor y no tiene este problema.

### A6-12 · Ruido en el log del servidor: `Error: Internal: NoFallbackError` en cada 404 de ficha
- Severidad: **baja**
- Observado: cada `/wiki/<slug inexistente>` añade 2 líneas (`Error: Internal: NoFallbackError / at ignore-listed frames`) al log de producción. `/no-existe` y `/comunidad/x` no las añaden. Un bot que rastree `/wiki/*` llenará el log y ocultará los errores reales.
- Causa: `dynamicParams = false` en `src/app/(wiki)/wiki/[slug]/page.tsx:24` (Next 16.2.1 registra el fallback interno).
- Arreglo propuesto: filtrar esa línea en el colector de logs o abrir una incidencia en Next. No conviene volver a `dynamicParams = true`, porque sin él vuelve el 404 suave que evita el comentario de esa línea.

### A6-13 · Un escape `%` mal formado en una ficha da 500 en texto plano
- Severidad: **baja**
- Observado: `/wiki/%E0%A4%A` y `/wiki/%` → `500 Internal Server Error` (21 bytes, `text/plain`). `/%` y `/wiki?universe=%E0%A4%A` responden bien (404 y 200).
- Causa: Next falla al decodificar el parámetro dinámico antes de llegar a la app. El proxy no llega a ejecutarse: la respuesta no lleva las cookies de Auth.js.
- Arreglo propuesto: aceptarlo (solo pasa con enlaces corruptos) o anotarlo para cuando haya `not-found.tsx`. Si molesta en los logs, un `location ~ "%(?![0-9A-Fa-f]{2})"` → `return 400` en nginx.

### A6-14 · `getWikiArticles` no valida su entrada
- Severidad: **baja**: no afecta al fan ni es un DoS.
- Observado, reenviando la acción con su id real:
  - `search: 123`, `search: {}`, `null` o sin argumentos → 500 y una traza `TypeError: k.trim is not a function` en el log;
  - `pageSize: 0` → `totalPages: Infinity`; `pageSize: 'abc'` → `NaN`;
  - una búsqueda de 900 000 caracteres responde en 54 ms (se recorta a `MAX_QUERY_LENGTH`) y `page`/`pageSize` enormes devuelven `[]` sin coste.
- Causa: `src/features/monsters/actions/get-wiki-articles.ts:58-64` desestructura sin comprobar el tipo.
- Arreglo propuesto: un `z.object({ page: z.coerce.number().int().min(1).max(1000).catch(1), pageSize: z.number().int().min(1).max(48).catch(12), search: z.string().catch(''), universe: z.string().catch('all'), tipo: z.string().optional().catch(undefined) }).catch({})` al principio de la acción.

## 3. Comprobado y correcto
- **Hidratación:** 0 errores de React y 0 avisos en 46 rutas × 2 viewports (TZ `America/Guayaquil`), ni en 360 (`Asia/Tokyo`, `en-US`) y 1024 (`Pacific/Honolulu`, `pt-BR`) con el registro relleno. `formatFecha` usa UTC y el estado del registro espera a hidratar. La única fuente es la del año (A6-11).
- **Encuesta sin base de datos o sin `VOTE_SECRET`:** con la API en 500, con la conexión rechazada o con `unavailable`, se lee «Votación no disponible ahora.», con los botones desactivados y sin errores en consola (`shots/a6-poll-api-500.png`). La ruta y `castVote` capturan el fallo de Prisma. `voteSecret()` exige ≥ 32 caracteres y `DATABASE_URL`. El pool de pg tiene un tiempo límite de conexión de 3 s.
- **Navegación entre builds:** un buildId distinto en la respuesta RSC provoca una recarga completa, y el destino se carga bien.
- **Paleta ⌘K:** con las acciones fallando, muestra «Cargando el archivo…» y luego su `isError`. Si el chunk no llega, se cierra y avisa con «Recargar» (según el código).
- **Frontmatter inválido:** se omite y lo detectan `check:content` y el build; con `dynamicParams = false`, un slug sin MDX da un 404 real.
- **Listeners:** `EntityPreview`, `ArticleProgress`, `SectionChip`, `Navbar`, `sidebar`, `useActiveHeading`, `use-media-query`, `use-mobile` y `ArticleImages` limpian bien. El `storage` del registro es único, a nivel de módulo.
- **Caché:** los estáticos van con `public, max-age=31536000, immutable`; `/api/comunidad/encuesta`, con `no-store`; las páginas ISR, con `s-maxage=3600` (coherente con `revalidate = 3600`); `/wiki/aleatorio` responde 307 incluso con `from` mal formado.
- **Bucles de red:** ninguno. En `/wiki?universe=…` y en la arena con duelo, no hay peticiones a partir de los 3 s; solo los prefetch de los enlaces visibles.
- **Miniaturas por el optimizador:** funcionan en este entorno (200).

## 4. Riesgos de configuración (sin medir aquí)
- **Votos durante la vista previa solo HTTP:** `cast-vote.ts:47` pone la cookie `wb_voter` con `secure: true` en producción. Mientras el vhost del VPS esté solo en HTTP (antes de certbot), el navegador la descarta: cada visita es un votante nuevo (hasta el límite de 5 votos por red) y al recargar desaparece «Tu voto». Activar TLS antes de anunciar la votación.
- **Ventana del deploy:** `deploy.sh` recrea el contenedor con `compose up -d app`. Durante esos segundos nginx sirve su 502 por defecto (en inglés y en blanco). Opcional: `error_page 502 503 504 /mantenimiento.html` en el vhost.

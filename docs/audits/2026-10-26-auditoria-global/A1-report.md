# A1 · Landing `/` y chrome global (navbar/footer)

## Cobertura
- `/` en 8 viewports (320, 360, 390, 768, 1024, 1280, 1440, 1920): desbordamiento horizontal, consola (errores/warnings/HTTP>=400), imágenes (cargadas tras hacer scroll), LCP (PerformanceObserver) y capturas de página completa.
- LCP además en 390x1200, 768x1366, 1024x1366, 1440x1200.
- axe en `/` a 390 y 1440 (0 violaciones); con errores del formulario visibles a 320/768/1280 (0); con el menú abierto a 320/768 (0).
- Navbar escritorio 1280: enlaces, activo, sticky (alto 83 a 87,5 px), Ctrl+K, clic en `/#contacto` y `/#universos`, entrada directa a `/#contacto`, activo en /wiki/the-bloop, /wiki/arena y /comunidad.
- Navbar móvil/tablet (hamburguesa visible hasta 1279 px): abrir, Esc (devuelve el foco al botón), tab order, bloqueo de scroll, cerrar con cada enlace.
- Todos los enlaces de la landing (14 internos con anclas, externos solo listados): HTTP 200 y ancla existente.
- Formulario: vacío, email inválido, longitudes, envío válido, doble envío.
- Tab completo de la landing a 1440 y 390 (orden y foco visible).
- Contraste del hero: se sustituyó la imagen por fondo blanco y negro puro y se midió el contraste real de h1 blanco, h1 naranja y frase en los 8 viewports.
- No cubierto: hero con una criatura con imagen (la de esta semana, Le'Mug, no tiene `image`, así que el hero va sin imagen; se simuló con blanco/negro); menú móvil en /wiki y /comunidad; dev server.

## Hallazgos

### A1-1 · El formulario de contacto no envía nada y muestra un éxito falso
- Severidad: crítica
- Dónde: `/#contacto`, cualquier viewport. Rellenar con datos válidos y pulsar «Enviar a Boris».
- Esperado: llamada a la server action `sendContactEmail` y, si Resend falla, un error amable. Observado: 0 peticiones POST; aparece el toast «Mensaje enviado correctamente. ¡Pronto recibirás noticias de Boris!», el formulario se vacía y los datos (nombre, email, mensaje) se escriben en `console.log`. Doble envío (2 clics seguidos): 2 toasts de éxito, sin botón deshabilitado ni estado «Enviando…». Ningún mensaje de fans llega a Boris.
- Evidencia: `shots/a1-form-sent.png`; salida de `a1-form.mjs` (POSTs `[]`, toasts x2, `console log:{name: Tester…}`).
- Causa probable: `src/features/marketing/components/contact/ContactForm.tsx:38-43` (`onSubmit` solo hace `console.log` y `toast.success`). `src/core/actions/contact.action.ts` está completa (valida con Zod, escapa HTML, devuelve `{error}`), pero no la importa nadie (`grep contact.action src` solo la encuentra a sí misma). Ojo: `new Resend(process.env.RESEND_API_KEY)` a nivel de módulo (`contact.action.ts:6`) lanza en la importación si falta la clave; al conectarla hay que crear el cliente dentro de la acción, o el error amable (catch) nunca se alcanzará.
- Arreglo propuesto: en `onSubmit`, construir `FormData`, llamar a `sendContactEmail`, `toast.error(result.error)` si falla (y mapear `details` a `form.setError`), `toast.success` + `reset()` solo si `success`; usar `form.formState.isSubmitting` para deshabilitar el botón y cambiar su texto; quitar el `console.log`; instanciar Resend de forma perezosa dentro de la acción.

### A1-2 · El menú móvil no se cierra al pulsar un enlace de ancla (o «Inicio») estando en `/`
- Severidad: alta
- Dónde: `/`, 320–1279 px (hamburguesa). Abrir menú, pulsar Universos, Contacto o Inicio.
- Esperado: el panel se cierra y se ve la sección. Observado: la página hace scroll por detrás (scrollY 397 / 4376) pero el panel sigue abierto (`dialogs 1`), con `body overflow:hidden` y overlay; el fan ve el menú tapando el contenido y tiene que cerrarlo a mano. Con Wiki y Comunidad (navegación de ruta) sí se cierra.
- Evidencia: `shots/a1-menu-open-after-link.png` (tras pulsar «Universos»: panel abierto, «Universos» activo).
- Causa probable: `src/components/navbar/components/NavLinks.tsx:60-80` (`handleLinkClick` hace `preventDefault()` y scroll programático, así que la navegación que desmontaba el panel no ocurre) y `src/components/Navbar.tsx:76` (`<Sheet>` sin estado controlado). «Inicio» (`/`) tampoco navega.
- Arreglo propuesto: `<Sheet open onOpenChange>` controlado y un `onNavigate` en `NavLinks` (en el menú móvil) que cierre el sheet; o envolver los enlaces del panel en `SheetClose`.

### A1-3 · Aviso LCP de Next: la primera tarjeta de universos (`The_Bloop_fauces.webp`) es la imagen LCP y no es `eager`
- Severidad: media
- Dónde: `/`, componente `ContentCard` de `HeroBleed` (tarjeta «Colosos»). Medido con `PerformanceObserver`: LCP = esa imagen (`loading="lazy"`) en 1920x1080, 1440x1200, 1024x1366, 390x1200 (en 768x1366 es la tarjeta de El Gran Majá). En 390x844, 768x1024, 1024x768, 1280x800 y 1440x900 el LCP es el h1/párrafo, por eso en dev solo salta con ventanas altas o grandes (pantalla completa de 1080p).
- Esperado: imagen above-the-fold con prioridad. Observado: `loading=lazy`, `fetchpriority=auto` (la imagen del hero sí lleva `eager`/`high`, pero esta semana no hay imagen de hero). La web usa `sizes` correctos (`w=256` en móvil, `w=640` a 1920).
- Causa probable: `src/features/marketing/sections/HeroBleed.tsx:83-93` no pasa `eager` a las tarjetas; `ContentCard` ya lo soporta (`eager`, `ContentCard.tsx:~25`).
- Arreglo propuesto: pasar `eager` a las tarjetas de universos de la primera fila (`eager={i < 4}`, o al menos `i === 0`; son 4 imágenes pequeñas y siempre están en la primera pantalla desde tablet).

### A1-4 · Formulario de contacto: errores no accesibles y sin límites de longitud
- Severidad: media
- Dónde: `/#contacto`. Enviar vacío.
- Observado: los 4 errores aparecen y el foco va al nombre (bien), pero ningún campo tiene `aria-invalid` ni `aria-describedby`, y los `<p>` de error no tienen `role="alert"`/`aria-live` ni `id`: un lector de pantalla no los asocia al campo. El email es `type="text"` (sin teclado de email en móvil). Sin `maxLength`; el esquema del cliente no tiene máximos (nombre de 500 caracteres y mensaje de 6000 pasan la validación del cliente) mientras la acción del servidor sí limita a 100/150/5000, así que el fan escribirá un texto largo y solo se enterará al enviar. Mensajes de error del cliente distintos a los del servidor.
- Evidencia: `shots/a1-form-errors.png`; `aria-invalid:null, aria-describedby:null, maxLength:-1`.
- Causa probable: `ContactForm.tsx:14-19` (esquema) y `:60-100` (inputs, `Input` no usa `FormControl` con ids de shadcn porque envuelve el control en `ContactField`), `ContactFields.tsx:25-29`.
- Arreglo propuesto: compartir el esquema Zod con la acción (un archivo sin `'use server'`); `type="email"`+`inputMode`; `aria-invalid={!!error}`, `aria-describedby` al `id` del `<p>` y `role="alert"` en el error; `maxLength` en cada campo.

### A1-5 · Scroll-spy de la navbar roto: «Inicio» queda activo mientras se lee Universos/Contacto
- Severidad: media
- Dónde: `/`, escritorio (1280+). Hacer scroll hasta #universos (y hasta #contacto): el enlace activo sigue siendo «Inicio». Solo se activa al hacer clic en el enlace.
- Medido: scrollY 500 (universos top -36, bottom 243) y 3000 (contacto -452/328): activo `['Inicio']` en ambos.
- Causa probable: `NavLinks.tsx:20-64`. El `useEffect` depende de `activeHash` y al principio ejecuta `setActiveHash(window.location.hash)`; cuando el scroll-spy fija `#universos`, el efecto se relanza y lo restaura a `''`. Además `removeEventListener("hashchange", () => …)` (línea 62) usa una función nueva, así que el listener nunca se elimina (fuga, uno por cada cambio de `activeHash`). También, al final de la página, `contacto` queda con `bottom < 200` y no activaría nada.
- Arreglo propuesto: efecto con `[pathname]` solo, `setActiveHash(location.hash)` una vez, handler con nombre para quitarlo, y el cálculo con un `IntersectionObserver` o una comparación `top <= 200` sin exigir `bottom >= 200` (la última sección cuyo top ya pasó).

### A1-6 · Miniaturas de YouTube vía `/_next/image`: un fallo de DNS del servidor rompe las miniaturas
- Severidad: baja
- Dónde: `FeaturedVideosSection` → `ContentCard` (`/_next/image?url=https://i.ytimg.com/vi/<id>/mqdefault.jpg`). En el servidor de producción, 200 y cargan bien (3 miniaturas; 237 px nativos a 1440). Con el DNS caído en dev dio 500 porque es el servidor de Next quien las descarga.
- Evaluación: sí conviene `unoptimized`. La fuente `mqdefault` es un JPEG 320x180 ya pequeño y servido por la CDN de Google; el optimizador solo añade un salto (y un punto de fallo y de carga en el VPS) y apenas ahorra bytes (reescala 320→256/640). Con `unoptimized` el navegador las pide directo a YouTube y un fallo solo afecta a esa tarjeta. Sin `next/image` optimizado también se puede quitar `i.ytimg.com` de `remotePatterns`.
- Causa: `src/components/content/ContentCard.tsx` (`<Image fill sizes …>` sin `unoptimized`), `next.config.ts:11-15`.
- Arreglo propuesto: `unoptimized={/^https?:\/\//.test(cover)}` en `ContentCard` (o una prop `unoptimized`) para las miniaturas. Como la CDN sirve 320 px y la tarjeta mide hasta ~400 px a 1x, valorar `hqdefault` (480x360) en `youtubeThumbUrl`.

## Comprobado y correcto
- Desbordamiento horizontal: ninguno en 8 viewports (scrollWidth == clientWidth).
- Consola: sin errores ni warnings en los 8 viewports; sin respuestas HTTP >= 400.
- axe en `/` (móvil y escritorio, con errores del formulario y con menú abierto): 0 violaciones.
- Contraste del hero (peor caso, imagen blanca pura): h1 blanco >= 10,8:1, h1 naranja >= 4,94:1, frase >= 8,39:1 en los 8 viewports; sobre negro todo >= 6,9:1.
- Menú móvil: se abre, Esc cierra y devuelve el foco al botón, Tab queda en el panel (sale una vez al chrome del navegador y vuelve, comportamiento normal de un diálogo modal), `overflow:hidden` en el body, Wiki/Comunidad cierran por navegación.
- Navbar: sticky con transición (83 a 87,5 px), Ctrl+K abre la paleta; activo correcto en /wiki/*, /comunidad; clic en `/#universos` y `/#contacto` deja la sección a 80 px bajo la barra; entrada directa a `/#contacto` a 96 px.
- Enlaces: los 14 internos de la landing dan 200 y todas las anclas (`#universos`, `#contacto`, `#catalogo`, `#explorar`) existen.
- Imágenes: ninguna rota tras hacer scroll; `sizes` coherentes (`w=256` móvil, `w=384` 1280, `w=640` 1920); hero con `eager`+`fetchpriority=high`.
- Teclado: orden de tabulación lógico (navbar, buscador, criatura, universos, personajes, vídeos, comunidad, Sobre Boris, formulario, footer) y foco visible en todos (outline en navbar/footer, ring en tarjetas y botones).
- Formulario: cada campo vacío muestra su error; el email inválido se detecta; el foco va al primer campo inválido; no hay desbordamiento.
- Tamaños táctiles: todos >= 44 px salvo el enlace de correo en línea (169x14, exento) y los títulos de tarjeta (el enlace estirado cubre toda la tarjeta).

## Observaciones menores (no hallazgos)
- Esta semana el hero no tiene imagen (Le'Mug sin `image`): queda solo el degradado, sin placeholder; se ve bien, pero no hay «criatura de fondo».

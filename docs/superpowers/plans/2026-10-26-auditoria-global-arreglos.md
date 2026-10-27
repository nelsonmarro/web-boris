# Auditoría global — arreglos

**Origen:** auditoría multiagente del 2026-10-26, pedida por Nelson («control de calidad de funcionalidad, UI, UX, responsividad de la página en todos sus apartados y corregir posibles errores que estropeen la experiencia de los usuarios de Boris»).

Seis auditores recorrieron la web en producción con Playwright: 8 viewports, axe, rastreo de enlaces y recursos, y revisión de código. Los informes con las reproducciones, las mediciones y la causa en el código están en `docs/audits/2026-10-26-auditoria-global/` (`A1`…`A6`). Cada tarea cita los ids de los hallazgos que cierra: **lee el hallazgo en su informe antes de tocar nada**.

**Decisiones (Nelson está ausente y delegó todas las decisiones):**
- **D1 — Atrás/adelante del Archivo:** las pestañas, el universo y la página crean entrada de historial (`pushState`); escribir en el buscador la reemplaza (`replaceState`). Con `popstate`, el estado vuelve a leerse de la URL.
- **D2 — Seguridad:** cabeceras mínimas que no rompan YouTube ni las imágenes: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva y `poweredByHeader: false`. No se añade CSP: con los scripts en línea de Next haría falta un nonce, y eso vuelve dinámicas las páginas estáticas.
- **D3 — Auth.js:** el proxy solo se ejecuta en `/admin` y `/settings`, las únicas rutas que protege. Así se acaban las cookies en cada página pública y el conflicto con la caché ISR.
- **D4 — No se arregla:**
  - `A6-12` y `A6-13`: los hace el propio Next con `dynamicParams = false`.
  - `A2-8`: leer la cookie del menú lateral volvería dinámico el layout estático.
  - `A3-4`: es contenido canónico; no se reescribe.
  - `A5-6`: el texto de 11 px en eyebrows y chips es de la marca y solo se usa en etiquetas, no en cuerpo de texto.
  - `A5-8`: el peso de la landing son sus imágenes, ya optimizadas.
  - `A2-3`: no se reproduce. La protección real llega con `error.tsx` (`A6-3`).
- **D5 — Página 404 y de error:** en español y con la marca. Deben dar una salida: Inicio, Archivo, buscador y Expediente aleatorio. Nada de lore inventado.

**Restricciones globales:**
- Textos y comentarios en español, con la densidad de comentarios del archivo.
- Solo canon: ningún texto de lore nuevo.
- Marca: `#00122E` / `#FF7300`, `crystal-surface`.
- Un elemento enfocable nuevo lleva `outline-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary`.
- Objetivos táctiles de al menos 44×44 px en móvil.
- Los módulos puros (`src/core/**`, `src/features/community/lib/**`) usan solo imports relativos `.ts`.
- Sin dependencias nuevas.
- **Cada tarea toca solo sus archivos:** la lista de cada una es exclusiva, porque se ejecutan en paralelo.
- Los implementadores no hacen commit ni `npm run build`. Verifican con `npm test`, `npm run lint` y `npx tsc --noEmit`, y prueban en el navegador contra `http://localhost:3131`. Ese servidor es el build de `main`: **no refleja sus cambios**, así que para probarlos usan `next dev` en un puerto propio (abajo).
- Puertos de `next dev` para probar: T1 4101, T2 4102, T3 4103, T4 4104, T5 4105, T6 4106, T7 4107, T8 4108. Se arranca con `npx next dev -p <puerto>` y se para al terminar, matando su PID. `DATABASE_URL` a `localhost:5433`, como en `.env` pero con ese puerto (Postgres ya está en marcha).

---

### Task 1: Formulario de contacto (A1-1 crítica, A1-4)
**Archivos:**
- `src/features/marketing/components/contact/ContactForm.tsx`
- `src/features/marketing/components/contact/ContactFields.tsx`
- `src/core/actions/contact.action.ts`

**Qué arreglar:**
- El formulario debe enviar de verdad con la server action `sendContactEmail`. Un mensaje de éxito solo con `success`; con `error`, el mensaje del servidor y los errores por campo.
- Mientras envía, el botón queda desactivado («Enviando…»), así que el doble clic no manda dos correos.
- El esquema del cliente refleja los máximos del servidor (100 / 150 / 5000) y los inputs llevan `maxLength`.
- El campo de correo es `type="email"` con `inputMode="email"`.
- Errores accesibles: `aria-invalid`, `aria-describedby` hacia el texto del error y `role="alert"` (o una región viva) para el mensaje global.
- `new Resend(...)` sale del nivel de módulo: se crea al enviar. Sin clave o con una clave de relleno, la acción devuelve un error amable sin lanzar al importarse.
- El correo se valida igual en cliente y servidor.

**Prueba:** en el navegador, enviar vacío, con correo inválido, demasiado largo, válido y con doble clic. En local la clave de Resend es de relleno, así que el resultado esperado es el error amable, no un éxito falso.

### Task 2: Navbar y footer (A1-2, A1-5, A6-10, A2-12, aviso de A4: logo y buscador cortados a 320)
**Archivos:**
- `src/components/navbar/**`
- `src/components/Navbar.tsx` (si existe)
- `src/components/Footer.tsx`

**Qué arreglar:**
- El menú móvil se cierra al pulsar cualquier enlace, también las anclas de `/` (Sheet controlado).
- El scroll-spy marca la sección visible.
- El listener `hashchange` se limpia (misma referencia de función).
- A 320 px la navbar no corta el logo ni el botón de búsqueda.
- El footer a 768 px con el menú lateral abierto no solapa el logo y «Navegación».

### Task 3: Menú lateral y cabecera de la wiki (A2-2, A2-7, A2-11, A2-9 si es barato)
**Archivos:**
- `src/components/sidebar/**`
- `src/components/AppSidebar.tsx`
- `src/app/(wiki)/wiki/layout.tsx`

**Qué arreglar:**
- La hoja móvil se cierra al navegar (`setOpenMobile(false)` al pulsar un enlace, o un efecto sobre `usePathname`).
- Con el menú plegado, pulsar un grupo lo despliega y abre ese grupo.
- «Comunidad» es accesible desde el menú móvil de la wiki y desde la cabecera de la wiki.
- Los títulos truncados llevan `title` o salen completos.
- `region` de axe en la Arena y la ficha a 1280: el contenido del menú lateral queda dentro de un landmark (`nav`/`aside`).

### Task 4: Explorador del Archivo (A2-1/A5-1 alta, A6-1 alta, A2-5, A2-4, A6-7 en /wiki, A2-14)
**Archivos:**
- `src/features/monsters/components/WikiList.tsx`
- los componentes que solo usa el explorador, en su carpeta

**Qué arreglar:**
- **Paginación** que nunca se sale de la pantalla de 320 a 1440 ni con el menú abierto a 768. Por ejemplo, en móvil compacta «‹ 1 … 4 5 6 … 9 ›» con botones de icono que conservan el nombre accesible.
- **Si la consulta falla** (`isError`), mostrar «No se pudo cargar el archivo» con un botón «Reintentar», nunca «Ningún registro coincide».
- **Historial según D1.**
- **Clic intermitente desde el footer (A2-4):** investigar la carrera entre el `#explorar` y la lectura de la URL y arreglarla si se encuentra.
- **La primera fila de tarjetas va `eager`.**

### Task 5: 404, errores, SEO y metadatos (A6-2/A2-6 alta, A6-3, A5-2, A5-3, A5-4)
**Archivos (nuevos o propios de esta tarea):**
- `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`
- `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`
- `src/app/layout.tsx` (metadatos)
- los `page.tsx` y `layout.tsx` de `(marketing)` y `(wiki)` **excepto** `comunidad/page.tsx` (Task 8), `wiki/arena/page.tsx` (Task 7) y `wiki/layout.tsx` (Task 3)

**Qué arreglar:**
- 404 y error en español y con la marca (D5). `error.tsx` lleva un botón «Reintentar» (`reset`) y uno «Recargar». `global-error.tsx` es mínimo, con su propio `<html>`.
- Para una ficha inexistente, el 404 tiene que salir con el chrome de la wiki o al menos con salida. Comprobar qué renderiza Next con `dynamicParams = false`.
- `robots.ts`: permitir todo y enlazar el sitemap.
- `sitemap.ts`: `/`, `/wiki`, `/comunidad`, `/wiki/arena`, `/wiki/registro` y las fichas, desde `getContentRepository()`.
- `manifest.ts`: nombre, colores de marca e icono existente.
- `alternates.canonical` en cada ruta: `/`, `/wiki`, `/wiki/registro` y las fichas.
- Títulos únicos: `/wiki` ≠ `/`.
- Open Graph y `twitter:card` por defecto en el layout raíz, con una imagen por defecto ya existente en `public/` que no sea el logo como portada de lore, y `og:image` de la ficha cuando tenga `image`.
- **Convención que siguen T7 y T8 en sus páginas:** `alternates: { canonical: '<ruta>' }` y `openGraph: { title, description, url: '<ruta>' }`.

### Task 6: Seguridad, proxy y entrada de las acciones (A6-5, A6-9/A2-13, A6-14)
**Archivos:**
- `next.config.ts`
- `src/proxy.ts`
- `src/features/monsters/actions/get-wiki-articles.ts`

**Qué arreglar:**
- Cabeceras según D2 (sin CSP) y `poweredByHeader: false`.
- El `matcher` del proxy solo para `/admin/:path*` y `/settings/:path*` (D3), sin romper `/api/auth`.
- Zod en la entrada de `getWikiArticles`: `page` ≥ 1 y acotada, `pageSize` dentro de una lista blanca, `search` ≤ `MAX_QUERY_LENGTH`, `tipo` y `universe` válidos. Ante entrada inválida, corregir con valores seguros, no lanzar.

**Prueba:** las cabeceras con `curl -I` contra `next dev`; que no salga ninguna cookie de Auth en `/`; que el iframe de YouTube y las imágenes siguen bien.

### Task 7: Versus Arena (A4-1, A4-2, A4-3, A4-4, A4-7, A6-11, A6-7 en la Arena)
**Archivos:**
- `src/features/monsters/components/arena/**`
- `src/features/monsters/components/wiki/mdx/WikiTabs*`
- `src/app/(wiki)/wiki/arena/page.tsx` (metadatos según la convención de T5)

**Qué arreglar:**
- **Elegir el mismo combatiente:** no puede dejar la URL y el título en «X vs X» mientras se ve otro rival. Normalizar antes de escribir la URL y mostrar el aviso o cambiar B de forma visible.
- **Altura de los selects:** 48 px, sobreescribiendo `data-[size=default]:h-8` en el uso. No se toca `ui/select.tsx`.
- **Etiquetas del radar** legibles a 320 y 360: tamaño relativo o `viewBox` que no encoja el texto por debajo de unos 11 px efectivos, con más contraste.
- **Pestañas:** que no se apilen y que el subrayado siga a la activa a 320/360.
- **URL canónica:** `?a=` solo o slugs inválidos se reescriben a lo que se muestra.
- **Hidratación del año (#418):** se arregla.
- **El primer retrato va `eager`.**

### Task 8: Comunidad, vídeos, imágenes y logs (A6-4, A4-5, A4-6, A6-6, A6-8/A1-6, A1-3, A5-7)
**Archivos:**
- `src/app/(marketing)/comunidad/page.tsx`
- `src/features/community/**`
- `src/features/marketing/sections/**`
- `src/components/content/ContentCard.tsx`

**Qué arreglar:**
- **A6-4:** el mapa de luchadores que recibe `PollTile` incluye todas las fichas (título, imagen y estado), no solo las de la encuesta de esa semana. Así, el lunes del cambio de semana la encuesta nueva no sale con slugs en bruto.
- **A4-5:** «Reintentar» (`refetch`) cuando falla la votación.
- **A4-6:** la fila de la criatura de la semana no recorta a 320.
- **A6-6:** el fallo del RSS se registra en una sola línea concisa y en un solo sitio, una vez por ventana de memoización (`youtube-rss.ts`); los consumidores no lo vuelven a registrar.
- **A6-8/A1-6:** las miniaturas de `i.ytimg.com` van `unoptimized` (en `ContentCard`, cuando la portada empieza por `https://i.ytimg.com/`, y donde más se usen).
- **A1-3/A5-7:** las imágenes del primer pliegue van `eager`: primera fila de universos en la landing y primera imagen de `/comunidad`.
- **Metadatos de `comunidad/page.tsx`** según la convención de T5.

### Task 9 (controlador): accesibilidad suelta, integración y QA
- A3-1 y A3-2 (contraste en `ExpedienteSellado` e `InfoStats`) y A3-3 (`especies.mdx`: solo el nivel del título, h3 → h2).
- A5-5 y A2-10 (objetivos táctiles) que hayan quedado fuera de las tareas anteriores.
- Build, tests, revisión por tarea, revisión final, QA con Playwright y Chrome DevTools (todas las rutas, 8 viewports) y Lighthouse.
- Informe en `docs/audits/2026-10-26-auditoria-global/README.md`.

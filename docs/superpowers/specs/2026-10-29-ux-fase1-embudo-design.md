# UX fase 1: embudo a YouTube y contexto para el recién llegado — diseño

Fecha: 2026-10-29. De la auditoría `docs/audits/2026-10-29-ux-recien-llegado/README.md` (issue #85), fase 1: todo lo que no necesita material de Boris. Copy de interfaz (no lore): puede escribirse; el lore sigue siendo solo canon.

## A. Landing
1. **Hero** (`HeroAbisal`): bajo el h1, la frase pasa a decir qué es esto: «La wiki oficial de los universos animados que BorisaoBlois cuenta en YouTube.» Debajo del buscador, dos acciones: **«Ver el último vídeo»** (botón primario naranja, `getLatestVideo()`, externo) y **«Suscríbete»** (secundario, `YOUTUBE_SUBSCRIBE_URL`). El chip «En pantalla» se mantiene. Sin romper el contraste ni la animación.
2. **Orden:** Hero → **Vídeos** → Universos → Personajes destacados → Comunidad → Sobre Boris/contacto. Los vídeos dejan de estar en la pantalla 5 del móvil.
3. **Personajes destacados compactos:** en móvil, tarjetas 16:9 (no retrato) o fila horizontal; que la sección no ocupe más de ~1 pantalla de móvil.
4. **Sobre Boris:** fuera «Biografía: Próximamente» (vuelve cuando Boris la mande).
5. **Huecos de escritorio:** reducir los espacios verticales excesivos entre secciones de la landing (medir y ajustar; sin tocar el ritmo de la wiki).
6. **Navbar al hacer scroll:** fondo sólido oscuro (`#00122E` ~95 %) en lugar del cristal translúcido que se aclara sobre contenido claro; sin `backdrop-blur` grande (rendimiento Firefox). Scroll-spy: que marque la sección que realmente está en pantalla.
7. **Pie:** enlace «Suscríbete» junto al canal.

## B. Ficha (`/wiki/[slug]`)
1. **Línea de contexto** bajo el título (fichas no índice): «Expediente del universo *{universo}* · una serie de BorisaoBlois en YouTube» con enlace «Ver en YouTube» (canal) — corto, una línea.
2. **Bloque de vídeo arriba:** si la ficha tiene vídeos (`getVideosForSlug`), el primero se muestra justo después de la cabecera como **embed ligero**: miniatura `sddefault` + botón de play; al pulsar se carga el `iframe` de `youtube-nocookie.com/embed/<id>?autoplay=1` (sin cookies ni JS de YouTube hasta el clic). Título «Mírala/Míralo en vídeo» → mejor neutro: «Aparece en vídeo». Debajo, «Suscríbete al canal». Si no hay vídeo: nada arriba (no inventar). «Aparece en» del final se mantiene.
3. **Escala de tamaño:** en los datos de la cabecera, la longitud añade «≈ N ballenas azules» (ballena azul = 30 m, redondeo a entero, solo si `stats.length` ≥ 60). Función pura `blueWhales(lengthM)` probada.

## C. Wiki (`/wiki`)
1. **«Empieza por aquí»:** fila de 4–5 fichas estrella (config `START_HERE`: the-bloop, el-gran-maja, vlad-julia, slowdown-criyonte, phillip-forte) encima del explorador, solo cuando no hay búsqueda ni filtros; tarjetas pequeñas con portada. Una frase arriba: «¿Nuevo en los universos de BorisaoBlois? Empieza por estos expedientes.»

## Verificación
Lint, tests, check:content, build; QA en Chrome a 390 y 1440 (landing, /wiki, The Bloop, El Gran Majá, una ficha sin vídeo); axe 0; sin desbordes; Lighthouse sin regresión; el embed no carga nada de YouTube antes del clic.

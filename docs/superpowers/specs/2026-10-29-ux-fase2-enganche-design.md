# UX fase 2: enganche — diseño

Fecha: 2026-10-29. Fase 2 de la auditoría `docs/audits/2026-10-29-ux-recien-llegado/` (issue #85). Nada de esto necesita material de Boris: el copy de interfaz se escribe; el lore sigue siendo solo canon (sinopsis de `universes.ts`, textos de las fichas, `stats`).

Rutas nuevas (ya reservadas en `wiki-routes.ts` y añadidas a `sitemap.ts`): `/empieza-aqui`, `/videos`, `/wiki/escala`, `/wiki/tamanos`.

## 1. `/empieza-aqui` (grupo `(marketing)`, con navbar y pie)
- Qué es esto en dos frases (copy de interfaz, sin lore inventado): los universos animados de BorisaoBlois en YouTube y esta wiki como su archivo oficial.
- Los cuatro universos (de `UNIVERSES`: título, era, sinopsis recortada, enlace al archivo filtrado).
- «Empieza por estos expedientes» (`START_HERE`).
- «Mira sus vídeos»: enlace a `/videos` y «Suscríbete».
- «Cómo usar el archivo»: registro (y rangos), expediente aleatorio, Arena, escala, juego de tamaños, votación de /comunidad — una línea cada uno con enlace.
- Pequeño glosario solo con definiciones canónicas que ya estén en la wiki (p. ej. qué es un Coloso / un Titán según las fichas de categoría `colosos.mdx` / `titanes.mdx`; expediente sellado = lore aún no desclasificado por Boris). Si una definición no está en el canon, no se pone.
- Enlaces de entrada: un enlace discreto «¿Nuevo? Empieza aquí» en el hero de la landing, en la fila «Empieza por aquí» de /wiki y en el pie.

## 2. `/videos` (grupo `(marketing)`)
- Todos los vídeos del canal (`getChannelVideos`: destacados + RSS) agrupados por universo y ordenados por fecha de publicación (los más antiguos primero: «Ver en orden»), con un selector «Más recientes primero». El universo de un vídeo sale de las fichas a las que está vinculado (`linkVideos` / `videos.json`); sin fichas, grupo «Otros vídeos».
- Cada vídeo: miniatura (`sddefault`), título, fecha, fichas en las que aparece (chips enlazados) y enlace a YouTube. Nota visible: «Orden de publicación; el orden de la historia lo confirmará Boris».
- Enlace «Ver todos los vídeos» desde la sección Vídeos de la landing y desde `/empieza-aqui`.

## 3. `/wiki/escala`
- Barras horizontales a escala (SVG o CSS) con todas las fichas con `stats.length`, ordenadas de mayor a menor, más referencias reales marcadas como tales: ballena azul (30 m), Titanic (269 m), Torre Eiffel (330 m), Empire State (443 m), Burj Khalifa (828 m). Cada criatura enlaza a su ficha; su portada pequeña al lado. Accesible (tabla o lista con valores; no solo gráfico).
- Enlace desde la escala «≈ N ballenas azules» de la ficha (si es trivial) y desde el menú lateral («Tu archivo»).

## 4. `/wiki/tamanos` — «¿Quién es más grande?»
- Juego cliente: dos tarjetas (criatura o referencia real), el jugador elige la más grande; acierto → racha +1 y nueva pareja; fallo → fin con «Racha: N», mejor racha en `localStorage` (clave `wb-tamanos`, con try/catch) y botón «Compartir» (Web Share API, fallback copiar enlace). Pool: fichas con `stats.length` + referencias reales de la escala. Lógica pura (emparejar sin repetir la pareja anterior, sin empates) en una lib probada.
- Enlaces desde la Arena, la escala y el menú lateral.

## 5. Rangos del registro
- Función pura `rangoDeRegistro(opened, total)`: Civil (0), Recluta (≥1), Operativo (≥25 %), Analista (≥50 %), Investigador jefe (≥80 %), Acceso total (100 %). Probada.
- Se muestra en `RegistroProgress` («Rango: Operativo · siguiente: Analista en N expedientes») y en el enlace «Tu registro» de /wiki. Solo cosmético: no bloquea nada.

## 6. Imágenes para compartir de cada ficha
- `src/app/(wiki)/wiki/[slug]/opengraph-image.tsx` (convención de Next 16, `ImageResponse`, 1200×630): fondo de marca, portada de la ficha a la derecha, título, categoría · universo, 2–3 datos (longitud, amenaza) y la marca; las selladas muestran el sello «Expediente sellado». Generadas en el build (las fichas son estáticas). Revisa en los docs de Next 16 cómo cargar fuentes e imágenes locales en `ImageResponse`. El `pageMetadata` de la ficha no debe pisar la imagen generada (comprobarlo).

## Verificación
Lint, tests, check:content, build; QA a 390 y 1440 de las páginas nuevas y de las tocadas; axe 0; sin desbordes; juego jugable con teclado.

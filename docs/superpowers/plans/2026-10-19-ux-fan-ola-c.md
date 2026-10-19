# UX fan · Ola C (enganche) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** darle al fan razones para seguir y volver, sin añadir ruido. Incluye:
- expediente sellado y medidor de apartados;
- un registro de expedientes vistos;
- expediente aleatorio;
- siguiente/anterior;
- vista previa de los enlaces;
- "Aparece en" con vídeos;
- el voto "desclasificar";
- slug canónico de Criyonte.

**Architecture:**
- Lógica pura nueva en `src/core/search/` (con tests `node:test`) y componentes pequeños en la ficha y en la wiki.
- Se apoya en lo que ya existe:
  - el índice de entidades y `data-entity` (Ola B);
  - `ContentCard`/`Section` (#55);
  - la encuesta de `/comunidad` (#43).
- El estado del fan vive solo en el navegador (`zustand` + `persist`).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Zustand v5 (`persist`), TanStack Query v5 y `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-18-ux-fan-ola-c-design.md`. **Este plan prevalece** sobre ella en el alcance; ver "Alcance tras #55 y la Ola B". Reglas visuales vinculantes: `docs/superpowers/specs/2026-10-18-rediseno-minimal-design.md` §1.

## Alcance tras #55 y la Ola B (rulings)

**Se quita de la spec C** (el §7 de #55):
- §2 completo: hero móvil con imagen, tira de personajes, carrusel de universos y ocultar personajes destacados;
- §7 taxonomía: ya está en `src/core/search/tipos.ts`;
- §6 "Novedades del archivo" en la portada de la wiki, porque la portada es "Archivo" + pestañas + catálogo;
- §3, los chips "Lee el expediente" / "Recrea el duelo" en las tarjetas de vídeo de la landing: la tarjeta entera ya es el enlace a YouTube y no se anidan enlaces. "Aparece en" se queda solo en la ficha.

**Se mantiene:**
- slug de Criyonte con redirección;
- expediente sellado + medidor + voto "desclasificar";
- página Registro + estado de vistos;
- expediente aleatorio;
- siguiente/anterior;
- vista previa;
- "Aparece en".

**Puntos de entrada del Registro y del Aleatorio** (enlaces de texto, sin tarjetas nuevas):
- en el menú lateral de la wiki, "Sitio principal" (`SidebarNavigation.tsx`) gana "Registro del archivo" y "Expediente aleatorio";
- bajo la línea de presentación de "Archivo" (`WikiExplorerSection.tsx`), una línea de texto: "Tu registro · N/T ›" + "Expediente aleatorio ›";
- en la paleta vacía, una fila "Expediente aleatorio";
- en el expediente sellado, "Ver el registro".

## Global Constraints

- **Solo canon:** los textos de intriga son factuales ("Boris aún no ha desclasificado este expediente", "Pendiente de registro") y nunca insinúan trama.
- **Sin dependencias nuevas.**
- **Reglas visuales de #55 §1:** `ContentCard`/`Section`, sin eyebrows por sección ni tarjeta, iconos solo funcionales, "Próximamente" como texto naranja de 11 px y superficies `crystal-surface`/`#061a2e`.
- **Accesibilidad:** foco `outline-hidden` + ring, objetivos de 44 px, texto ≥ 11 px y `motion-reduce:`.
- **Next 16:** `as Route` y `fetchPriority`/`loading`.
- **Módulos puros en `src/core/search/`:** imports relativos con `.ts` y sin `@/`.
- **Estado del fan:** solo `localStorage`, con la clave `wb-registro` y escrituras en try/catch; sin persistencia el sitio funciona igual. Las páginas siguen siendo ISR y no leen ese estado en el servidor.
- **Validación:** `npx tsc --noEmit`, `npm run lint`, `npm test` y `npm run check:content`. `npm run build` solo lo ejecuta el orquestador.
- **Commits:** en español, terminados con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Trabajo en paralelo:** los implementadores no hacen commit ni tocan archivos de otra tarea.

## Lotes

1. **Lote 1:** tarea 1.
2. **Lote 2:** tareas 2, 3 y 4 en paralelo.
3. **Lote 3:** tarea 5, porque comparte `validate.ts` y `check-content` con la 3.
4. **Tarea 6:** el orquestador cablea la ficha y hace la QA.

---

### Task 1: Slug canónico de Criyonte

**Files:**
- Mueve: `git mv src/content/slowdown-criyote.mdx src/content/slowdown-criyonte.mdx`.
- Modifica: `next.config.ts`, `src/features/monsters/config/wiki-navigation.ts`, `src/features/monsters/lib/arena.ts`, `src/content/encuestas.json`, `src/content/{animales-colosos,colosos,phiscanula-arcticum}.mdx`, `tests/community/poll-schedule.test.ts`, `tests/content/schemas.test.ts` y `src/features/monsters/components/arena/components/ArenaSimulator.tsx`.

- [ ] **Step 1:** Sustituye cada referencia `slowdown-criyote` por `slowdown-criyonte`. Al terminar, `grep -rn "slowdown-criyote" src tests scripts` solo debe aparecer en el mapa de slugs antiguos.
- [ ] **Step 2:** En `next.config.ts` añade `async redirects() { return [{ source: '/wiki/slowdown-criyote', destination: '/wiki/slowdown-criyonte', permanent: true }]; }`. Si ya hay un `redirects`, añade la entrada.
- [ ] **Step 3:** En `ArenaSimulator.tsx`:
  - añade `const LEGACY_SLUGS: Record<string, string> = { 'slowdown-criyote': 'slowdown-criyonte' };`;
  - normaliza `paramA` y `paramB` con `LEGACY_SLUGS[p] ?? p` antes de validarlos;
  - si se normalizó alguno, reescribe la URL con el `writePair` que ya existe, una vez y en un efecto.
- [ ] **Step 4:** Validar con `npx tsc --noEmit`, `npm run lint`, `npm test` y `npm run check:content`. Las encuestas y la navegación deben validar.
- [ ] **Step 5:** Commit `fix(contenido): slug canónico slowdown-criyonte con redirección permanente`.

---

### Task 2: Registro del archivo (vistos)

**Files:**
- Crea:
  - `src/core/search/registro.ts` + `tests/search/registro.test.ts`;
  - `src/features/monsters/store/registro-store.ts`;
  - `src/features/monsters/components/wiki/article/MarkSeen.tsx`;
  - `src/app/(wiki)/wiki/registro/page.tsx`;
  - `src/features/monsters/components/wiki/registro/{RegistroGrid,RegistroProgress}.tsx`;
  - `src/features/monsters/components/wiki/registro/RegistroLink.tsx`, el enlace "Tu registro · N/T", cliente.
- Modifica: `src/components/sidebar/components/SidebarNavigation.tsx`, para "Registro del archivo"; el enlace "Expediente aleatorio" lo añade la tarea 4. También `src/features/monsters/components/wiki/WikiExplorerSection.tsx`, para la línea de texto con `RegistroLink`.
- **No toques** `page.tsx` de la ficha: el orquestador monta `MarkSeen`.

**Interfaces:**
- `registroEntries(entries: readonly EntityEntry[]): { tipo: TipoId; label: string; items: EntityEntry[] }[]`:
  - quedan fuera `Directorio` y `Categoría`, usando `isIndexCategory` de `catalog.ts`;
  - agrupa por `tipoOf`, en el orden de `TIPOS`, y ordena cada grupo por `richness` descendente.
- `registroTotal(entries)`: cuántas no son `proximamente` ni índice.
- `progress(entries, seen: Record<string, string>): { opened: number; total: number }`: cuenta solo los slugs vistos que existen y no están sellados.
- `useRegistro`, de Zustand con `persist` (`name: 'wb-registro'`, `createJSONStorage(() => localStorage)` con try/catch): `{ seen: Record<string, string>; markSeen(slug): void }`.
- `MarkSeen({ slug })`: en el `useEffect` del montaje llama a `markSeen(slug)`.

**Pasos:**
- [ ] **Step 1 (TDD):** escribe `tests/search/registro.test.ts`. Debe cubrir:
  - los índices quedan fuera;
  - el orden de los grupos sigue `TIPOS`;
  - el orden dentro de cada grupo es por `richness`;
  - los sellados no cuentan en `registroTotal`;
  - `progress` ignora los slugs desconocidos y los sellados.
  Comprueba que falla, implementa `registro.ts` y comprueba que pasa.
- [ ] **Step 2:** escribe el store `registro-store.ts`. Fíjate en el patrón de hidratación: Zustand con `persist` hidrata en cliente. Para evitar errores de hidratación, los componentes que pintan el estado esperan a `useRegistro.persist.hasHydrated()` (o equivalente) y hasta entonces muestran el estado neutro.
- [ ] **Step 3:** `/wiki/registro` (`revalidate = 3600`).
  - **Server component:** `h1` "Registro del archivo", una línea de texto, `RegistroProgress` (cliente) y una `Section` por grupo con `RegistroGrid`.
  - **`RegistroProgress`:**
    - "Has abierto N de T expedientes", con una barra `role="meter"` y `aria-valuenow`/`aria-valuemin`/`aria-valuemax`;
    - antes de hidratar, "Abre expedientes para completar tu registro";
    - enlace "Expediente aleatorio ›" a `/wiki/aleatorio`, que crea la tarea 4.
  - **`RegistroGrid`:**
    - rejilla `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` de `ContentCard`, cada una con `href`, `title`, `meta` = categoría, imagen y `pending` si está sellada;
    - un componente cliente marca cada tarjeta por `data-slug` sin cambiar su tamaño:
      - sin abrir: la imagen en `grayscale opacity-60` y el texto "Sin abrir";
      - abierta: "Abierto" en texto;
      - sellada: "Próximamente", que ya pinta `ContentCard`.
    - Para no tocar `ContentCard`, envuelve cada tarjeta en un `div` con `data-slug` y aplica las clases con un selector CSS sobre el `img` interno, o pásalas por props si añades una prop **aditiva** `className` a la imagen. Documéntalo en el informe.
  - **Al final,** la `Section` "Pendiente de desclasificar", con una lista de enlaces de texto a las fichas selladas.
- [ ] **Step 4:** en el menú lateral, añade "Registro del archivo" → `/wiki/registro` en "Sitio principal". Debajo de la presentación de "Archivo", añade la línea "Tu registro · N/T ›" (`RegistroLink`), que lleva a `/wiki/registro`. El enlace aleatorio lo añade la tarea 4.
- [ ] **Step 5:** Validar y commit `feat(wiki): registro del archivo con expedientes vistos (en el navegador)`.

---

### Task 3: Expediente sellado, medidor y voto "desclasificar"

**Files:**
- Crea:
  - `src/core/search/section-completeness.ts` + `tests/search/section-completeness.test.ts`;
  - `src/features/monsters/components/wiki/article/ExpedienteSellado.tsx`;
  - `src/features/monsters/components/wiki/article/ArchivoMeter.tsx`.
- Modifica:
  - `src/features/monsters/components/wiki/article/WikiArticleContent.tsx`;
  - `src/core/content/schemas.ts`, `src/core/content/validate.ts` y `scripts/check-content.mts` (la parte de encuestas);
  - `src/features/community/lib/poll-schedule.ts` (`PollDef` lleva `tipo`), `src/features/community/components/PollTile.tsx`, `src/features/marketing/sections/CommunityStrip.tsx` y `src/content/encuestas.json`;
  - los tests `tests/content/schemas.test.ts`, `tests/content/validate.test.ts` y `tests/community/poll-schedule.test.ts`.

**Interfaces:**
- `sectionCompleteness(mdx: string): { done: number; total: number; pending: string[] }`:
  - recorre los `##` del cuerpo, excluyendo "Referencias";
  - un apartado está pendiente si, hasta el siguiente `##`, contiene `<Proximamente` y ningún otro párrafo de texto, entendido como una línea no vacía que no sea una etiqueta JSX ni un comentario.
- En `CuratedPollSchema`: `tipo: z.enum(['duelo','desclasificar']).default('duelo')`.
- `PollDef`: `tipo: 'duelo' | 'desclasificar'`. La rotación automática siempre genera `'duelo'`.

**Pasos:**
- [ ] **Step 1 (TDD):** tests de `sectionCompleteness`:
  - un apartado solo con `<Proximamente />` cuenta como pendiente;
  - un apartado con texto y `<Proximamente />` cuenta como hecho;
  - "Referencias" queda excluido;
  - sin `##` → `{ done: 0, total: 0, pending: [] }`.

  Comprueba que fallan e implementa hasta que pasen.
- [ ] **Step 2: `ExpedienteSellado`** (server), que en `WikiArticleContent` sustituye al bloque `<Proximamente />` cuando `status === 'proximamente'`:
  - superficie `crystal-surface` con un sello "EXPEDIENTE SELLADO" (borde y texto `primary/70`, girado −4°, `aria-hidden`; el texto accesible va aparte);
  - "Boris aún no ha desclasificado este expediente.";
  - el cuerpo MDX canónico que tenga se sigue renderizando encima, como hoy;
  - acciones (enlaces de texto de 44 px):
    - "Pide que se desclasifique" → `/comunidad`, solo si la encuesta de esta semana es de tipo `desclasificar` e incluye este slug (usa `getWeeklyPoll()`);
    - "Sigue el canal" → YouTube, `target=_blank`;
    - "Ver el registro" → `/wiki/registro`.
- [ ] **Step 3: `ArchivoMeter`**: solo en las fichas que no son Próximamente, con `total ≥ 2` y `pending.length ≥ 1`, bajo la entradilla. Lleva:
  - el texto "Archivo · N de T apartados desclasificados";
  - una barra `role="meter"`;
  - "Pendiente: A, B".

  Móntalo en `WikiArticleContent`, en la parte superior del cuerpo.
- [ ] **Step 4: encuesta "desclasificar"**
  - **Esquema y validación:**
    - `crossCheckPolls`: si `tipo === 'desclasificar'`, a y b deben ser artículos con `status: proximamente`; si es `duelo`, se mantiene lo de hoy (deben tener `stats`).
    - Tests: el valor por defecto es `duelo`; una `desclasificar` con un artículo que no está sellado da error.
  - **`PollDef`:** propaga `tipo` desde la encuesta curada.
  - **`PollTile`,** cuando `tipo === 'desclasificar'`:
    - pregunta por defecto "¿Qué expediente quieres que Boris desclasifique primero?", o `pregunta` si está curada;
    - las opciones llevan el título y "Próximamente", sin el enlace a la Arena;
    - la nota "Tu voto es una señal para Boris, no una promesa de publicación.";
    - la API de voto no cambia.
  - **`CommunityStrip`:** si la encuesta es `desclasificar`, el texto pasa a "Votación de la semana: ¿qué expediente se desclasifica primero? Votar ›".
  - **Contenido:** añade a `encuestas.json` la entrada `{ "semana": "2026-W45", "tipo": "desclasificar", "a": "cael-cortes", "b": "aodos-ay01" }`.
- [ ] **Step 5:** Validar y commit `feat(wiki): expediente sellado, medidor de apartados y voto para desclasificar`.

---

### Task 4: Bucles — aleatorio, siguiente/anterior y vista previa

**Files:**
- Crea:
  - `src/core/search/nav-neighbors.ts` + `tests/search/nav-neighbors.test.ts`;
  - `src/core/search/random-pick.ts` + `tests/search/random-pick.test.ts`;
  - `src/app/(wiki)/wiki/aleatorio/route.ts`;
  - `src/features/monsters/components/wiki/article/ArticleNeighbors.tsx`;
  - `src/features/monsters/components/wiki/article/EntityPreview.tsx`.
- Modifica:
  - `src/components/search/SearchPalette.tsx`: fila "Expediente aleatorio" en el estado sin consulta y en el vacío;
  - `src/components/sidebar/components/SidebarNavigation.tsx`: solo la entrada "Expediente aleatorio". Coordínate: la tarea 2 añade "Registro del archivo" en el mismo archivo. Añade tu entrada justo debajo de "Inicio"/"Universos", y si ves cambios de la tarea 2, no los toques.
  - `src/features/monsters/components/wiki/WikiExplorerSection.tsx`: solo "Expediente aleatorio ›" en la línea de texto que crea la tarea 2. Si aún no existe, añádelo como enlace propio en esa posición y documéntalo.
- **No toques** `page.tsx` de la ficha: el orquestador monta `ArticleNeighbors` y `EntityPreview`.

**Interfaces:**
- `navNeighbors(slug: string, nav: readonly NavGroupLike[]): { group: string; prev?: { title; url }; next?: { title; url } } | null`.
  - Busca el grupo padre que contiene `/wiki/<slug>` y devuelve sus vecinos con vuelta circular.
  - Un grupo de un solo elemento devuelve `group` sin `prev` ni `next`.
  - Un slug que no está en el menú devuelve `null`.
  - El tipo `NavGroupLike` es estructural (`{ title: string; url: string; items?: NavGroupLike[] }`), para que el módulo sea puro.
- `pickRandom<T>(items: readonly T[], rng: () => number): T | undefined`.
- `GET /wiki/aleatorio`:
  - `export const dynamic = 'force-dynamic'`;
  - candidatas: las entradas de `getEntityIndex()` que no son índice (`isIndexCategory`) ni `proximamente`;
  - responde con `NextResponse.redirect(new URL('/wiki/' + slug, request.url), 307)`.

**Pasos:**
- [ ] **Step 1 (TDD):** tests de los dos módulos puros:
  - `navNeighbors`: vuelta circular, grupo de un solo elemento, slug fuera del menú y grupos anidados (Personajes › Animales);
  - `pickRandom`: con un rng fijo devuelve el elemento esperado; con la lista vacía, `undefined`.

  Comprueba que fallan e implementa hasta que pasen.
- [ ] **Step 2:** el route handler. Comprueba con `curl -sI` en la QA del orquestador; no levantes servidor tú.
- [ ] **Step 3: `ArticleNeighbors`** (server), con props `{ slug }`:
  - usa `navNeighbors(slug, WIKI_NAVIGATION)`;
  - es una fila de dos enlaces de texto de 44 px: "‹ \<Anterior\>" y "Siguiente en \<Grupo\>: \<Siguiente\> ›";
  - en el móvil va apilada, con el siguiente primero;
  - sin vecinos, no renderiza nada.
- [ ] **Step 4: `EntityPreview`** (cliente), una vista previa al pasar por los enlaces `a[data-entity]` dentro de `[data-article-body]`:
  - solo con `(hover: hover) and (pointer: fine)`;
  - delegación de eventos;
  - aparece tras 300 ms de hover, o al momento con foco de teclado; se oculta al salir, con Esc o con scroll;
  - tarjeta `#061a2e` con borde `white/15` y `max-w-xs`: miniatura 16:9 (o el placeholder), título, "Categoría · Universo", la `description` recortada a 3 líneas y "Próximamente" si procede;
  - los datos salen de `useQuery(['wiki-index'], getWikiIndex)`, el mismo de la paleta;
  - `position: fixed`, debajo o encima del enlace según el espacio;
  - `role="tooltip"` y `aria-describedby` en el enlace mientras está visible.
- [ ] **Step 5: entradas a "Expediente aleatorio"**: en la paleta, el menú lateral y la línea de "Archivo".
- [ ] **Step 6:** Validar y commit `feat(wiki): expediente aleatorio, siguiente/anterior y vista previa de enlaces`.

---

### Task 5: "Aparece en" (vídeos ↔ fichas)

**Files:**
- Crea:
  - `src/core/search/video-links.ts` + `tests/search/video-links.test.ts`;
  - `src/content/videos.json`;
  - `src/features/community/data/channel-videos.ts`;
  - `src/features/monsters/components/wiki/article/ApareceEn.tsx`.
- Modifica:
  - `src/features/community/data/latest-video.ts`, para compartir el fetch del RSS;
  - `src/core/content/schemas.ts` + `validate.ts` + `scripts/check-content.mts`, para validar `videos.json`;
  - `src/core/content/{types,file-repository}.ts`, para `getVideoLinks()`.
- **No toques** `page.tsx`: lo monta el orquestador.

**Interfaces:**
- `videos.json`: `[{ "id": "<11 caracteres>", "fichas": ["slug", …] }]`.
  - Contenido inicial: `[{ "id": "hedUAqopPBg", "fichas": ["the-bloop", "el-gran-maja"] }]`. Es una relación factual: el título del vídeo nombra a los dos.
  - `check:content` valida el formato del id (`/^[A-Za-z0-9_-]{11}$/`) y que los slugs existan.
- `linkVideos(videos: { id; title }[], index: EntityIndex, manual: { id; fichas }[]): Map<slug, { id; title }[]>`: une `findMentions(video.title, index)` con las relaciones manuales, sin duplicados y en el orden de los vídeos.
- `getChannelVideos(): Promise<{ id; title; published? }[]>`: `FEATURED_VIDEOS` más las entradas del RSS, sin duplicados por id. Si el RSS falla, solo los destacados. Hoy el RSS de YouTube devuelve 404, así que el respaldo es lo normal.
- `ApareceEn({ videos })` (server):
  - `Section` "Aparece en", sin contenedor propio;
  - fila de hasta 4 `ContentCard` con `external`, miniatura `https://i.ytimg.com/vi/<id>/mqdefault.jpg`, título del vídeo y `lines=1`;
  - sin vídeos, no renderiza nada.

**Pasos:**
- [ ] **Step 1 (TDD):** tests de `linkVideos`:
  - relación por título (un título con un nombre propio de una sola palabra en mayúscula);
  - relación manual;
  - sin duplicados;
  - un vídeo sin relaciones no aparece.
- [ ] **Step 2:** `videos.json`, su esquema y la validación, con tests: un id inválido o un slug que no existe dan error.
- [ ] **Step 3:** `getChannelVideos` y `getVideoLinks` en el repositorio; `ApareceEn`.
- [ ] **Step 4:** Validar y commit `feat(wiki): bloque "Aparece en" con los vídeos donde sale cada ficha`.

---

### Task 6: Cableado, QA y entrega (orquestador)

- [ ] En `src/app/(wiki)/wiki/[slug]/page.tsx`:
  - monta `<MarkSeen slug>`, `<EntityPreview />`, `<ArticleNeighbors slug>` (después del cuerpo y antes de los relacionados) y `<ApareceEn videos>` (antes de `ArticleNeighbors`);
  - obtén los vídeos con `getVideoLinks()`.
- [ ] Ejecuta `npm run lint && npm test && npm run check:content && npm run build` y `next start -p 3131`.
- [ ] QA con Chrome DevTools a 390 y 1440:
  - Cael Cortés: expediente sellado; Bogbo o Porcia: medidor, si su MDX tiene apartados pendientes;
  - registro: abrir 3 fichas → "Has abierto 3 de T"; probarlo también sin `localStorage`;
  - `/wiki/aleatorio`: varias peticiones dan fichas distintas y nunca selladas;
  - siguiente/anterior en El Gran Majá;
  - vista previa con ratón y con teclado;
  - "Aparece en" en El Gran Majá y en The Bloop;
  - `/wiki/slowdown-criyote` → 308, y `/wiki/arena?a=slowdown-criyote` funciona;
  - la encuesta W45 valida;
  - Lighthouse 100 en `/wiki/registro`, `/wiki/cael-cortes` y `/wiki/el-gran-maja`, en móvil y escritorio.
- [ ] Capturas en `docs/audits/2026-10-18-experiencia-fan/ola-c/` + README.
- [ ] Revisión final de toda la rama, una ronda de correcciones y una re-revisión.
- [ ] PR "Closes #51", CI, squash merge, borrar la rama y cerrar la épica #52.

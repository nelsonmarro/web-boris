# UX fan · Ola C (enganche) — diseño

**Issue:** #51 (épica #52). **Auditoría:** `docs/audits/2026-10-18-experiencia-fan/README.md`, hallazgos #5, #7, #14, #15 y #16.
**Depende de la Ola B** (`docs/superpowers/specs/2026-10-18-ux-fan-ola-b-design.md`): el índice de entidades (`src/core/search/entity-index.ts`), `findMentions`, la paleta global, `getWikiIndex` con `richness` y los enlaces automáticos (`data-entity`).
**Objetivo:** que el fan tenga razones para seguir, volver y compartir:
- ve personajes desde la primera pantalla;
- salta del vídeo a la ficha y de la ficha al vídeo;
- lo que falta le da curiosidad en vez de decepción;
- el archivo le propone siempre un siguiente paso.

**Rama:** `feat/ux-fan-ola-c`, creada desde `main` después de fusionar la Ola B.

## Restricciones globales

Las mismas que la Ola B:
- solo canon y sin dependencias nuevas;
- "ley Abisal": superficies sólidas `#061a2e`, naranja solo para indicadores, texto ≥ 11 px, objetivos táctiles ≥ 44 px, `outline-hidden`, `motion-reduce:`;
- Next 16 (`as Route`, `fetchPriority`/`loading`);
- lógica pura testeable con `node:test`;
- validar con `tsc`, `lint`, `test`, `check:content` y `build`.

Restricciones propias de esta ola:
- **Estado del fan solo en el navegador:** Zustand con `persist` en `localStorage`, clave `wb-registro`. Todas las páginas siguen siendo estáticas o ISR y no leen el estado en el servidor. Si `localStorage` falla (modo privado, bloqueos), el sitio funciona sin progreso: hay que envolver en try/catch y no lanzar errores.
- **Textos de intriga solo factuales:** "Boris aún no ha desclasificado este expediente", "Pendiente de registro" y similares. Nunca insinuar trama ni explicar por qué algo está oculto.

## 1. Piezas

| Unidad | Ubicación | Responsabilidad |
|---|---|---|
| `registro-store.ts` | `src/features/monsters/store/` | Store `persist` con `seen: Record<slug, isoDate>`, `markSeen(slug)` y `hasSeen` |
| `MarkSeen` | `…/wiki/article/` | Componente cliente que llama `markSeen(slug)` al montar la ficha |
| `registro.ts` | `src/core/search/` (puro) | `registroEntries(index)` y `progress(entries, seen)` |
| `/wiki/registro` | `src/app/(wiki)/wiki/registro/page.tsx` | Página del Registro del archivo (ISR) |
| `section-completeness.ts` | `src/core/search/` (puro) | `sectionCompleteness(mdx)` → `{ done, total, pending: string[] }` |
| `ExpedienteSellado`, `ArchivoMeter` | `…/wiki/article/` | Presentación de las fichas `status: proximamente` y medidor de apartados |
| `nav-neighbors.ts` | `src/core/search/` (puro, recibe la navegación como argumento) | `navNeighbors(slug, nav)` → `{ group, prev, next }` |
| `/wiki/aleatorio` | `src/app/(wiki)/wiki/aleatorio/route.ts` | Redirección 307 a una ficha al azar (sin caché) |
| `random-pick.ts` | `src/core/search/` (puro) | `pickRandom(entries, rng)` |
| `EntityPreview` | `…/wiki/article/` | Vista previa al pasar el ratón por los enlaces `data-entity` (escritorio) |
| `videos.ts` (datos) | `src/core/content/` | `getChannelVideos()` y `videosForEntity(slug)` |
| `video-links.ts` | `src/core/search/` (puro) | `linkVideos(videos, index, manual)` → `Map<slug, Video[]>` |
| `src/content/videos.json` | contenido | Relaciones vídeo → fichas que confirme Boris |
| `ApareceEn` | `…/wiki/article/` | Bloque "Aparece en" de la ficha |
| `CharacterStrip`, `MobileHeroMedia` | `src/features/marketing/components/` | Primera pantalla móvil de la landing |
| `tipos.ts` | `src/features/monsters/config/` | Agrupación del filtro "Tipo" del explorador |

## 2. Primera pantalla móvil de la landing (< md)

- **`HomeMosaic`:**
  - En móvil, el hero lleva arriba `MobileHeroMedia`: la imagen de la criatura de la semana (`pickFeatured(articles)`) a sangre, con `aspect-[16/10]` y `fetchPriority="high"` + `loading="eager"`, porque es el LCP en móvil.
  - Debajo de la imagen, el eyebrow-enlace "Criatura de la semana · \<Nombre\> ›" lleva a la ficha.
  - Luego siguen el h1, el párrafo, el buscador, el CTA y la línea de cifras, como hoy, sobre fondo sólido.
  - La tile `CreatureOfWeekTile` del mosaico se oculta en móvil (`hidden md:flex`).
  - **Desde md no cambia nada.**
- **`CharacterStrip`** (solo < md), justo después del hero:
  - rótulo "Personajes" y enlace "Ver todos" a `/wiki/registro`;
  - fila deslizable con scroll-snap (`w-[42%]`, para que asome la siguiente);
  - entran las fichas con portada no de marca, no Próximamente, de categoría `Coloso`, `Titán`, `Animal`, `Humano` o `Entidad`, ordenadas por `richness`;
  - cada tarjeta lleva imagen 3:4 con `imagePosition`, título y categoría;
  - la última tarjeta es "Ver todos los expedientes ›".
- **"Explora los universos"** (`UniversePreviewSection` / `FlipCard`):
  - en móvil pasa a carrusel horizontal (`w-[80%]`, snap) con la sinopsis visible siempre, sin volteo ni "toca para ver", y el enlace al universo;
  - en escritorio sigue igual.
- **"Personajes destacados"** (`FeaturedCharactersSection`): `hidden md:block`.
- **Objetivo medible:** la altura total de la landing a 390 px baja de 12 909 px a menos de 8 000 px.

## 3. Vídeos ↔ fichas

- **`getChannelVideos()`:**
  - Une `FEATURED_VIDEOS` (`src/features/marketing/config/videos.ts`) con las entradas del RSS. `parseYoutubeFeed` ya devuelve todas; se reutiliza el fetch de `latest-video.ts` (revalidate 3600, timeout 4 s), refactorizado para compartirlo.
  - Quita duplicados por `id`.
  - Si el RSS falla, se usan solo los destacados.
- **`src/content/videos.json`:** `[{ "id": "<11 chars>", "fichas": ["slug", …] }]`. Empieza vacío (`[]`). Lo valida `check:content`: id con el formato de YouTube y slugs existentes.
- **`linkVideos(videos, index, manual)`:**
  - ficha ← `findMentions(video.title, index)`, con la regla del nombre propio de la Ola B;
  - más las relaciones manuales de `videos.json`;
  - sin duplicados.
  - Ejemplo de hoy: "Colosos - The Bloop vs El Gran Majá - La Batalla" se asocia a `the-bloop` y `el-gran-maja`. Ojo: el índice debe reconocer "The Bloop" dentro de "The Bloop vs…". Como "The Bloop" no es apodo (lo confirma Boris en #41) y el título completo es "The Bloop Ojo Solo", **esa relación entra por `videos.json`**, que se rellena con este vídeo como única entrada inicial: `{ "id": "hedUAqopPBg", "fichas": ["the-bloop", "el-gran-maja"] }`. Es una relación factual, porque el título nombra a ambos.
- **`ApareceEn`, en la ficha:**
  - va después del cuerpo y antes de "Siguiente" y de los relacionados;
  - título "Aparece en" y lista horizontal de miniaturas (`i.ytimg.com/vi/<id>/mqdefault.jpg`, 16:9, sin bandas) con el título del vídeo;
  - cada una enlaza a YouTube con `target="_blank"`, `rel="noopener noreferrer"` y el texto oculto "(se abre en YouTube)";
  - solo se muestra si hay al menos un vídeo.
- **Tarjetas de vídeo** de la landing (`FeaturedVideosSection`) y de `/comunidad` (`LatestVideoTile`):
  - si el vídeo tiene fichas, debajo aparecen chips "Lee el expediente: \<Ficha\>" (enlaces internos);
  - si son exactamente dos y ambas tienen `stats`, se añade "Recrea el duelo en la Arena" (`/wiki/arena?a=&b=`).
  - Ahí van los vídeos con imagen `i.ytimg.com`; ya está en `remotePatterns`.

## 4. Próximamente como intriga

- **`ExpedienteSellado`** sustituye a la presentación actual de las fichas con `status: proximamente`. Lo decide `WikiArticleContent` y se ve en todos los anchos.
  - Tarjeta `crystal-surface` con un sello girado "EXPEDIENTE SELLADO" (borde y texto `primary/70`, `uppercase`, `tracking`, `aria-hidden`; el texto accesible va aparte).
  - Datos conocidos: universo, categoría y `description` si existe; portada si existe y no es de marca, si no el placeholder por categoría.
  - El cuerpo canónico que ya tenga el MDX, aunque sean 11 palabras, se renderiza dentro.
  - Texto fijo: "Boris aún no ha desclasificado este expediente."
  - Acciones:
    - si la encuesta de la semana es de tipo `desclasificar` e incluye esta ficha, "Pide que se desclasifique" → `/comunidad#encuesta`;
    - siempre, "Sigue el canal" (YouTube) y "Ver el registro" (`/wiki/registro`).
- **`sectionCompleteness(mdx)`:**
  - cuenta los `##` del cuerpo, excluyendo "Referencias";
  - un apartado está pendiente si su contenido, hasta el siguiente `##`, contiene `<Proximamente` y ningún otro párrafo de texto;
  - devuelve `{ done, total, pending: [títulos] }`.
- **`ArchivoMeter`:**
  - en las fichas que no son Próximamente y tienen `total ≥ 2` y `pending.length ≥ 1`, bajo la descripción;
  - muestra "Archivo · 3 de 4 apartados desclasificados", una barra (`role="meter"` con `aria-valuenow`, `aria-valuemin` y `aria-valuemax`) y "Pendiente: Alimentación";
  - en las fichas completas no se muestra.
- **Encuesta "desclasificar":**
  - `CuratedPollSchema` gana `tipo: z.enum(['duelo', 'desclasificar']).default('duelo')`.
  - `crossCheckPolls`: `duelo` exige `stats` en a y b (igual que hoy); `desclasificar` exige `status: proximamente` en ambas.
  - La rotación automática (`poll-schedule`) solo genera duelos.
  - `PollTile` y `PollTeaserTile` con `tipo: desclasificar`:
    - pregunta por defecto "¿Qué expediente quieres que Boris desclasifique primero?";
    - opciones con título y sello, sin barra de la Arena ni enlace "Ver el duelo en la Arena";
    - nota fija "Tu voto es una señal para Boris, no una promesa de publicación.".
  - La API de voto y el modelo `PollVote` no cambian: siguen votando a o b por semana.
  - Se añade a `encuestas.json` `{ "semana": "2026-W45", "tipo": "desclasificar", "a": "cael-cortes", "b": "aodos-ay01" }`.

## 5. Registro del archivo (`/wiki/registro`)

- **`registroEntries(index)`:** devuelve todas las entradas cuya `category` no es `Directorio` ni `Categoría`, agrupadas por tipo (§7) y ordenadas por `richness`. **El total que cuenta para el progreso** son las que no tienen `status: proximamente`.
- **Página:**
  - con ISR (`revalidate = 3600`); se renderiza en el servidor sin estado;
  - cabecera "Registro del archivo" (h1) con "Has abierto N de T expedientes" y una barra; antes de hidratar o sin `localStorage`, el texto es "Abre expedientes para completar tu registro";
  - rejilla por grupo (2 columnas en móvil, 4–6 en escritorio) con tarjetas de imagen cuadrada o placeholder, título y estado;
  - **sin abrir:** imagen `grayscale` + `opacity-60` y etiqueta "Sin abrir";
  - **abierta:** a color, con ✓ y "Abierto" (texto, no solo icono);
  - **sellada:** sello y "Sellado". No cuenta para el total.
  - El estado lo aplica en el cliente un componente que lee el store y marca las tarjetas por `data-slug`, sin cambiar el layout para evitar CLS.
  - Al final, la sección "Pendiente de desclasificar": fichas selladas y fichas con apartados pendientes (de `sectionCompleteness`), con enlaces.
- **`MarkSeen`:** se monta en `[slug]/page.tsx` y marca la ficha al abrirla. Las selladas también se marcan, aunque no sumen.
- **Entradas a la página:**
  - el "Ver todos" de `CharacterStrip`;
  - el enlace "Registro del archivo" en la sección "Sitio principal" del menú lateral de la wiki;
  - un contador pequeño "Tu registro · N/T" en `WikiHomeMosaic`, dentro de la tile del archivo central bajo el buscador;
  - el "Ver el registro" de `ExpedienteSellado`.

## 6. Bucles de descubrimiento

- **Expediente aleatorio:**
  - `GET /wiki/aleatorio` (route handler con `dynamic = 'force-dynamic'`) redirige con 307 a `/wiki/<slug>`;
  - `pickRandom` elige entre las fichas de `registroEntries` que no son Próximamente; el rng se inyecta para los tests;
  - accesos: un botón "Expediente aleatorio" (icono `Shuffle`) en la paleta (vacía y sin resultados), en la tile del archivo central de `WikiHomeMosaic` y en la cabecera de `/wiki/registro`.
- **Siguiente y anterior:**
  - `navNeighbors(slug, WIKI_NAVIGATION)` devuelve el grupo padre y los hermanos anterior y siguiente, con vuelta circular dentro del grupo; sin vecinos si el grupo tiene un solo elemento;
  - en la ficha, después de "Aparece en" y antes de los relacionados, va una barra "‹ \<Anterior\>" a la izquierda y "Siguiente en \<Grupo\>: \<Siguiente\> ›" a la derecha;
  - en móvil, dos botones a ancho completo apilados, con el siguiente primero.
- **Vista previa al pasar el ratón (`EntityPreview`):**
  - solo con `(hover: hover) and (pointer: fine)`;
  - delegación de eventos sobre el cuerpo del artículo para los `a[data-entity]` que pone el plugin de la Ola B;
  - aparece tras 300 ms de hover o al instante con foco de teclado; se oculta al salir, con Esc o con scroll;
  - tarjeta `#061a2e`, borde `white/15` y `max-w-xs`, con miniatura 16:9, título, "Universo · Categoría", la `description` recortada a 3 líneas y el chip Próximamente;
  - los datos salen del índice que ya usa la paleta (TanStack Query `['wiki-index']`), sin peticiones nuevas por enlace;
  - se posiciona bajo o sobre el enlace según el espacio, sin librería: `getBoundingClientRect` + `position: fixed`;
  - `role="tooltip"`, y el enlace lleva `aria-describedby` mientras está visible.
- **Novedades del archivo:**
  - en la portada de la wiki, entre el mosaico y el explorador, una fila "Novedades del archivo" con las 3 últimas de `getContentRepository().getNews(3)`;
  - reutiliza el formato de `NewsTile`: fecha, título, resumen y enlace.

## 7. Taxonomía y nombres

- **`tipos.ts`** define los grupos del filtro "Tipo" del explorador. Las `category` del frontmatter no cambian.

  | Grupo (`?tipo=`) | Etiqueta | Categorías |
  |---|---|---|
  | `criaturas` | Criaturas | Coloso, Titán, Animal |
  | `personajes` | Personajes | Humano, Entidad |
  | `especies` | Especies | Especie |
  | `organizaciones` | Organizaciones | Organización |
  | `vehiculos` | Vehículos | Vehículo |
  | `historia` | Historia y libros | Historia, Libro |

  - `Directorio` y `Categoría` no entran en ningún grupo.
  - El explorador sustituye `?category=` por `?tipo=` (no hay enlaces publicados que lo usen; el sitio aún no está desplegado). `getFilterOptions` devuelve solo los grupos con contenido.
  - Los grupos también ordenan las secciones de `/wiki/registro`.
- **Slug de Criyonte:**
  - `git mv src/content/slowdown-criyote.mdx src/content/slowdown-criyonte.mdx`;
  - actualizar todas las referencias: `wiki-navigation.ts`, `arena.ts` (`SILHOUETTE_BY_SLUG` y otras), `encuestas.json`, `colosos.mdx`, `animales-colosos.mdx`, `phiscanula-arcticum.mdx` y los tests `tests/content/schemas.test.ts` y `tests/community/poll-schedule.test.ts`;
  - `next.config.ts` añade `redirects()`: `/wiki/slowdown-criyote` → `/wiki/slowdown-criyonte`, permanente;
  - `ArenaSimulator` acepta el slug antiguo en `?a=` / `?b=` mediante un mapa `LEGACY_SLUGS` y reescribe la URL;
  - fuente: el PDF, el docx y el esquema de Boris dicen "Criyonte" (`memory`: canon-sources).

## 8. Pruebas (`node:test`, `tests/search/` y `tests/content/`)

- **`registro.test.ts`:** quedan fuera Directorio y Categoría; los sellados no cuentan para el total; `progress` ignora los slugs desconocidos y los sellados.
- **`section-completeness.test.ts`:**
  - apartado con solo `<Proximamente />` → pendiente;
  - apartado con texto y `<Proximamente />` → hecho;
  - "Referencias" excluido;
  - sin `##` → `total = 0`.
- **`nav-neighbors.test.ts`:** vuelta circular; grupo de un elemento → sin vecinos; slug que no está en el menú → `null`.
- **`random-pick.test.ts`:** con un rng fijo devuelve la entrada esperada; nunca devuelve sellados ni directorios.
- **`video-links.test.ts`:** relación por título (con un título que nombre una entidad de una palabra en mayúscula); relación manual; sin duplicados; un vídeo sin relaciones no aparece.
- **`tipos.test.ts`:** cada categoría usada en el contenido pertenece a lo sumo a un grupo; Directorio y Categoría a ninguno.
- **`schemas.test.ts` / `validate.test.ts`:**
  - `tipo` por defecto `duelo`;
  - `desclasificar` con a o b que no son Próximamente → error;
  - `videos.json` con un id o un slug inválidos → error.

## 9. QA (orquestador, Chrome DevTools, a 390 y 1440)

1. **Landing a 390:**
   - la imagen de la criatura en la primera pantalla;
   - la tira de personajes visible al hacer el primer scroll;
   - el carrusel de universos con la sinopsis visible;
   - sin "Personajes destacados";
   - altura < 8 000 px;
   - a 1440, la landing no cambia (comparar con la captura `despues-landing-1440.webp` del crystal look).
2. **Vídeos:** El Gran Majá y The Bloop muestran "Aparece en" con la batalla; la tarjeta de la batalla en la landing ofrece "Lee el expediente" × 2 y "Recrea el duelo", con destino `?a=the-bloop&b=el-gran-maja`.
3. **Cael Cortés:** muestra "Expediente sellado". Bogbo y Porcia muestran el `ArchivoMeter` (si su MDX tiene apartados pendientes).
4. **Registro:**
   - abrir 3 fichas y volver: "Has abierto 3 de T", con esas tres a color y ✓;
   - en modo privado o con `localStorage` bloqueado (simulado lanzando en `setItem`), la página no rompe.
5. **Aleatorio:** `/wiki/aleatorio` redirige a fichas distintas en varias peticiones y nunca a una sellada.
6. **Siguiente/anterior** en El Gran Majá (grupo Animales); la vista previa en escritorio sobre un enlace automático, con ratón y con teclado.
7. **Encuesta:** `encuestas.json` W45 valida; `PollTile` con `tipo: desclasificar` se renderiza bien (forzando la semana en dev o con un test de render si no hay base de datos).
8. **Explorador:** `?tipo=criaturas` filtra; el selector muestra los grupos.
9. **Redirección:** `/wiki/slowdown-criyote` → 308 a `/wiki/slowdown-criyonte`; `/wiki/arena?a=slowdown-criyote` funciona.
10. **Lighthouse:** accesibilidad 100 en `/`, `/wiki/registro`, `/wiki/el-gran-maja` y `/wiki/cael-cortes`, en móvil y escritorio. Consola limpia.
11. **Evidencia:** capturas en `docs/audits/2026-10-18-experiencia-fan/ola-c/`.

## 10. Fuera de alcance

- cuentas de usuario y sincronización del registro entre dispositivos;
- insignias o logros;
- mapa interactivo;
- grafo visual de relaciones;
- citas `WikiQuote` (dependen de Boris, #41);
- nuevos apodos sin fuente.

## 11. Entrega

1. Un plan en `docs/superpowers/plans/2026-10-18-ux-fan-ola-c.md`. Las tareas se agrupan por archivos disjuntos:
   - taxonomía y slug (§7);
   - landing móvil (§2);
   - vídeos (§3);
   - intriga y registro (§4, §5);
   - bucles (§6);
   - QA.
   La tarea de taxonomía y slug va primero, porque mueve archivos que tocan las demás.
2. PR "Closes #51", CI, squash merge y borrar la rama. Al terminar, cerrar la épica #52.

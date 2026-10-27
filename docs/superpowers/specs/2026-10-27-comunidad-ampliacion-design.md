# Ampliación del hub `/comunidad` — diseño

Fecha: 2026-10-27. Pedido por Nelson: «siento que tiene pocas cosas»; novedades primero y más llamativas; añadir el paquete 1–5 (resultado de la semana pasada y palmarés, próximo duelo, expedientes más pedidos, más vídeos, tu registro). Amplía la spec `2026-10-18-hub-comunidad-design.md` (hub) sin cambiar su arquitectura ni el modelo de datos.

## 1. Objetivo

Que `/comunidad` cambie sola cada semana y dé más motivos para volver, usando solo datos que ya existen: las novedades, los votos guardados en `PollVote`, el calendario de encuestas, el RSS del canal y el registro del fan en `localStorage`. Nada de lore nuevo ni de contenido inventado; nada que dependa de Boris.

## 2. Orden de la página

Una columna, `max-w-3xl`, por importancia:

1. **Novedades** (destacada + lista).
2. **Encuesta de la semana** (`PollTile`), con «Próxima semana: A vs B» al pie.
3. **Criatura de la semana** (sin cambios).
4. **Últimos vídeos** (hasta 4; sustituye a «Último vídeo»).
5. **Resultado de la semana pasada**.
6. **Palmarés**.
7. **Expedientes más pedidos**.
8. **Tu registro**.

Las secciones 5–7 se cargan en el cliente (ver §4) y van bajo el pliegue para que su aparición no mueva lo que se ve al entrar. La 8 también es de cliente (estado neutro hasta hidratar, igual que `/wiki/registro`).

Intro nueva: «Lo último de BorisaoBlois, la votación de la semana y lo que más pide la comunidad.» (también en la `description` de los metadatos).

## 3. Novedades

- **Destacada:** la novedad más reciente sale como `ContentCard` a ancho completo (`aspect="video"`, `headingLevel={3}`, `eager`), con `meta` = fecha formateada, `description` = `resumen`, y enlace (`external` si es `https://`).
- **Imagen deducida**, sin cambiar el formato de las novedades (`src/content/novedades/*.md`): función pura `newsImage(entry, articlesBySlug)` en `src/features/community/lib/news-image.ts`:
  - enlace interno `/wiki/<slug>` (con `WIKI_LINK`) → `coverOf(article.frontmatter.image)` de esa ficha (y su `imagePosition` y `category` para el placeholder);
  - enlace de YouTube → `youtubeThumbUrl(id)` si se puede extraer un id de 11 caracteres (`watch?v=`, `youtu.be/`, `/shorts/`, `/live/`);
  - si no hay imagen, la tarjeta muestra el placeholder por categoría (`category` si la hay).
- **Lista:** el resto (hasta 4 más) en la `NewsList` actual. Con una sola novedad, solo la destacada. Sin novedades, el estado vacío actual.
- Sin chips ni eyebrows (ley Abisal). El título de la sección sigue siendo «Novedades».

## 4. Historial de votos

### Datos

Los ids de encuesta son `<semana>-<a>-vs-<b>` (`pollIdFor`). Todo el historial se deduce de `PollVote` con una sola consulta: `prisma.pollVote.groupBy({ by: ['pollId', 'option'], _count: { _all: true } })`.

Lógica pura en `src/features/community/lib/poll-history.ts` (imports relativos `.ts`, probada con node:test):

- `parsePollId(id)` → `{ week, a, b } | null`. `week` son los 8 primeros caracteres si cumplen `WEEK_KEY_REGEX`; el resto se parte por el **primer** `-vs-` (los slugs no contienen `-vs-`; lo garantiza `check:content`, ver §8). Devuelve `null` si no encaja.
- `summarizeHistory(rows, { currentPollId, curated, sealedSlugs, limit })` donde `rows: { pollId, option, count }[]`:
  - agrupa por `pollId`, descarta los que no parsean, el `currentPollId` y las filas con `option` ∉ {a, b};
  - `tipo` de cada encuesta: la curada de esa semana (`curated.find(semana === week && a && b coinciden)`) o `duelo`;
  - **`lastWeek`**: la encuesta pasada con la semana más alta (orden lexicográfico de `YYYY-Www` es cronológico) que tenga `total > 0`; con `tally = computeTally([a, b], counts)` y `winner` = opción con más votos o `null` si empate;
  - **`palmares`**: solo `duelo`; por slug, `wins` (encuestas ganadas; los empates no cuentan) y `duels` (encuestas en las que participó con `total > 0`); orden: `wins` desc, luego ratio `wins/duels` desc, luego slug asc; `limit` (5) entradas, solo con `wins ≥ 1`;
  - **`masPedidos`**: solo `desclasificar`; por slug, suma de votos en todas sus encuestas; solo slugs en `sealedSlugs` (siguen `status: proximamente`); orden: votos desc, slug asc; `limit` (5).
- Tipos exportados: `PollHistory = { lastWeek: LastWeekResult | null; palmares: PalmaresEntry[]; masPedidos: PedidoEntry[] }`.

### Endpoint

`GET /api/comunidad/historial` (`src/app/api/comunidad/historial/route.ts`): lee el `groupBy`, `getActivePoll()`, `repo.getCuratedPolls()` y los slugs sellados (`getArticles()` con `status === 'proximamente'`), llama a `summarizeHistory` y responde `Cache-Control: no-store`. Ante cualquier error, registra una línea (`[comunidad] no se pudo leer el historial:`) y responde `{ lastWeek: null, palmares: [], masPedidos: [] }` con 200: el historial es opcional y la página no debe romperse. Respuesta JSON: `PollHistory`; los títulos y retratos los pone el cliente con el mismo mapa `fighters` que ya recibe `PollTile`.

### Cliente

`PollHistoryTiles` (`src/features/community/components/PollHistoryTiles.tsx`, `'use client'`): `useQuery(['comunidad','historial'])` sin reintentos agresivos (`retry: 1`), `staleTime: 60_000`. Mientras carga o si falla, no pinta nada (están bajo el pliegue; un fallo no merece un aviso). Con datos, pinta hasta tres `Section` (`contained={false}`; importa `@/components/content/Section`):

- **Resultado de la semana pasada** (`id="semana-pasada"`): fila `crystal-surface` con los dos retratos (reutiliza el patrón de retrato de `PollTile`: extraer `FighterPortrait` a `src/features/community/components/FighterPortrait.tsx` y usarlo en ambos), porcentajes, «Ganó X» o «Empate», y «N votos». Si fue `desclasificar`: «La comunidad pidió desclasificar X (P %)». Si la encuesta pasada no tuvo votos, la sección no aparece.
- **Palmarés** (`id="palmares"`): lista ordenada (`ol`) de hasta 5: posición, retrato pequeño (48 px), título enlazado a la ficha, «N victorias · M duelos». Sin ganadores, no aparece.
- **Expedientes más pedidos** (`id="mas-pedidos"`): lista de hasta 5 fichas selladas: retrato, título enlazado, «N votos», y `PendingLabel`. Acción de sección: «Ver el registro ›» → `/wiki/registro`. Sin datos, no aparece.

Un slug que ya no exista en `fighters` (ficha renombrada o borrada) se omite de las listas y de «semana pasada» (si falta uno de los dos, la fila no se pinta).

## 5. Próximo duelo

`getWeeklyPoll(date)` ya acepta fecha: la página calcula `next = getCurrentPoll(curated, fighterSlugs, lunes de la semana siguiente)` (nueva función `getNextPoll(curated, fighterSlugs, date)` en `poll-schedule.ts`, que suma 7 días y delega). `PollTile` recibe `nextPoll?: PollDef | null` y, si existe, pinta al pie: «Próxima semana: A vs B» (o «Próxima semana: ¿A o B?» si es `desclasificar`), con títulos del mapa `fighters`. Es un teaser: si el emparejamiento automático cambia porque entra una ficha con `stats`, el lunes se corrige solo. ISR de 1 h, igual que la criatura.

## 6. Últimos vídeos

`getChannelVideos()` (destacados + RSS, ya en caché) ordenados por `published` desc; los sin fecha, al final en su orden. Función pura `latestVideos(videos, n)` en `src/features/community/lib/latest-videos.ts`. La sección «Últimos vídeos» (`id="videos"`, acción «Ver el canal ›» externa a `SOCIAL.youtube` de `src/features/marketing/config/social.ts`) pinta hasta 4 `ContentCard` externas en `grid gap-4 sm:grid-cols-2`, `headingLevel={3}`, `meta` = fecha si la hay. Con un solo vídeo (RSS caído y un destacado), una tarjeta `max-w-md` como ahora. `getLatestVideo` sigue para la landing.

## 7. Tu registro

`RegistroProgress` ya existe (`src/features/monsters/components/wiki/registro/RegistroProgress.tsx`) y recibe `slugs`. La sección «Tu registro» (`id="tu-registro"`, acción «Ver el registro ›» → `/wiki/registro`) lo reutiliza tal cual; la página pasa `registroSlugs((await getEntityIndex()).entries)`. Texto bajo el título, como en `/wiki/registro`: «El registro se guarda solo en este navegador.»

## 8. Validación y pruebas

- node:test: `poll-history.test.ts` (parseo, descarte del vigente, empates, orden del palmarés, sellados en «más pedidos», límite), `news-image.test.ts` (interno, YouTube en sus 4 formas, sin imagen), `latest-videos.test.ts` (orden por fecha, sin fecha al final, `n`), `poll-schedule.test.ts` (`getNextPoll` = la curada de la semana siguiente o el automático).
- `check:content`: rechaza un slug que contenga `-vs-` (nuevo), porque rompería `parsePollId`.
- QA con Chrome DevTools en el build de producción: 320/390/768/1280 px; sin desbordamiento; axe sin violaciones; historial con base vacía (no aparece nada y no hay errores), con votos de dos semanas (semana pasada + palmarés) y con una votación `desclasificar` pasada (más pedidos). El servidor de QA arranca siempre con `RESEND_API_KEY=re_qa_invalida CONTACT_EMAIL=qa-sin-envio@example.invalid`.
- `npm run lint`, `npm test`, `npm run check:content`, `npm run build`.

## 9. Fuera de alcance

Cuentas, comentarios, trivia, compartir el voto, novedades con imagen propia en el frontmatter, cambios en `PollVote` o migraciones, página de historial completo.

## 10. Seguimiento

Issue nuevo «Comunidad: novedades destacadas, historial de votos, próximo duelo, vídeos y registro» con esta spec; un PR; actualizar `CLAUDE.md` (sección del hub: orden, historial por `pollId`, endpoint, `-vs-` prohibido en slugs).

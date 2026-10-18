# Hub de la comunidad (`/comunidad`) — diseño

**Issue:** #10 · **Fecha:** 2026-10-18 · **Estado:** aprobado en conversación (secciones 1–3), pendiente de revisión del documento.

## 1. Objetivo

Una página pública, sin login, que dé motivos para volver cada semana: la criatura de la semana, el último vídeo de Boris, una encuesta "¿Quién gana?" con votos anónimos y las novedades del lore. El código debe quedar listo para dos evoluciones futuras **sin reescribir la UI**:

- **CMS:** el contenido (novedades, encuestas, artículos) pasa a gestionarse fuera del código.
- **Cuentas de usuario:** los votos se ligan a una cuenta (Auth.js + Prisma ya están configurados).

### Decisiones tomadas (Nelson, 2026-10-18)

| Tema | Decisión |
|---|---|
| Alcance de #10 | Opción 1: hub comunitario público (no espacio personal, no panel de edición) |
| Ubicación | Ruta nueva `/comunidad`, enlazada en la navbar; piloto del crystal look (#11) |
| Encuesta | Lista curada + rotación automática cuando no hay duelo curado |
| Anti-abuso | Cookie anónima + IP con hash (sin captcha) |
| Novedades | Entradas escritas a mano, una por archivo |
| Arquitectura | Enfoque A: repositorio de contenido + Server Components + votos en Postgres |
| Estética | `CrystalTile` con la piel abisal actual; el estilo cristal definitivo lo fija el spec de #11 |

### Fuera de alcance

Cuentas, login, panel de administración, CMS real, comentarios, histórico de encuestas ("resultado de la semana pasada"), notificaciones, captcha. Todo lo anterior queda posible sin migraciones destructivas.

## 2. Contexto existente que se reutiliza

- `pickFeatured(articles, date)` en `src/features/monsters/lib/featured.ts`: criatura de la semana por semana ISO (`isoWeek`), ya compartida por landing y wiki.
- Arena (`/wiki/arena?a=<slug>&b=<slug>`): enfrentamiento compartible; la encuesta enlaza a ella.
- `hasStats()` (`lib/stats.ts`): criterio de criatura "luchadora".
- `getAllArticles()` (`src/utils/mdx.ts`): lectura y validación de MDX con Zod.
- `FeaturedVideosSection`: lista de 3 vídeos del PDF de Boris y reproductor `<lite-youtube>`.
- `CategoryPlaceholder`, `ProximamenteChip`, `<Proximamente />`: placeholders de la ola 5.
- Infra: Prisma v7 con `@prisma/adapter-pg`, `src/lib/prisma.ts`; Postgres local por `docker compose`; producción en el VPS de Hostinger (KVM 2), donde Postgres es viable.

## 3. Arquitectura

```
src/core/content/                    ← punto de cambio para el CMS
  types.ts            NewsEntry, PollDef, ContentRepository
  file-repository.ts  implementación sobre archivos (reusa utils/mdx.ts)
  index.ts            getContentRepository(): hoy devuelve la de archivos

src/content/
  *.mdx               artículos (sin cambios)
  novedades/*.md      una novedad por archivo
  encuestas.json      duelos curados

src/features/community/
  lib/poll-schedule.ts   encuesta vigente (curada o automática), id estable
  lib/poll-results.ts    recuento → porcentajes
  lib/voter.ts           id anónimo, HMAC de voterKey e ipHash
  actions/cast-vote.ts   server action de escritura
  data/videos.ts         RSS del canal + respaldo estático
  components/            CrystalTile, CreatureOfWeekTile, LatestVideoTile, PollTile, NewsTile

src/app/(marketing)/comunidad/page.tsx      página (usa navbar y fondo de la landing)
src/app/api/comunidad/encuesta/route.ts     GET del estado de la encuesta (no cacheado)
```

### Reglas de dependencia

1. La UI no lee archivos ni Prisma: usa `getContentRepository()` (contenido) y la action / el route handler (votos).
2. `lib/poll-schedule.ts`, `lib/poll-results.ts` y los esquemas Zod son **funciones puras con imports relativos** (sin alias `@/`) para poder probarlas con `node:test` sin bundler.
3. Solo `cast-vote.ts`, el route handler y `voter.ts` tocan cookies, cabeceras o Prisma.

### `ContentRepository`

```ts
interface ContentRepository {
  getArticles(): Promise<WikiArticle[]>;          // envuelve getAllArticles()
  getNews(limit?: number): Promise<NewsEntry[]>;  // ordenadas por fecha desc
  getCuratedPolls(): Promise<CuratedPoll[]>;      // encuestas.json validado
}
```

El CMS futuro implementa la misma interfaz (`CmsContentRepository`) y `getContentRepository()` elige según una variable de entorno. Nada más cambia.

## 4. Contenido nuevo (formatos)

### `src/content/novedades/<yyyy-mm-dd>-<slug>.md`

```yaml
---
fecha: 2026-10-18          # ISO, obligatoria
titulo: "La Hecatombe del Lapeón llega a la wiki"
resumen: "Ya puedes leer la sinopsis del cuarto universo de BorisaoBlois."   # ≤ 160 caracteres
enlace: /wiki/la-hecatombe-del-lapeon    # interno (/wiki/…, /comunidad…) o https://youtube.com/…
---
```

Sin cuerpo (el texto vive en `resumen`). Regla "solo canon": una novedad anuncia algo publicado; no inventa lore.

### `src/content/encuestas.json`

```json
[
  { "semana": "2026-W43", "a": "vlad-julia", "b": "el-gran-maja" },
  { "semana": "2026-W44", "a": "the-bloop", "b": "slowdown-criyote", "pregunta": "¿Quién gana la revancha?" },
  { "semana": "2026-W45", "a": "bogbo", "b": "le-mug" }
]
```

- `semana`: semana ISO `YYYY-Www`; única en la lista.
- `a`, `b`: slugs distintos de artículos con stats (`hasStats`).
- `pregunta`: opcional; por defecto "¿Quién gana?".

`check:content` valida ambos formatos con los mismos esquemas Zod y falla si: falta un campo, la fecha no es válida, un enlace interno no existe, una semana se repite, un slug no existe o no tiene stats.

## 5. Encuesta de la semana

`getCurrentPoll(curated, fighters, date): PollDef | null`

1. `semana = isoWeekKey(date)` → `"2026-W43"` (extiende `isoWeek` con el año ISO).
2. Si hay duelo curado para esa semana → se usa.
3. Si no: emparejamiento automático determinista entre luchadores (artículos con `hasStats`) ordenados por slug. `w` = semanas completas transcurridas desde el lunes 1970-01-05 00:00 UTC hasta el lunes de la semana actual. Con `n` luchadores: `i = w % n` y `j = (i + 1 + w % (n - 1)) % n`; el desplazamiento está en `[1, n-1]`, así que nunca `i = j`. Mismo resultado en todos los servidores y en cada render de la semana.
4. Menos de 2 luchadores → `null` (la tile no se muestra).
5. `pollId = "<semana>-<a>-vs-<b>"`, p. ej. `2026-W43-vlad-julia-vs-el-gran-maja`. Estable y legible: los votos se cuentan por este id.

La semana cambia el lunes 00:00 UTC (definición ISO). La página usa ISR (`revalidate` ≤ 1 h) para que el cambio de semana llegue sin rebuild; el route handler y la action recalculan siempre la encuesta vigente en el servidor.

## 6. Modelo de datos

```prisma
model PollVote {
  id        String   @id @default(cuid())
  pollId    String
  option    String   // slug votado
  voterKey  String   // HMAC-SHA256(VOTE_SECRET, id anónimo de la cookie)
  ipHash    String   // HMAC-SHA256(VOTE_SECRET, ip + "|" + pollId)
  userId    String?  // futuro: cuentas
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt DateTime @default(now())

  @@unique([pollId, voterKey])
  @@unique([pollId, userId])   // Postgres trata los NULL como distintos
  @@index([pollId, option])
  @@index([pollId, ipHash])
}
```

`User` gana la relación inversa `pollVotes PollVote[]`. Migración nueva con `prisma migrate dev`; no toca tablas existentes.

## 7. Flujos

### Leer estado — `GET /api/comunidad/encuesta`

Sin caché (`Cache-Control: no-store`). Recalcula la encuesta vigente, lee la cookie `wb_voter` (si existe) y responde:

```ts
type PollState =
  | { status: 'open'; poll: PollDef; totals: Record<string, number>; percents: Record<string, number>; total: number; myOption: string | null }
  | { status: 'unavailable'; poll: PollDef | null };
```

### Votar — server action `castVote({ pollId, option })`

1. Zod: `pollId` y `option` strings acotados.
2. Recalcula la encuesta vigente; si `pollId` no coincide → `{ error: 'cerrada' }`; si `option ∉ {a, b}` → `{ error: 'opcion' }`.
3. Cookie `wb_voter`: si no existe se crea un id aleatorio (`crypto.randomUUID()`), httpOnly, `SameSite=Lax`, `Secure` en producción, `Max-Age` 1 año, `Path=/`.
4. IP: primer valor de `x-forwarded-for`, si no `x-real-ip`, si no `"desconocida"`. Nunca se guarda en claro.
5. Límite: si ya hay ≥ 5 votos con ese `ipHash` en ese `pollId` → `{ error: 'limite' }` (devuelve también el estado).
6. Inserta. Si choca con `@@unique([pollId, voterKey])` (P2002) → no es error: devuelve el estado con `myOption`.
7. Devuelve el `PollState` actualizado.

### Disponibilidad

Si falta `DATABASE_URL` o `VOTE_SECRET`, o Prisma lanza, la lectura responde `unavailable` y la action `{ error: 'no-disponible' }`. La página y las otras tiles nunca dependen de la base de datos; el build y el CI no la necesitan.

## 8. UI

### Página

Cabecera: eyebrow "Comunidad", `page-title` "Comunidad", una frase factual ("Cada semana: una criatura, un duelo y lo último de BorisaoBlois."). Grid:

```
≥ 1024 px                                        < 768 px (pila)
┌──────────────┬────────────┬─────────────┐     Criatura
│ Criatura     │ Último     │ ¿Quién gana?│     ¿Quién gana?
│ (2 filas)    │ vídeo      │             │     Último vídeo
│              ├────────────┴─────────────┤     Novedades
│              │ Novedades                │
└──────────────┴──────────────────────────┘
```

Entre 768 y 1024 px: 2 columnas (criatura | encuesta, vídeo | novedades).

### `CrystalTile`

Props: `eyebrow`, `title`, `icon?`, `href?` (toda la tile enlazable si se da), `className?`, `children`. Piel actual (contrato de estilo de la wiki): superficie sólida `#061a2e` bajo el texto, `border-white/10`, `rounded-3xl`, brillo de vidrio solo en el borde superior (gradiente blanco/10 → transparente), foco visible con anillo `primary`. #11 cambia solo este componente.

### Tiles

- **Criatura de la semana:** `pickFeatured()`; portada (o `CategoryPlaceholder`), nombre, chip de amenaza (`getThreatLevel`), enlace "Ver ficha".
- **Último vídeo:** el primero del RSS `https://www.youtube.com/feeds/videos.xml?channel_id=UChE8ki_10uZSZN0YTBi8_RA` (fetch con `revalidate: 3600`, timeout corto, parseo mínimo de `yt:videoId`, `title`, `published`). Si falla → primer vídeo de la lista estática (movida de `FeaturedVideosSection` a `data/videos.ts`, que la landing también usa). Reproductor `<lite-youtube>` y enlace "Ver más en YouTube".
- **¿Quién gana?** (isla cliente): pide el estado al montar.
  - Antes de votar: dos retratos con "VS" y dos botones con el nombre (`aria-pressed`).
  - Tras votar o si ya votó: barras con porcentaje y total en una región `aria-live="polite"`; la opción propia marcada.
  - `unavailable`: "Votación no disponible ahora" y los dos retratos.
  - Siempre: enlace "Ver el duelo en la Arena" y la línea "Tu voto es anónimo".
  - Errores `cerrada` (la semana cambió) → recarga el estado; `limite` → mensaje "Se alcanzó el límite de votos desde esta red".
- **Novedades:** las 5 más recientes (fecha en `es`, título, resumen, enlace). Sin entradas → `<Proximamente />`.

### Navegación y metadatos

"Comunidad" en la navbar (entre Universos y Contacto), menú móvil y footer. `generateMetadata` con título "Comunidad" y descripción; OG vía `metadataBase` existente.

## 9. Configuración

- Nueva variable `VOTE_SECRET` (≥ 32 caracteres aleatorios) en `.env.example` y en el CI con valor ficticio.
- Producción (VPS): `DATABASE_URL` hacia Postgres del VPS y `VOTE_SECRET`; el proxy inverso debe pasar `X-Forwarded-For`. Se concreta en el plan de despliegue en Hostinger.

## 10. Privacidad y seguridad

- No se guarda IP ni dato personal; los hashes usan HMAC con secreto (no reversibles sin el secreto).
- La cookie `wb_voter` es funcional (evitar el doble voto); no se usa para rastreo.
- La action valida todo en el servidor; el cliente nunca decide la encuesta vigente.
- Ningún secreto llega al cliente.

## 11. Pruebas

- **Unitarias (`node:test`, sin dependencias nuevas; Node 24 ejecuta TS):**
  - `poll-schedule`: curada gana a automática; automática determinista; `i ≠ j`; `null` con < 2 luchadores; `pollId` estable; cambio de año ISO (semana 52/53 → 1).
  - `poll-results`: porcentajes que suman 100 con redondeo, total 0.
  - Esquemas de `encuestas.json` y `novedades/` (casos válidos e inválidos).
  - Script `npm test` → `node --experimental-strip-types --test`, añadido al CI antes del build.
- **Validación habitual:** `npm run lint`, `npm run check:content`, `npm run build` (sin base de datos).
- **QA Chrome DevTools** (build de producción, Postgres local con `make db-up`), 1440 y 390 px:
  votar → resultados; segundo voto desde el mismo dispositivo → mismos resultados, sin voto nuevo; borrar cookie y votar hasta el límite por IP; base de datos apagada → aviso, resto de tiles bien; RSS caído (URL inválida en entorno de prueba) → vídeo de respaldo; consola y red limpias; Lighthouse a11y.

## 12. Evolución prevista

- **CMS:** implementar `CmsContentRepository` (novedades, encuestas, artículos) y elegirla en `getContentRepository()`. La UI y los votos no cambian.
- **Cuentas:** con sesión, `castVote` rellena `userId` y aplica `@@unique([pollId, userId])`; los votos anónimos siguen siendo válidos. Un futuro "espacio personal" puede listar `user.pollVotes`.
- **Histórico:** los votos ya quedan guardados por `pollId`; "resultado de la semana pasada" es una consulta más.

## 13. Seguimiento en GitHub

#10 se reescribe como épica del hub con sub-issues: (1) repositorio de contenido + formatos + `check:content`; (2) modelo `PollVote`, migración, action y route handler; (3) tiles + página + navegación; (4) tests `node:test` + CI; (5) QA y despliegue (depende del plan de Hostinger).

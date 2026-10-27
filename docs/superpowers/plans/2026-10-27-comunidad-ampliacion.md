# Ampliación del hub /comunidad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que `/comunidad` tenga más motivos para volver cada semana: novedad destacada con imagen, «Próxima semana» en la encuesta, hasta 4 vídeos, historial de votos (semana pasada, palmarés, expedientes más pedidos) y «Tu registro», todo con datos que ya existen.

**Architecture:** Lógica pura y probada con node:test en `src/features/community/lib/` (`poll-history`, `news-image`, `latest-videos`, `getNextPoll`); un route handler sin caché (`GET /api/comunidad/historial`) que resume `PollVote` con un solo `groupBy`; una isla de cliente (`PollHistoryTiles`) que lo pinta bajo el pliegue; y la página ISR reordenada. Sin cambios de modelo de datos ni migraciones.

**Tech Stack:** Next.js 16 (App Router, route handlers), React 19, TanStack Query v5, Prisma 7 (`@prisma/adapter-pg`), Tailwind v4, node:test con `--experimental-strip-types`.

**Spec:** `docs/superpowers/specs/2026-10-27-comunidad-ampliacion-design.md` (manda sobre este plan; léela antes de empezar).

## Global Constraints

- Todo texto visible y todo comentario en **español**, con la densidad de comentarios del archivo que se toca.
- Solo canon: ningún texto de lore nuevo; los únicos textos nuevos son los de la spec, copiados literalmente:
  - Intro / `description`: «Lo último de BorisaoBlois, la votación de la semana y lo que más pide la comunidad.»
  - «Próxima semana: A vs B» · «Próxima semana: ¿A o B?» (si es `desclasificar`).
  - Secciones: «Novedades», «Últimos vídeos» (acción «Ver el canal ›»), «Resultado de la semana pasada», «Palmarés», «Expedientes más pedidos» (acción «Ver el registro ›»), «Tu registro» (acción «Ver el registro ›»).
  - «Ganó X» · «Empate» · «N votos» · «La comunidad pidió desclasificar X (P %)» · «N victorias · M duelos» · «El registro se guarda solo en este navegador.»
  - Log del endpoint: `[comunidad] no se pudo leer el historial:`
- Ley Abisal: una sección = un propósito (h2 + contenido + como mucho una acción); sin chips ni eyebrows; superficie `crystal-surface` (sin `after:*` sobre ella); iconos solo funcionales.
- Los componentes cliente importan cada primitiva de su archivo: `@/components/content/Section`, `@/components/content/PendingLabel`, `@/components/content/CategoryPlaceholder`, `@/components/content/ContentCard` (nunca del barril `@/components/content`).
- Los módulos puros (`src/features/community/lib/**`, `src/core/**`) usan **solo imports relativos con extensión `.ts`**; `import type` de un módulo con `@/` no vale tampoco: usar la ruta relativa.
- Un elemento enfocable nuevo lleva `focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary` y mide al menos 44 px de alto (`min-h-11`).
- Sin dependencias nuevas, sin cambios en `prisma/schema.prisma`, sin migraciones.
- Tests: `npm test` (= `node --experimental-strip-types --no-warnings --test 'tests/**/*.test.ts'`); un archivo suelto: `node --experimental-strip-types --no-warnings --test tests/community/<archivo>.test.ts`.
- Rama: `feat/comunidad-ampliacion` (ya creada). Un commit por tarea; todos terminan con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/features/community/lib/poll-history.ts` | Crear | `parsePollId`, `summarizeHistory`, `emptyHistory` y los tipos `PollHistory` (puro). |
| `tests/community/poll-history.test.ts` | Crear | Pruebas del historial. |
| `src/features/community/lib/poll-schedule.ts` | Modificar | `getNextPoll`. |
| `tests/community/poll-schedule.test.ts` | Modificar | Pruebas de `getNextPoll`. |
| `src/features/community/lib/news-image.ts` | Crear | `newsImage` (puro): imagen deducida de una novedad. |
| `tests/community/news-image.test.ts` | Crear | Pruebas de `newsImage`. |
| `src/features/community/lib/latest-videos.ts` | Crear | `latestVideos` (puro). |
| `tests/community/latest-videos.test.ts` | Crear | Pruebas de `latestVideos`. |
| `src/core/content/validate.ts` | Modificar | `crossCheckPollIdSlugs` (`-vs-` prohibido en slugs). |
| `tests/content/validate.test.ts` | Modificar | Prueba de `crossCheckPollIdSlugs`. |
| `scripts/check-content.mts` | Modificar | Llama a `crossCheckPollIdSlugs`. |
| `src/app/api/comunidad/historial/route.ts` | Crear | `GET` del historial, sin caché, vacío ante error. |
| `src/features/community/components/FighterPortrait.tsx` | Crear | Retrato de ficha (extraído de `PollTile`) y tipo `PollFighter`. |
| `src/features/community/components/PollTile.tsx` | Modificar | Usa `FighterPortrait`; pie «Próxima semana». |
| `src/features/community/components/PollHistoryTiles.tsx` | Crear | Isla de cliente: semana pasada, palmarés, más pedidos. |
| `src/features/community/components/NewsFeatured.tsx` | Crear | Novedad destacada (`ContentCard` a ancho completo). |
| `src/app/(marketing)/comunidad/page.tsx` | Modificar | Nuevo orden, intro, vídeos, historial y registro. |
| `CLAUDE.md` | Modificar | Sección del hub. |

## Decisiones tomadas al planificar (ambigüedades de la spec)

- **D1 — `coverOf` no entra en módulos puros.** `CategoryPlaceholder.tsx` importa `lucide-react` y `@/utils/cn`; con `--experimental-strip-types` el alias `@/` no resuelve y rompería node:test. `newsImage` devuelve la `image` **en bruto** de la ficha; `ContentCard` ya aplica `coverOf(image)` por dentro, así que una portada de marca acaba igualmente en el placeholder por categoría.
- **D2 — «Encuesta pasada» = semana anterior a la vigente.** Además de descartar `currentPollId`, `summarizeHistory` descarta toda encuesta cuya semana sea **≥** la de `currentPollId` (p. ej. un duelo automático de esta semana que se reinició al publicar una ficha con stats: no es «la semana pasada»). Si `currentPollId` es `null`, solo se descartan los ids que no parsean.
- **D3 — Dos encuestas con votos en la misma semana más alta** (reinicio a mitad de semana): `lastWeek` es la de más votos; a igualdad, la de id menor.
- **D4 — Pluralización:** «1 voto», «1 victoria», «1 duelo»; con otro número, plural. «Empate» también para una `desclasificar` empatada.
- **D5 — `masPedidos` solo con votos ≥ 1**, igual que el palmarés solo con `wins ≥ 1`.
- **D6 — La regla de `check:content` también rechaza un slug que acabe en `-vs`** (regex `/-vs(?:-|$)/`): `parsePollId` parte por el **primer** `-vs-`, y una opción `a` acabada en `-vs` (p. ej. `x-vs` → `…-x-vs-vs-b`) cortaría dentro del nombre. Un slug que empieza por `vs-` sí es seguro.
- **D7 — «Próxima semana» se oculta si ya no es futura:** `PollTile` solo la pinta si `nextPoll.week > poll.week`. El lunes, la página ISR (1 h) puede traer como «próxima» la encuesta que la API ya da como vigente.
- **D8 — Los retratos de `PollTile` siguen con `loading="eager"`:** en escritorio la encuesta sigue cerca del primer pliegue (la auditoría #66 los puso `eager` por el aviso de LCP). `FighterPortrait` recibe `eager?: boolean`; `PollTile` lo pasa y las listas del historial no. La novedad destacada también va `eager`.
- **D9 — Las filas de la semana pasada no enlazan** (la spec no lo pide); las de palmarés y más pedidos sí enlazan el título a la ficha.

---

### Task 1: Historial de votos puro (`poll-history.ts`)

**Files:**
- Create: `src/features/community/lib/poll-history.ts`
- Test: `tests/community/poll-history.test.ts`

**Interfaces:**
- Consumes: `WEEK_KEY_REGEX`, `CuratedPoll`, `PollTipo` de `src/core/content/schemas.ts`; `computeTally(options: readonly string[], counts: Readonly<Record<string, number>>): PollTally` y `PollTally = { totals: Record<string, number>; percents: Record<string, number>; total: number }` de `src/features/community/lib/poll-results.ts`.
- Produces (los usan las tareas 6 y 7):
  - `parsePollId(id: string): ParsedPollId | null` con `ParsedPollId = { week: string; a: string; b: string }`
  - `HistoryRow = { pollId: string; option: string; count: number }`
  - `LastWeekResult = PollTally & { id: string; week: string; tipo: PollTipo; a: string; b: string; winner: string | null }`
  - `PalmaresEntry = { slug: string; wins: number; duels: number }`
  - `PedidoEntry = { slug: string; votes: number }`
  - `PollHistory = { lastWeek: LastWeekResult | null; palmares: PalmaresEntry[]; masPedidos: PedidoEntry[] }`
  - `SummarizeOptions = { currentPollId: string | null; curated: readonly CuratedPoll[]; sealedSlugs: ReadonlySet<string>; limit?: number }`
  - `summarizeHistory(rows: readonly HistoryRow[], options: SummarizeOptions): PollHistory`
  - `emptyHistory(): PollHistory`
  - `HISTORY_LIMIT = 5`

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/community/poll-history.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyHistory,
  parsePollId,
  summarizeHistory,
  type HistoryRow,
  type SummarizeOptions,
} from '../../src/features/community/lib/poll-history.ts';
import type { CuratedPoll } from '../../src/core/content/schemas.ts';

const CURATED: CuratedPoll[] = [
  { semana: '2026-W38', tipo: 'desclasificar', a: 'cael-cortes', b: 'ya-abierta' },
  { semana: '2026-W42', tipo: 'duelo', a: 'vlad-julia', b: 'el-gran-maja' },
  { semana: '2026-W45', tipo: 'desclasificar', a: 'cael-cortes', b: 'aodos-ay01' },
];
const SEALED = new Set(['cael-cortes', 'aodos-ay01']);

/** Filas del `groupBy` de una encuesta: `{ opción: votos }`. */
const rows = (pollId: string, counts: Record<string, number>): HistoryRow[] =>
  Object.entries(counts).map(([option, count]) => ({ pollId, option, count }));

const opts = (over: Partial<SummarizeOptions> = {}): SummarizeOptions => ({
  currentPollId: '2026-W44-bogbo-vs-le-mug',
  curated: CURATED,
  sealedSlugs: SEALED,
  ...over,
});

test('parsePollId: semana, y a y b partidos por el primer -vs-', () => {
  assert.deepEqual(parsePollId('2026-W42-vlad-julia-vs-el-gran-maja'), {
    week: '2026-W42',
    a: 'vlad-julia',
    b: 'el-gran-maja',
  });
  assert.deepEqual(parsePollId('2026-W45-cael-cortes-vs-aodos-ay01'), {
    week: '2026-W45',
    a: 'cael-cortes',
    b: 'aodos-ay01',
  });
  // Un slug que empieza por «vs-» no confunde el corte.
  assert.deepEqual(parsePollId('2026-W01-bogbo-vs-vs-algo'), { week: '2026-W01', a: 'bogbo', b: 'vs-algo' });
});

test('parsePollId: null si el id no encaja', () => {
  for (const id of [
    '',
    '2026-W42',
    '2026-W42-bogbo',
    '2026-W42-bogbo-vs-',
    '2026-W42--vs-le-mug',
    '2026-W54-bogbo-vs-le-mug',
    '2026W42-bogbo-vs-le-mug',
    '2026-W42_bogbo-vs-le-mug',
    '2026-W42-Bogbo-vs-le-mug',
    '2026-W42-bogbo-vs-bogbo',
  ]) {
    assert.equal(parsePollId(id), null, id);
  }
});

test('sin votos: historial vacío', () => {
  assert.deepEqual(summarizeHistory([], opts()), emptyHistory());
  assert.deepEqual(emptyHistory(), { lastWeek: null, palmares: [], masPedidos: [] });
});

test('lastWeek: la semana pasada más alta con votos; la vigente queda fuera', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W42-vlad-julia-vs-el-gran-maja', { 'vlad-julia': 3, 'el-gran-maja': 1 }),
      ...rows('2026-W43-the-bloop-vs-slowdown-criyonte', { 'the-bloop': 1, 'slowdown-criyonte': 3 }),
      ...rows('2026-W44-bogbo-vs-le-mug', { bogbo: 10, 'le-mug': 9 }),
    ],
    opts(),
  );
  assert.deepEqual(history.lastWeek, {
    id: '2026-W43-the-bloop-vs-slowdown-criyonte',
    week: '2026-W43',
    tipo: 'duelo',
    a: 'the-bloop',
    b: 'slowdown-criyonte',
    winner: 'slowdown-criyonte',
    totals: { 'the-bloop': 1, 'slowdown-criyonte': 3 },
    percents: { 'the-bloop': 25, 'slowdown-criyonte': 75 },
    total: 4,
  });
});

test('ignora opciones ajenas, ids que no parsean y otras encuestas de la semana vigente', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W41-bogbo-vs-le-mug', { bogbo: 2, 'le-mug': 1 }),
      // Solo votos a una opción que no es del duelo: total 0, no cuenta como semana pasada.
      ...rows('2026-W43-the-bloop-vs-slowdown-criyonte', { intruso: 5 }),
      ...rows('basura', { bogbo: 9 }),
      ...rows('2026-W43-sin-separador', { sin: 9 }),
      // Duelo automático de esta semana que se reinició: no es «la semana pasada».
      ...rows('2026-W44-the-bloop-vs-le-mug', { 'the-bloop': 7 }),
    ],
    opts(),
  );
  assert.equal(history.lastWeek?.id, '2026-W41-bogbo-vs-le-mug');
  assert.deepEqual(history.lastWeek?.totals, { bogbo: 2, 'le-mug': 1 });
  assert.deepEqual(history.palmares, [{ slug: 'bogbo', wins: 1, duels: 1 }]);
});

test('sin encuesta vigente (currentPollId null) cuentan todas las que parsean', () => {
  const history = summarizeHistory(rows('2026-W44-bogbo-vs-le-mug', { bogbo: 1 }), opts({ currentPollId: null }));
  assert.equal(history.lastWeek?.id, '2026-W44-bogbo-vs-le-mug');
});

test('dos encuestas con votos en la misma semana: gana la de más votos', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W43-bogbo-vs-le-mug', { bogbo: 1 }),
      ...rows('2026-W43-the-bloop-vs-le-mug', { 'the-bloop': 2, 'le-mug': 1 }),
    ],
    opts(),
  );
  assert.equal(history.lastWeek?.id, '2026-W43-the-bloop-vs-le-mug');
});

test('empate: winner null y no suma victorias', () => {
  const history = summarizeHistory(rows('2026-W43-bogbo-vs-le-mug', { bogbo: 2, 'le-mug': 2 }), opts());
  assert.equal(history.lastWeek?.winner, null);
  assert.equal(history.lastWeek?.total, 4);
  assert.deepEqual(history.palmares, []);
});

test('palmarés: victorias desc, luego ratio desc; los empates no son victorias; límite', () => {
  const all = [
    ...rows('2026-W39-bogbo-vs-vlad-julia', { bogbo: 1 }),
    ...rows('2026-W40-bogbo-vs-le-mug', { bogbo: 3, 'le-mug': 1 }),
    ...rows('2026-W41-bogbo-vs-the-bloop', { bogbo: 2, 'the-bloop': 5 }),
    ...rows('2026-W42-vlad-julia-vs-el-gran-maja', { 'vlad-julia': 4, 'el-gran-maja': 4 }),
    ...rows('2026-W43-the-bloop-vs-le-mug', { 'the-bloop': 2, 'le-mug': 1 }),
  ];
  assert.deepEqual(summarizeHistory(all, opts()).palmares, [
    { slug: 'the-bloop', wins: 2, duels: 2 },
    { slug: 'bogbo', wins: 2, duels: 3 },
  ]);
  assert.deepEqual(summarizeHistory(all, opts({ limit: 1 })).palmares, [{ slug: 'the-bloop', wins: 2, duels: 2 }]);
});

test('palmarés: a igualdad de victorias y ratio, por slug', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W30-bogbo-vs-le-mug', { 'le-mug': 2, bogbo: 1 }),
      ...rows('2026-W31-vlad-julia-vs-el-gran-maja', { 'el-gran-maja': 1 }),
    ],
    opts(),
  );
  assert.deepEqual(history.palmares, [
    { slug: 'el-gran-maja', wins: 1, duels: 1 },
    { slug: 'le-mug', wins: 1, duels: 1 },
  ]);
});

test('más pedidos: solo votaciones desclasificar y solo fichas aún selladas; fuera del palmarés', () => {
  const history = summarizeHistory(
    [
      ...rows('2026-W38-cael-cortes-vs-ya-abierta', { 'cael-cortes': 2, 'ya-abierta': 9 }),
      ...rows('2026-W45-cael-cortes-vs-aodos-ay01', { 'cael-cortes': 3, 'aodos-ay01': 5 }),
    ],
    opts({ currentPollId: '2026-W46-bogbo-vs-le-mug' }),
  );
  assert.deepEqual(history.masPedidos, [
    { slug: 'aodos-ay01', votes: 5 },
    { slug: 'cael-cortes', votes: 5 },
  ]);
  assert.deepEqual(history.palmares, []);
  assert.equal(history.lastWeek?.tipo, 'desclasificar');
  assert.equal(history.lastWeek?.winner, 'aodos-ay01');
  assert.deepEqual(
    summarizeHistory(rows('2026-W45-cael-cortes-vs-aodos-ay01', { 'cael-cortes': 3, 'aodos-ay01': 5 }), {
      ...opts({ currentPollId: '2026-W46-bogbo-vs-le-mug' }),
      limit: 1,
    }).masPedidos,
    [{ slug: 'aodos-ay01', votes: 5 }],
  );
});

test('una encuesta con las mismas fichas pero otra semana que la curada es un duelo', () => {
  // En W43 no hay votación curada con esas fichas (la curada es de W45): cuenta como duelo (palmarés), no como «más pedidos».
  const history = summarizeHistory(
    rows('2026-W43-cael-cortes-vs-aodos-ay01', { 'cael-cortes': 1 }),
    opts(),
  );
  assert.equal(history.lastWeek?.tipo, 'duelo');
  assert.deepEqual(history.masPedidos, []);
  assert.deepEqual(history.palmares, [{ slug: 'cael-cortes', wins: 1, duels: 1 }]);
});
```

- [ ] **Step 2: Ejecutar el test y verlo fallar**

Run: `node --experimental-strip-types --no-warnings --test tests/community/poll-history.test.ts`
Expected: FAIL con `ERR_MODULE_NOT_FOUND` (no existe `poll-history.ts`).

- [ ] **Step 3: Implementar `poll-history.ts`**

Crear `src/features/community/lib/poll-history.ts`:

```ts
/**
 * Historial de la encuesta semanal deducido de `PollVote` (spec 2026-10-27 §4): resultado de la semana pasada,
 * palmarés de los duelos y expedientes más pedidos. Puro (lo prueban los tests con node:test): solo imports
 * relativos con extensión .ts.
 */
import { WEEK_KEY_REGEX, type CuratedPoll, type PollTipo } from '../../../core/content/schemas.ts';
import { computeTally, type PollTally } from './poll-results.ts';

/** Entradas como mucho en el palmarés y en «más pedidos». */
export const HISTORY_LIMIT = 5;

/** Separa las dos opciones en el id (`pollIdFor`). `check:content` impide que un slug lo contenga. */
const SEPARATOR = '-vs-';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ParsedPollId {
  week: string;
  a: string;
  b: string;
}

/** Una fila de `prisma.pollVote.groupBy({ by: ['pollId', 'option'] })`. */
export interface HistoryRow {
  pollId: string;
  option: string;
  count: number;
}

export type LastWeekResult = PollTally & {
  id: string;
  week: string;
  tipo: PollTipo;
  a: string;
  b: string;
  /** Opción con más votos; `null` si empataron. */
  winner: string | null;
};

export interface PalmaresEntry {
  slug: string;
  /** Duelos ganados (los empates no cuentan). */
  wins: number;
  /** Duelos con al menos un voto en los que participó. */
  duels: number;
}

export interface PedidoEntry {
  slug: string;
  votes: number;
}

export interface PollHistory {
  lastWeek: LastWeekResult | null;
  palmares: PalmaresEntry[];
  masPedidos: PedidoEntry[];
}

export interface SummarizeOptions {
  /** Encuesta vigente: ni ella ni otra de su semana (o posterior) entran en el historial. */
  currentPollId: string | null;
  curated: readonly CuratedPoll[];
  /** Fichas con `status: proximamente`: las únicas que pueden salir en «más pedidos». */
  sealedSlugs: ReadonlySet<string>;
  limit?: number;
}

export function emptyHistory(): PollHistory {
  return { lastWeek: null, palmares: [], masPedidos: [] };
}

/** `<semana>-<a>-vs-<b>` → sus partes, o `null` si no encaja. Parte por el **primer** `-vs-`. */
export function parsePollId(id: string): ParsedPollId | null {
  const week = id.slice(0, 8);
  if (!WEEK_KEY_REGEX.test(week) || id[8] !== '-') return null;
  const rest = id.slice(9);
  const cut = rest.indexOf(SEPARATOR);
  if (cut < 0) return null;
  const a = rest.slice(0, cut);
  const b = rest.slice(cut + SEPARATOR.length);
  if (!SLUG.test(a) || !SLUG.test(b) || a === b) return null;
  return { week, a, b };
}

interface PastPoll extends ParsedPollId {
  id: string;
  tipo: PollTipo;
  tally: PollTally;
  winner: string | null;
}

const bySlug = (x: { slug: string }, y: { slug: string }) => (x.slug < y.slug ? -1 : x.slug > y.slug ? 1 : 0);

/** Encuestas ya cerradas con su recuento; solo se suman los votos a `a` o a `b`. */
function pastPolls(rows: readonly HistoryRow[], { currentPollId, curated }: SummarizeOptions): PastPoll[] {
  const currentWeek = currentPollId ? parsePollId(currentPollId)?.week : undefined;
  const counts = new Map<string, { parsed: ParsedPollId; votes: Record<string, number> }>();
  for (const row of rows) {
    if (row.pollId === currentPollId) continue;
    const parsed = parsePollId(row.pollId);
    if (!parsed || (currentWeek !== undefined && parsed.week >= currentWeek)) continue;
    if (row.option !== parsed.a && row.option !== parsed.b) continue;
    const entry = counts.get(row.pollId) ?? { parsed, votes: { [parsed.a]: 0, [parsed.b]: 0 } };
    entry.votes[row.option] += row.count;
    counts.set(row.pollId, entry);
  }

  return [...counts].map(([id, { parsed, votes }]) => {
    const tally = computeTally([parsed.a, parsed.b], votes);
    const va = tally.totals[parsed.a];
    const vb = tally.totals[parsed.b];
    const tipo =
      curated.find((c) => c.semana === parsed.week && c.a === parsed.a && c.b === parsed.b)?.tipo ?? 'duelo';
    return { id, ...parsed, tipo, tally, winner: va > vb ? parsed.a : vb > va ? parsed.b : null };
  });
}

/** La encuesta pasada más reciente con votos; en la misma semana, la de más votos (y a igualdad, la de id menor). */
function lastWeekOf(polls: readonly PastPoll[]): LastWeekResult | null {
  const voted = polls.filter((p) => p.tally.total > 0);
  if (voted.length === 0) return null;
  const [p] = [...voted].sort(
    (x, y) =>
      (x.week < y.week ? 1 : x.week > y.week ? -1 : 0) || y.tally.total - x.tally.total || (x.id < y.id ? -1 : 1),
  );
  return { id: p.id, week: p.week, tipo: p.tipo, a: p.a, b: p.b, winner: p.winner, ...p.tally };
}

function palmaresOf(polls: readonly PastPoll[], limit: number): PalmaresEntry[] {
  const stats = new Map<string, PalmaresEntry>();
  const entry = (slug: string) => {
    let e = stats.get(slug);
    if (!e) {
      e = { slug, wins: 0, duels: 0 };
      stats.set(slug, e);
    }
    return e;
  };
  for (const p of polls) {
    if (p.tipo !== 'duelo' || p.tally.total === 0) continue;
    entry(p.a).duels += 1;
    entry(p.b).duels += 1;
    if (p.winner) entry(p.winner).wins += 1;
  }
  return [...stats.values()]
    .filter((e) => e.wins >= 1)
    .sort((x, y) => y.wins - x.wins || y.wins / y.duels - x.wins / x.duels || bySlug(x, y))
    .slice(0, limit);
}

function masPedidosOf(polls: readonly PastPoll[], sealed: ReadonlySet<string>, limit: number): PedidoEntry[] {
  const votes = new Map<string, number>();
  for (const p of polls) {
    if (p.tipo !== 'desclasificar') continue;
    for (const slug of [p.a, p.b]) {
      if (sealed.has(slug)) votes.set(slug, (votes.get(slug) ?? 0) + p.tally.totals[slug]);
    }
  }
  return [...votes]
    .map(([slug, v]) => ({ slug, votes: v }))
    .filter((e) => e.votes > 0)
    .sort((x, y) => y.votes - x.votes || bySlug(x, y))
    .slice(0, limit);
}

/** Resume el `groupBy` de `PollVote` (todas las encuestas) en lo que pinta `/comunidad`. */
export function summarizeHistory(rows: readonly HistoryRow[], options: SummarizeOptions): PollHistory {
  const limit = options.limit ?? HISTORY_LIMIT;
  const polls = pastPolls(rows, options);
  return {
    lastWeek: lastWeekOf(polls),
    palmares: palmaresOf(polls, limit),
    masPedidos: masPedidosOf(polls, options.sealedSlugs, limit),
  };
}
```

- [ ] **Step 4: Ejecutar el test y verlo pasar**

Run: `node --experimental-strip-types --no-warnings --test tests/community/poll-history.test.ts`
Expected: PASS (12 tests, 0 fallos).

- [ ] **Step 5: Lint**

Run: `npx eslint src/features/community/lib/poll-history.ts tests/community/poll-history.test.ts`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/features/community/lib/poll-history.ts tests/community/poll-history.test.ts
git commit -m "$(cat <<'EOF'
feat(comunidad): historial de votos puro (semana pasada, palmarés, más pedidos)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `getNextPoll` en el calendario

**Files:**
- Modify: `src/features/community/lib/poll-schedule.ts` (añadir al final)
- Test: `tests/community/poll-schedule.test.ts` (import y tests nuevos al final)

**Interfaces:**
- Consumes: `getCurrentPoll(curated, fighterSlugs, date): PollDef | null`, `DAY_MS` (ya importado de `iso-week.ts`).
- Produces: `getNextPoll(curated: readonly CuratedPoll[], fighterSlugs: readonly string[], date?: Date): PollDef | null` (lo usa la tarea 8).

- [ ] **Step 1: Escribir el test que falla**

En `tests/community/poll-schedule.test.ts`, añadir `getNextPoll` al import existente:

```ts
import {
  DEFAULT_QUESTION,
  DEFAULT_QUESTION_DESCLASIFICAR,
  getCurrentPoll,
  getNextPoll,
  isoWeekKey,
  pollIdFor,
  weeksSinceEpoch,
} from '../../src/features/community/lib/poll-schedule.ts';
```

y al final del archivo:

```ts
test('getNextPoll: la votación curada de la semana siguiente', () => {
  const curated = [{ semana: '2026-W45', tipo: 'desclasificar' as const, a: 'cael-cortes', b: 'aodos-ay01' }];
  // Domingo 2026-11-01, último día de 2026-W44.
  const next = getNextPoll(curated, FIGHTERS, new Date('2026-11-01T23:59:00Z'));
  assert.ok(next);
  assert.equal(next.id, '2026-W45-cael-cortes-vs-aodos-ay01');
  assert.equal(next.week, '2026-W45');
  assert.equal(next.tipo, 'desclasificar');
});

test('getNextPoll: sin curada, el emparejamiento automático de la semana siguiente', () => {
  const tuesday = new Date('2026-10-27T10:00:00Z'); // 2026-W44
  const next = getNextPoll([], FIGHTERS, tuesday);
  assert.equal(next?.week, '2026-W45');
  assert.deepEqual(next, getCurrentPoll([], FIGHTERS, new Date('2026-11-02T00:00:00Z')));
});

test('getNextPoll: null con menos de dos luchadores y sin curada', () => {
  assert.equal(getNextPoll([], ['bogbo'], new Date('2026-10-27T10:00:00Z')), null);
});
```

- [ ] **Step 2: Ejecutar el test y verlo fallar**

Run: `node --experimental-strip-types --no-warnings --test tests/community/poll-schedule.test.ts`
Expected: FAIL con `SyntaxError: The requested module ... does not provide an export named 'getNextPoll'`.

- [ ] **Step 3: Implementar**

Al final de `src/features/community/lib/poll-schedule.ts`:

```ts
/**
 * Encuesta de la semana siguiente a `date` (el «Próxima semana» de `PollTile`). Es un adelanto: si entra una ficha
 * con stats antes del lunes, el emparejamiento automático puede cambiar y el lunes se corrige solo.
 */
export function getNextPoll(
  curated: readonly CuratedPoll[],
  fighterSlugs: readonly string[],
  date: Date = new Date(),
): PollDef | null {
  return getCurrentPoll(curated, fighterSlugs, new Date(date.getTime() + 7 * DAY_MS));
}
```

- [ ] **Step 4: Ejecutar el test y verlo pasar**

Run: `node --experimental-strip-types --no-warnings --test tests/community/poll-schedule.test.ts`
Expected: PASS (todos, incluidos los 3 nuevos).

- [ ] **Step 5: Commit**

```bash
git add src/features/community/lib/poll-schedule.ts tests/community/poll-schedule.test.ts
git commit -m "$(cat <<'EOF'
feat(comunidad): getNextPoll, la encuesta de la semana siguiente

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Imagen deducida de una novedad (`news-image.ts`)

**Files:**
- Create: `src/features/community/lib/news-image.ts`
- Test: `tests/community/news-image.test.ts`

**Interfaces:**
- Consumes: `WIKI_LINK` de `src/core/search/wiki-routes.ts`; `NEWS_HOSTS`, `YOUTUBE_ID_REGEX`, `NewsEntry` de `src/core/content/schemas.ts`; `youtubeThumbUrl(id)` de `src/utils/youtube.ts`; tipo `WikiFrontmatter` de `src/core/types/wiki.ts`.
- Produces (lo usa la tarea 8):
  - `NewsImage = { image?: string; imagePosition?: string; category?: string }`
  - `NewsArticleRef = { frontmatter: Pick<WikiFrontmatter, 'image' | 'imagePosition' | 'category'> }` (un `WikiArticle` encaja)
  - `newsImage(entry: Pick<NewsEntry, 'enlace'>, articlesBySlug: ReadonlyMap<string, NewsArticleRef>): NewsImage`
- Decisión D1: `image` va en bruto; `ContentCard` aplica `coverOf`.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/community/news-image.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newsImage, type NewsArticleRef } from '../../src/features/community/lib/news-image.ts';

const ARTICLES = new Map<string, NewsArticleRef>([
  [
    'la-hecatombe-del-lapeon',
    { frontmatter: { image: '/assets/Hecatombe/portada.webp', imagePosition: '50% 20%', category: 'Historia' } },
  ],
  ['sin-imagen', { frontmatter: { category: 'Coloso' } }],
]);

const THUMB = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

test('enlace a una ficha: su imagen, su encuadre y su categoría', () => {
  const expected = { image: '/assets/Hecatombe/portada.webp', imagePosition: '50% 20%', category: 'Historia' };
  assert.deepEqual(newsImage({ enlace: '/wiki/la-hecatombe-del-lapeon' }, ARTICLES), expected);
  assert.deepEqual(newsImage({ enlace: '/wiki/la-hecatombe-del-lapeon#origen' }, ARTICLES), expected);
  assert.deepEqual(newsImage({ enlace: '/wiki/la-hecatombe-del-lapeon?x=1' }, ARTICLES), expected);
});

test('ficha sin imagen: solo la categoría, para el placeholder', () => {
  const result = newsImage({ enlace: '/wiki/sin-imagen' }, ARTICLES);
  assert.equal(result.image, undefined);
  assert.equal(result.category, 'Coloso');
});

test('enlace interno que no es una ficha (o ficha inexistente): sin imagen', () => {
  for (const enlace of ['/wiki/arena', '/wiki/no-existe', '/comunidad', '/', '/wiki']) {
    assert.deepEqual(newsImage({ enlace }, ARTICLES), {}, enlace);
  }
});

test('YouTube en sus cuatro formas: miniatura del vídeo', () => {
  const cases: [string, string][] = [
    ['https://www.youtube.com/watch?v=vRVFd7LfTTs', 'vRVFd7LfTTs'],
    ['https://youtube.com/watch?v=vRVFd7LfTTs&t=30s', 'vRVFd7LfTTs'],
    ['https://youtu.be/vRVFd7LfTTs?si=abc', 'vRVFd7LfTTs'],
    ['https://www.youtube.com/shorts/XurjKHinBIY', 'XurjKHinBIY'],
    ['https://m.youtube.com/live/hedUAqopPBg?feature=share', 'hedUAqopPBg'],
  ];
  for (const [enlace, id] of cases) {
    assert.deepEqual(newsImage({ enlace }, ARTICLES), { image: THUMB(id) }, enlace);
  }
});

test('YouTube sin id de vídeo válido (o host ajeno): sin imagen', () => {
  for (const enlace of [
    'https://youtube.com/@borisaoblois',
    'https://www.youtube.com/watch?v=corto',
    'https://www.youtube.com/playlist?list=PL1234567890',
    'https://youtu.be/',
    'https://example.com/watch?v=vRVFd7LfTTs',
  ]) {
    assert.deepEqual(newsImage({ enlace }, ARTICLES), {}, enlace);
  }
});
```

- [ ] **Step 2: Ejecutar el test y verlo fallar**

Run: `node --experimental-strip-types --no-warnings --test tests/community/news-image.test.ts`
Expected: FAIL con `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implementar**

Crear `src/features/community/lib/news-image.ts`:

```ts
/**
 * Imagen de la novedad destacada de /comunidad, deducida de su enlace (spec 2026-10-27 §3) sin cambiar el formato de
 * las novedades. Puro (lo prueban los tests con node:test): solo imports relativos con extensión .ts.
 *
 * `image` va tal cual la trae la ficha: `ContentCard` le aplica `coverOf`, que descarta las imágenes de marca y deja
 * el placeholder por `category`. (`coverOf` vive en un componente con `lucide-react` y no se puede importar aquí.)
 */
import { NEWS_HOSTS, YOUTUBE_ID_REGEX, type NewsEntry } from '../../../core/content/schemas.ts';
import { WIKI_LINK } from '../../../core/search/wiki-routes.ts';
import type { WikiFrontmatter } from '../../../core/types/wiki.ts';
import { youtubeThumbUrl } from '../../../utils/youtube.ts';

export interface NewsImage {
  image?: string;
  imagePosition?: string;
  category?: string;
}

/** Lo único que hace falta de una ficha; un `WikiArticle` encaja. */
export interface NewsArticleRef {
  frontmatter: Pick<WikiFrontmatter, 'image' | 'imagePosition' | 'category'>;
}

/** Id del vídeo en `watch?v=`, `youtu.be/<id>`, `/shorts/<id>` o `/live/<id>`; `null` si no hay uno válido. */
function youtubeId(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !NEWS_HOSTS.includes(url.hostname)) return null;
  const candidate =
    url.hostname === 'youtu.be'
      ? url.pathname.split('/')[1]
      : url.pathname === '/watch'
        ? url.searchParams.get('v')
        : url.pathname.match(/^\/(?:shorts|live)\/([^/]+)/)?.[1];
  return candidate && YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
}

export function newsImage(
  entry: Pick<NewsEntry, 'enlace'>,
  articlesBySlug: ReadonlyMap<string, NewsArticleRef>,
): NewsImage {
  const slug = entry.enlace.match(WIKI_LINK)?.[1];
  if (slug) {
    const article = articlesBySlug.get(slug);
    if (!article) return {};
    const { image, imagePosition, category } = article.frontmatter;
    return { image, imagePosition, category };
  }
  const id = youtubeId(entry.enlace);
  return id ? { image: youtubeThumbUrl(id) } : {};
}
```

- [ ] **Step 4: Ejecutar el test y verlo pasar**

Run: `node --experimental-strip-types --no-warnings --test tests/community/news-image.test.ts`
Expected: PASS (5 tests).

Nota: el test «ficha sin imagen» comprueba campo a campo porque `newsImage` devuelve `{ image: undefined, imagePosition: undefined, category: 'Coloso' }` (con `deepStrictEqual`, `{ x: undefined }` ≠ `{}`).

- [ ] **Step 5: Commit**

```bash
git add src/features/community/lib/news-image.ts tests/community/news-image.test.ts
git commit -m "$(cat <<'EOF'
feat(comunidad): imagen deducida de la novedad (ficha enlazada o miniatura de YouTube)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Últimos vídeos (`latest-videos.ts`)

**Files:**
- Create: `src/features/community/lib/latest-videos.ts`
- Test: `tests/community/latest-videos.test.ts`

**Interfaces:**
- Consumes: `FeedVideo = { id: string; title: string; published?: string }` de `src/features/community/lib/youtube-feed.ts`.
- Produces: `latestVideos<T extends FeedVideo>(videos: readonly T[], n: number): T[]` (lo usa la tarea 8).

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/community/latest-videos.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latestVideos } from '../../src/features/community/lib/latest-videos.ts';

const v = (id: string, published?: string) => (published ? { id, title: id, published } : { id, title: id });

const VIDEOS = [
  v('aaaaaaaaaaa'),
  v('bbbbbbbbbbb', '2025-12-13T14:19:43+00:00'),
  v('ccccccccccc'),
  v('ddddddddddd', '2026-03-01T10:00:00+00:00'),
  v('eeeeeeeeeee', 'no-es-una-fecha'),
];

test('más reciente primero; los sin fecha (o con fecha inválida) al final, en su orden', () => {
  assert.deepEqual(
    latestVideos(VIDEOS, 10).map((x) => x.id),
    ['ddddddddddd', 'bbbbbbbbbbb', 'aaaaaaaaaaa', 'ccccccccccc', 'eeeeeeeeeee'],
  );
});

test('n limita el número de vídeos', () => {
  assert.deepEqual(latestVideos(VIDEOS, 2).map((x) => x.id), ['ddddddddddd', 'bbbbbbbbbbb']);
  assert.deepEqual(latestVideos(VIDEOS, 0), []);
  assert.deepEqual(latestVideos([], 4), []);
});

test('misma fecha: se respeta el orden de entrada; no muta la lista', () => {
  const same = [v('xxxxxxxxxxx', '2026-01-01T00:00:00Z'), v('yyyyyyyyyyy', '2026-01-01T00:00:00Z')];
  const copy = structuredClone(same);
  assert.deepEqual(latestVideos(same, 4).map((x) => x.id), ['xxxxxxxxxxx', 'yyyyyyyyyyy']);
  assert.deepEqual(same, copy);
});
```

- [ ] **Step 2: Ejecutar el test y verlo fallar**

Run: `node --experimental-strip-types --no-warnings --test tests/community/latest-videos.test.ts`
Expected: FAIL con `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implementar**

Crear `src/features/community/lib/latest-videos.ts`:

```ts
/** «Últimos vídeos» de /comunidad (spec 2026-10-27 §6). Puro (lo prueban los tests con node:test). */
import type { FeedVideo } from './youtube-feed.ts';

/** Fecha en ms, o `null` si falta o no es válida. */
const timeOf = (video: FeedVideo) => {
  const t = video.published ? Date.parse(video.published) : Number.NaN;
  return Number.isNaN(t) ? null : t;
};

/**
 * Los `n` vídeos más recientes: primero los fechados (de más nuevo a más viejo), luego los sin fecha en su orden
 * (los destacados de Boris no traen fecha). A igualdad, el orden de entrada. No muta `videos`.
 */
export function latestVideos<T extends FeedVideo>(videos: readonly T[], n: number): T[] {
  return videos
    .map((video, index) => ({ video, index, time: timeOf(video) }))
    .sort((x, y) => {
      if (x.time !== null && y.time !== null) return y.time - x.time || x.index - y.index;
      if (x.time !== null) return -1;
      if (y.time !== null) return 1;
      return x.index - y.index;
    })
    .slice(0, Math.max(0, n))
    .map((e) => e.video);
}
```

- [ ] **Step 4: Ejecutar el test y verlo pasar**

Run: `node --experimental-strip-types --no-warnings --test tests/community/latest-videos.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/community/lib/latest-videos.ts tests/community/latest-videos.test.ts
git commit -m "$(cat <<'EOF'
feat(comunidad): latestVideos, los vídeos del canal por fecha

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `check:content` rechaza `-vs-` en los slugs

**Files:**
- Modify: `src/core/content/validate.ts` (función nueva tras `crossCheckReservedSlugs`)
- Modify: `scripts/check-content.mts` (import, comentario de cabecera punto 9, sección «9»)
- Test: `tests/content/validate.test.ts` (import y test al final)

**Interfaces:**
- Produces: `crossCheckPollIdSlugs(slugs: Iterable<string>): string[]`.

- [ ] **Step 1: Escribir el test que falla**

En `tests/content/validate.test.ts`, añadir `crossCheckPollIdSlugs` al import:

```ts
import {
  crossCheckEntities,
  crossCheckNews,
  crossCheckPollIdSlugs,
  crossCheckPolls,
  crossCheckReservedSlugs,
  crossCheckVideoLinks,
} from '../../src/core/content/validate.ts';
```

y al final del archivo:

```ts
test('crossCheckPollIdSlugs: un slug con "-vs-" o acabado en "-vs" rompería el id de la encuesta', () => {
  assert.deepEqual(crossCheckPollIdSlugs(['the-bloop', 'el-gran-maja', 'vs-inicio', 'canvas-azul', 'versus']), []);
  const errors = crossCheckPollIdSlugs(['the-bloop', 'bloop-vs-maja', 'colosos-vs']);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /^src\/content\/bloop-vs-maja\.mdx: .*-vs-.*encuesta/);
  assert.match(errors[1], /^src\/content\/colosos-vs\.mdx: /);
});
```

- [ ] **Step 2: Ejecutar el test y verlo fallar**

Run: `node --experimental-strip-types --no-warnings --test tests/content/validate.test.ts`
Expected: FAIL con `does not provide an export named 'crossCheckPollIdSlugs'`.

- [ ] **Step 3: Implementar en `validate.ts`**

Justo después de `crossCheckReservedSlugs` en `src/core/content/validate.ts`:

```ts
/** `-vs-` dentro del slug, o `-vs` al final: el corte de `parsePollId` caería dentro del nombre. */
const POLL_SEPARATOR_IN_SLUG = /-vs(?:-|$)/;

/**
 * El id de una encuesta es `<semana>-<a>-vs-<b>` y el historial de /comunidad lo parte por el primer `-vs-`
 * (`parsePollId`). Un slug que contenga `-vs-` o acabe en `-vs` partiría mal sus encuestas: se rechaza.
 */
export function crossCheckPollIdSlugs(slugs: Iterable<string>): string[] {
  const errors: string[] = [];
  for (const slug of slugs) {
    if (POLL_SEPARATOR_IN_SLUG.test(slug)) {
      errors.push(
        `src/content/${slug}.mdx: "${slug}" contiene "-vs-" (o acaba en "-vs"), que separa las opciones en el id de una encuesta; renombra la ficha`,
      );
    }
  }
  return errors;
}
```

- [ ] **Step 4: Ejecutar el test y verlo pasar**

Run: `node --experimental-strip-types --no-warnings --test tests/content/validate.test.ts`
Expected: PASS.

- [ ] **Step 5: Conectarlo en `scripts/check-content.mts`**

En el import de `validate.ts`:

```ts
import {
  crossCheckEntities,
  crossCheckNews,
  crossCheckPollIdSlugs,
  crossCheckPolls,
  crossCheckReservedSlugs,
  crossCheckVideoLinks,
} from '../src/core/content/validate.ts';
```

Sustituir la línea 9 del comentario de cabecera:

```ts
 *  9. Un MDX usa como slug un nombre reservado por una ruta estática (`arena`, `registro`, `aleatorio`) o un slug
 *     que contiene `-vs-` (o acaba en `-vs`), que rompería el id de sus encuestas (`<semana>-<a>-vs-<b>`).
```

Sustituir el bloque 9:

```ts
// 9: nombres reservados por rutas estáticas y slugs que romperían el id de una encuesta
problems['Slugs reservados'].push(...crossCheckReservedSlugs(slugs), ...crossCheckPollIdSlugs(slugs));
```

- [ ] **Step 6: Verificar a mano con un archivo temporal**

```bash
printf -- "---\ntitle: Prueba\nuniverse: 'Colosos'\n---\n\nPrueba.\n" > src/content/prueba-vs-falsa.mdx
npm run check:content; echo "exit=$?"
rm src/content/prueba-vs-falsa.mdx
npm run check:content
```

Expected: la primera ejecución termina con `exit=1` y lista bajo `✗ Slugs reservados (1)` la línea `src/content/prueba-vs-falsa.mdx: "prueba-vs-falsa" contiene "-vs-"…`. Tras borrar el archivo, `✓ Todo en orden.` (Asegúrate de que el archivo temporal queda borrado: `git status` limpio salvo los cambios de la tarea.)

- [ ] **Step 7: Commit**

```bash
git add src/core/content/validate.ts scripts/check-content.mts tests/content/validate.test.ts
git commit -m "$(cat <<'EOF'
feat(check:content): rechazar slugs con -vs-, que romperían el id de las encuestas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Endpoint `GET /api/comunidad/historial`

**Files:**
- Create: `src/app/api/comunidad/historial/route.ts`

**Interfaces:**
- Consumes: `summarizeHistory`, `emptyHistory`, `PollHistory` (tarea 1); `getActivePoll(): Promise<PollDef | null>` de `@/features/community/server/poll-state`; `getContentRepository()` (`getCuratedPolls`, `getArticles`); `prisma` de `@/lib/prisma`; `describeError` de `@/features/community/lib/describe-error`.
- Produces: `GET /api/comunidad/historial` → JSON `PollHistory`, `Cache-Control: no-store`, siempre 200 (lo consume la tarea 7).

Los route handlers no se cachean por defecto en Next 16 (`node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`, «Caching»), y el proyecto no activa Cache Components: no hace falta `export const dynamic`.

- [ ] **Step 1: Implementar el route handler**

Crear `src/app/api/comunidad/historial/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContentRepository } from '@/core/content';
import { getActivePoll } from '@/features/community/server/poll-state';
import { describeError } from '@/features/community/lib/describe-error';
import { emptyHistory, summarizeHistory, type PollHistory } from '@/features/community/lib/poll-history';

/**
 * Historial de la encuesta semanal para /comunidad (spec 2026-10-27 §4): una sola consulta agrupada sobre `PollVote`.
 * Es opcional: ante cualquier fallo se registra una línea y se responde vacío con 200, y la página no se rompe.
 * Los Route Handlers no se cachean por defecto.
 */
export async function GET() {
  let history: PollHistory = emptyHistory();
  try {
    const repo = getContentRepository();
    const [groups, current, curated, articles] = await Promise.all([
      prisma.pollVote.groupBy({ by: ['pollId', 'option'], _count: { _all: true } }),
      getActivePoll(),
      repo.getCuratedPolls(),
      repo.getArticles(),
    ]);
    history = summarizeHistory(
      groups.map((g) => ({ pollId: g.pollId, option: g.option, count: g._count._all })),
      {
        currentPollId: current?.id ?? null,
        curated,
        sealedSlugs: new Set(articles.filter((a) => a.frontmatter.status === 'proximamente').map((a) => a.slug)),
      },
    );
  } catch (error) {
    console.error(`[comunidad] no se pudo leer el historial: ${describeError(error)}`);
  }
  return NextResponse.json(history, { headers: { 'Cache-Control': 'no-store' } });
}
```

- [ ] **Step 2: Tipos y lint**

Run: `npx tsc --noEmit && npx eslint src/app/api/comunidad/historial/route.ts`
Expected: sin errores.

- [ ] **Step 3: Probar contra la base local**

```bash
make db-up
npm run dev   # en otra terminal (o en segundo plano); espera a «Ready»
curl -s -D - http://localhost:3000/api/comunidad/historial
```

Expected (base sin votos): `HTTP/1.1 200`, `cache-control: no-store` y el cuerpo `{"lastWeek":null,"palmares":[],"masPedidos":[]}`.

Sembrar votos de prueba (con la fecha de hoy en 2026-W44; si la ejecutas otra semana, usa dos semanas anteriores a la actual):

```bash
docker compose exec -T db psql -U root -d webboris -c "INSERT INTO \"PollVote\" (id, \"pollId\", option, \"voterKey\", \"ipHash\") VALUES
 ('qa-h1','2026-W42-vlad-julia-vs-el-gran-maja','vlad-julia','qa-k1','qa-ip'),
 ('qa-h2','2026-W42-vlad-julia-vs-el-gran-maja','vlad-julia','qa-k2','qa-ip'),
 ('qa-h3','2026-W42-vlad-julia-vs-el-gran-maja','el-gran-maja','qa-k3','qa-ip'),
 ('qa-h4','2026-W43-the-bloop-vs-slowdown-criyonte','the-bloop','qa-k4','qa-ip');"
curl -s http://localhost:3000/api/comunidad/historial
```

Expected: `lastWeek.id` = `2026-W43-the-bloop-vs-slowdown-criyonte`, `winner` = `the-bloop`, `total` = 1; `palmares` = `[{"slug":"the-bloop","wins":1,"duels":1},{"slug":"vlad-julia","wins":1,"duels":1}]`; `masPedidos` = `[]`.

Comprobar el fallo controlado: `make db-down`, repetir el `curl` → 200 con el cuerpo vacío y, en la consola del dev server, **una** línea `[comunidad] no se pudo leer el historial: …`. Después `make db-up`.

Limpiar: `docker compose exec -T db psql -U root -d webboris -c "DELETE FROM \"PollVote\" WHERE id LIKE 'qa-h%';"` y parar el dev server.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/comunidad/historial/route.ts
git commit -m "$(cat <<'EOF'
feat(comunidad): GET /api/comunidad/historial, historial de votos sin caché

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `FighterPortrait`, «Próxima semana» en `PollTile` y `PollHistoryTiles`

**Files:**
- Create: `src/features/community/components/FighterPortrait.tsx`
- Modify: `src/features/community/components/PollTile.tsx`
- Create: `src/features/community/components/PollHistoryTiles.tsx`

**Interfaces:**
- Consumes: `PollDef` de `../lib/poll-schedule`; `PollHistory`, `LastWeekResult`, `PalmaresEntry`, `PedidoEntry` de `../lib/poll-history` (tarea 1); `GET /api/comunidad/historial` (tarea 6); `REGISTRO_ROUTE` de `@/core/search/wiki-routes`.
- Produces (los usa la tarea 8):
  - `PollFighter` (movido a `FighterPortrait.tsx`; `PollTile.tsx` lo re-exporta, así que `import { PollTile, type PollFighter } from '…/PollTile'` sigue valiendo).
  - `FighterPortrait({ fighter: PollFighter; pending?: boolean; sizes?: string; className?: string })`
  - `PollTile({ initialPoll: PollDef; fighters: Record<string, PollFighter>; nextPoll?: PollDef | null })`
  - `PollHistoryTiles({ fighters: Record<string, PollFighter> })` (`'use client'`)

- [ ] **Step 1: Crear `FighterPortrait.tsx`**

Es el `Portrait` de `PollTile` tal cual, con `sizes`, `className` y `eager` configurables (decisión D8).

```tsx
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, coverOf } from '@/components/content/CategoryPlaceholder';

export interface PollFighter {
  slug: string;
  title: string;
  image?: string;
  imagePosition?: string;
  category?: string;
  /** `proximamente`: la ficha sigue sellada; si Boris ya la desclasificó viene sin estado. */
  status?: string;
}

/**
 * Retrato cuadrado de una ficha en la encuesta y en el historial de /comunidad. `pending`: la ficha aún no está
 * desclasificada; el retrato va apagado (en gris), como las tarjetas «Próximamente». `className` ajusta el tamaño
 * (p. ej. `w-12 rounded-xl` en las listas; `cn` resuelve el conflicto con `w-full`/`rounded-2xl`).
 */
export function FighterPortrait({
  fighter,
  pending = false,
  sizes = '(min-width: 768px) 300px, 40vw',
  className,
  eager = false,
}: {
  fighter: PollFighter;
  pending?: boolean;
  sizes?: string;
  className?: string;
  /** `loading="eager"`: solo para los retratos de la encuesta vigente, cerca del primer pliegue. */
  eager?: boolean;
}) {
  const cover = coverOf(fighter.image);
  return (
    <div
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#00122E]',
        pending && 'grayscale opacity-70',
        className,
      )}
    >
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes={sizes}
          loading={eager ? 'eager' : undefined}
          className="object-cover"
          style={{ objectPosition: fighter.imagePosition ?? '50% 50%' }}
        />
      ) : (
        <CategoryPlaceholder category={fighter.category} className="[&_span]:hidden" />
      )}
    </div>
  );
}
```

- [ ] **Step 2: `PollTile` usa `FighterPortrait`**

En `src/features/community/components/PollTile.tsx`:

a) Sustituir los imports

```tsx
import Image from 'next/image';
import Link from 'next/link';
```

por

```tsx
import Link from 'next/link';
```

y la línea

```tsx
import { CategoryPlaceholder, coverOf } from '@/components/content/CategoryPlaceholder';
```

por

```tsx
import { FighterPortrait, type PollFighter } from './FighterPortrait';
```

b) Sustituir la interfaz `PollFighter` entera (desde `export interface PollFighter {` hasta su `}`) por:

```tsx
export type { PollFighter } from './FighterPortrait';
```

c) Borrar la función `Portrait` entera (desde el comentario `/** \`pending\`: la ficha aún no está desclasificada…` hasta su `}` de cierre).

d) Sustituir los cuatro `<Portrait ` por `<FighterPortrait ` (dos en la rama `declassify`, dos en la rama del duelo) y añadir a cada uno la prop `eager` (los demás props no cambian).

- [ ] **Step 3: `PollTile` recibe `nextPoll` y pinta «Próxima semana»**

a) Firma:

```tsx
export function PollTile({
  initialPoll,
  fighters,
  nextPoll = null,
}: {
  initialPoll: PollDef;
  fighters: Record<string, PollFighter>;
  /** Encuesta de la semana siguiente (`getNextPoll`): adelanto al pie. */
  nextPoll?: PollDef | null;
}) {
```

b) Justo después de `const headingId = React.useId();`:

```tsx
  // Solo si sigue siendo futura: el lunes la página ISR puede traer como «próxima» la que la API ya da como vigente.
  const upcoming = nextPoll && nextPoll.week > poll.week ? nextPoll : null;
  const [nextA, nextB] = upcoming ? [upcoming.a, upcoming.b].map((slug) => fighters[slug]?.title ?? slug) : [];
```

c) Justo antes del `</section>` final (después del bloque `{declassify ? (… ) : (…)}` del pie):

```tsx
      {upcoming && (
        <p className="mt-4 border-t border-white/10 pt-4 text-[13px] text-white/70">
          {upcoming.tipo === 'desclasificar' ? `Próxima semana: ¿${nextA} o ${nextB}?` : `Próxima semana: ${nextA} vs ${nextB}`}
        </p>
      )}
```

- [ ] **Step 4: Crear `PollHistoryTiles.tsx`**

```tsx
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Section } from '@/components/content/Section';
import { PendingLabel } from '@/components/content/PendingLabel';
import { REGISTRO_ROUTE } from '@/core/search/wiki-routes';
import { FighterPortrait, type PollFighter } from './FighterPortrait';
import type { LastWeekResult, PalmaresEntry, PedidoEntry, PollHistory } from '../lib/poll-history';

type Fighters = Record<string, PollFighter>;

async function fetchHistory(): Promise<PollHistory> {
  const res = await fetch('/api/comunidad/historial', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PollHistory;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const TITLE_LINK =
  'inline-flex min-h-11 items-center break-words rounded-sm font-bold text-white transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/** Retrato de 48 px de las listas; el icono del placeholder, a escala. */
const SMALL_PORTRAIT = 'w-12 shrink-0 rounded-xl [&_svg]:h-5 [&_svg]:w-5';

/**
 * Historial de la encuesta (spec 2026-10-27 §4): semana pasada, palmarés y expedientes más pedidos. Va bajo el
 * pliegue: mientras carga o si falla no pinta nada. Cada sección se omite si no tiene datos, y un slug que ya no
 * está en `fighters` (ficha renombrada o borrada) se omite.
 */
export function PollHistoryTiles({ fighters }: { fighters: Fighters }) {
  const { data } = useQuery({
    queryKey: ['comunidad', 'historial'],
    queryFn: fetchHistory,
    retry: 1,
    staleTime: 60_000,
  });
  if (!data) return null;
  return (
    <>
      {data.lastWeek && <LastWeek result={data.lastWeek} fighters={fighters} />}
      <Palmares entries={data.palmares} fighters={fighters} />
      <MasPedidos entries={data.masPedidos} fighters={fighters} />
    </>
  );
}

function LastWeek({ result, fighters }: { result: LastWeekResult; fighters: Fighters }) {
  const a = fighters[result.a];
  const b = fighters[result.b];
  if (!a || !b) return null;
  const declassify = result.tipo === 'desclasificar';
  const winner = result.winner ? fighters[result.winner] : undefined;
  const verdict = !winner
    ? 'Empate'
    : declassify
      ? `La comunidad pidió desclasificar ${winner.title} (${result.percents[winner.slug] ?? 0} %)`
      : `Ganó ${winner.title}`;

  return (
    <Section id="semana-pasada" title="Resultado de la semana pasada" contained={false}>
      <div className="crystal-surface rounded-2xl p-5 md:p-6">
        <ul className="grid grid-cols-2 gap-4">
          {[a, b].map((f) => (
            <li key={f.slug} className="flex min-w-0 flex-col gap-2">
              <FighterPortrait
                fighter={f}
                pending={declassify && f.status === 'proximamente'}
                sizes="96px"
                className="w-20 sm:w-24"
              />
              <span className="break-words font-bold text-white">{f.title}</span>
              <span className="font-display text-2xl font-black tabular-nums text-white">
                {result.percents[f.slug] ?? 0}%
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg font-bold text-white">{verdict}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/60">
          {plural(result.total, 'voto', 'votos')}
        </p>
      </div>
    </Section>
  );
}

function Palmares({ entries, fighters }: { entries: PalmaresEntry[]; fighters: Fighters }) {
  const rows = entries.filter((e) => fighters[e.slug]);
  if (rows.length === 0) return null;
  return (
    <Section id="palmares" title="Palmarés" contained={false}>
      <ol className="divide-y divide-white/10">
        {rows.map((e, i) => {
          const f = fighters[e.slug];
          return (
            <li key={e.slug} className="flex items-center gap-4 py-3">
              {/* El `ol` ya anuncia la posición a los lectores de pantalla. */}
              <span
                aria-hidden="true"
                className="w-6 shrink-0 text-right font-display text-xl font-black italic tabular-nums text-primary"
              >
                {i + 1}
              </span>
              <FighterPortrait fighter={f} sizes="48px" className={SMALL_PORTRAIT} />
              <div className="min-w-0 flex-1">
                <Link href={`/wiki/${f.slug}` as Route} className={TITLE_LINK}>
                  {f.title}
                </Link>
                <p className="text-[12px] text-white/55">
                  {plural(e.wins, 'victoria', 'victorias')} · {plural(e.duels, 'duelo', 'duelos')}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function MasPedidos({ entries, fighters }: { entries: PedidoEntry[]; fighters: Fighters }) {
  const rows = entries.filter((e) => fighters[e.slug]);
  if (rows.length === 0) return null;
  return (
    <Section
      id="mas-pedidos"
      title="Expedientes más pedidos"
      action={{ href: REGISTRO_ROUTE, label: 'Ver el registro' }}
      contained={false}
    >
      <ol className="divide-y divide-white/10">
        {rows.map((e) => {
          const f = fighters[e.slug];
          const sealed = f.status === 'proximamente';
          return (
            <li key={e.slug} className="flex items-center gap-4 py-3">
              <FighterPortrait fighter={f} pending={sealed} sizes="48px" className={SMALL_PORTRAIT} />
              <div className="min-w-0 flex-1">
                <Link href={`/wiki/${f.slug}` as Route} className={TITLE_LINK}>
                  {f.title}
                </Link>
                <p className="text-[12px] text-white/55">{plural(e.votes, 'voto', 'votos')}</p>
              </div>
              {sealed && <PendingLabel className="shrink-0" />}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 5: Tipos y lint**

Run: `npx tsc --noEmit && npx eslint src/features/community/components`
Expected: sin errores. (`PollHistoryTiles` aún no se monta: lo hace la tarea 8; la página sigue compilando porque `PollFighter` se re-exporta desde `PollTile`.)

- [ ] **Step 6: Commit**

```bash
git add src/features/community/components/FighterPortrait.tsx src/features/community/components/PollTile.tsx src/features/community/components/PollHistoryTiles.tsx
git commit -m "$(cat <<'EOF'
feat(comunidad): FighterPortrait, «Próxima semana» en la encuesta y PollHistoryTiles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Página `/comunidad` reordenada

**Files:**
- Create: `src/features/community/components/NewsFeatured.tsx`
- Modify: `src/app/(marketing)/comunidad/page.tsx` (se reescribe entero)

**Interfaces:**
- Consumes: `getNextPoll` (tarea 2), `newsImage` / `NewsImage` (tarea 3), `latestVideos` (tarea 4), `PollTile` con `nextPoll` y `PollHistoryTiles` (tarea 7), `getChannelVideos(): Promise<ChannelVideo[]>` (`@/features/community/data/channel-videos`), `getEntityIndex()` (`@/core/content/entities`), `registroSlugs(entries)` (`@/core/search/registro`), `RegistroProgress({ slugs })`, `SOCIAL_LINKS.youtube`, `REGISTRO_ROUTE`.
- Produces: la página. `getLatestVideo` deja de usarse aquí y **se queda** (lo usa `FeaturedVideosSection` de la landing).

- [ ] **Step 1: Crear `NewsFeatured.tsx`**

```tsx
import type { NewsEntry } from '@/core/content';
import { ContentCard } from '@/components/content/ContentCard';
import { formatFecha } from '@/utils/format-date';
import type { NewsImage } from '../lib/news-image';

/**
 * Novedad más reciente a ancho completo (spec 2026-10-27 §3). Es lo primero de /comunidad: su imagen es el LCP y va
 * `eager`. La imagen sale de su enlace (`newsImage`); sin imagen, `ContentCard` pinta el placeholder por categoría.
 */
export function NewsFeatured({ entry, image }: { entry: NewsEntry; image: NewsImage }) {
  return (
    <ContentCard
      href={entry.enlace}
      external={entry.enlace.startsWith('https://')}
      title={entry.titulo}
      meta={formatFecha(new Date(`${entry.fecha}T00:00:00Z`))}
      description={entry.resumen}
      image={image.image}
      imagePosition={image.imagePosition}
      category={image.category}
      aspect="video"
      headingLevel={3}
      eager
      sizes="(min-width: 768px) 720px, 100vw"
    />
  );
}
```

- [ ] **Step 2: Reescribir `src/app/(marketing)/comunidad/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ContentCard, Section } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { getEntityIndex } from '@/core/content/entities';
import { registroSlugs } from '@/core/search/registro';
import { REGISTRO_ROUTE } from '@/core/search/wiki-routes';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { RegistroProgress } from '@/features/monsters/components/wiki/registro/RegistroProgress';
import { SOCIAL_LINKS } from '@/features/marketing/config/social';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { getChannelVideos, type ChannelVideo } from '@/features/community/data/channel-videos';
import { getNextPoll } from '@/features/community/lib/poll-schedule';
import { latestVideos } from '@/features/community/lib/latest-videos';
import { newsImage } from '@/features/community/lib/news-image';
import { CommunityCreatureRow } from '@/features/community/components/CommunityCreatureRow';
import { NewsFeatured } from '@/features/community/components/NewsFeatured';
import { NewsList } from '@/features/community/components/NewsList';
import { PollHistoryTiles } from '@/features/community/components/PollHistoryTiles';
import { PollTile, type PollFighter } from '@/features/community/components/PollTile';
import { formatFecha } from '@/utils/format-date';
import { youtubeThumbUrl, youtubeWatchUrl } from '@/utils/youtube';

/** Criatura, duelo, próximo duelo y vídeos cambian sin rebuild; la encuesta y el historial se piden aparte, sin caché. */
export const revalidate = 3600;

const INTRO = 'Lo último de BorisaoBlois, la votación de la semana y lo que más pide la comunidad.';

/** Vídeos de «Últimos vídeos» (spec 2026-10-27 §6). */
const MAX_VIDEOS = 4;

export const metadata: Metadata = pageMetadata({
  title: 'Comunidad | Universos de BorisaoBlois',
  description: INTRO,
  path: '/comunidad',
});

const videoDate = (published?: string) =>
  published && !Number.isNaN(Date.parse(published)) ? formatFecha(new Date(published)) : undefined;

function VideoCard({ video, sizes, className }: { video: ChannelVideo; sizes: string; className?: string }) {
  return (
    <ContentCard
      external
      href={youtubeWatchUrl(video.id)}
      title={video.title}
      meta={videoDate(video.published)}
      image={youtubeThumbUrl(video.id)}
      headingLevel={3}
      sizes={sizes}
      className={className}
    />
  );
}

export default async function ComunidadPage() {
  const repo = getContentRepository();
  const [articles, weekly, curated, news, channelVideos, entityIndex] = await Promise.all([
    repo.getArticles(),
    getWeeklyPoll(),
    repo.getCuratedPolls(),
    repo.getNews(5),
    getChannelVideos(),
    getEntityIndex(),
  ]);
  const { poll } = weekly;
  const nextPoll = getNextPoll(curated, weekly.fighters.map((a) => a.slug));
  // Todas las fichas, no solo las de la encuesta de este render: el lunes la API devuelve la encuesta nueva y la página ISR
  // aún es la vieja; con el mapa completo la encuesta nueva (y el historial) sale con título y retrato en lugar del slug.
  const fighterCards: Record<string, PollFighter> = Object.fromEntries(
    articles.map((a) => [
      a.slug,
      {
        slug: a.slug,
        title: a.frontmatter.title,
        image: a.frontmatter.image,
        imagePosition: a.frontmatter.imagePosition,
        category: a.frontmatter.category,
        status: a.frontmatter.status,
      },
    ]),
  );

  const articlesBySlug = new Map(articles.map((a) => [a.slug, a]));
  const [featuredNews, ...moreNews] = news;
  const creature = pickFeatured(articles);
  const videos = latestVideos(channelVideos, MAX_VIDEOS);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pb-16 pt-32">
        {/* Una columna, ordenada por importancia (spec 2026-10-27 §2). El historial y el registro van bajo el
            pliegue: se pintan en el cliente y su aparición no mueve lo que se ve al entrar. */}
        <div className="mx-auto max-w-3xl space-y-14 px-6">
          <header className="space-y-4">
            <h1 className="page-title text-white">Comunidad</h1>
            <p className="text-lg leading-relaxed text-white/70">{INTRO}</p>
          </header>

          <Section id="novedades" title="Novedades" contained={false}>
            {featuredNews ? (
              <div className="space-y-6">
                <NewsFeatured entry={featuredNews} image={newsImage(featuredNews, articlesBySlug)} />
                {moreNews.length > 0 && <NewsList news={moreNews} />}
              </div>
            ) : (
              <NewsList news={[]} />
            )}
          </Section>

          {poll && <PollTile initialPoll={poll} fighters={fighterCards} nextPoll={nextPoll} />}

          {creature && (
            <Section id="criatura-semana" title="Criatura de la semana" contained={false}>
              <CommunityCreatureRow creature={creature} />
            </Section>
          )}

          {videos.length > 0 && (
            <Section
              id="videos"
              title="Últimos vídeos"
              action={{ href: SOCIAL_LINKS.youtube, label: 'Ver el canal', external: true }}
              contained={false}
            >
              {videos.length === 1 ? (
                <VideoCard video={videos[0]} sizes="(min-width: 768px) 448px, 100vw" className="max-w-md" />
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {videos.map((video) => (
                    <li key={video.id}>
                      <VideoCard video={video} sizes="(min-width: 768px) 352px, (min-width: 640px) 50vw, 100vw" />
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          <PollHistoryTiles fighters={fighterCards} />

          <Section
            id="tu-registro"
            title="Tu registro"
            action={{ href: REGISTRO_ROUTE, label: 'Ver el registro' }}
            contained={false}
          >
            <p className="mb-4 text-white/70">El registro se guarda solo en este navegador.</p>
            <RegistroProgress slugs={registroSlugs(entityIndex.entries)} />
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Tipos y lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores. Si `typedRoutes` se queja del `href` de `NewsFeatured` (`ContentCard` recibe `string` y hace el cast a `Route` por dentro, así que no debería), no añadir `as Route` fuera de `ContentCard`.

- [ ] **Step 4: Ver la página en el navegador**

```bash
make db-up
npm run dev
```

Abrir `http://localhost:3000/comunidad` y comprobar, con la base sin votos:
- Orden: «Novedades» (la de 2026-10-18 de «La Hecatombe del Lapeón» como tarjeta grande; esa ficha no tiene `image`, así que muestra el placeholder de su categoría; debajo, en lista, la del tráiler de Colosos 3), encuesta con «Próxima semana: ¿… o …?» al pie (la semana 2026-W45 es `desclasificar`), «Criatura de la semana», «Últimos vídeos» (hasta 4 tarjetas en dos columnas desde 640 px; «Ver el canal ›» abre YouTube en otra pestaña), y «Tu registro» con la barra.
- No aparecen «Resultado de la semana pasada», «Palmarés» ni «Expedientes más pedidos», y la consola del navegador no tiene errores.
- Con los votos de prueba de la tarea 6 (mismo `INSERT`): aparecen «Resultado de la semana pasada» («Ganó The Bloop Ojo Solo», «1 voto») y «Palmarés» (2 filas, «1 victoria · 1 duelo»). Para «Expedientes más pedidos», añadir `('qa-h5','2026-W41-cael-cortes-vs-aodos-ay01','aodos-ay01','qa-k5','qa-ip')` **y** una entrada temporal `{ "semana": "2026-W41", "tipo": "desclasificar", "a": "cael-cortes", "b": "aodos-ay01" }` en `src/content/encuestas.json` (no se hace commit de ella): aparece la lista con «1 voto», «Próximamente» y «Ver el registro ›».
- Limpiar: `DELETE FROM "PollVote" WHERE id LIKE 'qa-h%';`, `git checkout src/content/encuestas.json`, parar el dev server.

- [ ] **Step 5: Commit**

```bash
git add src/features/community/components/NewsFeatured.tsx "src/app/(marketing)/comunidad/page.tsx"
git commit -m "$(cat <<'EOF'
feat(comunidad): novedad destacada, próximo duelo, últimos vídeos, historial y registro en el hub

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: `CLAUDE.md` y validación final

**Files:**
- Modify: `CLAUDE.md` (párrafo «**Contenido del hub `/comunidad`**», añadir al final)

- [ ] **Step 1: Actualizar `CLAUDE.md`**

Al final del párrafo que empieza por «**Contenido del hub `/comunidad`**» (tras «…`src/core/content/iso-week.ts`).»), añadir:

```markdown
 Orden de `/comunidad` (spec 2026-10-27): novedades (la más reciente destacada, con la imagen deducida de su enlace: portada de la ficha o miniatura de YouTube, `newsImage`), encuesta (con «Próxima semana» al pie, `getNextPoll`), criatura de la semana, últimos vídeos (hasta 4, `latestVideos` sobre `getChannelVideos`), historial de votos y «Tu registro» (`RegistroProgress`). El historial (semana pasada, palmarés y expedientes más pedidos) se deduce de `PollVote` por `pollId` con un solo `groupBy`: `summarizeHistory` (`src/features/community/lib/poll-history.ts`) ← `GET /api/comunidad/historial` (sin caché; ante un error registra una línea y responde vacío) ← `PollHistoryTiles` (cliente, bajo el pliegue; sin datos no pinta nada). `parsePollId` parte el id por el primer `-vs-`, así que ningún slug puede contener `-vs-` ni acabar en `-vs` (lo rechaza `check:content`).
```

(Va en la misma línea del párrafo, separado por un espacio, como el resto de frases de ese bloque.)

- [ ] **Step 2: Validación completa**

Run, en orden:

```bash
npm run lint
npm test
npm run check:content
npm run build
```

Expected:
- `npm run lint`: sin errores.
- `npm test`: todos los tests pasan (incluidos `poll-history`, `news-image`, `latest-videos`, `poll-schedule` y `validate`).
- `npm run check:content`: `✓ Todo en orden.`
- `npm run build`: compila; en la tabla de rutas, `/comunidad` sale con revalidación de 1 h y `/api/comunidad/historial` como dinámica (`ƒ`).

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: hub /comunidad — orden, historial de votos por pollId y -vs- prohibido en slugs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: QA (la hace el controlador, spec §8)**

Sobre el build de producción (`make start`, `:3131`), arrancado con `RESEND_API_KEY=re_qa_invalida CONTACT_EMAIL=qa-sin-envio@example.invalid`, con Chrome DevTools: 320/390/768/1280 px sin desbordamiento horizontal; axe sin violaciones; historial con base vacía (no aparece nada, sin errores en consola), con votos de dos semanas (semana pasada + palmarés) y con una votación `desclasificar` pasada (más pedidos), con los mismos datos de prueba de la tarea 8 y su limpieza al terminar. El issue y el PR (spec §10) también los gestiona el controlador.

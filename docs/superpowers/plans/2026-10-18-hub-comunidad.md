# Hub de la comunidad (`/comunidad`) — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página pública `/comunidad` con criatura de la semana, último vídeo, encuesta "¿Quién gana?" con votos anónimos en Postgres y novedades del lore, con el código preparado para un futuro CMS y cuentas de usuario.

**Architecture:** El contenido (artículos, novedades, duelos curados) se lee a través de una interfaz `ContentRepository` cuya única implementación hoy lee archivos de `src/content/`. La lógica de la encuesta (calendario, porcentajes, hashes) son funciones puras probadas con `node:test`. Los votos se guardan en la tabla `PollVote` vía un server action; el estado se lee con un route handler GET sin caché. La página es estática (ISR 1 h) y la encuesta es una isla de cliente con TanStack Query.

**Tech Stack:** Next.js 16 (App Router, `typedRoutes`), React 19, Tailwind v4, Zod v4, Prisma v7 + `@prisma/adapter-pg`, TanStack Query v5, `@next/third-parties` (`YouTubeEmbed`), `node:test` (Node 24).

**Spec:** `docs/superpowers/specs/2026-10-18-hub-comunidad-design.md`

## Global Constraints

- Node 24 (`node --experimental-strip-types`); **no se añaden dependencias npm**.
- Módulos puros probados con `node:test` (`src/core/content/schemas.ts`, `readers.ts`, `validate.ts`, `src/features/community/lib/*.ts`): **solo imports relativos con extensión `.ts`** (nunca `@/`), y solo `import type` para tipos de otros módulos.
- Copy en español; "solo canon": ninguna novedad ni texto inventa lore.
- Estilo "ley Abisal": superficie sólida `#061a2e` bajo texto, `border-white/10`, radios `3xl/2xl/xl/full`, texto ≥ 11 px, texto secundario ≥ `text-white/60`, superficies naranja sólidas con texto `#00122E`, foco visible `ring-primary`.
- `typedRoutes: true`: enlaces con query/hash o externos se tipan con `as Route` (`import type { Route } from 'next'`).
- Nunca imprimir valores de `.env`; solo nombres de variables.
- La página y el build **no** dependen de la base de datos ni de `VOTE_SECRET`.
- Commits terminan con:
  ```
  Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01XWwdBECjKje9Q7zMvFK3J1
  ```

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/core/content/schemas.ts` | Zod: `CuratedPollSchema(s)`, `NewsEntrySchema`, tipos (puro) |
| `src/core/content/readers.ts` | Leer `novedades/*.md` y `encuestas.json` del disco → `{ items, errors }` (puro) |
| `src/core/content/validate.ts` | Referencias cruzadas: slugs de duelos y enlaces de novedades (puro) |
| `src/core/content/types.ts` | Interfaz `ContentRepository` |
| `src/core/content/file-repository.ts` | Implementación sobre archivos |
| `src/core/content/index.ts` | `getContentRepository()` (punto de cambio para el CMS) |
| `src/content/encuestas.json`, `src/content/novedades/*.md` | Contenido inicial |
| `src/features/community/lib/poll-schedule.ts` | Semana ISO, encuesta vigente, `pollId` (puro) |
| `src/features/community/lib/poll-results.ts` | Recuento → porcentajes que suman 100 (puro) |
| `src/features/community/lib/youtube-feed.ts` | Parseo del feed Atom de YouTube (puro) |
| `src/features/community/lib/voter.ts` | HMAC, IP del cliente, configuración de votación (puro) |
| `src/features/community/types.ts` | `PollState` |
| `src/features/community/data/latest-video.ts` | Último vídeo (RSS + respaldo) |
| `src/features/community/server/poll-state.ts` | Encuesta vigente + lectura de votos (Prisma) |
| `src/features/community/actions/cast-vote.ts` | Server action de voto |
| `src/app/api/comunidad/encuesta/route.ts` | GET del estado (sin caché) |
| `src/features/community/components/*.tsx` | `CrystalTile` + 4 tiles |
| `src/app/(marketing)/comunidad/page.tsx` | Página |
| `src/features/marketing/config/videos.ts` | Lista estática de vídeos (sale de `FeaturedVideosSection`) |
| `tests/**/*.test.ts` | Tests `node:test` |

---

### Task 1: Esquemas de contenido + runner de tests + CI

**Files:**
- Create: `src/core/content/schemas.ts`
- Create: `tests/content/schemas.test.ts`
- Modify: `package.json` (script `test`)
- Modify: `.github/workflows/ci.yml` (paso `npm test`)

**Interfaces:**
- Produces: `WEEK_KEY_REGEX: RegExp`, `CuratedPollSchema`, `CuratedPollsSchema`, `type CuratedPoll = { semana: string; a: string; b: string; pregunta?: string }`, `NewsEntrySchema`, `type NewsEntry = { id: string; fecha: string /* YYYY-MM-DD */; titulo: string; resumen: string; enlace: string }`.

- [ ] **Step 1: Escribir el test que falla** — `tests/content/schemas.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CuratedPollsSchema, NewsEntrySchema } from '../../src/core/content/schemas.ts';

test('acepta duelos curados válidos', () => {
  const r = CuratedPollsSchema.safeParse([
    { semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja' },
    { semana: '2026-W43', a: 'the-bloop', b: 'slowdown-criyote', pregunta: '¿Quién gana?' },
  ]);
  assert.equal(r.success, true);
});

test('rechaza semanas repetidas', () => {
  const r = CuratedPollsSchema.safeParse([
    { semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja' },
    { semana: '2026-W42', a: 'the-bloop', b: 'bogbo' },
  ]);
  assert.equal(r.success, false);
});

test('rechaza un duelo contra sí mismo', () => {
  const r = CuratedPollsSchema.safeParse([{ semana: '2026-W42', a: 'bogbo', b: 'bogbo' }]);
  assert.equal(r.success, false);
});

test('rechaza semanas mal formadas', () => {
  for (const semana of ['2026-42', '2026-W54', '2026-W00', '26-W10']) {
    const r = CuratedPollsSchema.safeParse([{ semana, a: 'a-1', b: 'b-1' }]);
    assert.equal(r.success, false, semana);
  }
});

test('normaliza la fecha Date que produce gray-matter', () => {
  const n = NewsEntrySchema.parse({
    fecha: new Date('2026-10-18T00:00:00Z'),
    titulo: 'Título de prueba',
    resumen: 'Resumen corto',
    enlace: '/wiki/bogbo',
  });
  assert.equal(n.fecha, '2026-10-18');
});

test('rechaza enlaces http y resúmenes largos', () => {
  const base = { fecha: '2026-10-18', titulo: 'Título de prueba', resumen: 'Resumen corto', enlace: '/wiki' };
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'http://x.com' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, resumen: 'x'.repeat(161) }).success, false);
  assert.equal(NewsEntrySchema.safeParse(base).success, true);
});
```

- [ ] **Step 2: Añadir el script y ver que falla**

En `package.json`, dentro de `"scripts"`, añadir tras `"check:content"`:

```json
    "test": "node --experimental-strip-types --no-warnings --test 'tests/**/*.test.ts'"
```

Run: `npm test`
Expected: FAIL — `Cannot find module '…/src/core/content/schemas.ts'`.

- [ ] **Step 3: Implementar** — `src/core/content/schemas.ts`

```ts
/**
 * Esquemas del contenido del hub /comunidad (novedades y duelos curados).
 * Puro: solo imports relativos con extensión .ts (lo usan check:content y los tests con node:test).
 */
import { z } from 'zod';

/** Semana ISO `YYYY-Www` (W01–W53). */
export const WEEK_KEY_REGEX = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/;

const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug inválido' });

export const CuratedPollSchema = z
  .object({
    semana: z.string().regex(WEEK_KEY_REGEX, { message: 'semana ISO inválida (YYYY-Www)' }),
    a: Slug,
    b: Slug,
    pregunta: z.string().min(3).max(80).optional(),
  })
  .refine((p) => p.a !== p.b, { message: 'a y b deben ser criaturas distintas' });

export const CuratedPollsSchema = z.array(CuratedPollSchema).superRefine((polls, ctx) => {
  const seen = new Set<string>();
  polls.forEach((p, i) => {
    if (seen.has(p.semana)) {
      ctx.addIssue({ code: 'custom', message: `semana repetida: ${p.semana}`, path: [i, 'semana'] });
    }
    seen.add(p.semana);
  });
});

export type CuratedPoll = z.infer<typeof CuratedPollSchema>;

/** gray-matter convierte `fecha: 2026-10-18` en Date: se normaliza a `YYYY-MM-DD`. */
const IsoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.iso.date(),
);

const NewsLink = z
  .string()
  .refine((v) => v.startsWith('/') || v.startsWith('https://'), {
    message: 'el enlace debe ser interno (/…) o https://',
  });

export const NewsEntrySchema = z.object({
  fecha: IsoDate,
  titulo: z.string().min(3).max(90),
  resumen: z.string().min(3).max(160),
  enlace: NewsLink,
});

/** `id` = nombre del archivo sin extensión. */
export type NewsEntry = z.infer<typeof NewsEntrySchema> & { id: string };
```

- [ ] **Step 4: Ver que pasa**

Run: `npm test`
Expected: PASS — 6 tests, 0 failures.

- [ ] **Step 5: Añadir el paso al CI** — `.github/workflows/ci.yml`, entre `- run: npm run lint` y `- run: npm run check:content`:

```yaml
      - run: npm test

```

- [ ] **Step 6: Validar y commit**

Run: `npx tsc --noEmit` (sin salida) y `npm run lint` (0 errores).

```bash
git add src/core/content/schemas.ts tests/content/schemas.test.ts package.json .github/workflows/ci.yml
git commit -m "feat(comunidad): esquemas de novedades y duelos + runner node:test en CI"
```

---

### Task 2: Calendario de encuestas y porcentajes (lógica pura)

**Files:**
- Create: `src/features/community/lib/poll-schedule.ts`
- Create: `src/features/community/lib/poll-results.ts`
- Create: `tests/community/poll-schedule.test.ts`
- Create: `tests/community/poll-results.test.ts`

**Interfaces:**
- Consumes: `type CuratedPoll` (Task 1).
- Produces:
  - `DEFAULT_QUESTION = '¿Quién gana?'`
  - `interface PollDef { id: string; week: string; a: string; b: string; question: string }`
  - `isoWeekKey(date: Date): string` → `"2026-W42"`
  - `weeksSinceEpoch(date: Date): number`
  - `pollIdFor(week: string, a: string, b: string): string` → `"2026-W42-vlad-julia-vs-el-gran-maja"`
  - `getCurrentPoll(curated: readonly CuratedPoll[], fighterSlugs: readonly string[], date?: Date): PollDef | null`
  - `interface PollTally { totals: Record<string, number>; percents: Record<string, number>; total: number }`
  - `computeTally(options: readonly string[], counts: Readonly<Record<string, number>>): PollTally`

- [ ] **Step 1: Tests que fallan** — `tests/community/poll-schedule.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_QUESTION,
  getCurrentPoll,
  isoWeekKey,
  pollIdFor,
  weeksSinceEpoch,
} from '../../src/features/community/lib/poll-schedule.ts';

const FIGHTERS = ['vlad-julia', 'the-bloop', 'el-gran-maja', 'bogbo', 'le-mug', 'slowdown-criyote'];

test('isoWeekKey sigue la definición ISO (lunes, jueves decide el año)', () => {
  assert.equal(isoWeekKey(new Date('2026-10-18T12:00:00Z')), '2026-W42'); // domingo
  assert.equal(isoWeekKey(new Date('2026-10-19T00:00:00Z')), '2026-W43'); // lunes
  assert.equal(isoWeekKey(new Date('2021-01-03T10:00:00Z')), '2020-W53');
  assert.equal(isoWeekKey(new Date('2024-12-30T10:00:00Z')), '2025-W01');
  assert.equal(isoWeekKey(new Date('2026-01-01T10:00:00Z')), '2026-W01');
});

test('weeksSinceEpoch es igual toda la semana y suma 1 el lunes', () => {
  const sunday = weeksSinceEpoch(new Date('2026-10-18T23:59:59Z'));
  assert.equal(weeksSinceEpoch(new Date('2026-10-12T00:00:00Z')), sunday);
  assert.equal(weeksSinceEpoch(new Date('2026-10-19T00:00:00Z')), sunday + 1);
  assert.equal(weeksSinceEpoch(new Date('1970-01-05T00:00:00Z')), 0);
});

test('el duelo curado de la semana gana a la rotación automática', () => {
  const poll = getCurrentPoll(
    [{ semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja', pregunta: '¿Quién resiste?' }],
    FIGHTERS,
    new Date('2026-10-14T09:00:00Z'),
  );
  assert.deepEqual(poll, {
    id: '2026-W42-vlad-julia-vs-el-gran-maja',
    week: '2026-W42',
    a: 'vlad-julia',
    b: 'el-gran-maja',
    question: '¿Quién resiste?',
  });
});

test('sin duelo curado: emparejamiento automático estable y nunca contra sí mismo', () => {
  for (let n = 2; n <= FIGHTERS.length; n++) {
    const fighters = FIGHTERS.slice(0, n);
    for (let week = 0; week < 120; week++) {
      const date = new Date(Date.UTC(2026, 0, 5) + week * 7 * 86_400_000);
      const monday = getCurrentPoll([], fighters, date);
      const sunday = getCurrentPoll([], fighters, new Date(date.getTime() + 6 * 86_400_000 + 3_600_000));
      assert.ok(monday);
      assert.notEqual(monday.a, monday.b);
      assert.deepEqual(monday, sunday);
      assert.equal(monday.question, DEFAULT_QUESTION);
      assert.equal(monday.id, pollIdFor(monday.week, monday.a, monday.b));
    }
  }
});

test('el orden y los duplicados de la lista de luchadores no cambian el resultado', () => {
  const date = new Date('2026-11-04T12:00:00Z');
  const a = getCurrentPoll([], FIGHTERS, date);
  const b = getCurrentPoll([], [...FIGHTERS].reverse().concat('bogbo'), date);
  assert.deepEqual(a, b);
});

test('menos de dos luchadores → sin encuesta', () => {
  assert.equal(getCurrentPoll([], ['bogbo'], new Date('2026-11-04T12:00:00Z')), null);
  assert.equal(getCurrentPoll([], [], new Date('2026-11-04T12:00:00Z')), null);
});
```

`tests/community/poll-results.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTally } from '../../src/features/community/lib/poll-results.ts';

test('porcentajes enteros que suman 100', () => {
  assert.deepEqual(computeTally(['a', 'b'], { a: 2, b: 1 }), {
    totals: { a: 2, b: 1 },
    percents: { a: 67, b: 33 },
    total: 3,
  });
  assert.deepEqual(computeTally(['a', 'b'], { a: 1, b: 1 }).percents, { a: 50, b: 50 });
  assert.deepEqual(computeTally(['a', 'b'], { a: 1, b: 2 }).percents, { a: 33, b: 67 });
});

test('sin votos: todo a cero', () => {
  assert.deepEqual(computeTally(['a', 'b'], {}), { totals: { a: 0, b: 0 }, percents: { a: 0, b: 0 }, total: 0 });
});

test('ignora opciones ajenas al duelo y valores no válidos', () => {
  const t = computeTally(['a', 'b'], { a: 3, b: -2, intruso: 9 });
  assert.deepEqual(t.totals, { a: 3, b: 0 });
  assert.equal(t.total, 3);
  assert.deepEqual(t.percents, { a: 100, b: 0 });
});

test('la suma es 100 para cualquier recuento positivo', () => {
  for (let a = 0; a <= 40; a++) {
    for (let b = 0; b <= 40; b++) {
      if (a + b === 0) continue;
      const { percents } = computeTally(['a', 'b'], { a, b });
      assert.equal(percents.a + percents.b, 100, `${a}/${b}`);
    }
  }
});
```

- [ ] **Step 2: Ver que fallan**

Run: `npm test`
Expected: FAIL — no existen `poll-schedule.ts` / `poll-results.ts`.

- [ ] **Step 3: Implementar** — `src/features/community/lib/poll-schedule.ts`

```ts
/**
 * Calendario de la encuesta "¿Quién gana?". Puro (lo prueban los tests con node:test):
 * solo imports relativos con extensión .ts.
 */
import type { CuratedPoll } from '../../../core/content/schemas.ts';

export const DEFAULT_QUESTION = '¿Quién gana?';

export interface PollDef {
  /** `<semana>-<a>-vs-<b>`: estable toda la semana; los votos se cuentan por este id. */
  id: string;
  week: string;
  a: string;
  b: string;
  question: string;
}

const DAY_MS = 86_400_000;
/** Lunes 1970-01-05 00:00 UTC: origen para contar semanas completas. */
const EPOCH_MONDAY_MS = Date.UTC(1970, 0, 5);

/** Lunes 00:00 UTC de la semana ISO que contiene `date`. */
function mondayUtc(date: Date): number {
  const day = date.getUTCDay() || 7; // 1 = lunes … 7 = domingo
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - (day - 1));
}

/** Clave de semana ISO, p. ej. `2026-W42`. El jueves de la semana decide el año. */
export function isoWeekKey(date: Date): string {
  const thursday = new Date(mondayUtc(date) + 3 * DAY_MS);
  const year = thursday.getUTCFullYear();
  const week = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / DAY_MS / 7) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Semanas completas desde el lunes 1970-01-05 hasta el lunes de la semana de `date`. */
export function weeksSinceEpoch(date: Date): number {
  return Math.round((mondayUtc(date) - EPOCH_MONDAY_MS) / (7 * DAY_MS));
}

export function pollIdFor(week: string, a: string, b: string): string {
  return `${week}-${a}-vs-${b}`;
}

/**
 * Encuesta vigente: el duelo curado de la semana si existe; si no, un emparejamiento
 * determinista entre luchadores (artículos con stats). `null` con menos de dos luchadores.
 */
export function getCurrentPoll(
  curated: readonly CuratedPoll[],
  fighterSlugs: readonly string[],
  date: Date = new Date(),
): PollDef | null {
  const week = isoWeekKey(date);
  const pick = curated.find((p) => p.semana === week);
  if (pick) {
    return { id: pollIdFor(week, pick.a, pick.b), week, a: pick.a, b: pick.b, question: pick.pregunta ?? DEFAULT_QUESTION };
  }

  const fighters = [...new Set(fighterSlugs)].sort();
  const n = fighters.length;
  if (n < 2) return null;

  const w = weeksSinceEpoch(date);
  const i = w % n;
  const j = (i + 1 + (w % (n - 1))) % n; // desplazamiento en [1, n-1] → nunca i = j
  const a = fighters[i];
  const b = fighters[j];
  return { id: pollIdFor(week, a, b), week, a, b, question: DEFAULT_QUESTION };
}
```

`src/features/community/lib/poll-results.ts`

```ts
/** Recuento de una encuesta → porcentajes enteros que suman 100 (método del mayor resto). Puro. */
export interface PollTally {
  totals: Record<string, number>;
  percents: Record<string, number>;
  total: number;
}

export function computeTally(options: readonly string[], counts: Readonly<Record<string, number>>): PollTally {
  const totals: Record<string, number> = {};
  for (const o of options) totals[o] = Math.max(0, Math.floor(counts[o] ?? 0));
  const total = options.reduce((sum, o) => sum + totals[o], 0);

  const percents: Record<string, number> = {};
  if (total === 0) {
    for (const o of options) percents[o] = 0;
    return { totals, percents, total };
  }

  const exact = options.map((o) => ({ o, value: (totals[o] * 100) / total }));
  for (const { o, value } of exact) percents[o] = Math.floor(value);
  let remaining = 100 - options.reduce((sum, o) => sum + percents[o], 0);
  const byRemainder = [...exact].sort((x, y) => (y.value % 1) - (x.value % 1) || x.o.localeCompare(y.o));
  for (const { o } of byRemainder) {
    if (remaining <= 0) break;
    percents[o] += 1;
    remaining -= 1;
  }
  return { totals, percents, total };
}
```

- [ ] **Step 4: Ver que pasan**

Run: `npm test`
Expected: PASS — todos los tests de `tests/content` y `tests/community`.

- [ ] **Step 5: Commit**

```bash
git add src/features/community/lib/poll-schedule.ts src/features/community/lib/poll-results.ts tests/community
git commit -m "feat(comunidad): calendario determinista de la encuesta y porcentajes"
```

---

### Task 3: Repositorio de contenido, contenido inicial y `check:content`

**Files:**
- Create: `src/core/content/readers.ts`, `src/core/content/validate.ts`, `src/core/content/types.ts`, `src/core/content/file-repository.ts`, `src/core/content/index.ts`
- Create: `src/content/encuestas.json`
- Create: `src/content/novedades/2025-12-13-colosos-3-trailer.md`, `src/content/novedades/2026-10-18-la-hecatombe-del-lapeon.md`
- Create: `tests/content/readers.test.ts`, `tests/content/validate.test.ts`
- Modify: `scripts/check-content.mts`
- Modify: `CLAUDE.md` (sección "Pipeline de contenido")

**Interfaces:**
- Consumes: esquemas y tipos de Task 1.
- Produces:
  - `readNews(dir: string): { items: NewsEntry[]; errors: string[] }` (ordenadas por fecha desc, luego id)
  - `readCuratedPolls(file: string): { items: CuratedPoll[]; errors: string[] }`
  - `crossCheckPolls(polls, articleSlugs: ReadonlySet<string>, fighterSlugs: ReadonlySet<string>): string[]`
  - `crossCheckNews(news, articleSlugs: ReadonlySet<string>): string[]`
  - `interface ContentRepository { getArticles(): Promise<WikiArticle[]>; getNews(limit?: number): Promise<NewsEntry[]>; getCuratedPolls(): Promise<CuratedPoll[]> }`
  - `getContentRepository(): ContentRepository` (desde `@/core/content`), que además re-exporta `type CuratedPoll`, `type NewsEntry`, `type ContentRepository`.

- [ ] **Step 1: Tests que fallan** — `tests/content/readers.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readCuratedPolls, readNews } from '../../src/core/content/readers.ts';

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'wb-content-'));
}

test('lee novedades válidas, ordena por fecha y reporta las inválidas', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, '2026-01-01-a.md'), '---\nfecha: 2026-01-01\ntitulo: "Primera novedad"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  fs.writeFileSync(path.join(dir, '2026-02-01-b.md'), '---\nfecha: 2026-02-01\ntitulo: "Segunda novedad"\nresumen: "Texto"\nenlace: https://youtube.com/x\n---\n');
  fs.writeFileSync(path.join(dir, 'rota.md'), '---\ntitulo: "Sin fecha"\n---\n');
  const { items, errors } = readNews(dir);
  assert.deepEqual(items.map((n) => n.id), ['2026-02-01-b', '2026-01-01-a']);
  assert.equal(items[1].fecha, '2026-01-01');
  assert.equal(errors.length > 0, true);
  assert.match(errors[0], /^rota\.md:/);
});

test('carpeta de novedades inexistente → vacío sin errores', () => {
  assert.deepEqual(readNews(path.join(tmpDir(), 'no-existe')), { items: [], errors: [] });
});

test('lee encuestas.json y reporta JSON o esquema inválidos', () => {
  const dir = tmpDir();
  const ok = path.join(dir, 'ok.json');
  fs.writeFileSync(ok, JSON.stringify([{ semana: '2026-W42', a: 'vlad-julia', b: 'el-gran-maja' }]));
  assert.equal(readCuratedPolls(ok).items.length, 1);

  const broken = path.join(dir, 'broken.json');
  fs.writeFileSync(broken, '[{');
  assert.match(readCuratedPolls(broken).errors[0], /JSON inválido/);

  const invalid = path.join(dir, 'invalid.json');
  fs.writeFileSync(invalid, JSON.stringify([{ semana: 'x', a: 'a', b: 'a' }]));
  const r = readCuratedPolls(invalid);
  assert.equal(r.items.length, 0);
  assert.ok(r.errors.length >= 1);
});
```

`tests/content/validate.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crossCheckNews, crossCheckPolls } from '../../src/core/content/validate.ts';

const ARTICLES = new Set(['the-bloop', 'el-gran-maja', 'la-hecatombe-del-lapeon']);
const FIGHTERS = new Set(['the-bloop', 'el-gran-maja']);

test('duelos: slug inexistente o sin stats', () => {
  const errors = crossCheckPolls(
    [
      { semana: '2026-W42', a: 'the-bloop', b: 'el-gran-maja' },
      { semana: '2026-W43', a: 'the-bloop', b: 'no-existe' },
      { semana: '2026-W44', a: 'la-hecatombe-del-lapeon', b: 'the-bloop' },
    ],
    ARTICLES,
    FIGHTERS,
  );
  assert.equal(errors.length, 2);
  assert.match(errors[0], /no-existe.*no existe/);
  assert.match(errors[1], /la-hecatombe-del-lapeon.*no tiene stats/);
});

test('novedades: enlaces internos rotos; externos e internos válidos pasan', () => {
  const base = { fecha: '2026-10-18', titulo: 'T', resumen: 'R' };
  const errors = crossCheckNews(
    [
      { ...base, id: 'ok-articulo', enlace: '/wiki/the-bloop' },
      { ...base, id: 'ok-ruta', enlace: '/comunidad' },
      { ...base, id: 'ok-arena', enlace: '/wiki/arena?a=the-bloop&b=el-gran-maja' },
      { ...base, id: 'ok-externo', enlace: 'https://www.youtube.com/watch?v=vRVFd7LfTTs' },
      { ...base, id: 'rota', enlace: '/wiki/no-existe' },
    ],
    ARTICLES,
  );
  assert.deepEqual(errors, ['novedades/rota.md: enlace interno inexistente /wiki/no-existe']);
});
```

- [ ] **Step 2: Ver que fallan**

Run: `npm test`
Expected: FAIL — no existen `readers.ts` / `validate.ts`.

- [ ] **Step 3: Implementar los módulos puros**

`src/core/content/readers.ts`

```ts
/**
 * Lectura de novedades y duelos curados desde el disco. Puro (lo usan check:content,
 * el repositorio de archivos y los tests): solo imports relativos con extensión .ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { CuratedPollsSchema, NewsEntrySchema, type CuratedPoll, type NewsEntry } from './schemas.ts';

export interface ReadResult<T> {
  items: T[];
  errors: string[];
}

export function readNews(dir: string): ReadResult<NewsEntry> {
  if (!fs.existsSync(dir)) return { items: [], errors: [] };
  const items: NewsEntry[] = [];
  const errors: string[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    const parsed = NewsEntrySchema.safeParse(data);
    if (parsed.success) {
      items.push({ ...parsed.data, id: file.replace(/\.md$/, '') });
    } else {
      for (const issue of parsed.error.issues) {
        errors.push(`${file}: ${issue.path.join('.') || '(raíz)'} — ${issue.message}`);
      }
    }
  }
  items.sort((x, y) => y.fecha.localeCompare(x.fecha) || x.id.localeCompare(y.id));
  return { items, errors };
}

export function readCuratedPolls(file: string): ReadResult<CuratedPoll> {
  if (!fs.existsSync(file)) return { items: [], errors: [] };
  const name = path.basename(file);
  let json: unknown;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { items: [], errors: [`${name}: JSON inválido — ${(error as Error).message}`] };
  }
  const parsed = CuratedPollsSchema.safeParse(json);
  if (!parsed.success) {
    return {
      items: [],
      errors: parsed.error.issues.map((i) => `${name}: ${i.path.join('.') || '(raíz)'} — ${i.message}`),
    };
  }
  return { items: parsed.data, errors: [] };
}
```

`src/core/content/validate.ts`

```ts
/** Referencias cruzadas del contenido del hub contra los artículos. Puro. */
import type { CuratedPoll, NewsEntry } from './schemas.ts';

/** Rutas propias (no MDX) a las que puede enlazar una novedad. */
const STATIC_ROUTES = new Set(['/', '/wiki', '/wiki/arena', '/comunidad']);

export function crossCheckPolls(
  polls: readonly CuratedPoll[],
  articleSlugs: ReadonlySet<string>,
  fighterSlugs: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  for (const p of polls) {
    for (const slug of [p.a, p.b]) {
      if (!articleSlugs.has(slug)) errors.push(`encuestas.json ${p.semana}: "${slug}" no existe en src/content`);
      else if (!fighterSlugs.has(slug)) errors.push(`encuestas.json ${p.semana}: "${slug}" no tiene stats`);
    }
  }
  return errors;
}

export function crossCheckNews(news: readonly NewsEntry[], articleSlugs: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  for (const n of news) {
    if (!n.enlace.startsWith('/')) continue; // externos (https://) no se comprueban
    const pathOnly = n.enlace.split(/[?#]/)[0];
    const article = pathOnly.match(/^\/wiki\/([^/]+)$/)?.[1];
    const ok = STATIC_ROUTES.has(pathOnly) || (article !== undefined && articleSlugs.has(article));
    if (!ok) errors.push(`novedades/${n.id}.md: enlace interno inexistente ${n.enlace}`);
  }
  return errors;
}
```

- [ ] **Step 4: Ver que pasan**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Repositorio** (código de Next, puede usar `@/`)

`src/core/content/types.ts`

```ts
import type { WikiArticle } from '@/core/types/wiki';
import type { CuratedPoll, NewsEntry } from './schemas';

/**
 * Fuente de contenido de la web. Hoy la implementa `fileContentRepository` (archivos en src/content);
 * un CMS futuro implementará esta misma interfaz y la UI no cambiará.
 */
export interface ContentRepository {
  getArticles(): Promise<WikiArticle[]>;
  /** Novedades ordenadas por fecha descendente. */
  getNews(limit?: number): Promise<NewsEntry[]>;
  getCuratedPolls(): Promise<CuratedPoll[]>;
}
```

`src/core/content/file-repository.ts`

```ts
import path from 'node:path';
import { getAllArticles } from '@/utils/mdx';
import { readCuratedPolls, readNews } from './readers';
import type { ContentRepository } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

function logErrors(source: string, errors: string[]): void {
  for (const e of errors) console.error(`[content:${source}] ${e}`);
}

/** Contenido desde archivos. Las entradas inválidas se omiten y se registran (como los MDX). */
export const fileContentRepository: ContentRepository = {
  getArticles: () => getAllArticles(),

  async getNews(limit) {
    const { items, errors } = readNews(path.join(CONTENT_DIR, 'novedades'));
    logErrors('novedades', errors);
    return limit === undefined ? items : items.slice(0, limit);
  },

  async getCuratedPolls() {
    const { items, errors } = readCuratedPolls(path.join(CONTENT_DIR, 'encuestas.json'));
    logErrors('encuestas', errors);
    return items;
  },
};
```

`src/core/content/index.ts`

```ts
import { fileContentRepository } from './file-repository';
import type { ContentRepository } from './types';

/** Punto único de cambio: cuando exista un CMS, elegir aquí su implementación (p. ej. por variable de entorno). */
export function getContentRepository(): ContentRepository {
  return fileContentRepository;
}

export type { ContentRepository } from './types';
export type { CuratedPoll, NewsEntry } from './schemas';
```

- [ ] **Step 6: Contenido inicial**

`src/content/encuestas.json` (W42 = semana del 12 al 18 de octubre de 2026; la siguiente arranca el lunes 19):

```json
[
  { "semana": "2026-W42", "a": "vlad-julia", "b": "el-gran-maja" },
  { "semana": "2026-W43", "a": "the-bloop", "b": "slowdown-criyote" },
  { "semana": "2026-W44", "a": "bogbo", "b": "le-mug" }
]
```

`src/content/novedades/2026-10-18-la-hecatombe-del-lapeon.md`

```markdown
---
fecha: 2026-10-18
titulo: "La Hecatombe del Lapeón llega a la wiki"
resumen: "Ya puedes leer la sinopsis del cuarto universo de BorisaoBlois: los Lapeones y los Cyon."
enlace: /wiki/la-hecatombe-del-lapeon
---
```

`src/content/novedades/2025-12-13-colosos-3-trailer.md`

```markdown
---
fecha: 2025-12-13
titulo: "Colosos 3: Tráiler Oficial"
resumen: "BorisaoBlois publicó el tráiler oficial de Colosos 3 en su canal de YouTube."
enlace: https://www.youtube.com/watch?v=vRVFd7LfTTs
---
```

- [ ] **Step 7: Integrar en `check:content`** — `scripts/check-content.mts`

1. En el comentario de cabecera, añadir tras el punto 5:
   ```
    *  6. Las novedades (src/content/novedades/*.md) o los duelos (src/content/encuestas.json) no cumplen su esquema,
    *     un duelo usa una criatura inexistente o sin stats, o una novedad enlaza a una ruta interna inexistente.
   ```
2. Imports, tras el de `WikiFrontmatterSchema`:
   ```ts
   import { readCuratedPolls, readNews } from '../src/core/content/readers.ts';
   import { crossCheckNews, crossCheckPolls } from '../src/core/content/validate.ts';
   ```
3. En `problems`, añadir la clave `'Comunidad (novedades / encuestas)': [],`.
4. Junto a `universesWithArticles`, declarar `const fighterSlugs = new Set<string>();` y, dentro del bucle de MDX, en la rama `else` de `parsed.success`, añadir:
   ```ts
       const stats = parsed.data.stats;
       if (stats && Object.keys(stats).length > 0) fighterSlugs.add(file.replace(/\.mdx$/, ''));
   ```
   (mismo criterio que `hasStats`).
5. Antes de `// Reporte`, añadir:
   ```ts
   // 6: hub /comunidad
   const news = readNews(path.join(CONTENT_DIR, 'novedades'));
   const polls = readCuratedPolls(path.join(CONTENT_DIR, 'encuestas.json'));
   problems['Comunidad (novedades / encuestas)'].push(
     ...news.errors,
     ...polls.errors,
     ...crossCheckNews(news.items, slugs),
     ...crossCheckPolls(polls.items, slugs, fighterSlugs),
   );
   ```

Run: `npm run check:content`
Expected: `✓ Todo en orden.`

Prueba negativa: cambiar temporalmente `"le-mug"` por `"no-existe"` en `encuestas.json` → `npm run check:content` falla con `encuestas.json 2026-W44: "no-existe" no existe en src/content`. Revertir.

- [ ] **Step 8: Documentar en `CLAUDE.md`** — en "Pipeline de contenido de la wiki", tras el párrafo "Solo canon, nada inventado", añadir:

```markdown
**Contenido del hub `/comunidad`**: `src/content/novedades/<fecha>-<slug>.md` (frontmatter `fecha`, `titulo`, `resumen` ≤ 160, `enlace` interno o https; sin cuerpo) y `src/content/encuestas.json` (duelos curados `{ semana: "YYYY-Www", a, b, pregunta? }` entre criaturas con `stats`; las semanas sin duelo rotan solas). Se leen siempre vía `getContentRepository()` (`src/core/content/`), el punto de cambio para un futuro CMS. `check:content` valida ambos.
```

- [ ] **Step 9: Validar y commit**

Run: `npm test` (PASS), `npx tsc --noEmit`, `npm run lint` (0 errores), `npm run check:content` (✓).

```bash
git add src/core/content src/content/encuestas.json src/content/novedades tests/content scripts/check-content.mts CLAUDE.md
git commit -m "feat(comunidad): repositorio de contenido, novedades y duelos curados validados en check:content"
```

---

### Task 4: Último vídeo (RSS + respaldo) y lista de vídeos compartida

**Files:**
- Create: `src/features/community/lib/youtube-feed.ts`
- Create: `tests/community/youtube-feed.test.ts`
- Create: `src/features/marketing/config/videos.ts`
- Create: `src/features/community/data/latest-video.ts`
- Modify: `src/features/marketing/config/social.ts` (añadir `YOUTUBE_CHANNEL_ID`)
- Modify: `src/features/marketing/sections/FeaturedVideosSection.tsx` (usar la lista compartida)
- Modify: `.env.example` (variable opcional `YOUTUBE_FEED_URL`)

**Interfaces:**
- Produces:
  - `interface FeedVideo { id: string; title: string; published: string }`, `parseYoutubeFeed(xml: string): FeedVideo[]`
  - `type VideoOrientation = 'landscape' | 'short'`, `interface FeaturedVideo { id; title; category; orientation: VideoOrientation }`, `FEATURED_VIDEOS: readonly FeaturedVideo[]`
  - `YOUTUBE_CHANNEL_ID = 'UChE8ki_10uZSZN0YTBi8_RA'`
  - `interface LatestVideo { id: string; title: string; published?: string; source: 'rss' | 'fallback' }`, `getLatestVideo(): Promise<LatestVideo>`

- [ ] **Step 1: Test que falla** — `tests/community/youtube-feed.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseYoutubeFeed } from '../../src/features/community/lib/youtube-feed.ts';

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">
  <title>Borisao Blois</title>
  <published>2021-03-03T20:42:26+00:00</published>
  <entry>
    <id>yt:video:vRVFd7LfTTs</id>
    <yt:videoId>vRVFd7LfTTs</yt:videoId>
    <title>Colosos 3: Tráiler Oficial</title>
    <published>2025-12-13T14:19:43+00:00</published>
  </entry>
  <entry>
    <yt:videoId>YykxsLwHPw4</yt:videoId>
    <title>Colosos &amp; Ocultos &quot;2&quot;</title>
    <published>2025-02-05T12:26:01+00:00</published>
  </entry>
  <entry>
    <yt:videoId>id-roto</yt:videoId>
    <title>Inválido</title>
    <published>2025-01-01T00:00:00+00:00</published>
  </entry>
</feed>`;

test('extrae los vídeos en el orden del feed e ignora la cabecera del canal', () => {
  assert.deepEqual(parseYoutubeFeed(FEED), [
    { id: 'vRVFd7LfTTs', title: 'Colosos 3: Tráiler Oficial', published: '2025-12-13T14:19:43+00:00' },
    { id: 'YykxsLwHPw4', title: 'Colosos & Ocultos "2"', published: '2025-02-05T12:26:01+00:00' },
  ]);
});

test('feed vacío o basura → lista vacía', () => {
  assert.deepEqual(parseYoutubeFeed(''), []);
  assert.deepEqual(parseYoutubeFeed('<html>error</html>'), []);
});
```

- [ ] **Step 2: Ver que falla** — Run: `npm test` → FAIL (módulo inexistente).

- [ ] **Step 3: Implementar el parser** — `src/features/community/lib/youtube-feed.ts`

```ts
/** Parseo mínimo del feed Atom público de un canal de YouTube. Puro. */
export interface FeedVideo {
  id: string;
  title: string;
  published: string;
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|#39|apos);/g, (m) => ENTITIES[m] ?? m);

/** Vídeos en el orden del feed (el más reciente primero). Las entradas incompletas se descartan. */
export function parseYoutubeFeed(xml: string): FeedVideo[] {
  const videos: FeedVideo[] = [];
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const entry = match[1];
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1]?.trim();
    if (id && /^[\w-]{11}$/.test(id) && title && published) {
      videos.push({ id, title: decode(title), published });
    }
  }
  return videos;
}
```

- [ ] **Step 4: Ver que pasa** — Run: `npm test` → PASS.

- [ ] **Step 5: Lista de vídeos compartida** — crear `src/features/marketing/config/videos.ts`

```ts
export type VideoOrientation = 'landscape' | 'short';

export interface FeaturedVideo {
  id: string;
  title: string;
  category: string;
  orientation: VideoOrientation;
}

/**
 * Los tres videos que Boris indicó en "Requerimientos Pagina"; títulos tal como aparecen en YouTube.
 * La batalla es horizontal (16:9); "Extinción masiva" y "El Blitz" son YouTube Shorts (9:16).
 * También es el respaldo del "último vídeo" del hub /comunidad si el feed RSS falla.
 */
export const FEATURED_VIDEOS: readonly FeaturedVideo[] = [
  {
    id: 'hedUAqopPBg',
    title: 'Colosos - The Bloop vs El Gran Majá - La Batalla',
    category: 'COLOSOS',
    orientation: 'landscape',
  },
  {
    id: 'XurjKHinBIY',
    title: 'Extinción masiva',
    category: 'SHORT · CGI',
    orientation: 'short',
  },
  {
    id: 'BP6fwpSuR7I',
    title: 'El Blitz',
    category: 'SHORT · SEGUNDA GUERRA MUNDIAL',
    orientation: 'short',
  },
];
```

En `FeaturedVideosSection.tsx`: borrar `type Orientation`, `interface FeaturedVideo`, el comentario y la constante `VIDEOS`; añadir `import { FEATURED_VIDEOS, type VideoOrientation } from '@/features/marketing/config/videos';`; sustituir `Orientation` por `VideoOrientation` en `FRAME_BY_ORIENTATION`, `ITEM_BY_ORIENTATION` y `TITLE_BY_ORIENTATION`, y `VIDEOS.map` por `FEATURED_VIDEOS.map`. Nada más cambia en el JSX.

- [ ] **Step 6: Id del canal** — en `src/features/marketing/config/social.ts`, tras `YOUTUBE_HANDLE`:

```ts
/** Id del canal: lo necesita el feed RSS público de YouTube (último vídeo del hub /comunidad). */
export const YOUTUBE_CHANNEL_ID = 'UChE8ki_10uZSZN0YTBi8_RA';
```

- [ ] **Step 7: Obtener el último vídeo** — `src/features/community/data/latest-video.ts`

```ts
import { FEATURED_VIDEOS } from '@/features/marketing/config/videos';
import { YOUTUBE_CHANNEL_ID } from '@/features/marketing/config/social';
import { parseYoutubeFeed } from '../lib/youtube-feed';

export interface LatestVideo {
  id: string;
  title: string;
  published?: string;
  source: 'rss' | 'fallback';
}

const DEFAULT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

/** Último vídeo del canal (RSS, caché 1 h). Si el feed falla, el primero de la lista del PDF de Boris. */
export async function getLatestVideo(): Promise<LatestVideo> {
  const feedUrl = process.env.YOUTUBE_FEED_URL || DEFAULT_FEED_URL;
  try {
    const res = await fetch(feedUrl, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const [latest] = parseYoutubeFeed(await res.text());
    if (latest) return { ...latest, source: 'rss' };
    throw new Error('feed sin vídeos');
  } catch (error) {
    console.error('[comunidad] feed de YouTube no disponible, uso el respaldo:', error);
  }
  const fallback = FEATURED_VIDEOS[0];
  return { id: fallback.id, title: fallback.title, source: 'fallback' };
}
```

- [ ] **Step 8: `.env.example`** — añadir al final:

```
# Opcional (QA): otra URL para el feed de YouTube del hub /comunidad; una URL inválida fuerza el vídeo de respaldo
# YOUTUBE_FEED_URL=
```

- [ ] **Step 9: Validar y commit**

Run: `npm test`, `npx tsc --noEmit`, `npm run lint`.

```bash
git add src/features/community/lib/youtube-feed.ts tests/community/youtube-feed.test.ts src/features/marketing/config/videos.ts src/features/marketing/config/social.ts src/features/marketing/sections/FeaturedVideosSection.tsx src/features/community/data/latest-video.ts .env.example
git commit -m "feat(comunidad): último vídeo desde el RSS del canal con respaldo a la lista del PDF"
```

---

### Task 5: Votos — modelo `PollVote`, hashes, lectura (GET) y voto (server action)

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_hub_comunidad/migration.sql` (generada)
- Modify: `docker-compose.yml` (puerto configurable)
- Create: `src/features/community/lib/voter.ts`, `tests/community/voter.test.ts`
- Create: `src/features/community/types.ts`
- Create: `src/features/community/server/poll-state.ts`
- Create: `src/app/api/comunidad/encuesta/route.ts`
- Create: `src/features/community/actions/cast-vote.ts`
- Modify: `.env.example`, `.github/workflows/ci.yml` (`VOTE_SECRET`)

**Interfaces:**
- Consumes: `getCurrentPoll`, `PollDef` (Task 2); `computeTally`, `PollTally` (Task 2); `getContentRepository` (Task 3); `hasStats` (`@/features/monsters/lib/stats`); `prisma` (`@/lib/prisma`).
- Produces:
  - `VOTER_COOKIE = 'wb_voter'`, `MAX_VOTES_PER_IP = 5`, `VOTER_COOKIE_MAX_AGE = 31_536_000`
  - `hmac(secret, value): string`, `voterKeyFor(secret, voterId): string`, `ipHashFor(secret, ip, pollId): string`
  - `clientIp(get: (name: string) => string | null): string`
  - `voteSecret(env?: Record<string, string | undefined>): string | null`
  - `type PollState = ({ status: 'open'; poll: PollDef; myOption: string | null } & PollTally) | { status: 'unavailable'; poll: PollDef | null }`
  - `getActivePoll(date?: Date): Promise<PollDef | null>`, `loadOpenState(poll: PollDef, voterKey: string | null): Promise<PollState>`, `isUniqueViolation(e: unknown): boolean`
  - `GET /api/comunidad/encuesta` → JSON `PollState`
  - `castVote(input: { pollId: string; option: string }): Promise<CastVoteResult>` con `type CastVoteResult = { ok: true; state: PollState } | { ok: false; error: 'cerrada' | 'opcion' | 'limite' | 'no-disponible' | 'invalido'; state?: PollState }`

- [ ] **Step 1: Test que falla** — `tests/community/voter.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientIp, hmac, ipHashFor, voteSecret, voterKeyFor } from '../../src/features/community/lib/voter.ts';

const SECRET = 'x'.repeat(32);

test('hmac es determinista, en hex y depende del secreto', () => {
  assert.equal(hmac(SECRET, 'a'), hmac(SECRET, 'a'));
  assert.match(hmac(SECRET, 'a'), /^[0-9a-f]{64}$/);
  assert.notEqual(hmac(SECRET, 'a'), hmac('y'.repeat(32), 'a'));
});

test('el hash de IP cambia por encuesta y nunca contiene la IP', () => {
  const h1 = ipHashFor(SECRET, '203.0.113.7', 'poll-1');
  assert.notEqual(h1, ipHashFor(SECRET, '203.0.113.7', 'poll-2'));
  assert.equal(h1.includes('203.0.113.7'), false);
  assert.notEqual(voterKeyFor(SECRET, 'abc'), voterKeyFor(SECRET, 'abd'));
});

test('clientIp: primer X-Forwarded-For, luego X-Real-IP, luego "desconocida"', () => {
  const headers = (h: Record<string, string>) => (name: string) => h[name] ?? null;
  assert.equal(clientIp(headers({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1' })), '203.0.113.7');
  assert.equal(clientIp(headers({ 'x-real-ip': '198.51.100.2' })), '198.51.100.2');
  assert.equal(clientIp(headers({})), 'desconocida');
});

test('voteSecret exige secreto ≥ 32 caracteres y DATABASE_URL', () => {
  assert.equal(voteSecret({ VOTE_SECRET: SECRET, DATABASE_URL: 'postgresql://x' }), SECRET);
  assert.equal(voteSecret({ VOTE_SECRET: 'corto', DATABASE_URL: 'postgresql://x' }), null);
  assert.equal(voteSecret({ VOTE_SECRET: SECRET }), null);
  assert.equal(voteSecret({}), null);
});
```

- [ ] **Step 2: Ver que falla** — Run: `npm test` → FAIL.

- [ ] **Step 3: Implementar** — `src/features/community/lib/voter.ts`

```ts
/** Identidad anónima del votante y configuración de la votación. Puro (node:crypto). */
import { createHmac } from 'node:crypto';

export const VOTER_COOKIE = 'wb_voter';
/** Votos máximos por red (hash de IP) y encuesta: deja votar a un hogar sin abrir la puerta al spam. */
export const MAX_VOTES_PER_IP = 5;
export const VOTER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** HMAC-SHA256 en hex: no reversible sin el secreto. */
export function hmac(secret: string, value: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export const voterKeyFor = (secret: string, voterId: string): string => hmac(secret, voterId);

export const ipHashFor = (secret: string, ip: string, pollId: string): string => hmac(secret, `${ip}|${pollId}`);

/** IP del cliente detrás del proxy inverso. Nunca se guarda en claro. */
export function clientIp(get: (name: string) => string | null): string {
  const forwarded = get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || get('x-real-ip')?.trim() || 'desconocida';
}

/** Secreto de votación (≥ 32 caracteres) o `null` si la votación no está configurada. */
export function voteSecret(env: Record<string, string | undefined> = process.env): string | null {
  const secret = env.VOTE_SECRET;
  return secret && secret.length >= 32 && env.DATABASE_URL ? secret : null;
}
```

- [ ] **Step 4: Ver que pasa** — Run: `npm test` → PASS.

- [ ] **Step 5: Modelo Prisma** — en `prisma/schema.prisma`, dentro de `model User` añadir la línea `pollVotes     PollVote[]` tras `sessions      Session[]`, y al final del archivo:

```prisma
/// Voto anónimo de la encuesta semanal de /comunidad. La encuesta vive en el contenido (no en la base);
/// `pollId` es "<semana ISO>-<a>-vs-<b>". `userId` queda vacío hasta que existan cuentas.
model PollVote {
  id        String   @id @default(cuid())
  pollId    String
  option    String
  voterKey  String
  ipHash    String
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt DateTime @default(now())

  @@unique([pollId, voterKey])
  @@unique([pollId, userId])
  @@index([pollId, option])
  @@index([pollId, ipHash])
}
```

- [ ] **Step 6: Puerto de Postgres configurable** — en `docker-compose.yml`, cambiar `- "5432:5432"` por:

```yaml
      - "${DB_PORT:-5432}:5432"
```

(En esta máquina el 5432 lo ocupa otro proyecto.)

- [ ] **Step 7: Generar la primera migración contra una base vacía**

No existe `prisma/migrations`: esta migración crea todas las tablas (Auth.js + `PollVote`). Se genera contra un Postgres desechable para no tocar la base local del usuario:

```bash
DB_PORT=5433 docker compose -p webboris-hub up -d db
export DATABASE_URL=postgresql://root:rootpassword@localhost:5433/webboris
until docker compose -p webboris-hub exec -T db pg_isready -U root >/dev/null 2>&1; do sleep 1; done
npx prisma migrate dev --name hub_comunidad
npx prisma generate
```

Expected: `prisma/migrations/<timestamp>_hub_comunidad/migration.sql` con `CREATE TABLE "PollVote"`, los dos índices únicos y los dos índices simples, además de las tablas de Auth.js; "Your database is now in sync with your schema".

- [ ] **Step 8: Tipos y lectura del estado**

`src/features/community/types.ts`

```ts
import type { PollDef } from './lib/poll-schedule';
import type { PollTally } from './lib/poll-results';

/** Estado de la encuesta que reciben el route handler y la isla de cliente. */
export type PollState =
  | ({ status: 'open'; poll: PollDef; myOption: string | null } & PollTally)
  | { status: 'unavailable'; poll: PollDef | null };
```

`src/features/community/server/poll-state.ts`

```ts
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContentRepository } from '@/core/content';
import { hasStats } from '@/features/monsters/lib/stats';
import { getCurrentPoll, type PollDef } from '../lib/poll-schedule';
import { computeTally } from '../lib/poll-results';
import type { PollState } from '../types';

/** Encuesta vigente calculada en el servidor (curada o automática). El cliente nunca la decide. */
export async function getActivePoll(date: Date = new Date()): Promise<PollDef | null> {
  const repo = getContentRepository();
  const [curated, articles] = await Promise.all([repo.getCuratedPolls(), repo.getArticles()]);
  const fighters = articles.filter((a) => hasStats(a.frontmatter)).map((a) => a.slug);
  return getCurrentPoll(curated, fighters, date);
}

/** Recuento de la encuesta y voto propio. Lanza si la base de datos falla: decide el llamador. */
export async function loadOpenState(poll: PollDef, voterKey: string | null): Promise<PollState> {
  const [groups, mine] = await Promise.all([
    prisma.pollVote.groupBy({ by: ['option'], where: { pollId: poll.id }, _count: { _all: true } }),
    voterKey
      ? prisma.pollVote.findUnique({
          where: { pollId_voterKey: { pollId: poll.id, voterKey } },
          select: { option: true },
        })
      : Promise.resolve(null),
  ]);
  const counts = Object.fromEntries(groups.map((g) => [g.option, g._count._all]));
  return { status: 'open', poll, myOption: mine?.option ?? null, ...computeTally([poll.a, poll.b], counts) };
}

export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
```

- [ ] **Step 9: Route handler** — `src/app/api/comunidad/encuesta/route.ts`

```ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getActivePoll, loadOpenState } from '@/features/community/server/poll-state';
import { VOTER_COOKIE, voteSecret, voterKeyFor } from '@/features/community/lib/voter';
import type { PollState } from '@/features/community/types';

/** Estado de la encuesta vigente para la isla de cliente. Los Route Handlers no se cachean por defecto. */
export async function GET() {
  const poll = await getActivePoll();
  let state: PollState = { status: 'unavailable', poll };
  const secret = voteSecret();
  if (poll && secret) {
    try {
      const voterId = (await cookies()).get(VOTER_COOKIE)?.value;
      state = await loadOpenState(poll, voterId ? voterKeyFor(secret, voterId) : null);
    } catch (error) {
      console.error('[comunidad] no se pudo leer la encuesta:', error);
    }
  }
  return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } });
}
```

- [ ] **Step 10: Server action** — `src/features/community/actions/cast-vote.ts`

```ts
'use server';

import { randomUUID } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getActivePoll, isUniqueViolation, loadOpenState } from '../server/poll-state';
import {
  MAX_VOTES_PER_IP,
  VOTER_COOKIE,
  VOTER_COOKIE_MAX_AGE,
  clientIp,
  ipHashFor,
  voteSecret,
  voterKeyFor,
} from '../lib/voter';
import type { PollState } from '../types';

const VoteInput = z.object({
  pollId: z.string().min(1).max(160),
  option: z.string().min(1).max(80),
});

export type CastVoteError = 'cerrada' | 'opcion' | 'limite' | 'no-disponible' | 'invalido';

export type CastVoteResult =
  | { ok: true; state: PollState }
  | { ok: false; error: CastVoteError; state?: PollState };

export async function castVote(input: { pollId: string; option: string }): Promise<CastVoteResult> {
  const parsed = VoteInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalido' };
  const { pollId, option } = parsed.data;

  const poll = await getActivePoll();
  if (!poll || poll.id !== pollId) return { ok: false, error: 'cerrada' };
  if (option !== poll.a && option !== poll.b) return { ok: false, error: 'opcion' };

  const secret = voteSecret();
  if (!secret) return { ok: false, error: 'no-disponible', state: { status: 'unavailable', poll } };

  const cookieStore = await cookies();
  let voterId = cookieStore.get(VOTER_COOKIE)?.value;
  if (!voterId) {
    voterId = randomUUID();
    cookieStore.set(VOTER_COOKIE, voterId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: VOTER_COOKIE_MAX_AGE,
      path: '/',
    });
  }
  const voterKey = voterKeyFor(secret, voterId);
  const requestHeaders = await headers();
  const ipHash = ipHashFor(secret, clientIp((name) => requestHeaders.get(name)), poll.id);

  try {
    const already = await prisma.pollVote.findUnique({
      where: { pollId_voterKey: { pollId: poll.id, voterKey } },
      select: { id: true },
    });
    if (!already) {
      const fromNetwork = await prisma.pollVote.count({ where: { pollId: poll.id, ipHash } });
      if (fromNetwork >= MAX_VOTES_PER_IP) {
        return { ok: false, error: 'limite', state: await loadOpenState(poll, voterKey) };
      }
      try {
        await prisma.pollVote.create({ data: { pollId: poll.id, option, voterKey, ipHash } });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error; // doble clic: el primer voto ya entró
      }
    }
    return { ok: true, state: await loadOpenState(poll, voterKey) };
  } catch (error) {
    console.error('[comunidad] voto no registrado:', error);
    return { ok: false, error: 'no-disponible', state: { status: 'unavailable', poll } };
  }
}
```

- [ ] **Step 11: Variables** — `.env.example`, tras `CONTACT_FROM_EMAIL`:

```
# Secreto para los hashes de la votación anónima de /comunidad (≥ 32 caracteres; generar con: openssl rand -hex 32).
# Sin él (o sin DATABASE_URL) la encuesta muestra "Votación no disponible" y el resto del hub funciona.
VOTE_SECRET=
```

`.github/workflows/ci.yml`, en `env:` tras `CONTACT_EMAIL`:

```yaml
      VOTE_SECRET: ci-dummy-vote-secret-0123456789abcdef
```

- [ ] **Step 12: Prueba de humo contra la base desechable**

Con `DATABASE_URL` del Step 7 exportada y `export VOTE_SECRET=$(openssl rand -hex 32)`:

```bash
npm run build && npx next start -p 3131 &
until curl -s -o /dev/null http://localhost:3131/; do sleep 1; done
curl -s http://localhost:3131/api/comunidad/encuesta
```

Expected: JSON con `"status":"open"`, `"poll":{"id":"<semana>-…-vs-…"`, `"total":0`, `"myOption":null`. Con `VOTE_SECRET` vacío, `"status":"unavailable"`. Parar el servidor con `kill $(lsof -t -i:3131)`.

- [ ] **Step 13: Validar y commit**

Run: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run check:content`.

```bash
git add prisma docker-compose.yml src/features/community/lib/voter.ts tests/community/voter.test.ts src/features/community/types.ts src/features/community/server src/app/api/comunidad src/features/community/actions .env.example .github/workflows/ci.yml
git commit -m "feat(comunidad): votos anónimos en Postgres (PollVote), lectura sin caché y server action con límites"
```

---

### Task 6: Tiles, página `/comunidad` y navegación

**Files:**
- Create: `src/features/community/components/CrystalTile.tsx`, `CreatureOfWeekTile.tsx`, `LatestVideoTile.tsx`, `PollTile.tsx`, `NewsTile.tsx`
- Create: `src/app/(marketing)/comunidad/page.tsx`
- Modify: `src/components/navbar/components/NavLinks.tsx` (array `NAV_LINKS`)
- Modify: `src/components/Footer.tsx` (array `NAV_LINKS`)

**Interfaces:**
- Consumes: `getContentRepository`, `NewsEntry` (Task 3); `getCurrentPoll`, `PollDef` (Task 2); `getLatestVideo`, `LatestVideo` (Task 4); `castVote`, `CastVoteError`, `PollState` (Task 5); `pickFeatured` (`@/features/monsters/lib/featured`); `getThreatLevel`, `THREAT_TONE_CLASSES`, `hasStats` (`@/features/monsters/lib/stats`); `CategoryPlaceholder`, `isBrandPlaceholder` (`@/features/monsters/components/wiki/CategoryPlaceholder`); `Proximamente` (`@/features/monsters/components/wiki/mdx/Proximamente`); `YouTubeEmbed` (`@next/third-parties/google`).
- Produces: `CrystalTile({ eyebrow, title, icon?, className?, children })`, `interface PollFighter { slug: string; title: string; image?: string; imagePosition?: string; category?: string }`, ruta `/comunidad`.

- [ ] **Step 1: `CrystalTile`** — `src/features/community/components/CrystalTile.tsx`

```tsx
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CrystalTileProps {
  eyebrow: string;
  title: string;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
}

/**
 * Tile del hub /comunidad. Piel actual: superficie sólida bajo el texto y brillo de vidrio solo en el borde.
 * El estilo "crystal look" definitivo (#11) se aplica cambiando únicamente este componente.
 */
export function CrystalTile({ eyebrow, title, icon: Icon, className, children }: CrystalTileProps) {
  return (
    <section
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#061a2e] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:p-7',
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.07] to-transparent" />
      <header className="relative">
        <p className="eyebrow flex items-center gap-2 text-primary">
          {Icon && <Icon className="h-4 w-4" aria-hidden />}
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase italic tracking-tight text-white md:text-3xl">
          {title}
        </h2>
      </header>
      <div className="relative mt-5 flex flex-1 flex-col">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Criatura de la semana** — `src/features/community/components/CreatureOfWeekTile.tsx`

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { WikiArticleSummary } from '@/core/types/wiki';
import { getThreatLevel, THREAT_TONE_CLASSES } from '@/features/monsters/lib/stats';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { cn } from '@/utils/cn';
import { CrystalTile } from './CrystalTile';

export function CreatureOfWeekTile({ creature, className }: { creature: WikiArticleSummary | null; className?: string }) {
  if (!creature) return null;
  const { title, image, imagePosition, category, universe, description, stats } = creature.frontmatter;
  const threat = getThreatLevel(stats?.hostility);
  const cover = image && !isBrandPlaceholder(image) ? image : undefined;

  return (
    <CrystalTile eyebrow="Criatura de la semana" title={title} icon={Sparkles} className={className}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#00122E] lg:aspect-auto lg:min-h-[340px] lg:flex-1">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: imagePosition ?? '50% 50%' }}
          />
        ) : (
          <CategoryPlaceholder category={category} />
        )}
        {threat && (
          <span
            className={cn(
              'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.15em] backdrop-blur-md',
              THREAT_TONE_CLASSES[threat.tone].badge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} aria-hidden />
            Amenaza {threat.label}
          </span>
        )}
      </div>
      <p className="eyebrow mt-4 text-white/60">
        {universe}
        {category ? ` · ${category}` : ''}
      </p>
      {description && <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-white/70">{description}</p>}
      <Link
        href={`/wiki/${creature.slug}`}
        className="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-xl bg-primary px-5 text-[11px] font-bold uppercase tracking-wider text-[#00122E] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Ver ficha
      </Link>
    </CrystalTile>
  );
}
```

- [ ] **Step 3: Último vídeo** — `src/features/community/components/LatestVideoTile.tsx`

```tsx
'use client';

import Link from 'next/link';
import { YouTubeEmbed } from '@next/third-parties/google';
import { Clapperboard } from 'lucide-react';
import { YoutubeIcon } from '@/features/marketing/components/icons/YoutubeIcon';
import { SOCIAL_LINKS } from '@/features/marketing/config/social';
import type { LatestVideo } from '../data/latest-video';
import { CrystalTile } from './CrystalTile';

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function LatestVideoTile({ video, className }: { video: LatestVideo; className?: string }) {
  return (
    <CrystalTile eyebrow="Último vídeo" title={video.title} icon={Clapperboard} className={className}>
      {/* La regla global "YouTube Embed Fixes" hace que lite-youtube rellene este marco relative. */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black">
        <YouTubeEmbed videoid={video.id} playlabel={`Reproducir: ${video.title}`} params="controls=1&rel=0" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {video.published ? (
          <time dateTime={video.published} className="eyebrow text-white/60">
            {dateFormat.format(new Date(video.published))}
          </time>
        ) : (
          <span className="eyebrow text-white/60">Vídeo destacado</span>
        )}
        <Link
          href={SOCIAL_LINKS.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <YoutubeIcon className="h-4 w-4 shrink-0" />
          Ver más en YouTube
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </Link>
      </div>
    </CrystalTile>
  );
}
```

- [ ] **Step 4: Encuesta** — `src/features/community/components/PollTile.tsx`

```tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Swords } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { castVote, type CastVoteError } from '../actions/cast-vote';
import type { PollDef } from '../lib/poll-schedule';
import type { PollState } from '../types';
import { CrystalTile } from './CrystalTile';

export interface PollFighter {
  slug: string;
  title: string;
  image?: string;
  imagePosition?: string;
  category?: string;
}

const QUERY_KEY = ['comunidad', 'encuesta'] as const;

const ERROR_COPY: Record<CastVoteError, string> = {
  cerrada: 'La encuesta de esta semana cambió: ya puedes ver la nueva.',
  opcion: 'Esa opción no pertenece a este duelo.',
  limite: 'Se alcanzó el límite de votos desde esta red.',
  'no-disponible': 'Votación no disponible ahora.',
  invalido: 'No se pudo registrar el voto.',
};

async function fetchPollState(): Promise<PollState> {
  const res = await fetch('/api/comunidad/encuesta', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PollState;
}

function Portrait({ fighter }: { fighter: PollFighter }) {
  const cover = fighter.image && !isBrandPlaceholder(fighter.image) ? fighter.image : undefined;
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#00122E]">
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 160px, 40vw"
          className="object-cover"
          style={{ objectPosition: fighter.imagePosition ?? '50% 50%' }}
        />
      ) : (
        <CategoryPlaceholder category={fighter.category} className="[&_span]:hidden" />
      )}
    </div>
  );
}

export function PollTile({
  initialPoll,
  fighters,
  className,
}: {
  initialPoll: PollDef;
  fighters: Record<string, PollFighter>;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { data: state, isError } = useQuery({ queryKey: QUERY_KEY, queryFn: fetchPollState, staleTime: 30_000 });
  const [message, setMessage] = React.useState<string | null>(null);

  const vote = useMutation({
    mutationFn: castVote,
    onSuccess: (result) => {
      if (result.state) queryClient.setQueryData(QUERY_KEY, result.state);
      if (result.ok) {
        setMessage(null);
        return;
      }
      setMessage(ERROR_COPY[result.error]);
      if (result.error === 'cerrada') void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => setMessage(ERROR_COPY['no-disponible']),
  });

  const poll = state?.poll ?? initialPoll;
  const open = state?.status === 'open' ? state : null;
  const unavailable = isError || state?.status === 'unavailable';
  const sides = [poll.a, poll.b].map((slug) => fighters[slug] ?? { slug, title: slug });
  const showResults = !!open?.myOption;
  const status = message ?? (unavailable ? ERROR_COPY['no-disponible'] : '');

  return (
    <CrystalTile eyebrow="Encuesta semanal" title={poll.question} icon={Swords} className={className}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Portrait fighter={sides[0]} />
        <span className="font-display text-2xl font-black italic text-primary" aria-hidden>
          VS
        </span>
        <Portrait fighter={sides[1]} />
      </div>

      {showResults && open ? (
        <div className="mt-5">
          <ul className="space-y-3" aria-label="Resultados de la encuesta">
            {sides.map((f) => {
              const pct = open.percents[f.slug] ?? 0;
              const mine = open.myOption === f.slug;
              return (
                <li key={f.slug}>
                  <div className="flex items-baseline justify-between gap-2 text-sm font-bold text-white">
                    <span>
                      {f.title}
                      {mine && <span className="ml-2 text-[11px] uppercase tracking-wider text-primary">Tu voto</span>}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn('h-full rounded-full transition-[width] duration-700', mine ? 'bg-primary' : 'bg-[#0064A0]')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
            {open.total} {open.total === 1 ? 'voto' : 'votos'}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {sides.map((f) => (
            <button
              key={f.slug}
              type="button"
              disabled={!open || vote.isPending}
              aria-pressed={open?.myOption === f.slug}
              onClick={() => vote.mutate({ pollId: poll.id, option: f.slug })}
              className="min-h-12 rounded-xl border border-white/15 bg-[#00122E] px-3 text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {f.title}
            </button>
          ))}
        </div>
      )}

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-white/70">
        {status}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
        <Link
          href={`/wiki/arena?a=${poll.a}&b=${poll.b}` as Route}
          className="inline-flex min-h-11 items-center rounded-xl text-[11px] font-bold uppercase tracking-wider text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Ver el duelo en la Arena
        </Link>
        <span className="text-[13px] text-white/60">Tu voto es anónimo</span>
      </div>
    </CrystalTile>
  );
}
```

- [ ] **Step 5: Novedades** — `src/features/community/components/NewsTile.tsx`

```tsx
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight, Newspaper } from 'lucide-react';
import type { NewsEntry } from '@/core/content';
import { Proximamente } from '@/features/monsters/components/wiki/mdx/Proximamente';
import { CrystalTile } from './CrystalTile';

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function NewsTile({ news, className }: { news: NewsEntry[]; className?: string }) {
  return (
    <CrystalTile eyebrow="Novedades del lore" title="Lo último" icon={Newspaper} className={className}>
      {news.length === 0 ? (
        <Proximamente titulo="Novedades en preparación" />
      ) : (
        <ul className="divide-y divide-white/10">
          {news.map((n) => {
            const external = n.enlace.startsWith('https://');
            return (
              <li key={n.id} className="py-4 first:pt-0 last:pb-0">
                <time dateTime={n.fecha} className="eyebrow text-white/60">
                  {dateFormat.format(new Date(`${n.fecha}T00:00:00Z`))}
                </time>
                <Link
                  href={n.enlace as Route}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="mt-1 flex items-start gap-2 rounded-md font-bold text-white transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span>{n.titulo}</span>
                  {external && <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
                  {external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
                </Link>
                <p className="mt-1 text-[15px] leading-relaxed text-white/70">{n.resumen}</p>
              </li>
            );
          })}
        </ul>
      )}
    </CrystalTile>
  );
}
```

- [ ] **Step 6: Página** — `src/app/(marketing)/comunidad/page.tsx`

```tsx
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getContentRepository } from '@/core/content';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { hasStats } from '@/features/monsters/lib/stats';
import { getCurrentPoll } from '@/features/community/lib/poll-schedule';
import { getLatestVideo } from '@/features/community/data/latest-video';
import { CreatureOfWeekTile } from '@/features/community/components/CreatureOfWeekTile';
import { LatestVideoTile } from '@/features/community/components/LatestVideoTile';
import { NewsTile } from '@/features/community/components/NewsTile';
import { PollTile, type PollFighter } from '@/features/community/components/PollTile';

/** Criatura y duelo cambian cada lunes sin rebuild; el estado de la encuesta se pide aparte, sin caché. */
export const revalidate = 3600;

const INTRO = 'Cada semana: una criatura, un duelo y lo último de BorisaoBlois.';

export const metadata: Metadata = {
  title: 'Comunidad | Universos de BorisaoBlois',
  description: INTRO,
  openGraph: { title: 'Comunidad | Universos de BorisaoBlois', description: INTRO, url: '/comunidad' },
};

export default async function ComunidadPage() {
  const repo = getContentRepository();
  const [articles, curated, news, video] = await Promise.all([
    repo.getArticles(),
    repo.getCuratedPolls(),
    repo.getNews(5),
    getLatestVideo(),
  ]);
  const fighters = articles.filter((a) => hasStats(a.frontmatter));
  const poll = getCurrentPoll(curated, fighters.map((a) => a.slug));
  const fighterCards: Record<string, PollFighter> = Object.fromEntries(
    fighters.map((a) => [
      a.slug,
      {
        slug: a.slug,
        title: a.frontmatter.title,
        image: a.frontmatter.image,
        imagePosition: a.frontmatter.imagePosition,
        category: a.frontmatter.category,
      },
    ]),
  );

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pb-12 pt-32">
        <div className="container mx-auto px-6">
          <header className="mb-10 max-w-3xl space-y-4">
            <p className="eyebrow text-primary">Comunidad</p>
            <h1 className="page-title text-white">Comunidad</h1>
            <p className="text-lg leading-relaxed text-white/70">{INTRO}</p>
          </header>

          {/* Orden del DOM = orden en móvil. En lg se colocan explícitamente en 3 columnas. */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CreatureOfWeekTile
              creature={pickFeatured(articles)}
              className="lg:col-start-1 lg:row-span-2 lg:row-start-1"
            />
            {poll && (
              <PollTile initialPoll={poll} fighters={fighterCards} className="lg:col-start-3 lg:row-start-1" />
            )}
            <LatestVideoTile video={video} className="lg:col-start-2 lg:row-start-1" />
            <NewsTile news={news} className="lg:col-span-2 lg:col-start-2 lg:row-start-2" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 7: Navegación**

`src/components/navbar/components/NavLinks.tsx` — en `NAV_LINKS`, tras `{ name: "Universos", href: "/#universos" },` añadir:

```ts
  { name: "Comunidad", href: "/comunidad" },
```

(`isLinkActive` ya marca `pathname === href`; el menú móvil reutiliza `NavLinks`.)

`src/components/Footer.tsx` — en `NAV_LINKS`, tras `{ label: "Universos", href: "/#universos" },` añadir:

```ts
  { label: "Comunidad", href: "/comunidad" },
```

- [ ] **Step 8: Validar y commit**

Run: `npm test`, `npx tsc --noEmit`, `npm run lint` (0 errores), `npm run check:content`, `npm run build` (sin base de datos: debe pasar y listar `○ /comunidad` con revalidate `1h` y `ƒ /api/comunidad/encuesta`).

```bash
git add src/features/community/components "src/app/(marketing)/comunidad" src/components/navbar/components/NavLinks.tsx src/components/Footer.tsx
git commit -m "feat(comunidad): página /comunidad con tiles de criatura, vídeo, encuesta y novedades"
```

---

### Task 7: QA con Chrome DevTools, PR e issues (orquestador)

**Files:**
- Create: `docs/audits/2026-10-18-comunidad/README.md` + capturas `.webp`

- [ ] **Step 1: Entorno de QA**

```bash
DB_PORT=5433 docker compose -p webboris-hub up -d db
export DATABASE_URL=postgresql://root:rootpassword@localhost:5433/webboris
npx prisma migrate deploy
export VOTE_SECRET=$(openssl rand -hex 32)
npm run build && npx next start -p 3131   # en segundo plano
```

- [ ] **Step 2: Casos (1440 × 900 y 390 × 844)**

1. `/comunidad` carga 200; las 4 tiles visibles; en lg: criatura a la izquierda en 2 filas, vídeo y encuesta arriba, novedades abajo; en 390 px el orden es criatura, encuesta, vídeo, novedades y no hay scroll horizontal.
2. La criatura coincide con la de la landing (`pickFeatured`).
3. Encuesta de W42 = Vlad Julia vs El Gran Majá (curada). Votar → barras con porcentajes, "Tu voto", "1 voto". Recargar → mismos resultados (cookie).
4. Borrar la cookie `wb_voter` y votar 5 veces (borrando la cookie entre votos) → al 6.º, "Se alcanzó el límite de votos desde esta red".
5. `docker compose -p webboris-hub stop db` → recargar: "Votación no disponible ahora", resto de tiles bien, consola sin errores no controlados. `docker compose -p webboris-hub start db` → vuelve.
6. Reiniciar el servidor con `YOUTUBE_FEED_URL=https://www.youtube.com/feeds/videos.xml?channel_id=invalido` tras un `npm run build` → tile de vídeo con "Colosos - The Bloop vs El Gran Majá - La Batalla" (respaldo).
7. Navbar: "Comunidad" activo en `/comunidad`; en menú móvil y footer.
8. Red: sin 4xx/5xx; consola sin errores; Lighthouse accesibilidad ≥ 95 en `/comunidad` (desktop y móvil).

- [ ] **Step 3: Evidencias** — capturas en `docs/audits/2026-10-18-comunidad/` convertidas a WebP (`magick in.png -quality 80 out.webp`) + README con la tabla de casos y resultados.

- [ ] **Step 4: Revisión final** — agente revisor (opus) sobre `git diff main...HEAD` contra el spec; corregir Critical/Important.

- [ ] **Step 5: PR, CI y merge** — `git push -u origin feat/hub-comunidad`, `gh pr create` (resumen, verificación, `Refs #10`, atribución), esperar CI verde (`gh pr checks --watch`), `gh pr merge --squash --delete-branch`, `git checkout main && git pull`, `npm run build` en main.

- [ ] **Step 6: Issues** — reescribir #10 como épica del hub con checklist: (1) repositorio + formatos + `check:content` ✅, (2) `PollVote` + action + route ✅, (3) tiles + página + navegación ✅, (4) tests + CI ✅, (5) despliegue en el VPS (Postgres, `VOTE_SECRET`, proxy que fije `X-Real-IP` (nginx: `proxy_set_header X-Real-IP $remote_addr;`; detrás de Cloudflare: `real_ip_header CF-Connecting-IP` + `set_real_ip_from`)) → enlazar al issue del plan de Hostinger. Dejar #10 abierto hasta el despliegue.

- [ ] **Step 7: Parar el entorno de QA** — `kill $(lsof -t -i:3131)`; `docker compose -p webboris-hub down` (conserva el volumen; `down -v` solo si se quiere borrar los votos de prueba).

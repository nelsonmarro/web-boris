# Pendientes previos al despliegue — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar los arreglos y mejoras de código que no dependen de Boris ni del VPS antes del despliegue (#44): #61, #45, #46 y lo que sigue vigente de #47.

**Architecture:** Cinco tareas sobre módulos ya existentes. La lógica nueva va en módulos puros (`src/features/community/lib/`, `src/core/content/`) probados con node:test. La UI solo cambia en `PollTile` (estados de la votación) y `ContentCard` (nombre accesible y tipos). La lectura de artículos pasa por `getContentRepository()`.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Zod v4 · gray-matter · node:test · Tailwind CSS v4.

**Spec:** no hay spec aparte: los requisitos son los issues #61, #45, #46 y #47 (copiados en cada tarea). Las decisiones del controlador están en «Decisiones».

## Global Constraints

- Textos de la UI, comentarios y mensajes de error en **español**, con la densidad de comentarios del archivo que se toca.
- Los módulos puros (`src/core/**`, `src/features/community/lib/**`) solo usan imports relativos con extensión `.ts` (o paquetes de npm); nunca `@/…`. Así los importan los tests de node:test.
- Sin dependencias nuevas.
- No se toca el contenido (`src/content/**`) salvo que la tarea lo diga.
- Un elemento enfocable nuevo usa `outline-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary`.
- Los implementadores **no hacen commit**: el controlador hace commit de los archivos de cada tarea.
- Verificación de cada tarea: `npm test`, `npm run lint` y `npx tsc --noEmit`. El `npm run build` lo corre el controlador (dos builds a la vez se pisan en `.next`).
- `CLAUDE.md` lo actualiza el controlador al final, no las tareas.

## Decisiones

- **D1 — Reintento del RSS:** hasta 2 reintentos (pausas de 250 ms y 750 ms) ante 404, 408, 429, 5xx, un fallo de red o el tiempo límite de un intento. Cada intento tiene 4 s y la lectura entera 6 s, reintentos incluidos: el build puede esperar como mucho 2 s más que hoy, y solo la primera página que lo pide, porque `memoizeFailure` recuerda el fallo. Next solo guarda en caché las respuestas 200, así que cada reintento es una petición real.
- **D2 — Red del votante:** IPv4 tal cual; IPv6 por su prefijo /64; una IPv4 mapeada (`::ffff:a.b.c.d`) cuenta como IPv4. El hash de IPv4 no cambia; el de IPv6 sí, pero aún no hay votos en producción.
- **D3 — Empate en el reparto de porcentajes:** con restos iguales, el punto va a la opción que va primero (`poll.a`). El orden ya no depende de la configuración regional (`localeCompare`).
- **D4 — Hosts de las novedades:** solo YouTube (`youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`), porque es la única red que Boris ha confirmado (`SOCIAL_LINKS`).
- **D5 — `getArticle(slug)`:** busca en `getArticles()` en lugar de leer `src/content/<slug>.mdx`. Comparte la caché por petición y no construye rutas de archivo con el parámetro de la URL.
- **D6 — Lo que ya no aplica de #47:** `SearchBar` (eliminado en #62), `HomeMosaic`/`WikiHomeMosaic`, `getLoreStats`/`visualFiles` y `CrystalTile` (eliminados en #56). El nombre accesible y la unión `href`/`external` se aplican a `ContentCard`, que sustituyó a `CrystalTile`. Las columnas de `/wiki` a 1024 px y el chip de Medianos se comprueban en la QA: aquel mosaico ya no existe.

---

### Task 1: Reintento del feed RSS y entidades numéricas (#61, #45 RSS)

**Files:**
- Create: `src/features/community/lib/retry.ts`
- Modify: `src/features/community/data/youtube-rss.ts`
- Modify: `src/features/community/lib/youtube-feed.ts`
- Test: `tests/community/retry.test.ts` (nuevo), `tests/community/youtube-feed.test.ts`

**Interfaces:**
- Produces: `withRetry<T>(fn: (attempt: number) => Promise<T>, opts: RetryOptions): Promise<T>`, `HttpError` (`status: number`), `isTransientFetchError(error: unknown): boolean`. `fetchChannelFeed` mantiene su firma.

- [ ] **Step 1: tests del reintento (fallan)**

`tests/community/retry.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError, isTransientFetchError, withRetry } from '../../src/features/community/lib/retry.ts';

const noSleep = async () => {};

test('un fallo transitorio y luego un acierto: devuelve el acierto tras una pausa', async () => {
  const pauses: number[] = [];
  let calls = 0;
  const value = await withRetry(
    async (attempt) => {
      calls++;
      if (attempt === 0) throw new HttpError(404);
      return 'ok';
    },
    { delaysMs: [250, 750], shouldRetry: isTransientFetchError, sleep: async (ms) => void pauses.push(ms) },
  );
  assert.equal(value, 'ok');
  assert.equal(calls, 2);
  assert.deepEqual(pauses, [250]);
});

test('agota los reintentos y lanza el último error', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new HttpError(500 + calls);
      },
      { delaysMs: [1, 1], shouldRetry: isTransientFetchError, sleep: noSleep },
    ),
    (error: unknown) => error instanceof HttpError && error.status === 503,
  );
  assert.equal(calls, 3);
});

test('un error no transitorio no se reintenta', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new HttpError(403);
      },
      { delaysMs: [1, 1], shouldRetry: isTransientFetchError, sleep: noSleep },
    ),
    /HTTP 403/,
  );
  assert.equal(calls, 1);
});

test('sin pausas configuradas es un único intento', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new HttpError(500);
      },
      { delaysMs: [], shouldRetry: () => true, sleep: noSleep },
    ),
  );
  assert.equal(calls, 1);
});

test('isTransientFetchError: 404, 408, 429, 5xx, red y tiempo límite sí; 400, 403 y errores de parseo no', () => {
  for (const status of [404, 408, 429, 500, 502, 503]) assert.equal(isTransientFetchError(new HttpError(status)), true, String(status));
  for (const status of [400, 401, 403, 410]) assert.equal(isTransientFetchError(new HttpError(status)), false, String(status));
  assert.equal(isTransientFetchError(new TypeError('fetch failed')), true);
  assert.equal(isTransientFetchError(new DOMException('The operation timed out.', 'TimeoutError')), true);
  assert.equal(isTransientFetchError(new Error('feed sin vídeos')), false);
  assert.equal(isTransientFetchError('texto'), false);
});
```

- [ ] **Step 2: comprobar que fallan**

Run: `npm test 2>&1 | tail -20`
Expected: FAIL (no existe `src/features/community/lib/retry.ts`).

- [ ] **Step 3: `src/features/community/lib/retry.ts`**

```ts
/**
 * Reintentos con pausa para peticiones con fallos transitorios. Puro (lo prueban los tests con node:test): sin imports.
 * Lo usa el feed RSS del canal, que responde 404/500 de forma intermitente (#61).
 */

export interface RetryOptions {
  /** Pausa antes de cada reintento, en ms: su longitud es el número máximo de reintentos. */
  delaysMs: readonly number[];
  /** Si el error merece otro intento. */
  shouldRetry: (error: unknown) => boolean;
  /** Inyectable en los tests. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Llama a `fn` hasta que acierte, se agoten las pausas o `shouldRetry` diga que no. Lanza el último error. */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  { delaysMs, shouldRetry, sleep = defaultSleep }: RetryOptions,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= delaysMs.length || !shouldRetry(error)) throw error;
      await sleep(delaysMs[attempt]);
    }
  }
}

/** Respuesta HTTP no satisfactoria, con su código para decidir si se reintenta. */
export class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}

/**
 * Fallos que pueden no repetirse: 404 (el feed de YouTube lo da al azar), 408, 429 y 5xx; un fallo de red
 * (`fetch` lanza `TypeError`) y el tiempo límite de un intento (`TimeoutError`).
 */
export function isTransientFetchError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return error.status === 404 || error.status === 408 || error.status === 429 || error.status >= 500;
  }
  return error instanceof Error && (error.name === 'TypeError' || error.name === 'TimeoutError');
}
```

- [ ] **Step 4: usar el reintento en `src/features/community/data/youtube-rss.ts`**

Sustituir `fetchFeed` y sus constantes (el resto del archivo no cambia, salvo el último párrafo del comentario de `fetchChannelFeed`):

```ts
import { YOUTUBE_CHANNEL_ID } from '@/features/marketing/config/social';
import { memoizeFailure } from '../lib/failure-memo';
import { HttpError, isTransientFetchError, withRetry } from '../lib/retry';
import { parseYoutubeFeed, type FeedVideo } from '../lib/youtube-feed';

const DEFAULT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

/** Cuánto se recuerda que el feed falló antes de volver a intentarlo. */
const FAILURE_TTL_MS = 60_000;
/** Tiempo límite de cada intento y de toda la lectura, reintentos incluidos: el build no espera más que eso. */
const ATTEMPT_TIMEOUT_MS = 4000;
const TOTAL_TIMEOUT_MS = 6000;
/** Pausas antes de cada reintento: el feed responde 404/500 al azar (#61). */
const RETRY_DELAYS_MS = [250, 750] as const;

async function fetchFeed(): Promise<FeedVideo[]> {
  const feedUrl = process.env.YOUTUBE_FEED_URL || DEFAULT_FEED_URL;
  const budget = AbortSignal.timeout(TOTAL_TIMEOUT_MS);
  const res = await withRetry(
    async () => {
      const response = await fetch(feedUrl, {
        next: { revalidate: 3600 },
        signal: AbortSignal.any([budget, AbortSignal.timeout(ATTEMPT_TIMEOUT_MS)]),
      });
      if (!response.ok) throw new HttpError(response.status);
      return response;
    },
    // Agotado el tiempo total, no se reintenta aunque el error sea transitorio.
    { delaysMs: RETRY_DELAYS_MS, shouldRetry: (error) => !budget.aborted && isTransientFetchError(error) },
  );
  const videos = parseYoutubeFeed(await res.text());
  if (videos.length === 0) throw new Error('feed sin vídeos');
  return videos;
}
```

En el comentario de `fetchChannelFeed`, el último párrafo pasa a decir que antes de lanzar se reintenta hasta 2 veces (404, 5xx, red o tiempo límite, 6 s en total), y que el fallo final se recuerda `FAILURE_TTL_MS`: las páginas que lo piden después reciben el mismo error al instante, sin repetir los intentos.

- [ ] **Step 5: test de entidades numéricas (falla)**

Añadir a `tests/community/youtube-feed.test.ts`:

```ts
test('decodifica entidades numéricas una sola vez', () => {
  const entry = (title: string) =>
    `<feed><entry><yt:videoId>vRVFd7LfTTs</yt:videoId><title>${title}</title></entry></feed>`;
  assert.equal(parseYoutubeFeed(entry('Boris&#8217;s &#x201C;Colosos&#x201D;'))[0].title, 'Boris’s “Colosos”');
  assert.equal(parseYoutubeFeed(entry('&amp;#8217; literal'))[0].title, '&#8217; literal');
  assert.equal(parseYoutubeFeed(entry('nulo &#0; y fuera de rango &#x110000;'))[0].title, 'nulo &#0; y fuera de rango &#x110000;');
});
```

- [ ] **Step 6: decodificar en `src/features/community/lib/youtube-feed.ts`**

Sustituir `ENTITIES` y `decode`:

```ts
const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** Un carácter válido de XML: ni el nulo ni las mitades de un par sustituto, y dentro de Unicode. */
const isXmlChar = (cp: number) => cp > 0 && cp <= 0x10ffff && (cp < 0xd800 || cp > 0xdfff);

/** Entidades con nombre y numéricas (`&#8217;`, `&#x2019;`) en una sola pasada: `&amp;#39;` queda en `&#39;`. */
const decode = (s: string) =>
  s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (match, dec?: string, hex?: string, name?: string) => {
    if (name) return NAMED[name.toLowerCase()] ?? match;
    const cp = dec ? Number.parseInt(dec, 10) : Number.parseInt(hex ?? '', 16);
    return isXmlChar(cp) ? String.fromCodePoint(cp) : match;
  });
```

- [ ] **Step 7: verificar**

Run: `npm test 2>&1 | tail -8 && npm run lint && npx tsc --noEmit`
Expected: todos los tests pasan (incluidos los de `youtube-feed`, con `&#39;` y `&quot;` igual que antes); lint y tsc sin errores.

- [ ] **Step 8: informe** (sin commit)

---

### Task 2: Votación de /comunidad (#45 IPv6, encuesta, tests)

**Files:**
- Create: `src/features/community/lib/vote-input.ts`
- Modify: `src/features/community/lib/voter.ts`, `src/features/community/actions/cast-vote.ts`, `src/features/community/lib/poll-results.ts`, `src/features/community/lib/poll-schedule.ts` (solo el comentario de `getCurrentPoll`), `src/features/community/components/PollTile.tsx`
- Test: `tests/community/voter.test.ts`, `tests/community/poll-results.test.ts`, `tests/community/poll-schedule.test.ts`, `tests/community/vote-input.test.ts` (nuevo)

**Interfaces:**
- Produces: `networkOf(ip: string): string` (voter.ts); `checkVote(input: unknown, poll: PollDef | null): VoteCheck` (vote-input.ts), con `VoteCheck = { ok: true; pollId: string; option: string } | { ok: false; error: 'invalido' | 'cerrada' | 'opcion' }`. `castVote` mantiene su firma y sus códigos de error.

- [ ] **Step 1: tests (fallan)**

En `tests/community/voter.test.ts`, añadir `networkOf` al import y:

```ts
test('networkOf: IPv4 tal cual, IPv4 mapeada a IPv4 e IPv6 por su /64', () => {
  assert.equal(networkOf('203.0.113.7'), '203.0.113.7');
  assert.equal(networkOf('::ffff:203.0.113.7'), '203.0.113.7');
  assert.equal(networkOf('::FFFF:203.0.113.7'), '203.0.113.7');
  // Dos direcciones de privacidad de la misma red cuentan como una.
  assert.equal(networkOf('2001:db8:1:2:aaaa::1'), '2001:db8:1:2::/64');
  assert.equal(networkOf('2001:db8:1:2:bbbb:cccc:dddd:eeee'), '2001:db8:1:2::/64');
  assert.equal(networkOf('2001:0DB8:0001:0002::1'), '2001:db8:1:2::/64');
  assert.equal(networkOf('2001:db8::1'), '2001:db8:0:0::/64');
  assert.equal(networkOf('::1'), '0:0:0:0::/64');
  assert.equal(networkOf('fe80::1%eth0'), 'fe80:0:0:0::/64');
  assert.equal(networkOf('2001:db8:1:2:3:4:198.51.100.2'), '2001:db8:1:2::/64');
  assert.equal(networkOf('desconocida'), 'desconocida');
  assert.notEqual(networkOf('2001:db8:1:2::1'), networkOf('2001:db8:1:3::1'));
});
```

En `tests/community/poll-results.test.ts`:

```ts
test('con restos iguales, el punto va a la opción que va primero (sin depender del idioma)', () => {
  // 1 de 200 = 0,5 % y 199 de 200 = 99,5 %: mismo resto.
  assert.deepEqual(computeTally(['b', 'a'], { a: 1, b: 199 }).percents, { b: 100, a: 0 });
  assert.deepEqual(computeTally(['a', 'b'], { a: 1, b: 199 }).percents, { a: 1, b: 99 });
});
```

En `tests/community/poll-schedule.test.ts`:

```ts
test('una encuesta curada de otra semana no cuenta: rotación automática', () => {
  const date = new Date('2026-10-14T09:00:00Z'); // 2026-W42
  const curated = [{ semana: '2026-W41', tipo: 'duelo' as const, a: 'vlad-julia', b: 'el-gran-maja' }];
  assert.deepEqual(getCurrentPoll(curated, FIGHTERS, date), getCurrentPoll([], FIGHTERS, date));
});
```

`tests/community/vote-input.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkVote } from '../../src/features/community/lib/vote-input.ts';
import type { PollDef } from '../../src/features/community/lib/poll-schedule.ts';

const POLL: PollDef = {
  id: '2026-W43-the-bloop-vs-el-gran-maja',
  week: '2026-W43',
  tipo: 'duelo',
  a: 'the-bloop',
  b: 'el-gran-maja',
  question: '¿Quién gana?',
};

test('voto válido para la encuesta vigente', () => {
  assert.deepEqual(checkVote({ pollId: POLL.id, option: 'el-gran-maja' }, POLL), {
    ok: true,
    pollId: POLL.id,
    option: 'el-gran-maja',
  });
});

test('entrada inválida → invalido, aunque no haya encuesta', () => {
  for (const input of [null, 'x', {}, { pollId: '', option: 'a' }, { pollId: POLL.id, option: 'x'.repeat(81) }, { pollId: 'p'.repeat(161), option: 'a' }]) {
    assert.deepEqual(checkVote(input, POLL), { ok: false, error: 'invalido' });
    assert.deepEqual(checkVote(input, null), { ok: false, error: 'invalido' });
  }
});

test('otra encuesta o ninguna vigente → cerrada', () => {
  assert.deepEqual(checkVote({ pollId: '2026-W42-a-vs-b', option: 'the-bloop' }, POLL), { ok: false, error: 'cerrada' });
  assert.deepEqual(checkVote({ pollId: POLL.id, option: 'the-bloop' }, null), { ok: false, error: 'cerrada' });
});

test('opción ajena a la encuesta → opcion', () => {
  assert.deepEqual(checkVote({ pollId: POLL.id, option: 'vlad-julia' }, POLL), { ok: false, error: 'opcion' });
});
```

Run: `npm test 2>&1 | tail -20` → Expected: FAIL (`networkOf` y `vote-input.ts` no existen; el test de empate da `{ b: 99, a: 1 }`).

- [ ] **Step 2: `networkOf` en `src/features/community/lib/voter.ts`**

Añadir `import { isIP } from 'node:net';` junto al import de `node:crypto`, y después de `clientIp`:

```ts
/** Los 8 grupos de una IPv6 en hex sin ceros a la izquierda (`::` expandido; una IPv4 final cuenta como 2 grupos). */
function ipv6Groups(ip: string): string[] {
  let address = ip.split('%')[0].toLowerCase(); // sin la zona (`fe80::1%eth0`)
  const v4 = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(address);
  if (v4) {
    const [a, b, c, d] = v4.slice(1).map(Number);
    address = `${address.slice(0, v4.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const [head, tail] = address.split('::');
  const left = head ? head.split(':') : [];
  const right = tail === undefined ? [] : tail ? tail.split(':') : [];
  const groups = tail === undefined ? left : [...left, ...Array(8 - left.length - right.length).fill('0'), ...right];
  return groups.map((g) => Number.parseInt(g, 16).toString(16));
}

/**
 * Red del votante para el límite de votos por red: una IPv4 tal cual (también la mapeada `::ffff:a.b.c.d`) y una
 * IPv6 por su prefijo /64. Las direcciones IPv6 de privacidad rotan dentro del /64 y, sin agruparlas, esquivarían
 * el límite. Lo que no es una IP (`desconocida`) pasa igual.
 */
export function networkOf(ip: string): string {
  const value = ip.trim();
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(value);
  if (mapped && isIP(mapped[1]) === 4) return mapped[1];
  if (isIP(value) !== 6) return value;
  return `${ipv6Groups(value).slice(0, 4).join(':')}::/64`;
}
```

Nota: `isIP('fe80::1%eth0')` devuelve 6 en Node 24. Si no fuese así, quitar la zona antes de `isIP`.

- [ ] **Step 3: `src/features/community/lib/vote-input.ts`**

```ts
/** Validación del voto antes de tocar la base de datos. Puro (lo prueban los tests con node:test). */
import { z } from 'zod';
import type { PollDef } from './poll-schedule.ts';

const VoteInput = z.object({
  pollId: z.string().min(1).max(160),
  option: z.string().min(1).max(80),
});

export type VoteCheck =
  | { ok: true; pollId: string; option: string }
  | { ok: false; error: 'invalido' | 'cerrada' | 'opcion' };

/** `invalido` si la entrada no tiene forma de voto; `cerrada` si no es la encuesta vigente; `opcion` si la opción no es suya. */
export function checkVote(input: unknown, poll: PollDef | null): VoteCheck {
  const parsed = VoteInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalido' };
  const { pollId, option } = parsed.data;
  if (!poll || poll.id !== pollId) return { ok: false, error: 'cerrada' };
  if (option !== poll.a && option !== poll.b) return { ok: false, error: 'opcion' };
  return { ok: true, pollId, option };
}
```

- [ ] **Step 4: `castVote` usa `checkVote` y `networkOf`** (`src/features/community/actions/cast-vote.ts`)

Quitar `VoteInput` y el import de `z`; importar `checkVote` de `'../lib/vote-input'` y `networkOf` de `'../lib/voter'`. La función queda así (lo que no se muestra no cambia):

```ts
export async function castVote(input: { pollId: string; option: string }): Promise<CastVoteResult> {
  let poll: PollDef | null = null;
  try {
    poll = await getActivePoll();
    // Orden de los códigos: `invalido` (forma), `cerrada` (no es la vigente), `opcion` (no es suya).
    const check = checkVote(input, poll);
    if (!check.ok || !poll) return { ok: false, error: check.ok ? 'cerrada' : check.error };
    const { option } = check;

    const secret = voteSecret();
    …igual que hoy…
    const ipHash = ipHashFor(secret, networkOf(clientIp((name) => requestHeaders.get(name))), poll.id);
    …igual que hoy…
```

Antes, una entrada inválida respondía `invalido` sin leer la encuesta; ahora la encuesta se lee primero. Es aceptable: `getWeeklyPoll` lee archivos en caché, no la base de datos. El `|| !poll` solo sirve para que TypeScript sepa que `poll` no es `null` (si `check.ok`, `poll` existe).

- [ ] **Step 5: empate sin `localeCompare`** (`src/features/community/lib/poll-results.ts`)

```ts
  // Restos iguales: `sort` es estable, así que el punto va a la opción que va antes en `options` (poll.a primero).
  const byRemainder = [...exact].sort((x, y) => (y.value % 1) - (x.value % 1));
```

- [ ] **Step 6: documentar el cambio de duelo a mitad de semana** (`src/features/community/lib/poll-schedule.ts`)

Añadir al comentario de `getCurrentPoll`:

```ts
 *
 * Ojo: el emparejamiento automático depende de la lista de luchadores. Publicar a mitad de semana una ficha con
 * stats (o quitarlas de una) cambia el duelo de esa semana, y con él su id: el recuento empieza de cero.
 * Para fijar un duelo, ponerlo en `encuestas.json`.
```

- [ ] **Step 7: `PollTile`** (`src/features/community/components/PollTile.tsx`)

1. Estado: `const [limitReached, setLimitReached] = React.useState(false);`
2. En `onSuccess`, tras `setMessage(ERROR_COPY[result.error]);`:

```ts
      // Sin más votos desde esta red: se enseña el recuento en lugar de unos botones que ya no sirven.
      if (result.error === 'limite') setLimitReached(true);
```

3. Derivados:

```ts
  // Antes de la primera respuesta los botones están desactivados: se dice por qué.
  const loading = !state && !isError;
  const showResults = !!open && (!!open.myOption || limitReached);
  const status = message ?? (unavailable ? ERROR_COPY['no-disponible'] : loading ? 'Cargando la votación…' : '');
```

4. La región viva no anuncia la carga: `<div aria-live="polite" aria-busy={loading}>`.
5. Quitar `aria-pressed` de los botones de voto (solo se pintan cuando aún no has votado, así que siempre valía `false`).
6. Sangrar el contenido de `<div aria-live="polite" …>` un nivel (hoy está al mismo nivel que el `div`).

- [ ] **Step 8: verificar**

Run: `npm test 2>&1 | tail -8 && npm run lint && npx tsc --noEmit`
Expected: todo en verde.

- [ ] **Step 9: informe** (sin commit)

---

### Task 3: Novedades y semana de la criatura destacada (#45)

**Files:**
- Modify: `src/core/content/readers.ts`, `src/core/content/schemas.ts`, `src/core/content/iso-week.ts`, `src/features/monsters/lib/featured.ts`
- Test: `tests/content/readers.test.ts`, `tests/content/schemas.test.ts`, `tests/content/iso-week.test.ts` (nuevo)

**Interfaces:**
- Produces: `isoWeekNumber(date: Date): number` (iso-week.ts); `NEWS_HOSTS` (schemas.ts). `readNews` mantiene su firma.

- [ ] **Step 1: tests (fallan)**

`tests/content/readers.test.ts`:

```ts
test('novedades: la fecha debe coincidir con el prefijo del nombre del archivo', () => {
  const dir = tmpDir();
  // js-yaml convierte 2026-02-30 en 2026-03-02 sin avisar: el nombre lo delata.
  fs.writeFileSync(path.join(dir, '2026-02-30-imposible.md'), '---\nfecha: 2026-02-30\ntitulo: "Fecha imposible"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  fs.writeFileSync(path.join(dir, 'sin-fecha-en-el-nombre.md'), '---\nfecha: 2026-01-01\ntitulo: "Nombre sin fecha"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  fs.writeFileSync(path.join(dir, '2026-01-02-ok.md'), '---\nfecha: 2026-01-02\ntitulo: "Correcta"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  const { items, errors } = readNews(dir);
  assert.deepEqual(items.map((n) => n.id), ['2026-01-02-ok']);
  assert.equal(errors.length, 2);
  assert.match(errors.find((e) => e.startsWith('2026-02-30-imposible.md')) ?? '', /2026-03-02/);
  assert.match(errors.find((e) => e.startsWith('sin-fecha-en-el-nombre.md')) ?? '', /<yyyy-mm-dd>-<slug>\.md/);
});

test('novedades: un YAML roto se registra y se salta, sin lanzar', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, '2026-01-01-rota.md'), '---\nfecha: 2026-01-01\ntitulo: "sin cerrar\n  : [\n---\n');
  fs.writeFileSync(path.join(dir, '2026-01-02-ok.md'), '---\nfecha: 2026-01-02\ntitulo: "Correcta"\nresumen: "Texto"\nenlace: /wiki\n---\n');
  const { items, errors } = readNews(dir);
  assert.deepEqual(items.map((n) => n.id), ['2026-01-02-ok']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^2026-01-01-rota\.md: YAML inválido/);
});
```

El primer test existente (`rota.md` sin `fecha`) debe seguir pasando: su primer error sigue empezando por `rota.md:`.

`tests/content/schemas.test.ts`, en el test de enlaces:

```ts
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://youtu.be/vRVFd7LfTTs' }).success, true);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://evil.com/x' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://youtube.com.evil.com/x' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://user@www.youtube.com/x' }).success, false);
  assert.equal(NewsEntrySchema.safeParse({ ...base, enlace: 'https://' }).success, false);
```

`tests/content/iso-week.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isoWeekKey, isoWeekNumber } from '../../src/core/content/iso-week.ts';

test('isoWeekNumber es el número de isoWeekKey, en UTC', () => {
  assert.equal(isoWeekNumber(new Date('2026-10-18T12:00:00Z')), 42); // domingo
  // Domingo 23:30 en Ecuador (UTC-5) ya es lunes en UTC: semana 43, igual que la encuesta.
  assert.equal(isoWeekNumber(new Date('2026-10-19T04:30:00Z')), 43);
  assert.equal(isoWeekNumber(new Date('2027-01-01T00:00:00Z')), 53);
  for (const iso of ['2026-01-01T00:00:00Z', '2026-06-15T10:00:00Z', '2027-01-04T00:00:00Z']) {
    const date = new Date(iso);
    assert.equal(isoWeekNumber(date), Number(isoWeekKey(date).slice(-2)), iso);
  }
});
```

Antes de dar por buena la aserción de 2027-01-01, comprobar con `isoWeekKey` que da `2026-W53` (2026 empieza en jueves y tiene 53 semanas). Si no, corregir la aserción con el valor real de `isoWeekKey`, no el código.

Run: `npm test 2>&1 | tail -20` → Expected: FAIL.

- [ ] **Step 2: `isoWeekNumber`** (`src/core/content/iso-week.ts`)

```ts
/** Número de la semana ISO (1–53) de `date`, en UTC: el mismo que `isoWeekKey`. */
export function isoWeekNumber(date: Date): number {
  return Number(isoWeekKey(date).slice(-2));
}
```

- [ ] **Step 3: la criatura destacada usa la semana UTC** (`src/features/monsters/lib/featured.ts`)

Borrar `isoWeek` (calculaba la semana con la fecha local, así que la criatura destacada y la encuesta podían cambiar en momentos distintos) e importar `isoWeekNumber` de `@/core/content/iso-week`:

```ts
/** Criatura destacada de la semana: misma elección en landing y hub. Cambia el lunes a las 00:00 UTC, como la encuesta. */
export function pickFeatured(articles: WikiArticle[], date = new Date()): WikiArticleSummary | null {
  const candidates = articles.filter((a) => hasStats(a.frontmatter));
  if (candidates.length === 0) return null;
  return toSummary(candidates[isoWeekNumber(date) % candidates.length]);
}
```

Confirmar con `grep -rn "isoWeek\b" src tests scripts` que nadie más usaba `isoWeek`.

- [ ] **Step 4: hosts de YouTube** (`src/core/content/schemas.ts`)

```ts
/** Hosts externos de una novedad: solo YouTube, la única red que Boris ha confirmado (`SOCIAL_LINKS`). */
export const NEWS_HOSTS: readonly string[] = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];

function isAllowedExternal(value: string): boolean {
  if (!value.startsWith('https://')) return false;
  try {
    const url = new URL(value);
    return !url.username && !url.password && NEWS_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

const NewsLink = z
  .string()
  .refine((v) => isAllowedExternal(v) || (v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\')), {
    message: 'el enlace debe ser interno (/…) o https:// de YouTube',
  });
```

- [ ] **Step 5: `readNews`** (`src/core/content/readers.ts`)

```ts
/** `<yyyy-mm-dd>-<slug>.md`: la fecha del nombre debe ser la del frontmatter. */
const NEWS_FILE = /^(\d{4}-\d{2}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

export function readNews(dir: string): ReadResult<NewsEntry> {
  if (!fs.existsSync(dir)) return { items: [], errors: [] };
  const items: NewsEntry[] = [];
  const errors: string[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    let data: unknown;
    try {
      ({ data } = matter(fs.readFileSync(path.join(dir, file), 'utf8')));
    } catch (error) {
      // Un frontmatter mal formado no tumba la página: se registra y se salta, como un esquema inválido.
      errors.push(`${file}: YAML inválido — ${(error as Error).message.split('\n')[0]}`);
      continue;
    }
    const parsed = NewsEntrySchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${file}: ${issue.path.join('.') || '(raíz)'} — ${issue.message}`);
      }
      continue;
    }
    const prefix = NEWS_FILE.exec(file)?.[1];
    if (!prefix) {
      errors.push(`${file}: el nombre debe ser <yyyy-mm-dd>-<slug>.md`);
    } else if (prefix !== parsed.data.fecha) {
      // js-yaml convierte una fecha imposible (2026-02-30) en otra real (2026-03-02) sin avisar.
      errors.push(`${file}: la fecha ${parsed.data.fecha} no coincide con la del nombre (${prefix})`);
    } else {
      items.push({ ...parsed.data, id: file.replace(/\.md$/, '') });
    }
  }
  items.sort((x, y) => y.fecha.localeCompare(x.fecha) || x.id.localeCompare(y.id));
  return { items, errors };
}
```

- [ ] **Step 6: verificar**

Run: `npm test 2>&1 | tail -8 && npm run lint && npx tsc --noEmit && npm run check:content`
Expected: todo en verde; `check:content` sigue aceptando las 2 novedades reales (`2025-12-13-colosos-3-trailer.md`, `2026-10-18-la-hecatombe-del-lapeon.md`).

- [ ] **Step 7: informe** (sin commit)

---

### Task 4: Artículos vía `ContentRepository` (#46)

**Files:**
- Modify: `src/core/content/types.ts`, `src/core/content/file-repository.ts`, `src/utils/mdx.ts`, `src/app/(wiki)/wiki/[slug]/page.tsx`, `src/app/(wiki)/wiki/arena/page.tsx`, `src/features/monsters/actions/get-wiki-articles.ts`

**Interfaces:**
- Produces: `ContentRepository.getArticle(slug: string): Promise<WikiArticle | null>`.

- [ ] **Step 1: la interfaz** (`src/core/content/types.ts`)

```ts
export interface ContentRepository {
  /** Artículos válidos de la wiki, ordenados por título. */
  getArticles(): Promise<WikiArticle[]>;
  /** El artículo `slug`, o `null` si no existe o su frontmatter no es válido. */
  getArticle(slug: string): Promise<WikiArticle | null>;
  …el resto igual…
}
```

- [ ] **Step 2: la implementación de archivos** (`src/core/content/file-repository.ts`)

```ts
  getArticles: () => getAllArticles(),

  // Busca en la lista (en caché por petición) en lugar de leer `<slug>.mdx`: no construye rutas con la URL.
  async getArticle(slug) {
    return (await getAllArticles()).find((article) => article.slug === slug) ?? null;
  },
```

- [ ] **Step 3: `src/utils/mdx.ts`**

`getArticleBySlug` deja de exportarse (solo la usa `getAllArticles`). Renombrarla a `readArticle` y actualizar su llamada. El comentario de cabecera de `getAllArticles` añade: «Fuera de aquí, los artículos se leen con `getContentRepository()`».

- [ ] **Step 4: los llamadores**

- `src/app/(wiki)/wiki/[slug]/page.tsx`: quitar el import de `@/utils/mdx`; importar `getContentRepository` de `@/core/content`. `generateMetadata` y la página usan `getContentRepository().getArticle(slug)`; `generateStaticParams` y los relacionados usan `getContentRepository().getArticles()`.
- `src/app/(wiki)/wiki/arena/page.tsx`: `getContentRepository().getArticles()`.
- `src/features/monsters/actions/get-wiki-articles.ts`: las dos llamadas a `getAllArticles()` pasan a `getContentRepository().getArticles()`.

Comprobar que no queda ningún import de `@/utils/mdx` fuera de `src/core/content/file-repository.ts`:

Run: `grep -rn "@/utils/mdx" src scripts`
Expected: solo `src/core/content/file-repository.ts`.

- [ ] **Step 5: verificar**

Run: `npm test 2>&1 | tail -5 && npm run lint && npx tsc --noEmit`
Expected: todo en verde. (El build lo corre el controlador.)

- [ ] **Step 6: informe** (sin commit)

---

### Task 5: `ContentCard` y `CategoryPlaceholder` (#47)

Se despacha **después** de las tareas 1–4: toca `PollTile.tsx` (import), que también toca la tarea 2.

**Files:**
- Move: `src/features/monsters/components/wiki/CategoryPlaceholder.tsx` → `src/components/content/CategoryPlaceholder.tsx` (`git mv`)
- Modify: `src/components/content/index.ts`, `src/components/content/ContentCard.tsx`, `src/app/globals.css` (`.crystal-surface`)
- Modify (imports): todos los que importan `CategoryPlaceholder` o `coverOf` (`grep -rln "wiki/CategoryPlaceholder" src`)

**Interfaces:**
- Consumes: nada de las tareas anteriores.
- Produces: `CategoryPlaceholder` y `coverOf` desde `@/components/content/CategoryPlaceholder` (y desde el barril `@/components/content`). `ContentCardProps` pasa a ser un `type` con unión `href`/`external`.

- [ ] **Step 1: mover el placeholder**

`git mv src/features/monsters/components/wiki/CategoryPlaceholder.tsx src/components/content/CategoryPlaceholder.tsx`. Exportar `CategoryPlaceholder` y `coverOf` desde `src/components/content/index.ts`. En los importadores:
- los componentes cliente (`'use client'`: `PollTile`, `SearchPalette`, `EntityPreview` y los que lo sean) importan de `@/components/content/CategoryPlaceholder`, no del barril, para no arrastrar `ContentCard` al bundle del cliente;
- `ContentCard` importa de `./CategoryPlaceholder`;
- el resto puede usar cualquiera de las dos; usar la ruta directa en todos por coherencia.

Run: `grep -rn "wiki/CategoryPlaceholder" src` → Expected: sin resultados. `src/components/**` ya no importa `CategoryPlaceholder` desde `src/features/**`.

- [ ] **Step 2: nombre accesible de la tarjeta enlace** (`ContentCard.tsx`)

Hoy el nombre del enlace es todo el texto de la tarjeta (título, meta, descripción). Pasa a ser el título (con su «(próximamente)» para lectores de pantalla) y, en las externas, el aviso de pestaña nueva; la meta y la descripción quedan como descripción accesible:

```tsx
import { useId } from 'react';
…
  const titleId = useId();
  const metaId = useId();
  const descriptionId = useId();
  const hintId = useId();
…
        <Heading id={titleId} …>
…
        {meta && <p id={metaId} …>{meta}</p>}
        {description && <p id={descriptionId} …>{description}</p>}
…
  // Nombre = el título (WCAG 2.5.3: contiene el texto visible); la meta y la descripción, como descripción.
  const describedBy = [meta && metaId, description && descriptionId].filter(Boolean).join(' ') || undefined;
  if (!href) return <div className={classes}>{body}</div>;
  if (external) {
    const isYoutube = /youtu\.?be/.test(href);
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-labelledby={`${titleId} ${hintId}`} aria-describedby={describedBy} className={classes}>
        {body}
        <span id={hintId} className="sr-only">{isYoutube ? ' (se abre en YouTube)' : ' (se abre en una pestaña nueva)'}</span>
      </a>
    );
  }
  return <Link href={href as Route} aria-labelledby={titleId} aria-describedby={describedBy} className={classes}>{body}</Link>;
```

`useId` funciona en Server Components (React 19) y en cliente: `ContentCard` no necesita `'use client'`.

- [ ] **Step 3: `href` / `external` como unión** (`ContentCard.tsx`)

```ts
/** `external` solo tiene sentido con `href`. */
type ContentCardLink = { href: string; external?: boolean } | { href?: undefined; external?: never };

export type ContentCardProps = ContentCardLink & {
  title: string;
  …el resto de props de hoy, sin `href` ni `external`…
};
```

El barril (`index.ts`) ya exporta `type ContentCardProps`. Si algún llamador pasa `href` que puede ser `undefined` junto con `external`, ajustar el llamador (no relajar el tipo).

- [ ] **Step 4: el hilo de brillo por encima de la imagen** (`src/app/globals.css`, `.crystal-surface`)

Hoy el hilo es un fondo, así que una imagen pegada arriba (tarjetas con portada) lo tapa. Pasa a un `::after`:

```css
  .crystal-surface {
    --crystal-line: rgb(255 255 255 / 0.3);
    /* Contenedor del hilo; las utilidades (`sticky`, `absolute`…) van en una capa posterior y mandan. */
    position: relative;
    background: #061a2e;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(255 255 255 / 0.1);
    box-shadow: 0 20px 50px rgb(0 0 0 / 0.45);
  }

  /* Hilo de brillo superior: encima de la portada de las tarjetas con imagen arriba. */
  .crystal-surface::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: 0;
    z-index: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--crystal-line), transparent);
    pointer-events: none;
  }
```

Antes de cambiarlo, revisar cada uso de `crystal-surface` (`grep -rn "crystal-surface" src`): si alguno tiene hijos `absolute` que hoy se colocan respecto a un ancestro más lejano, o ya usa `::after`, anotarlo en el informe y no romperlo.

- [ ] **Step 5: verificar**

Run: `npm test 2>&1 | tail -5 && npm run lint && npx tsc --noEmit`
Expected: todo en verde.

- [ ] **Step 6: informe** (sin commit)

---

### Task 6 (controlador): CI, documentación, build y QA

- [ ] `.github/workflows/ci.yml`: `actions/checkout@v7` y `actions/setup-node@v7` (ambas sobre Node 24; hoy v4 corre sobre Node 20, obsoleto).
- [ ] `CLAUDE.md`: `getArticle` y «los artículos se leen con `getContentRepository()`» en el pipeline; reintento del RSS; red /64 del límite de votos; nombre `<yyyy-mm-dd>-<slug>.md` y hosts de YouTube en las novedades; la criatura destacada cambia el lunes UTC; un duelo automático cambia si se publica una ficha con stats a mitad de semana; `CategoryPlaceholder`/`coverOf` en `src/components/content/`.
- [ ] `npm run lint && npm test && npm run check:content && npm run build`.
- [ ] QA con Chrome DevTools (contexto aislado, build de producción en :3131), con evidencia en `docs/audits/2026-10-18-experiencia-fan/pre-despliegue/`:
  - `/comunidad`: estado «Cargando la votación…» antes de la primera respuesta (red lenta), votar, resultados; un título del feed con `’` si el feed responde.
  - Tarjetas: nombre accesible de una tarjeta interna, una externa (YouTube) y una «Próximamente»; hilo de brillo visible sobre la portada (1440 y 390).
  - `/wiki` a 1024 px con el menú lateral abierto y el chip «Próximamente» de Medianos (#47).
  - Ficha, Arena, explorador y búsqueda siguen funcionando (#46).
  - Lighthouse en `/`, `/wiki` y `/comunidad`; consola sin errores.
- [ ] Revisión final de la rama, PR (`Closes #61`, `Closes #45`, `Closes #46`, `Closes #47`), CI, merge y borrado de la rama. Cerrar la épica #30 (todos sus hijos están cerrados).

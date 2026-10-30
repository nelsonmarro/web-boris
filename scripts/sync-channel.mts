/**
 * Instantánea del canal de YouTube en src/content/canal.json (spec UX fase 2 §2), sin clave de API.
 * Uso: npm run sync:canal  (Node >= 22.6 con --experimental-strip-types). Conviene repetirlo antes de cada despliegue
 * para recoger lo publicado desde la última vez.
 *
 * 1. Lee las pestañas «Vídeos» y «Shorts» del canal (`ytInitialData`) y sigue sus páginas siguientes con la API interna
 *    de la web (`youtubei/v1/browse`, con la clave y el contexto públicos de `ytcfg`). Las pestañas listan del más nuevo
 *    al más antiguo: de ahí sale el `orden` de cada entrada dentro de su tipo (1 = el más antiguo). Por defecto, el
 *    script hace solo esto.
 * 2. Con `--con-fechas`, pide además la página de cada vídeo que aún no tiene fecha, de uno en uno y con pausa, para
 *    leer su fecha exacta (`publishDate`). Ante un HTTP 429 (YouTube limita las peticiones) o cualquier otro fallo deja
 *    de pedir fechas sin insistir y sigue con las que tiene; las leídas quedan también en
 *    `node_modules/.cache/sync-canal/`, y el siguiente intento solo pide las que faltan.
 * 3. Escribe canal.json (vídeos y luego shorts, cada bloque por `orden`), validado con el mismo esquema que
 *    check:content. Las fechas ya conocidas (canal.json o la caché) se conservan.
 *
 * Si el listado falla o YouTube cambia el formato, termina con un error claro y NO toca canal.json.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { YOUTUBE_HANDLE } from '../src/features/marketing/config/social.ts';
import { parseCanal, readCanal, serializeCanal, type CanalEntry } from '../src/features/community/lib/canal.ts';
import {
  extractInitialData,
  extractInnertube,
  parseBrowseContinuation,
  parseChannelTab,
  parseWatchDate,
  type ChannelItem,
} from '../src/features/community/lib/youtube-channel-page.ts';

const CANAL_FILE = path.join(process.cwd(), 'src', 'content', 'canal.json');
const DATE_CACHE = path.join(process.cwd(), 'node_modules', '.cache', 'sync-canal', 'fechas.json');
const CHANNEL_URL = `https://www.youtube.com/${YOUTUBE_HANDLE}`;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Accept-Language': 'es',
};
const PAUSE_MS = 300;
const TIMEOUT_MS = 20_000;
/** Tope de páginas por pestaña: evita un bucle si YouTube devolviera siempre un token. */
const MAX_PAGES = 100;
const WITH_DATES = process.argv.includes('--con-fechas');

/** HTTP 429: no se reintenta. */
class RateLimitError extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url: string, init: RequestInit = {}, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers: { ...HEADERS, ...init.headers }, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.ok) return res;
      await res.body?.cancel().catch(() => {});
      // Límite de peticiones: no se insiste. Hay que esperar y volver a lanzar el script.
      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        throw new RateLimitError(
          `YouTube limita las peticiones (HTTP 429${retryAfter ? `, reintentar tras ${retryAfter} s` : ''}) en ${url}; ` +
            'vuelve a lanzar `npm run sync:canal` más tarde',
        );
      }
      lastError = new Error(`HTTP ${res.status} en ${url}`);
    } catch (error) {
      if (error instanceof RateLimitError) throw error;
      lastError = error;
    }
    if (attempt < attempts) await sleep(1000 * attempt);
  }
  throw lastError;
}

/** Todos los elementos de una pestaña, en el orden de YouTube (el más nuevo primero). */
async function listTab(tab: 'videos' | 'shorts'): Promise<ChannelItem[]> {
  const html = await (await request(`${CHANNEL_URL}/${tab}`)).text();
  const first = parseChannelTab(extractInitialData(html));
  const items = [...first.items];
  let token = first.continuation;
  if (token) {
    const { apiKey, context } = extractInnertube(html);
    for (let page = 1; token; page++) {
      if (page > MAX_PAGES) throw new Error(`«${tab}»: más de ${MAX_PAGES} páginas; ¿bucle de continuación?`);
      await sleep(PAUSE_MS);
      const res = await request(`https://www.youtube.com/youtubei/v1/browse?key=${apiKey}&prettyPrint=false`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, continuation: token }),
      });
      const next = parseBrowseContinuation(await res.json());
      items.push(...next.items);
      token = next.continuation;
    }
  }
  console.log(`«${tab}»: ${items.length}`);
  return items;
}

/** Fechas leídas en intentos anteriores que no llegaron a escribir canal.json (p. ej. por un 429). */
function readDateCache(): Map<string, string> {
  try {
    if (!existsSync(DATE_CACHE)) return new Map();
    const json: unknown = JSON.parse(readFileSync(DATE_CACHE, 'utf8'));
    if (typeof json !== 'object' || json === null) return new Map();
    return new Map(Object.entries(json).filter((e): e is [string, string] => typeof e[1] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e[1])));
  } catch {
    return new Map();
  }
}

function writeDateCache(dates: Map<string, string>) {
  mkdirSync(path.dirname(DATE_CACHE), { recursive: true });
  writeFileSync(DATE_CACHE, JSON.stringify(Object.fromEntries(dates)));
}

async function main() {
  const existing = readCanal(CANAL_FILE);
  if (existing.errors.length > 0) throw new Error(`canal.json actual no es válido:\n${existing.errors.join('\n')}`);
  const dates = readDateCache();
  for (const e of existing.items) if (e.fecha) dates.set(e.id, e.fecha);

  // 1. Listado: el más nuevo primero en cada pestaña.
  const entries: CanalEntry[] = [];
  const seen = new Set<string>();
  for (const [tab, tipo] of [['videos', 'video'], ['shorts', 'short']] as const) {
    const items = (await listTab(tab)).filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    items.forEach((item, i) => {
      const fecha = dates.get(item.id);
      entries.push({ id: item.id, titulo: item.titulo, tipo, orden: items.length - i, ...(fecha ? { fecha } : {}) });
    });
  }
  if (entries.length === 0) throw new Error('el canal no devolvió ningún vídeo');

  // 2. Fechas (opcional): solo las que faltan, del más nuevo al más antiguo; se para al primer fallo.
  let fetched = 0;
  if (WITH_DATES) {
    const missing = entries.filter((e) => !e.fecha).sort((a, b) => b.orden - a.orden);
    for (const entry of missing) {
      let fecha: string;
      try {
        await sleep(PAUSE_MS);
        // Un solo intento por vídeo: ante cualquier fallo se para (no se insiste con YouTube).
        const html = await (await request(`https://www.youtube.com/watch?v=${entry.id}`, {}, 1)).text();
        fecha = parseWatchDate(html).slice(0, 10);
      } catch (error) {
        console.warn(
          `sync:canal — se dejan de pedir fechas (${error instanceof Error ? error.message : String(error)}); ` +
            `quedan ${missing.length - fetched} sin fecha`,
        );
        break;
      }
      fetched++;
      entry.fecha = fecha;
      dates.set(entry.id, fecha);
      writeDateCache(dates);
    }
  }

  const checked = parseCanal(entries);
  if (checked.errors.length > 0) throw new Error(`el resultado no cumple el esquema:\n${checked.errors.join('\n')}`);

  // Escritura atómica: un fallo a mitad no deja canal.json a medias.
  const tmp = `${CANAL_FILE}.tmp`;
  writeFileSync(tmp, serializeCanal(entries));
  renameSync(tmp, CANAL_FILE);

  const before = new Set(existing.items.map((e) => e.id));
  const added = entries.filter((e) => !before.has(e.id)).length;
  const removed = existing.items.filter((e) => !seen.has(e.id)).length;
  const videos = entries.filter((e) => e.tipo === 'video').length;
  const dated = entries.filter((e) => e.fecha).length;
  console.log(
    `canal.json: ${entries.length} (${videos} vídeos, ${entries.length - videos} shorts); ${added} nuevos, ` +
      `${removed} retirados; ${dated} con fecha${WITH_DATES ? ` (${fetched} pedidas)` : ''}`,
  );
}

main().catch((error: unknown) => {
  console.error(`sync:canal — ${error instanceof Error ? error.message : String(error)}`);
  console.error('canal.json no se ha modificado.');
  process.exit(1);
});

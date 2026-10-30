/**
 * Lectura de las páginas públicas de un canal de YouTube (pestañas «Vídeos» y «Shorts», y la página de cada vídeo) sin
 * clave de API, para `npm run sync:canal`. Puro: solo recibe texto o JSON ya descargado; lo prueban los tests con
 * fixtures. Si YouTube cambia el formato, lanza `ChannelFormatError` con lo que no encontró: el script se detiene sin
 * tocar `canal.json`.
 */

export class ChannelFormatError extends Error {
  constructor(message: string) {
    super(`formato de YouTube inesperado: ${message}`);
    this.name = 'ChannelFormatError';
  }
}

export interface ChannelItem {
  id: string;
  titulo: string;
}

export interface ChannelPage {
  items: ChannelItem[];
  /** Token para pedir la página siguiente a `youtubei/v1/browse`; sin él, no hay más. */
  continuation?: string;
}

const VIDEO_ID = /^[\w-]{11}$/;

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Valor en `path` (claves de objeto o índices de array), o `undefined` si algún paso no existe. */
function dig(value: unknown, ...path: (string | number)[]): unknown {
  let current = value;
  for (const key of path) {
    if (typeof key === 'number') current = Array.isArray(current) ? current[key] : undefined;
    else current = isObject(current) ? current[key] : undefined;
  }
  return current;
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/**
 * El objeto JSON que empieza en `text[start]` (una `{`), contando llaves fuera de las cadenas: más robusto que buscar
 * el `;</script>` final, que puede aparecer dentro de un título.
 */
export function extractJsonObject(source: string, start: number): string {
  if (source[start] !== '{') throw new ChannelFormatError('se esperaba un objeto JSON');
  let depth = 0;
  let inString = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new ChannelFormatError('objeto JSON sin cerrar');
}

/** El objeto asignado tras `marker` (p. ej. `var ytInitialData = `), ya parseado. */
function jsonAfter(html: string, marker: string): unknown {
  const at = html.indexOf(marker);
  if (at === -1) throw new ChannelFormatError(`no aparece «${marker.trim()}»`);
  const start = html.indexOf('{', at + marker.length);
  try {
    return JSON.parse(extractJsonObject(html, start));
  } catch (error) {
    if (error instanceof ChannelFormatError) throw error;
    throw new ChannelFormatError(`«${marker.trim()}» no es JSON válido`);
  }
}

/** `ytInitialData` de una página del canal. */
export const extractInitialData = (html: string): unknown => jsonAfter(html, 'var ytInitialData = ');

/** Clave y contexto de la API interna de la web (`ytcfg`), para pedir las páginas siguientes de la lista. */
export function extractInnertube(html: string): { apiKey: string; context: unknown } {
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  if (!apiKey) throw new ChannelFormatError('no aparece INNERTUBE_API_KEY');
  return { apiKey, context: jsonAfter(html, '"INNERTUBE_CONTEXT":') };
}

/** Un elemento de la cuadrícula: vídeo (`lockupViewModel` o el antiguo `videoRenderer`) o short. */
function itemOf(content: Json): ChannelItem | null | 'desconocido' {
  const lockup = content.lockupViewModel;
  if (isObject(lockup)) {
    // Otros tipos de lockup (listas, etc.) no son vídeos: se ignoran.
    if (lockup.contentType !== 'LOCKUP_CONTENT_TYPE_VIDEO') return null;
    return { id: text(lockup.contentId), titulo: text(dig(lockup, 'metadata', 'lockupMetadataViewModel', 'title', 'content')) };
  }
  const short = content.shortsLockupViewModel;
  if (isObject(short)) {
    return {
      id: text(dig(short, 'onTap', 'innertubeCommand', 'reelWatchEndpoint', 'videoId')),
      titulo: text(dig(short, 'overlayMetadata', 'primaryText', 'content')),
    };
  }
  const reel = content.reelItemRenderer;
  if (isObject(reel)) return { id: text(reel.videoId), titulo: text(dig(reel, 'headline', 'simpleText')) };
  const video = content.videoRenderer;
  if (isObject(video)) {
    const runs = dig(video, 'title', 'runs');
    const titulo = Array.isArray(runs)
      ? text(runs.map((r) => dig(r, 'text')).filter((t) => typeof t === 'string').join(''))
      : text(dig(video, 'title', 'simpleText'));
    return { id: text(video.videoId), titulo };
  }
  return 'desconocido';
}

/**
 * Vídeos y token de continuación de una lista de la cuadrícula (`richGridRenderer.contents` o los
 * `continuationItems` de una respuesta de `browse`). Un elemento con forma desconocida, o sin id válido o sin título,
 * es un error: mejor parar que publicar una lista incompleta.
 */
export function parseGridItems(contents: readonly unknown[]): ChannelPage {
  const items: ChannelItem[] = [];
  let continuation: string | undefined;
  contents.forEach((entry, index) => {
    if (!isObject(entry)) throw new ChannelFormatError(`elemento ${index} de la lista no es un objeto`);
    const token = dig(entry, 'continuationItemRenderer', 'continuationEndpoint', 'continuationCommand', 'token');
    if (typeof token === 'string' && token) {
      continuation = token;
      return;
    }
    const content = dig(entry, 'richItemRenderer', 'content');
    if (!isObject(content)) throw new ChannelFormatError(`elemento ${index}: ${Object.keys(entry).join(', ') || 'vacío'}`);
    const item = itemOf(content);
    if (item === null) return;
    if (item === 'desconocido') throw new ChannelFormatError(`elemento ${index}: ${Object.keys(content).join(', ') || 'vacío'}`);
    if (!VIDEO_ID.test(item.id)) throw new ChannelFormatError(`elemento ${index}: id de vídeo inválido «${item.id}»`);
    if (!item.titulo) throw new ChannelFormatError(`elemento ${index} (${item.id}): sin título`);
    items.push(item);
  });
  return continuation ? { items, continuation } : { items };
}

/** Primera página de la pestaña seleccionada («Vídeos» o «Shorts») a partir de su `ytInitialData`. */
export function parseChannelTab(data: unknown): ChannelPage {
  const tabs = dig(data, 'contents', 'twoColumnBrowseResultsRenderer', 'tabs');
  if (!Array.isArray(tabs)) throw new ChannelFormatError('no aparecen las pestañas del canal');
  const selected = tabs.find((tab) => dig(tab, 'tabRenderer', 'selected') === true);
  if (!selected) throw new ChannelFormatError('ninguna pestaña seleccionada');
  const contents = dig(selected, 'tabRenderer', 'content', 'richGridRenderer', 'contents');
  if (!Array.isArray(contents)) throw new ChannelFormatError('la pestaña no tiene cuadrícula de vídeos');
  return parseGridItems(contents);
}

/** Página siguiente, a partir de la respuesta de `youtubei/v1/browse` con un token de continuación. */
export function parseBrowseContinuation(json: unknown): ChannelPage {
  const actions = dig(json, 'onResponseReceivedActions');
  if (!Array.isArray(actions)) throw new ChannelFormatError('la continuación no trae onResponseReceivedActions');
  const contents: unknown[] = [];
  for (const action of actions) {
    const list =
      dig(action, 'appendContinuationItemsAction', 'continuationItems') ??
      dig(action, 'reloadContinuationItemsCommand', 'continuationItems');
    if (Array.isArray(list)) contents.push(...list);
  }
  return parseGridItems(contents);
}

/**
 * Fecha de publicación de la página de un vídeo (`publishDate`/`uploadDate` del microformato, con hora y zona), en
 * ISO 8601 UTC completo; quien la guarde decide la precisión.
 */
export function parseWatchDate(html: string): string {
  const raw = html.match(/"(?:publishDate|uploadDate)":"([^"]+)"/)?.[1] ?? html.match(/itemprop="(?:datePublished|uploadDate)" content="([^"]+)"/)?.[1];
  const time = raw ? Date.parse(raw) : Number.NaN;
  if (Number.isNaN(time)) throw new ChannelFormatError(raw ? `fecha inválida «${raw}»` : 'la página del vídeo no trae publishDate');
  return new Date(time).toISOString();
}

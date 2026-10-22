/** Parseo mínimo del feed Atom público de un canal de YouTube. Puro. */
export interface FeedVideo {
  id: string;
  title: string;
  /** Omitido si el feed trae una fecha inválida. */
  published?: string;
}

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

/** Vídeos en el orden del feed (el más reciente primero). Las entradas incompletas se descartan. */
export function parseYoutubeFeed(xml: string): FeedVideo[] {
  const videos: FeedVideo[] = [];
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const entry = match[1];
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1]?.trim();
    if (id && /^[\w-]{11}$/.test(id) && title) {
      const valid = published && !Number.isNaN(Date.parse(published));
      videos.push(valid ? { id, title: decode(title), published } : { id, title: decode(title) });
    }
  }
  return videos;
}

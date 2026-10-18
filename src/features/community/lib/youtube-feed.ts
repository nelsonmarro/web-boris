/** Parseo mínimo del feed Atom público de un canal de YouTube. Puro. */
export interface FeedVideo {
  id: string;
  title: string;
  /** Omitido si el feed trae una fecha inválida. */
  published?: string;
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
    if (id && /^[\w-]{11}$/.test(id) && title) {
      const valid = published && !Number.isNaN(Date.parse(published));
      videos.push(valid ? { id, title: decode(title), published } : { id, title: decode(title) });
    }
  }
  return videos;
}

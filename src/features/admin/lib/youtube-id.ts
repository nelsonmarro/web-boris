/** Id de YouTube a partir de lo que pegue quien edita: el id, o un enlace de vídeo, short o youtu.be. Puro. */
const ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeIdFrom(input: string): string | null {
  const text = input.trim();
  if (ID.test(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, '');
  let candidate: string | null = null;
  if (host === 'youtu.be') candidate = url.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    candidate = url.searchParams.get('v') ?? /^\/(?:shorts|embed|live)\/([^/?#]+)/.exec(url.pathname)?.[1] ?? null;
  }
  return candidate && ID.test(candidate) ? candidate : null;
}

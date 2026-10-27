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

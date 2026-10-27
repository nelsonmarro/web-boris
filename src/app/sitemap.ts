import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getContentRepository } from '@/core/content';

/** Páginas fijas; las fichas salen de los MDX. Sin `lastModified`: no se inventa una fecha que no se conoce. */
const STATIC_ROUTES = ['/', '/wiki', '/comunidad', '/wiki/arena', '/wiki/registro'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getContentRepository().getArticles();
  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${SITE_URL}${path === '/' ? '' : path}` })),
    ...articles.map((a) => ({ url: `${SITE_URL}/wiki/${a.slug}` })),
  ];
}

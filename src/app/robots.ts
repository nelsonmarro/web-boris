import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/** Todo el sitio es público e indexable; solo se enlaza el sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

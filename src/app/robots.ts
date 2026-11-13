import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/** Todo el sitio es público e indexable salvo el panel `/admin`; se enlaza el sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

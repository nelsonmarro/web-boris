import type { Metadata } from 'next';

/** Origen público del sitio; el mismo que usa `metadataBase` del layout raíz. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3131';

export const SITE_NAME = 'Universos de BorisaoBlois';

/**
 * Imagen social por defecto (1200×630, recorte de `Medusa_Buhonda`, el fondo de la landing). Un `openGraph` de página
 * sustituye al del layout entero, así que quien lo defina debe volver a pasar las imágenes (lo hace `pageMetadata`).
 */
export const DEFAULT_OG_IMAGES = [
  { url: '/assets/Branding/og-default.png', width: 1200, height: 630, alt: SITE_NAME },
];

interface PageMetadataInput {
  title: string;
  description?: string;
  /** Ruta canónica, p. ej. `/wiki/registro`. */
  path: string;
  /** Imagen propia (portada de la ficha); si falta, la imagen por defecto. */
  image?: string;
}

/** `title`, `description`, `alternates.canonical`, Open Graph y Twitter de una página, con la misma forma en todas. */
export function pageMetadata({ title, description, path, image }: PageMetadataInput): Metadata {
  const images = image ? [{ url: image }] : DEFAULT_OG_IMAGES;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'es_ES', title, description, url: path, images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

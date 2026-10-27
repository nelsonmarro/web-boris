import type { NewsEntry } from '@/core/content';
import { ContentCard } from '@/components/content/ContentCard';
import { formatFecha } from '@/utils/format-date';
import type { NewsImage } from '../lib/news-image';

/**
 * Novedad más reciente a ancho completo (spec 2026-10-27 §3). Es lo primero de /comunidad: su imagen es el LCP y va
 * `eager`. La imagen sale de su enlace (`newsImage`); sin imagen, `ContentCard` pinta el placeholder por categoría.
 */
export function NewsFeatured({ entry, image }: { entry: NewsEntry; image: NewsImage }) {
  return (
    <ContentCard
      href={entry.enlace}
      external={entry.enlace.startsWith('https://')}
      title={entry.titulo}
      meta={formatFecha(new Date(`${entry.fecha}T00:00:00Z`))}
      description={entry.resumen}
      image={image.image}
      imagePosition={image.imagePosition}
      category={image.category}
      aspect="video"
      headingLevel={3}
      eager
      sizes="(min-width: 768px) 720px, 100vw"
    />
  );
}

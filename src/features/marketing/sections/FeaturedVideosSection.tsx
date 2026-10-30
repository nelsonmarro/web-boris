import { ContentCard, Section } from '@/components/content';
import { youtubeThumbUrl, youtubeWatchUrl } from '@/utils/youtube';
import { cn } from '@/utils/cn';
import { SOCIAL_LINKS } from '../config/social';
import { FEATURED_VIDEOS } from '../config/videos';
import { getLandingLatestVideo } from '../data/landing-latest-video';
import { LANDING_SECTION } from './landing-rhythm';

/** Cabecera común a la sección y a su esqueleto: el h2 y el ancla `#videos` existen desde el primer byte. */
const SECTION = {
  id: 'videos',
  title: 'Vídeos',
  action: { href: SOCIAL_LINKS.youtube, label: 'Ver canal', external: true },
  className: LANDING_SECTION,
} as const;

interface VideoCard {
  id: string;
  title: string;
  meta: string;
}

/** Último vídeo del canal (RSS) y los tres que indicó Boris, sin duplicados y como mucho cuatro. Miniaturas, sin embeber nada. */
export async function FeaturedVideosSection() {
  // La misma lectura que el botón «Ver el último vídeo» del hero (`cache` por petición).
  const latest = await getLandingLatestVideo();

  const cards: VideoCard[] = [];
  // «Último vídeo» solo si viene del feed; el respaldo es uno de la lista de Boris y lleva su propia etiqueta.
  if (latest.source === 'rss') cards.push({ id: latest.id, title: latest.title, meta: 'Último vídeo' });
  for (const video of FEATURED_VIDEOS) {
    if (cards.some((c) => c.id === video.id)) continue;
    cards.push({ id: video.id, title: video.title, meta: video.label });
  }
  const shown = cards.slice(0, 4);

  return (
    <Section {...SECTION}>
      {/* 3 tarjetas ocupan 3 columnas en escritorio (sin hueco huérfano); 4, cuatro. */}
      <div className={cn('grid grid-cols-2 gap-3 lg:gap-4', shown.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4')}>
        {shown.map((video) => (
          <ContentCard
            key={video.id}
            external
            href={youtubeWatchUrl(video.id)}
            image={youtubeThumbUrl(video.id)}
            title={video.title}
            meta={video.meta}
            sizes={shown.length === 3 ? '(min-width: 1024px) 33vw, 50vw' : '(min-width: 1024px) 25vw, 50vw'}
          />
        ))}
      </div>
    </Section>
  );
}

/**
 * Respaldo del `<Suspense>` de la landing mientras llega el RSS: la misma cabecera y cuatro tarjetas vacías con la
 * forma de `ContentCard` (miniatura 16:9, título y meta), para que la sección no salte al rellenarse. Decorativo.
 */
export function FeaturedVideosSkeleton() {
  return (
    <Section {...SECTION}>
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="crystal-surface flex h-full flex-col overflow-hidden rounded-2xl">
            <div className="aspect-video w-full bg-[#00122E]" />
            <div className="flex flex-1 flex-col gap-1.5 p-4 md:p-5">
              <div className="h-[25px] w-4/5 rounded bg-white/10 motion-safe:animate-pulse" />
              <div className="h-[18px] w-1/3 rounded bg-white/10 motion-safe:animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

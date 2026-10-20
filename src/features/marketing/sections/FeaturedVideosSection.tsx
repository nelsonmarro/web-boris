import { ContentCard, Section } from '@/components/content';
import { youtubeThumbUrl, youtubeWatchUrl } from '@/utils/youtube';
import { getLatestVideo } from '@/features/community/data/latest-video';
import { cn } from '@/utils/cn';
import { SOCIAL_LINKS } from '../config/social';
import { FEATURED_VIDEOS } from '../config/videos';

interface VideoCard {
  id: string;
  title: string;
  meta: string;
}

/** Último vídeo del canal (RSS) y los tres que indicó Boris, sin duplicados y como mucho cuatro. Miniaturas, sin embeber nada. */
export async function FeaturedVideosSection() {
  const latest = await getLatestVideo();

  const cards: VideoCard[] = [];
  // «Último vídeo» solo si viene del feed; el respaldo es uno de la lista de Boris y lleva su propia etiqueta.
  if (latest.source === 'rss') cards.push({ id: latest.id, title: latest.title, meta: 'Último vídeo' });
  for (const video of FEATURED_VIDEOS) {
    if (cards.some((c) => c.id === video.id)) continue;
    cards.push({ id: video.id, title: video.title, meta: video.label });
  }
  const shown = cards.slice(0, 4);

  return (
    <Section id="videos" title="Vídeos" action={{ href: SOCIAL_LINKS.youtube, label: 'Ver canal', external: true }} className="scroll-mt-24">
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

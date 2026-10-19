import { ContentCard, Section } from '@/components/content';
import { getLatestVideo } from '@/features/community/data/latest-video';
import { SOCIAL_LINKS } from '../config/social';
import { FEATURED_VIDEOS } from '../config/videos';

/** Siglas que se conservan en mayúsculas al pasar la categoría a "sentence case". */
const ACRONYMS = new Set(['CGI']);

/** "SHORT · SEGUNDA GUERRA MUNDIAL" → "Short · segunda guerra mundial". */
function sentenceCase(text: string): string {
  const lowered = text
    .split(' ')
    .map((word) => (ACRONYMS.has(word) ? word : word.toLowerCase()))
    .join(' ');
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}

interface VideoCard {
  id: string;
  title: string;
  meta: string;
}

/** Último vídeo del canal (RSS) y los tres que indicó Boris, sin duplicados y como mucho cuatro. Miniaturas, sin embeber nada. */
export async function FeaturedVideosSection() {
  const latest = await getLatestVideo();

  const cards: VideoCard[] = [];
  if (latest.source === 'rss') cards.push({ id: latest.id, title: latest.title, meta: 'Último vídeo' });
  for (const video of FEATURED_VIDEOS) {
    if (cards.some((c) => c.id === video.id)) continue;
    cards.push({ id: video.id, title: video.title, meta: sentenceCase(video.category) });
  }

  return (
    <Section id="videos" title="Vídeos" action={{ href: SOCIAL_LINKS.youtube, label: 'Ver canal', external: true }} className="scroll-mt-24">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {cards.slice(0, 4).map((video) => (
          <ContentCard
            key={video.id}
            external
            href={`https://www.youtube.com/watch?v=${video.id}`}
            image={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
            title={video.title}
            meta={video.meta}
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ))}
      </div>
    </Section>
  );
}

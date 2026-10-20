import { ContentCard, Section } from '@/components/content';
import { youtubeThumbUrl, youtubeWatchUrl } from '@/utils/youtube';

const MAX_VIDEOS = 4;

interface ApareceEnProps {
  /** Vídeos del canal donde sale la ficha (`getVideosForSlug`). */
  videos: { id: string; title: string }[];
}

/**
 * «Aparece en»: los vídeos de Boris donde sale esta ficha, antes del pie de la ficha (`WikiArticleFooter`).
 * Sin vídeos no pinta nada. Lleva su propio `wiki-container` para alinearse con los relacionados.
 */
export function ApareceEn({ videos }: ApareceEnProps) {
  if (videos.length === 0) return null;
  return (
    <div className="clear-both mt-8 border-t border-white/10">
      <div className="wiki-container">
        <Section id="aparece-en" title="Aparece en" contained={false} className="py-10 md:py-14">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {videos.slice(0, MAX_VIDEOS).map((video) => (
              <ContentCard
                key={video.id}
                href={youtubeWatchUrl(video.id)}
                external
                title={video.title}
                image={youtubeThumbUrl(video.id)}
                titleLines={3}
                sizes="(min-width: 768px) 280px, 50vw"
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

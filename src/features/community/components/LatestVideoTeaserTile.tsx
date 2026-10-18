import { Clapperboard, Play } from 'lucide-react';
import { CrystalTile } from '@/components/crystal';
import type { LatestVideo } from '../data/latest-video';

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Último vídeo del canal: la tile entera abre el vídeo en YouTube. */
export function LatestVideoTeaserTile({ video, className }: { video: LatestVideo; className?: string }) {
  const hasDate = Boolean(video.published) && !Number.isNaN(Date.parse(video.published!));
  return (
    <CrystalTile
      variant="media"
      externalHref={`https://www.youtube.com/watch?v=${video.id}`}
      image={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
      eyebrow="Último vídeo"
      title={video.title}
      titleSize="compact"
      titleClassName="line-clamp-2"
      icon={Clapperboard}
      iconTone="cyan"
      imageClassName="scale-[1.34] group-hover/tile:scale-[1.4] motion-reduce:group-hover/tile:scale-[1.34]"
      className={className}
    >
      <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/75">
        <Play className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        Ver en YouTube
        {hasDate ? ` · ${dateFormat.format(new Date(video.published!))}` : ''}
      </span>
    </CrystalTile>
  );
}

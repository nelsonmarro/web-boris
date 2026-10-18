'use client';

import Link from 'next/link';
import { YouTubeEmbed } from '@next/third-parties/google';
import { Clapperboard } from 'lucide-react';
import { YoutubeIcon } from '@/features/marketing/components/icons/YoutubeIcon';
import { SOCIAL_LINKS } from '@/features/marketing/config/social';
import type { LatestVideo } from '../data/latest-video';
import { CrystalTile } from '@/components/crystal';

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function LatestVideoTile({ video, className }: { video: LatestVideo; className?: string }) {
  return (
    <CrystalTile eyebrow="Último vídeo" title={video.title} icon={Clapperboard} className={className}>
      {/* La regla global "YouTube Embed Fixes" hace que lite-youtube rellene este marco relative. */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black">
        <YouTubeEmbed videoid={video.id} playlabel={`Reproducir: ${video.title}`} params="controls=1&rel=0" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {video.published ? (
          <time dateTime={video.published} className="eyebrow text-white/60">
            {dateFormat.format(new Date(video.published))}
          </time>
        ) : (
          <span className="eyebrow text-white/60">Vídeo destacado</span>
        )}
        <Link
          href={SOCIAL_LINKS.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <YoutubeIcon className="h-4 w-4 shrink-0" />
          Ver más en YouTube
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </Link>
      </div>
    </CrystalTile>
  );
}

'use client';

import { Video } from 'lucide-react';
import Link from 'next/link';
import { YouTubeEmbed } from '@next/third-parties/google';
import { YoutubeIcon } from '@/features/marketing/components/icons/YoutubeIcon';
import { SOCIAL_LINKS } from '@/features/marketing/config/social';

type Orientation = 'landscape' | 'short';

interface FeaturedVideo {
  id: string;
  title: string;
  category: string;
  orientation: Orientation;
}

/**
 * Los tres videos que Boris indicó en "Requerimientos Pagina"; títulos tal como aparecen en YouTube.
 * La batalla es horizontal (16:9); "Extinción masiva" y "El Blitz" son YouTube Shorts (9:16).
 */
const VIDEOS: FeaturedVideo[] = [
  {
    id: 'hedUAqopPBg',
    title: 'Colosos - The Bloop vs El Gran Majá - La Batalla',
    category: 'COLOSOS',
    orientation: 'landscape',
  },
  {
    id: 'XurjKHinBIY',
    title: 'Extinción masiva',
    category: 'SHORT · CGI',
    orientation: 'short',
  },
  {
    id: 'BP6fwpSuR7I',
    title: 'El Blitz',
    category: 'SHORT · SEGUNDA GUERRA MUNDIAL',
    orientation: 'short',
  },
];

/*
 * `<lite-youtube>` no tiene tamaño propio aquí: la regla global "YouTube Embed Fixes" de globals.css
 * lo deja en `position: absolute; inset: 0; width/height: 100% !important`, así que rellena el marco
 * `relative` que lo contiene. Por eso la proporción se decide solo en el marco (aspect-video / 9:16).
 * La proporción 16:9 que lite-youtube dibuja con `::after { padding-bottom }` queda recortada por
 * `contain: content` y no influye.
 */
const FRAME_BASE =
  'relative w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_20px_40px_rgba(0,0,0,0.45)]';

const FRAME_BY_ORIENTATION: Record<Orientation, string> = {
  landscape: 'aspect-video',
  short: 'aspect-[9/16]',
};

/** Móvil: la batalla ocupa las 2 columnas y cada short una. Escritorio: 2fr · 1fr · 1fr. */
const ITEM_BY_ORIENTATION: Record<Orientation, string> = {
  landscape: 'col-span-2 lg:col-span-1',
  short: 'col-span-1 mx-auto w-full max-w-[280px]',
};

const TITLE_BY_ORIENTATION: Record<Orientation, string> = {
  landscape: 'text-2xl md:text-4xl lg:text-3xl',
  short: 'text-lg sm:text-xl',
};

export function FeaturedVideosSection() {
  return (
    <section id="videos" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5" />
              Archivo Multimedia
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white italic tracking-tight uppercase">
              Videos <span className="text-primary">Destacados</span>
            </h2>
          </div>
          <Link
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl text-[11px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:self-auto"
          >
            <YoutubeIcon className="w-4 h-4 shrink-0" />
            <span>
              Ver canal
              <span className="sr-only"> de BorisaoBlois en YouTube (se abre en una pestaña nueva)</span>
            </span>
          </Link>
        </header>

        <div className="mx-auto grid max-w-6xl grid-cols-2 items-start gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
          {VIDEOS.map((video) => (
            <div
              key={video.id}
              className={`group space-y-4 ${ITEM_BY_ORIENTATION[video.orientation]}`}
            >
              <div className={`${FRAME_BASE} ${FRAME_BY_ORIENTATION[video.orientation]}`}>
                <YouTubeEmbed
                  videoid={video.id}
                  playlabel={`Reproducir: ${video.title}`}
                  params="controls=1&rel=0"
                />
              </div>

              <div className="space-y-2 px-1">
                <span className="block text-[11px] font-bold uppercase leading-snug tracking-wider text-primary">
                  {video.category}
                </span>
                <h3
                  className={`font-bold text-white italic uppercase tracking-tight leading-tight group-hover:text-primary transition-colors ${TITLE_BY_ORIENTATION[video.orientation]}`}
                >
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}

'use client';

import * as React from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { youtubeThumbUrl } from '@/utils/youtube';

interface YouTubeLiteProps {
  /** Id de 11 caracteres del vídeo. */
  id: string;
  title: string;
  sizes?: string;
}

/**
 * Embed ligero de YouTube: hasta el clic solo hay una miniatura (`sddefault`, de i.ytimg.com) y un botón; no se carga
 * ni el reproductor, ni su JS, ni sus cookies. Al pulsar, el botón se cambia por el `iframe` de youtube-nocookie.com
 * con `autoplay=1` (lo pidió el propio clic) y el foco pasa al reproductor para no perderlo.
 */
export function YouTubeLite({ id, title, sizes = '(min-width: 1024px) 800px, calc(100vw - 2rem)' }: YouTubeLiteProps) {
  const [playing, setPlaying] = React.useState(false);
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[#00122E]">
      {playing ? (
        <iframe
          ref={frameRef}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir «${title}»`}
          className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          {/* sddefault es 4:3 con bandas negras: `object-cover` en la caja 16:9 las deja fuera. */}
          <Image src={youtubeThumbUrl(id)} alt="" fill unoptimized sizes={sizes} className="object-cover" />
          <span aria-hidden="true" className="absolute inset-0 bg-[#00122E]/20 transition-colors group-hover:bg-transparent motion-reduce:transition-none" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-[#00122E] shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
          >
            <Play className="ml-1 h-7 w-7 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}

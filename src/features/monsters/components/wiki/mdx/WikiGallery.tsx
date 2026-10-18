import * as React from 'react';
import Image from 'next/image';
import { Maximize2, ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface WikiGalleryProps {
  children: React.ReactNode;
}

export function WikiGallery({ children }: WikiGalleryProps) {
  return (
    <div className="my-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 clear-both not-prose">
      {children}
    </div>
  );
}

interface WikiImageProps {
  /** Sin `src` se muestra un marcador "Imagen pendiente". */
  src?: string;
  alt: string;
  caption?: string;
  align?: 'left' | 'right' | 'center' | 'none';
}

export function WikiImage({
  src,
  alt,
  caption,
  align = 'none',
}: WikiImageProps) {
  const alignClasses = {
    right: 'w-full mb-8 mt-0 @2xl:float-right @2xl:ml-8 @2xl:mb-6 @2xl:w-80 @3xl:w-96 @2xl:clear-right',
    left: 'w-full mb-8 mt-0 @2xl:float-left @2xl:mr-8 @2xl:mb-6 @2xl:w-80 @3xl:w-96 @2xl:clear-left',
    center: 'mx-auto mb-12 mt-0 w-full max-w-4xl clear-both',
    none: 'w-full mb-8 mt-0',
  };

  const aspect =
    align === 'none' || align === 'center' ? 'aspect-video' : 'aspect-[4/3] @2xl:aspect-[4/5]';

  return (
    <figure
      className={cn(
        'group not-prose block relative m-0 p-0 border-0 bg-transparent',
        alignClasses[align],
      )}
    >
      {!src ? (
        <div
          role="img"
          aria-label={alt ? `Imagen pendiente: ${alt}` : 'Imagen pendiente'}
          className={cn(
            'relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_55%,#00122E_100%)] p-4 text-center',
            aspect,
          )}
        >
          <ImageOff className="h-10 w-10 text-primary/80 drop-shadow-[0_0_18px_rgba(255,115,0,0.5)]" aria-hidden="true" />
          <span className="eyebrow text-white/60">Imagen pendiente</span>
          {alt && <span className="line-clamp-2 max-w-[90%] text-[11px] text-white/60">{alt}</span>}
        </div>
      ) : (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'relative block w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:border-primary/40 p-0 m-0 bg-transparent cursor-zoom-in',
          aspect,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={
            align === 'left' || align === 'right'
              ? '(min-width: 1280px) 384px, (min-width: 1024px) 320px, 100vw'
              : '(max-width: 1024px) 100vw, 800px'
          }
          className="object-cover object-top absolute m-0 p-0 block w-full h-full transition-transform duration-[1.5s] group-hover:scale-110 !top-0 !left-0 !inset-0"
        />

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-[0_0_20px_rgba(255,115,0,0.3)]">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
        </div>
      </a>
      )}

      {caption && (
        <figcaption className="mt-3 px-1 text-[12px] leading-snug text-white/60 md:text-[13px]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

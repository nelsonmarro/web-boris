import * as React from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';
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
  src: string;
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
    right: 'w-full mb-8 mt-0 lg:float-right lg:ml-8 lg:mb-6 lg:w-80 xl:w-96 lg:clear-right',
    left: 'w-full mb-8 mt-0 lg:float-left lg:mr-8 lg:mb-6 lg:w-80 xl:w-96 lg:clear-left',
    center: 'mx-auto mb-12 mt-0 w-full max-w-4xl clear-both',
    none: 'w-full mb-8 mt-0',
  };

  return (
    <figure
      className={cn(
        'group not-prose block relative m-0 p-0 border-0 bg-transparent',
        alignClasses[align],
      )}
    >
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'relative block w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:border-primary/40 p-0 m-0 bg-transparent cursor-zoom-in',
          align === 'none' || align === 'center'
            ? 'aspect-video'
            : 'aspect-[4/3] lg:aspect-[4/5]',
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

      {caption && (
        <figcaption className="mt-3 px-1 text-[12px] leading-snug text-white/55 md:text-[13px]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

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
    right: 'float-right ml-8 mb-8 mt-0 w-72 md:w-96 clear-right',
    left: 'float-left mr-8 mt-0 mb-8 w-72 md:w-96 clear-left',
    center: 'mx-auto mb-12 mt-0 w-full max-w-4xl clear-both',
    none: 'w-full mb-8 mt-0',
  };

  return (
    <div
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
          align === 'none' ? 'aspect-video' : 'aspect-[4/5]',
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-top absolute m-0 p-0 block w-full h-full transition-transform duration-[1.5s] group-hover:scale-110 !top-0 !left-0 !inset-0"
          priority
        />

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-[0_0_20px_rgba(255,115,0,0.3)]">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
        </div>
      </a>

      {caption && (
        <div className="mt-4 px-4 text-center select-none">
          <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] italic group-hover:text-primary transition-colors duration-300">
            {caption}
          </span>
          <div className="mt-2 h-[1px] w-12 mx-auto bg-primary/20 group-hover:w-24 group-hover:bg-primary/50 transition-all duration-500" />
        </div>
      )}
    </div>
  );
}


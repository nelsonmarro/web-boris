'use client';

import * as React from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface WikiGalleryProps {
  images: GalleryImage[];
}

export function WikiGallery({ images = [] }: WikiGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="my-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((img, i) => (
        <div key={i} className="group relative flex flex-col space-y-3">
          <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-xl glass-liquid group-hover:border-primary/40 transition-all duration-500">
            <div className="glass-reflection opacity-20" />
            
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
            />
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
               <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-xl border border-white/20 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                  <Maximize2 className="w-5 h-5 text-white" />
               </div>
            </div>
          </div>
          
          {img.caption && (
            <p className="px-2 text-center text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-wider line-clamp-2">
              {img.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

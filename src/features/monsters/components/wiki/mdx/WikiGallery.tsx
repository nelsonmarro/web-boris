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
    <div className="my-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {images.map((img, i) => (
        <div key={i} className="group relative flex flex-col space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a2339] group-hover:border-primary/50 transition-all duration-500">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-[1.5s] group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
               <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                  <Maximize2 className="w-4 h-4 text-white" />
               </div>
            </div>
          </div>
          
          {img.caption && (
            <p className="px-4 text-center text-[10px] font-bold text-white/40 group-hover:text-primary transition-colors uppercase tracking-[0.2em] leading-relaxed italic">
              {img.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

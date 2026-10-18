'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, isBrandPlaceholder } from '../CategoryPlaceholder';

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-white/5 last:border-0">
      <div className="sm:w-1/3 py-2 pr-2 sm:py-3 sm:pr-4">
        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="sm:w-2/3 py-1 sm:py-3 text-sm text-white/80 font-medium">
        {value}
      </div>
    </div>
  );
}

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="bg-primary/10 border-y border-primary/20 py-2 px-4 text-center">
        <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] italic">
          {title}
        </p>
      </div>
      <div className="px-4">
        {children}
      </div>
    </div>
  );
}

interface WikiInfoboxProps {
  title: string;
  image?: string;
  imageCaption?: string;
  category?: string;
  children: React.ReactNode;
  className?: string;
}

export function WikiInfobox({ title, image, imageCaption, category, children, className }: WikiInfoboxProps) {
  return (
    <aside className={cn(
      "w-full mb-8 bg-[#061a2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-20",
      className
    )}>
      {/* Header */}
      <div className="bg-primary/90 p-5 text-center shadow-lg border-b border-primary">
        <div className="font-display text-2xl font-black text-white italic uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          {title}
        </div>
      </div>

      {/* Image - Filling the rectangle edge-to-edge */}
      {(!image || isBrandPlaceholder(image)) ? (
        <div className="relative aspect-video w-full border-b border-white/10 bg-black/40">
          <CategoryPlaceholder category={category} />
        </div>
      ) : (
        <div className="relative border-b border-white/10 bg-black/40 group/img">
          <a 
            href={image} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="relative block aspect-[4/5] w-full overflow-hidden cursor-zoom-in"
          >
            <Image 
              src={image} 
              alt={title} 
              fill 
              sizes="(min-width: 1024px) 340px, 100vw"
              className="object-cover transition-transform duration-700 group-hover/img:scale-105" 
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
               <div className="bg-primary/20 backdrop-blur-md p-2 rounded-full border border-primary/40 scale-75">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-4 h-4"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
               </div>
            </div>
          </a>
          {imageCaption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 border-t border-white/5">
              <div className="text-center text-[11px] font-bold text-white/60 uppercase tracking-widest italic leading-relaxed">
                {imageCaption}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="pb-4">
        {children}
      </div>
      
      {/* Decorative footer */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </aside>
  );
}

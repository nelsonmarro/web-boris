'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-b border-white/5 last:border-0 group/field">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 min-w-[120px] group-hover/field:text-primary transition-colors">
        {label}
      </span>
      <span className="text-sm font-medium text-white/90">
        {value}
      </span>
    </div>
  );
}

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="mt-6 first:mt-0">
      <h4 className="bg-primary/20 text-primary px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] italic mb-2 rounded-lg border border-primary/30 shadow-[0_0_20px_rgba(255,115,0,0.1)]">
        {title}
      </h4>
      <div className="px-2">
        {children}
      </div>
    </div>
  );
}

interface WikiInfoboxProps {
  title: string;
  image?: string;
  imageCaption?: string;
  children: React.ReactNode;
  className?: string;
}

export function WikiInfobox({ title, image, imageCaption, children, className }: WikiInfoboxProps) {
  return (
    <aside className={cn(
      "w-full lg:w-[350px] lg:float-right lg:ml-8 mb-8 lg:mb-4 glass-liquid bg-[#0b2e4d] rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden border-refractive z-20 sticky top-24",
      className
    )}>
      <div className="glass-reflection opacity-20" />
      
      {/* Header */}
      <div className="bg-primary p-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <h3 className="text-2xl font-bold text-white italic uppercase tracking-tight relative z-10 drop-shadow-md">
          {title}
        </h3>
      </div>

      {/* Image */}
      {image && (
        <div className="p-4">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner group/infopic">
            <Image 
              src={image} 
              alt={title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover/infopic:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>
          {imageCaption && (
            <p className="mt-3 text-center text-[10px] font-bold text-white/40 uppercase tracking-wider italic">
              {imageCaption}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 pt-2">
        {children}
      </div>

      {/* Footer Decoration */}
      <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </aside>
  );
}

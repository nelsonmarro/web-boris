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
    <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-white/5 last:border-0">
      <div className="sm:w-1/3 py-2 pr-2 sm:py-3 sm:pr-4">
        <span className="text-xs font-bold text-white/80">
          {label}
        </span>
      </div>
      <div className="sm:w-2/3 py-1 sm:py-3 text-sm text-white/70">
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
      <div className="bg-[#fb8b24] py-1.5 px-4 text-center">
        <h4 className="text-sm font-extrabold text-black tracking-wide">
          {title}
        </h4>
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
  children: React.ReactNode;
  className?: string;
}

export function WikiInfobox({ title, image, imageCaption, children, className }: WikiInfoboxProps) {
  return (
    <aside className={cn(
      "w-full lg:w-[350px] lg:float-right lg:ml-8 mb-8 lg:mb-4 bg-[#111] rounded-xl border border-white/10 shadow-xl overflow-hidden z-20",
      className
    )}>
      {/* Header */}
      <div className="bg-[#fb8b24] p-4 text-center">
        <h3 className="text-xl font-extrabold text-black uppercase tracking-tight">
          {title}
        </h3>
      </div>

      {/* Image */}
      {image && (
        <div className="p-0 border-b border-white/5">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image 
              src={image} 
              alt={title} 
              fill 
              className="object-cover" 
            />
          </div>
          {imageCaption && (
            <div className="p-3 bg-[#1a1a1a]">
              <p className="text-center text-[11px] font-medium text-white/60">
                {imageCaption}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="pb-4">
        {children}
      </div>
    </aside>
  );
}

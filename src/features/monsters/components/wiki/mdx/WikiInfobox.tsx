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
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
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
        <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] italic">
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
      "w-full lg:w-[350px] lg:float-right lg:ml-8 mb-8 lg:mb-4 bg-[#061a2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-20",
      className
    )}>
      {/* Header */}
      <div className="bg-primary p-5 text-center shadow-lg">
        <div className="text-xl font-bold text-white italic uppercase tracking-tight">
          {title}
        </div>
      </div>

      {/* Image */}
      {image && (
        <div className="p-4 border-b border-white/5 bg-black/20">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-white/10">
            <Image 
              src={image} 
              alt={title} 
              fill 
              className="object-cover" 
            />
          </div>
          {imageCaption && (
            <div className="mt-3">
              <div className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest italic">
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

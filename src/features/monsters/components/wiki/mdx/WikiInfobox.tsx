'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

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
  children: React.ReactNode;
  className?: string;
}

/** Datos de la ficha en el rail derecho. La portada vive en la cabecera de la ficha, no aquí. */
export function WikiInfobox({ title, children, className }: WikiInfoboxProps) {
  return (
    <aside className={cn(
      "w-full mb-8 bg-[#061a2e] rounded-2xl border border-white/10 overflow-hidden z-20",
      className
    )}>
      {/* Header */}
      <div className="bg-primary/90 p-5 text-center border-b border-primary">
        <div className="font-display text-2xl font-black text-white italic uppercase tracking-widest">
          {title}
        </div>
      </div>

      {/* Content */}
      <div className="pb-4">
        {children}
      </div>
    </aside>
  );
}

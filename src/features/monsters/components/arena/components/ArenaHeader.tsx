'use client';

import * as React from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArenaHeaderProps {
  title: string;
  subtitle: string;
  description: string;
}

export function ArenaHeader({ title, subtitle, description }: ArenaHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
      <div className="space-y-4">
         <div className="inline-flex items-center gap-2.5 px-4 py-1.5 glass-liquid rounded-full border-white/10 bg-white/5">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="text-white text-[10px] font-bold tracking-wider uppercase">{subtitle}</span>
         </div>
         <h1 className="text-5xl md:text-7xl font-bold text-white italic tracking-tight uppercase leading-none">
           {title.split(' ')[0]} <span className="text-primary">{title.split(' ').slice(1).join(' ')}</span>
         </h1>
         <p className="text-white/60 text-lg max-w-xl font-medium">
           {description}
         </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" className="h-14 px-8 rounded-2xl glass-liquid border-white/10 text-white font-bold uppercase tracking-wider text-[11px] italic">
           Reglas de la Arena
        </Button>
      </div>
    </header>
  );
}

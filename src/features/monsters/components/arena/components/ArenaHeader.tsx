'use client';

import * as React from 'react';
import { Trophy, Database } from 'lucide-react';

interface ArenaHeaderProps {
  title: string;
  subtitle: string;
  description: string;
  fighterCount: number;
}

export function ArenaHeader({ title, subtitle, description, fighterCount }: ArenaHeaderProps) {
  const [first, ...rest] = title.split(' ');
  return (
    <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2.5 rounded-full glass-liquid border-white/10 bg-white/5 px-4 py-1.5">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          <span className="eyebrow text-white">{subtitle}</span>
        </div>
        <h1 className="page-title uppercase italic">
          {first} <span className="text-primary">{rest.join(' ')}</span>
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-white/60 md:text-lg">{description}</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl glass-liquid border-white/10 px-6 py-4">
        <Database className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="eyebrow text-white/40">Combatientes</span>
          <span className="font-mono text-2xl font-black text-white">{fighterCount}</span>
        </div>
      </div>
    </header>
  );
}

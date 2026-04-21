'use client';

import * as React from 'react';
import { BookOpen, Users, Play, Globe } from 'lucide-react';

const STATS = [
  { label: 'Entradas de Lore', value: '450+', icon: BookOpen, color: 'text-primary' },
  { label: 'Exploradores Activos', value: '1.2M', icon: Users, color: 'text-blue-400' },
  { label: 'Archivos Visuales', value: '120+', icon: Play, color: 'text-red-500' },
  { label: 'Universos Paralelos', value: '3', icon: Globe, color: 'text-emerald-400' },
];

export function LoreStatsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center text-center space-y-4 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/5 shadow-xl glass-liquid">
                 <stat.icon className={`w-7 h-7 ${stat.color} drop-shadow-[0_0_10px_currentColor]`} />
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-white tracking-tighter italic">{stat.value}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

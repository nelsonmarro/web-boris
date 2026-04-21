import * as React from 'react';
import { BookOpen, Users, Play, Globe } from 'lucide-react';
import { getLoreStats } from '../actions/get-lore-stats';

export async function LoreStatsSection() {
  const statsData = await getLoreStats();

  const STATS = [
    { label: 'Entradas de Lore', value: `${statsData.loreEntries}+`, icon: BookOpen, color: 'text-primary' },
    { label: 'Exploradores Activos', value: statsData.explorers, icon: Users, color: 'text-blue-400' },
    { label: 'Archivos Visuales', value: `${statsData.visualFiles}+`, icon: Play, color: 'text-red-500' },
    { label: 'Universos Paralelos', value: statsData.universes.toString(), icon: Globe, color: 'text-emerald-400' },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-black/10">
      <div className="container mx-auto px-6">
        <div className="glass-liquid rounded-[4rem] border-white/10 shadow-[0_60px_120px_rgba(0,0,0,0.8)] p-12 md:p-16 relative group border-refractive">
          <div className="glass-reflection opacity-20" />
          <div className="glass-shine" />
          
          <div className="absolute top-10 left-10 flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Live Data Stream</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 relative z-10 divide-x-0 lg:divide-x divide-white/5">
            {STATS.map((stat, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center text-center space-y-6 group/item first:pl-0 lg:pl-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover/item:scale-110 group-hover/item:border-primary/50 group-hover/item:bg-primary/5 shadow-xl glass-liquid">
                   <stat.icon className={`w-7 h-7 ${stat.color} drop-shadow-[0_0_10px_currentColor]`} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase drop-shadow-2xl">
                    {stat.value}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover/item:text-white/60 transition-colors">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

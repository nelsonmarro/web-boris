'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { ArenaHeader } from './arena/components/ArenaHeader';
import { ArenaSimulator } from './arena/components/ArenaSimulator';

export default function VersusArena() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black/40 relative overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 flex-1 container mx-auto px-6 py-12 md:py-20 flex flex-col">
        <ArenaHeader 
          title="Versus Arena"
          subtitle="Arena de Combate v1.0"
          description="Simulación avanzada de enfrentamientos entre entidades colosales. Analiza estadísticas y descubre quién dominaría el ecosistema."
        />

        <ArenaSimulator />

        <footer className="mt-12 flex items-center justify-between border-t border-white/5 pt-8 opacity-40">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white">
              <Info className="w-3 h-3" />
              Simulador Beta
           </div>
           <p className="text-[9px] font-bold uppercase tracking-wider text-white">Borisao Archive // {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

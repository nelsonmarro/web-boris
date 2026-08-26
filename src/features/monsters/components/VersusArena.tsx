'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { ArenaHeader } from './arena/components/ArenaHeader';
import { ArenaSimulator } from './arena/components/ArenaSimulator';
import { ComparadorEscala } from './arena/components/ComparadorEscala';
import { WikiTabs, WikiTab } from './wiki/mdx/WikiTabs';
import type { Fighter } from '@/features/monsters/lib/arena';

interface VersusArenaProps {
  fighters: Fighter[];
}

export default function VersusArena({ fighters }: VersusArenaProps) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-x-clip bg-black/40">
      <div className="absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-primary/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="container relative z-10 mx-auto flex flex-1 flex-col px-6 py-12 md:py-20">
        <ArenaHeader
          title="Versus Arena"
          subtitle="Arena de Combate v1.0"
          description="Simulación determinista de enfrentamientos entre entidades colosales a partir de sus registros biométricos. Compara perfiles y escala real."
          fighterCount={fighters.length}
        />

        <WikiTabs defaultValue="simulador" className="my-0 bg-transparent border-0 shadow-none overflow-visible">
          <WikiTab value="simulador" label="Simulador">
            <ArenaSimulator fighters={fighters} />
          </WikiTab>
          <WikiTab value="escala" label="Comparador de escala">
            <ComparadorEscala fighters={fighters} />
          </WikiTab>
        </WikiTabs>

        <footer className="mt-12 flex items-center justify-between border-t border-white/5 pt-8 opacity-40">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white">
            <Info className="h-3 w-3" />
            Puntaje: 35% poder · 25% defensa · 15% hostilidad · 15% escala · 10% inteligencia
          </div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-white">Borisao Archive // {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ArenaHeader } from './arena/components/ArenaHeader';
import { ArenaSimulator } from './arena/components/ArenaSimulator';
import { ComparadorEscala } from './arena/components/ComparadorEscala';
import { WikiTabs, WikiTab } from './wiki/mdx/WikiTabs';
import type { Fighter } from '@/features/monsters/lib/arena';

interface VersusArenaProps {
  fighters: Fighter[];
}

/** Fallback del simulador mientras `useSearchParams` resuelve: mismo bloque, con skeletons. */
function ArenaSimulatorSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando simulador">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <Skeleton className="h-[72px] rounded-xl bg-white/5" />
        <Skeleton className="h-12 rounded-xl bg-white/5 md:w-40" />
        <Skeleton className="h-[72px] rounded-xl bg-white/5" />
      </div>
      <Skeleton className="h-36 rounded-2xl bg-white/5" />
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,320px)_1fr]">
        <Skeleton className="h-96 rounded-2xl bg-white/5" />
        <Skeleton className="h-72 rounded-2xl bg-white/5" />
        <Skeleton className="h-96 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export default function VersusArena({ fighters }: VersusArenaProps) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-x-clip bg-black/40">
      <div className="absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-primary/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="wiki-container relative z-10 flex flex-1 flex-col py-10 lg:py-14">
        <ArenaHeader
          title="Versus Arena"
          subtitle="Arena de Combate v1.0"
          description="Simulación determinista de enfrentamientos entre entidades colosales a partir de sus registros biométricos. Compara perfiles y escala real."
          fighterCount={fighters.length}
        />

        <WikiTabs defaultValue="simulador" className="my-0 bg-transparent border-0 shadow-none overflow-visible">
          <WikiTab value="simulador" label="Simulador">
            <React.Suspense fallback={<ArenaSimulatorSkeleton />}>
              <ArenaSimulator fighters={fighters} />
            </React.Suspense>
          </WikiTab>
          <WikiTab value="escala" label="Comparador de escala">
            <ComparadorEscala fighters={fighters} />
          </WikiTab>
        </WikiTabs>

        <footer className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
            <Info className="mt-px h-3 w-3 shrink-0" />
            Puntaje: 35% poder · 25% defensa · 15% hostilidad · 15% escala · 10% inteligencia
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">Borisao Archive // {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

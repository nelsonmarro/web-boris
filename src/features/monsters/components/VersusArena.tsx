'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ArenaHeader } from './arena/components/ArenaHeader';
import { ArenaSimulator } from './arena/components/ArenaSimulator';
import { ComparadorEscala } from './arena/components/ComparadorEscala';
import { ArenaTabs, type ArenaTab } from './arena/components/ArenaTabs';
import { TournamentPanel } from './arena/components/TournamentPanel';
import type { Fighter } from '@/features/monsters/lib/arena';
import { TOURNAMENT_SIZE } from '@/features/monsters/lib/arena-battle';
import type { WeeklyDuel } from './arena/components/ArenaSimulator';

interface VersusArenaProps {
  fighters: Fighter[];
  /** Duelo de la votación semanal (tipo `duelo`), si lo hay: lo pasa la página desde el servidor. */
  weeklyDuel: WeeklyDuel | null;
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
      {/* Combate por asaltos */}
      <Skeleton className="h-[360px] rounded-2xl bg-white/5" />
      <Skeleton className="h-36 rounded-2xl bg-white/5" />
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,320px)_1fr]">
        <Skeleton className="h-96 rounded-2xl bg-white/5" />
        <Skeleton className="h-72 rounded-2xl bg-white/5" />
        <Skeleton className="h-96 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export default function VersusArena({ fighters, weeklyDuel }: VersusArenaProps) {
  const tabs: ArenaTab[] = [
    {
      value: 'simulador',
      label: 'Simulador',
      content: (
        <React.Suspense fallback={<ArenaSimulatorSkeleton />}>
          <ArenaSimulator fighters={fighters} weeklyDuel={weeklyDuel} />
        </React.Suspense>
      ),
    },
    // Con menos de 4 combatientes no hay torneo.
    ...(fighters.length >= TOURNAMENT_SIZE
      ? [{ value: 'torneo', label: 'Torneo rápido', content: <TournamentPanel fighters={fighters} /> }]
      : []),
    { value: 'escala', label: 'Escala', content: <ComparadorEscala fighters={fighters} /> },
  ];

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-x-clip bg-black/40">
      {/* Luces decorativas ancladas en px desde arriba: con porcentajes de la altura se movían al cambiar el esqueleto
          del simulador por el contenido (la página es estática) y sumaban desplazamiento de diseño (CLS). */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-120px] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute right-[-10%] top-[640px] h-[700px] w-[700px] rounded-full bg-primary/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="wiki-container relative z-10 flex flex-1 flex-col py-10 lg:py-14">
        <ArenaHeader
          title="Versus Arena"
          subtitle="Arena de Combate v2.0"
          description="Enfrenta a dos entidades colosales en cinco asaltos, apuesta por tu favorito y monta un torneo rápido. Los combates del canon terminan como en el canon."
          fighterCount={fighters.length}
        />

        <ArenaTabs tabs={tabs} defaultValue="simulador" />

        <footer className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
            <Info className="mt-px h-3 w-3 shrink-0" />
            Índice: 35% poder · 25% defensa · 15% hostilidad · 15% escala · 10% inteligencia · asaltos con ±8% de azar
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">Borisao Archive // <span suppressHydrationWarning>{new Date().getFullYear()}</span></p>
        </footer>
      </div>
    </div>
  );
}

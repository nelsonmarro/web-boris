'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { InfoSection, InfoField } from '@/features/monsters/components/wiki/mdx/WikiInfobox';
import { StatRow } from '@/features/monsters/components/wiki/StatRow';
import {
  getThreatLevel,
  scaleTen,
  THREAT_TONE_CLASSES,
  type WikiStats,
} from '@/features/monsters/lib/stats';

interface InfoStatsProps {
  stats: WikiStats;
}

/** Sección "Registro Biométrico" de la infobox: badge de amenaza + barras + habilidades. */
export function InfoStats({ stats }: InfoStatsProps) {
  const threat = getThreatLevel(stats.hostility);
  const hasBars =
    stats.power !== undefined ||
    stats.defense !== undefined ||
    stats.intelligence !== undefined ||
    stats.hostility !== undefined;

  return (
    <InfoSection title="Registro Biométrico">
      {threat && (
        <div className="flex flex-col gap-1 border-b border-white/5 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              Amenaza
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.15em]',
                THREAT_TONE_CLASSES[threat.tone].badge,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} />
              {threat.label}
            </span>
          </div>
          <p className="text-[11px] italic leading-snug text-white/50">{threat.text}</p>
        </div>
      )}

      {stats.length !== undefined && (
        <InfoField label="Longitud" value={`${stats.length.toLocaleString('es-ES')} m`} />
      )}
      {stats.weight && <InfoField label="Peso" value={stats.weight} />}
      {stats.biteType && <InfoField label="Mordida" value={stats.biteType} />}

      {hasBars && (
        <div className="border-b border-white/5 py-2">
          {stats.power !== undefined && (
            <StatRow label="Poder" value={stats.power} display={`${stats.power}`} />
          )}
          {stats.defense !== undefined && (
            <StatRow label="Defensa" value={stats.defense} display={`${stats.defense}`} />
          )}
          {stats.intelligence !== undefined && (
            <StatRow
              label="Inteligencia"
              value={scaleTen(stats.intelligence)}
              display={`${stats.intelligence}/10`}
              tone="cyan"
            />
          )}
          {stats.hostility !== undefined && (
            <StatRow
              label="Hostilidad"
              value={scaleTen(stats.hostility)}
              display={`${stats.hostility}/10`}
            />
          )}
        </div>
      )}

      {stats.specialAbilities && stats.specialAbilities.length > 0 && (
        <div className="py-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
            Habilidades
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stats.specialAbilities.map((ability) => (
              <span
                key={ability}
                className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary"
              >
                {ability}
              </span>
            ))}
          </div>
        </div>
      )}
    </InfoSection>
  );
}

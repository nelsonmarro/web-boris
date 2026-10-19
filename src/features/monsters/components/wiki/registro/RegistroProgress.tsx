'use client';

import { useMemo } from 'react';
import { progress } from '@/core/search/registro';
import { useSeen } from '@/features/monsters/store/registro-store';
import { ExpedienteAleatorioLink } from './ExpedienteAleatorioLink';

interface RegistroProgressProps {
  /** Slugs de las fichas que cuentan para el progreso (ni sellados ni índices): `registroSlugs(entries)`. */
  slugs: readonly string[];
}

/**
 * Progreso del fan en `/wiki/registro`. La página es ISR: el HTML trae el estado neutro (0 abiertos) y
 * el navegador lo completa al hidratar, sin tocar el tamaño de nada.
 */
export function RegistroProgress({ slugs }: RegistroProgressProps) {
  const entries = useMemo(() => slugs.map((slug) => ({ slug })), [slugs]);
  const { opened, total } = progress(entries, useSeen());
  const percent = total > 0 ? Math.round((opened / total) * 100) : 0;

  return (
    <div className="crystal-surface rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        {/* Misma altura de línea con y sin progreso para no mover la barra al hidratar. */}
        <p className="min-h-7 text-lg text-white">
          {opened > 0 ? (
            <>
              Has abierto <strong className="font-black tabular-nums">{opened}</strong> de{' '}
              <strong className="font-black tabular-nums">{total}</strong> expedientes
            </>
          ) : (
            'Abre expedientes para completar tu registro'
          )}
        </p>
        <ExpedienteAleatorioLink />
      </div>
      <div
        role="meter"
        aria-label="Expedientes abiertos"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={opened}
        aria-valuetext={`${opened} de ${total} expedientes abiertos`}
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

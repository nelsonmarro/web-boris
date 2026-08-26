'use client';

import * as React from 'react';
import { Progress as ProgressPrimitive } from '@base-ui/react/progress';
import { cn } from '@/utils/cn';

interface StatRowProps {
  label: string;
  /** Valor normalizado 0-100 para la barra. */
  value: number;
  /** Texto a mostrar a la derecha (p. ej. "8/10" o "88"). */
  display?: string;
  tone?: 'primary' | 'cyan';
  className?: string;
}

/** Fila de estadística con barra (patrón Pokémon DB), naranja sobre superficie sólida. */
export function StatRow({ label, value, display, tone = 'primary', className }: StatRowProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <ProgressPrimitive.Root
      value={clamped}
      className={cn('flex flex-col gap-1.5 py-2', className)}
      aria-label={label}
    >
      <div className="flex items-baseline justify-between gap-3">
        <ProgressPrimitive.Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
          {label}
        </ProgressPrimitive.Label>
        <span className="font-mono text-xs font-bold tabular-nums text-white/85">
          {display ?? clamped}
        </span>
      </div>
      <ProgressPrimitive.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-out',
            tone === 'primary'
              ? 'bg-gradient-to-r from-primary/70 to-primary shadow-[0_0_10px_rgba(255,115,0,0.5)]'
              : 'bg-gradient-to-r from-[#0064A0] to-cyan-300 shadow-[0_0_10px_rgba(0,100,160,0.6)]',
          )}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

import type * as React from 'react';
import { cn } from '@/utils/cn';

/** Rótulo de texto «Próximamente» de tarjetas, filas y listas. El chip con icono de las cabeceras es `ProximamenteChip`. */
export function PendingLabel({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className={cn('text-[11px] font-bold uppercase tracking-wider text-primary', className)}>
      Próximamente
    </span>
  );
}

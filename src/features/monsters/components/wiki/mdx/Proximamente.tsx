import * as React from 'react';
import { Hourglass } from 'lucide-react';

interface ProximamenteProps {
  titulo?: string;
  children?: React.ReactNode;
}

const DEFAULT_TEXT =
  'Todavía no hay información canónica sobre este apartado. Se completará cuando BorisaoBlois publique más lore.';

/** Bloque "Próximamente" para apartados sin lore canónico todavía. */
export function Proximamente({ titulo = 'Expediente en preparación', children }: ProximamenteProps) {
  return (
    <div className="not-prose clear-both my-8 flex items-start gap-4 rounded-2xl border border-dashed border-primary/30 bg-[#061a2e] p-5 md:p-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
        <Hourglass className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="eyebrow text-primary">Próximamente</p>
        <p className="mt-1 text-lg font-bold uppercase italic tracking-tight text-white">{titulo}</p>
        <div className="mt-2 text-[15px] leading-relaxed text-white/70">{children ?? DEFAULT_TEXT}</div>
      </div>
    </div>
  );
}

/** Chip compacto "Próximamente" para cabeceras y tarjetas. */
export function ProximamenteChip({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.15em] text-primary ${className}`}
    >
      <Hourglass className="h-3 w-3" aria-hidden="true" />
      Próximamente
    </span>
  );
}

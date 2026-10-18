import * as React from 'react';
import { FileText, Lock, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

type Classification = 'público' | 'restringido' | 'clasificado';

interface RegistroDeliriumProps {
  /** Código de expediente, p. ej. "DLR-0343". */
  code?: string;
  classification?: Classification;
  date?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const classifications: Record<
  Classification,
  { label: string; icon: typeof FileText; badge: string }
> = {
  público: {
    label: 'Público',
    icon: FileText,
    badge: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  },
  restringido: {
    label: 'Restringido',
    icon: Lock,
    badge: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  },
  clasificado: {
    label: 'Clasificado',
    icon: ShieldAlert,
    badge: 'border-red-500/40 text-red-300 bg-red-500/10',
  },
};

/**
 * Entrada de archivo científico de DELIRIUM (patrón "databank" de Subnautica).
 * Superficie sólida: nunca blur bajo texto.
 */
export function RegistroDelirium({
  code,
  classification = 'restringido',
  date,
  title = 'Registro de campo',
  children,
  className,
}: RegistroDeliriumProps) {
  const config = classifications[classification];
  const Icon = config.icon;

  return (
    <aside
      className={cn(
        'not-prose clear-both my-10 overflow-hidden rounded-2xl border border-primary/30 bg-[#061a2e] shadow-2xl',
        className,
      )}
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-primary/20 bg-primary/10 px-5 py-3 font-mono">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,115,0,0.8)]" />
          DELIRIUM
        </span>
        {code && (
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">
            EXP. {code}
          </span>
        )}
        {date && (
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">
            {date}
          </span>
        )}
        <span
          className={cn(
            'ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.15em]',
            config.badge,
          )}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
      </header>

      <div className="px-5 py-5 md:px-6">
        <h3 className="mb-3 text-xs font-black uppercase italic tracking-[0.2em] text-white/80">
          {title}
        </h3>
        <div className="space-y-3 text-[15px] leading-relaxed text-white/80 [&_ul]:mb-0 [&_ul]:space-y-2 [&_ul]:pl-0 [&_li]:text-[15px] [&_li]:font-normal [&_div]:mb-0 [&_div]:text-[15px] [&_div]:font-normal">
          {children}
        </div>
      </div>
    </aside>
  );
}

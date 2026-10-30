import type { ReactNode } from 'react';
import type { ThreatTone } from '@/features/monsters/lib/stats';
import { cn } from '@/utils/cn';

const TONE: Record<ThreatTone, string> = { green: 'text-emerald-300', amber: 'text-amber-300', red: 'text-red-300' };

/** Datos clave en una línea, sin caja (spec #55 §5). `note`: aclaración breve tras el valor, en tono secundario (texto o un enlace). */
export function FactsLine({ items }: { items: { label: string; value: string; tone?: ThreatTone; note?: ReactNode }[] }) {
  if (items.length === 0) return null;
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-3">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-white/60">{it.label}</dt>
          <dd className={cn('text-base font-semibold text-white', it.tone && TONE[it.tone])}>
            {it.value}
            {it.note && <span className="ml-2 text-sm font-normal text-white/70">{it.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

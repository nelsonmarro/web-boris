'use client';

import * as React from 'react';
import { ListTree } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useActiveHeading } from '@/features/monsters/hooks/useActiveHeading';
import type { WikiHeading } from '@/utils/headings';

interface WikiTOCProps {
  headings: WikiHeading[];
  /** `inline`: caja colapsable en el flujo (móvil/md). `rail`: lista compacta para la columna sticky. */
  variant?: 'inline' | 'rail';
  className?: string;
}

export function WikiTOC({ headings, variant = 'inline', className }: WikiTOCProps) {
  const [isOpen, setIsOpen] = React.useState(variant === 'rail');
  const activeId = useActiveHeading(headings.map((h) => h.id));

  if (headings.length === 0) return null;

  const items = (
    <ul className={cn(variant === 'rail' ? 'space-y-1' : 'p-6 py-5 space-y-3')}>
      {headings.map((h) => {
        const active = h.id === activeId;
        return (
          <li key={h.id} className={cn('flex items-baseline gap-2', h.level === 3 && 'pl-5')}>
            <span
              className={cn(
                'shrink-0 font-mono text-xs font-bold transition-colors',
                variant === 'rail' ? 'min-w-[1.75rem]' : 'min-w-[1.5rem]',
                active ? 'text-primary' : 'text-primary/60',
              )}
            >
              {h.numbering}
            </span>
            <a
              href={`#${h.id}`}
              aria-current={active ? 'location' : undefined}
              className={cn(
                'relative leading-tight transition-colors',
                variant === 'rail'
                  ? 'block flex-1 rounded-md py-1.5 pl-3 pr-2 text-[13px] font-semibold'
                  : 'text-sm font-semibold md:text-base',
                active
                  ? 'text-white'
                  : 'text-white/60 hover:text-white',
                variant === 'rail' && active && 'bg-primary/10',
              )}
            >
              {variant === 'rail' && (
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full transition-opacity',
                    active ? 'bg-primary opacity-100 shadow-[0_0_8px_rgba(255,115,0,0.8)]' : 'opacity-0',
                  )}
                />
              )}
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (variant === 'rail') {
    return (
      <nav
        aria-label="Contenido del artículo"
        className={cn(
          'max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#061a2e] p-4 shadow-2xl',
          className,
        )}
      >
        <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
          <ListTree className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">
            Contenido
          </span>
        </div>
        {items}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Contenido del artículo"
      className={cn(
        'mb-8 mt-2 inline-block min-w-full overflow-hidden rounded-2xl border border-white/10 bg-[#061a2e] shadow-2xl md:min-w-[320px]',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-5 py-3">
        <div className="flex items-center gap-3">
          <ListTree className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-bold tracking-wide text-white">Contenido</h4>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="group flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-white"
        >
          <span className="opacity-40 group-hover:opacity-100">[</span>
          {isOpen ? 'ocultar' : 'mostrar'}
          <span className="opacity-40 group-hover:opacity-100">]</span>
        </button>
      </div>
      {isOpen && items}
    </nav>
  );
}

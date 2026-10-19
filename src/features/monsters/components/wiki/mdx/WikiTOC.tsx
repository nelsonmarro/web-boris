'use client';

import { cn } from '@/utils/cn';
import { useActiveHeading } from '@/features/monsters/hooks/useActiveHeading';
import type { WikiHeading } from '@/utils/headings';

interface WikiTOCProps {
  headings: WikiHeading[];
  /**
   * `rail`: lista compacta para la columna sticky.
   * `panel`: solo la lista, para el desplegable "Contenido" de la ficha (el botón lo pone quien lo usa).
   */
  variant: 'rail' | 'panel';
  className?: string;
}

export function WikiTOC({ headings, variant, className }: WikiTOCProps) {
  const activeId = useActiveHeading(headings.map((h) => h.id));

  if (headings.length === 0) return null;

  const items = (
    <ul className={cn(variant === 'rail' ? 'space-y-1' : 'divide-y divide-white/5')}>
      {headings.map((h) => {
        const active = h.id === activeId;
        return (
          <li key={h.id} className={cn('flex items-baseline gap-2', variant === 'panel' && 'items-center', h.level === 3 && 'pl-5')}>
            <span
              className={cn(
                'shrink-0 font-mono text-xs font-bold text-primary transition-colors',
                variant === 'rail' ? 'min-w-[1.75rem]' : 'min-w-[1.5rem]',
              )}
            >
              {h.numbering}
            </span>
            <a
              href={`#${h.id}`}
              aria-current={active ? 'location' : undefined}
              className={cn(
                'relative leading-tight transition-colors',
                variant === 'rail' && 'block flex-1 rounded-md py-1.5 pl-3 pr-2 text-[13px] font-semibold',
                variant === 'panel' && 'flex min-h-11 flex-1 items-center text-sm font-semibold',
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
                    active ? 'bg-primary opacity-100' : 'opacity-0',
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
        <p className="mb-3 border-b border-white/5 pb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
          Contenido
        </p>
        {items}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Contenido del artículo"
      className={cn('rounded-2xl border border-white/10 bg-[#061a2e] px-4 py-1', className)}
    >
      {items}
    </nav>
  );
}

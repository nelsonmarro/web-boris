import Link from 'next/link';
import type { Route } from 'next';
import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  /** Ancla de la sección; el título pasa a tener el id `${id}-titulo`. */
  id?: string;
  title: string;
  action?: { href: string; label: string; external?: boolean };
  className?: string;
  /**
   * `true` (por defecto): la sección trae su propio `container` con margen lateral y vertical (landing).
   * `false`: sin contenedor ni relleno, para colocarla dentro de uno que ya los define (ficha, /comunidad).
   */
  contained?: boolean;
  children: ReactNode;
}

const ACTION = 'inline-flex min-h-11 items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm';

const YOUTUBE = /youtu\.?be/;

/** Una sección = un propósito (spec #55 §1): h2, contenido y como mucho un "Ver todo". */
export function Section({ id, title, action, className, contained = true, children }: SectionProps) {
  const autoId = useId();
  const headingId = id ? `${id}-titulo` : autoId;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(contained && 'container mx-auto px-6 py-16 md:py-24', className)}
    >
      <div className={cn('flex items-end justify-between gap-4', contained ? 'mb-8' : 'mb-6')}>
        <h2 id={headingId} className="section-title text-white">{title}</h2>
        {action &&
          (action.external ? (
            <a href={action.href} target="_blank" rel="noopener noreferrer" className={ACTION}>
              {action.label} <span aria-hidden="true">›</span>
              <span className="sr-only">
                {YOUTUBE.test(action.href) ? ' (se abre en YouTube)' : ' (se abre en una pestaña nueva)'}
              </span>
            </a>
          ) : (
            <Link href={action.href as Route} className={ACTION}>
              {action.label} <span aria-hidden="true">›</span>
            </Link>
          ))}
      </div>
      {children}
    </section>
  );
}

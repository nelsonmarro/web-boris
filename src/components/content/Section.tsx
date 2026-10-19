import Link from 'next/link';
import type { Route } from 'next';
import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  id?: string;
  title: string;
  action?: { href: string; label: string; external?: boolean };
  className?: string;
  children: ReactNode;
}

const ACTION = 'inline-flex min-h-11 items-center text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm';

/** Una sección = un propósito (spec #55 §1): h2, contenido y como mucho un "Ver todo". */
export function Section({ id, title, action, className, children }: SectionProps) {
  const headingId = useId();
  return (
    <section id={id} aria-labelledby={headingId} className={cn('container mx-auto px-6 py-16 md:py-24', className)}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id={headingId} className="section-title text-white">{title}</h2>
        {action &&
          (action.external ? (
            <a href={action.href} target="_blank" rel="noopener noreferrer" className={ACTION}>{action.label} ›</a>
          ) : (
            <Link href={action.href as Route} className={ACTION}>{action.label} ›</Link>
          ))}
      </div>
      {children}
    </section>
  );
}

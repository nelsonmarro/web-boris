import * as React from 'react';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  title: React.ReactNode;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
  /** h2 por defecto; h3 dentro de otras secciones. */
  as?: 'h2' | 'h3';
  id?: string;
  className?: string;
}

/** Cabecera de sección estándar: barra naranja + eyebrow + título + descripción + acción opcional. */
export function SectionHeader({ title, eyebrow, description, action, as: Tag = 'h2', id, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="flex gap-4">
        <div className="mt-1 h-8 w-1 shrink-0 rounded-full bg-primary shadow-[0_0_16px_rgba(255,115,0,0.8)] md:h-9" />
        <div className="space-y-1.5">
          {eyebrow && <div className="eyebrow text-primary">{eyebrow}</div>}
          <Tag id={id} className="section-title">
            {title}
          </Tag>
          {description && <p className="max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 md:pb-1">{action}</div>}
    </div>
  );
}

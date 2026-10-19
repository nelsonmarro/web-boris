'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { WikiTOC } from '@/features/monsters/components/wiki/mdx/WikiTOC';
import type { WikiHeading } from '@/utils/headings';

interface WikiArticleDisclosuresProps {
  /** Infobox completa (ya sin imagen). Sin ella no hay botón "Ficha completa". */
  ficha?: React.ReactNode;
  headings: WikiHeading[];
}

type PanelId = 'ficha' | 'toc';

const BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-[#061a2e] px-4 text-[12px] font-bold uppercase tracking-wider text-white/80 transition-colors hover:border-primary/40 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary aria-expanded:border-primary/40 aria-expanded:text-white motion-reduce:transition-none';

/**
 * Una sola fila con dos desplegables, "Ficha completa" y "Contenido", para cuando el contenedor del artículo
 * es más estrecho que el rail. Solo uno está abierto a la vez; cada botón controla su panel (`aria-controls`).
 */
export function WikiArticleDisclosures({ ficha, headings }: WikiArticleDisclosuresProps) {
  const [open, setOpen] = React.useState<PanelId | null>(null);
  const baseId = React.useId();
  const fichaId = `${baseId}-ficha`;
  const tocId = `${baseId}-toc`;
  const hasToc = headings.length > 0;

  if (!ficha && !hasToc) return null;

  const toggle = (id: PanelId) => setOpen((current) => (current === id ? null : id));

  const trigger = (id: PanelId, panelId: string, label: string) => (
    <button
      type="button"
      aria-expanded={open === id}
      aria-controls={panelId}
      onClick={() => toggle(id)}
      className={BUTTON}
    >
      {label}
      <ChevronDown
        aria-hidden="true"
        className={cn('h-4 w-4 transition-transform motion-reduce:transition-none', open === id && 'rotate-180')}
      />
    </button>
  );

  return (
    // `data-article-disclosures`: ancla de `SectionChip` (aparece cuando esta fila sale de la ventana por arriba).
    <div data-article-disclosures className="mb-6">
      <div className="flex flex-wrap gap-2">
        {ficha && trigger('ficha', fichaId, 'Ficha completa')}
        {hasToc && trigger('toc', tocId, 'Contenido')}
      </div>

      {ficha && (
        <div id={fichaId} hidden={open !== 'ficha'} className="mt-3">
          {ficha}
        </div>
      )}
      {hasToc && (
        <div id={tocId} hidden={open !== 'toc'} className="mt-3">
          <WikiTOC headings={headings} variant="panel" />
        </div>
      )}
    </div>
  );
}

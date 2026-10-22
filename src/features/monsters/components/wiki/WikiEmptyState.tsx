'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { PendingLabel } from '@/components/content/PendingLabel';
import type { WikiArticleSummary } from '@/core/types/wiki';

interface WikiEmptyStateProps {
  /** Búsqueda activa (ya recortada); si no hay, el aviso no la menciona. */
  query?: string;
  /** «¿Quisiste decir…?» del motor de búsqueda. */
  suggestion?: { slug: string; title: string } | null;
  /** Las fichas más completas del catálogo, como lista de enlaces de texto. */
  popular?: WikiArticleSummary[];
  /** Borra la búsqueda, el tipo y el universo. */
  onClear: () => void;
  /** Cambia la búsqueda (la sugerencia la sustituye por su título). */
  onSearch: (query: string) => void;
}

const LINK =
  'font-bold text-white underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

export function WikiEmptyState({ query, suggestion, popular, onClear, onSearch }: WikiEmptyStateProps) {
  const popularId = React.useId();
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-[#061a2e] px-6 py-12 text-center md:py-16">
      <div className="space-y-1">
        <p className="text-base font-bold text-white">
          Ningún registro coincide{query ? ` con «${query}»` : ''}
        </p>
        <p className="text-sm text-white/70">Prueba con otro nombre, o cambia el tipo o el universo.</p>
      </div>

      {suggestion && (
        <p className="text-sm text-white/80">
          ¿Quisiste decir{' '}
          <button
            type="button"
            onClick={() => onSearch(suggestion.title)}
            className={`${LINK} inline-flex min-h-11 items-center rounded-sm`}
          >
            {suggestion.title}
          </button>
          ?
        </p>
      )}

      <button
        type="button"
        onClick={onClear}
        className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-bold text-white transition-colors hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
      >
        Limpiar filtros
      </button>

      {popular && popular.length > 0 && (
        <div className="w-full border-t border-white/10 pt-5">
          <p id={popularId} className="text-sm text-white/70">Populares</p>
          <ul aria-labelledby={popularId} className="mt-1 flex flex-wrap justify-center gap-x-6">
            {popular.map(({ slug, frontmatter: fm }) => (
              <li key={slug}>
                <Link href={`/wiki/${slug}` as Route} className={`${LINK} inline-flex min-h-11 items-center rounded-sm text-sm`}>
                  {fm.title}
                  {fm.status === 'proximamente' && (
                    <PendingLabel className="ml-2" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

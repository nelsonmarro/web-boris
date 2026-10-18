import Link from 'next/link';
import type { Route } from 'next';
import { Swords } from 'lucide-react';
import { WikiBreadcrumbs } from './WikiBreadcrumbs';
import { WikiArticleActions } from './WikiArticleActions';
import { ProximamenteChip } from '../mdx/Proximamente';

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
  status?: 'proximamente';
  /** Slug del artículo si tiene stats: habilita el CTA hacia la Arena. */
  arenaSlug?: string;
}

export function WikiArticleHeader({ title, universe, category, status, arenaSlug }: WikiArticleHeaderProps) {
  return (
    <header className="relative z-20 border-b border-white/10 print:hidden">
      <div className="wiki-container flex flex-col gap-5 pb-6 pt-8 lg:pt-10">
        <WikiBreadcrumbs universe={universe} category={category} />
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-start gap-3">
            <h1 className="page-title">{title}</h1>
            {status === 'proximamente' && <ProximamenteChip />}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {arenaSlug && (
              <Link
                href={`/wiki/arena?a=${arenaSlug}` as Route}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[11px] font-bold uppercase tracking-wider text-[#00122E] transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-primary/40"
              >
                <Swords className="h-4 w-4" aria-hidden="true" />
                Enfrentar en la Arena
              </Link>
            )}
            <WikiArticleActions title={title} />
          </div>
        </div>
      </div>
    </header>
  );
}

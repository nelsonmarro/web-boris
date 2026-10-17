'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { WikiFilters } from './wiki/WikiFilters';
import { WikiArticleCard } from './wiki/WikiArticleCard';
import { WikiEmptyState } from './wiki/WikiEmptyState';
import { getWikiArticles, type WikiFilterOptions } from '../actions/get-wiki-articles';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface WikiListProps {
  options: WikiFilterOptions;
}

const PAGE_SIZE = 6;

/** Acepta un valor de la URL solo si existe entre las opciones; evita filtros vacíos por typos. */
function pickFilter(value: string | null, allowed: string[]): string {
  return value && allowed.includes(value) ? value : 'all';
}

export function WikiList({ options }: WikiListProps) {
  // Las tarjetas de la landing enlazan a /wiki?universe=…; el filtro arranca desde la URL.
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const [search, setSearch] = React.useState(initialSearch);
  const [universe, setUniverse] = React.useState(() =>
    pickFilter(searchParams.get('universe'), options.universes),
  );
  const [category, setCategory] = React.useState(() =>
    pickFilter(searchParams.get('category'), options.categories),
  );
  const [page, setPage] = React.useState(1);
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUniverseChange = (val: string | null) => {
    setUniverse(val || 'all');
    setPage(1);
  };

  const handleCategoryChange = (val: string | null) => {
    setCategory(val || 'all');
    setPage(1);
  };

  const { data, isPending, isPlaceholderData, isFetching } = useQuery({
    queryKey: ['wiki-articles', page, debouncedSearch, universe, category],
    queryFn: () =>
      getWikiArticles({ page, pageSize: PAGE_SIZE, search: debouncedSearch, universe, category }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const articles = data?.articles ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-10">
      <WikiFilters
        options={options}
        onSearchChange={setSearch}
        initialSearch={initialSearch}
        onUniverseChange={handleUniverseChange}
        onCategoryChange={handleCategoryChange}
        currentUniverse={universe}
        currentCategory={category}
      />

      <div className="relative min-h-[400px]">
        {isPending && !isPlaceholderData ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : articles.length > 0 ? (
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300',
              isFetching && isPlaceholderData ? 'opacity-50' : 'opacity-100',
            )}
          >
            {articles.map((article) => (
              <WikiArticleCard key={article.slug} slug={article.slug} frontmatter={article.frontmatter} />
            ))}
          </div>
        ) : (
          <WikiEmptyState />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10">
          <p className="eyebrow text-white/40">
            Mostrando página <span className="text-white">{page}</span> de{' '}
            <span className="text-white">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="h-10 rounded-xl border-white/15 bg-[#061a2e] px-5 text-white hover:bg-white/5"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
            </Button>

            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={page === p ? 'page' : undefined}
                      className={cn(
                        'h-10 w-10 rounded-xl text-xs font-bold transition-all',
                        page === p
                          ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,115,0,0.4)]'
                          : 'text-white/40 hover:text-white hover:bg-white/5',
                      )}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === page - 2 || p === page + 2) {
                  return (
                    <span key={p} className="text-white/20">
                      …
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="h-10 rounded-xl border-white/15 bg-[#061a2e] px-5 text-white hover:bg-white/5"
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

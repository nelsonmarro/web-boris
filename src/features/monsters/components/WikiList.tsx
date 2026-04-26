'use client';

import * as React from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { WikiFilters } from './wiki/WikiFilters';
import { WikiArticleCard } from './wiki/WikiArticleCard';
import { WikiEmptyState } from './wiki/WikiEmptyState';
import { getWikiArticles } from '../actions/get-wiki-articles';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function WikiList() {
  const [search, setSearch] = React.useState("");
  const [universe, setUniverse] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  // Debounce search to avoid excessive API calls
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle filter changes
  const handleUniverseChange = (val: string | null) => {
    setUniverse(val || "all");
    setPage(1);
  };

  const handleCategoryChange = (val: string | null) => {
    setCategory(val || "all");
    setPage(1);
  };

  const { data, isPending, isPlaceholderData, isFetching } = useQuery({
    queryKey: ['wiki-articles', page, debouncedSearch, universe, category],
    queryFn: () => getWikiArticles({ 
      page, 
      pageSize, 
      search: debouncedSearch,
      universe,
      category
    }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const articles = data?.articles || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-10">
      {/* Search and Filters Section */}
      <WikiFilters 
        onSearchChange={setSearch} 
        onUniverseChange={handleUniverseChange}
        onCategoryChange={handleCategoryChange}
        currentUniverse={universe}
        currentCategory={category}
      />

      {/* Results Grid */}
      <div className="relative min-h-[400px]">
        {isPending && !isPlaceholderData ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : articles.length > 0 ? (
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300",
            isFetching && isPlaceholderData ? "opacity-50" : "opacity-100"
          )}>
            {articles.map((article) => (
              <WikiArticleCard 
                key={article.slug} 
                slug={article.slug} 
                frontmatter={article.frontmatter} 
              />
            ))}
          </div>
        ) : (
          <WikiEmptyState />
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
          <p className="text-xs font-bold uppercase tracking-wider text-white/30">
            Mostrando página <span className="text-white">{page}</span> de <span className="text-white">{totalPages}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="glass-liquid border-white/10 hover:bg-white/5 text-white h-11 px-6 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
               {[...Array(totalPages)].map((_, i) => {
                 const p = i + 1;
                 // Only show current, first, last and around current
                 if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                   return (
                     <button
                       key={p}
                       onClick={() => setPage(p)}
                       className={cn(
                         "w-10 h-10 rounded-lg text-xs font-bold transition-all",
                         page === p 
                          ? "bg-primary text-white shadow-[0_0_15px_rgba(255,115,0,0.4)]" 
                          : "text-white/40 hover:text-white hover:bg-white/5"
                       )}
                     >
                       {p}
                     </button>
                   );
                 }
                 if (p === page - 2 || p === page + 2) {
                   return <span key={p} className="text-white/20">...</span>;
                 }
                 return null;
               })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="glass-liquid border-white/10 hover:bg-white/5 text-white h-11 px-6 rounded-xl"
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to concatenate classes
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

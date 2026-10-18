'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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

const PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 400;

/** Acepta un valor de la URL solo si existe entre las opciones; evita filtros vacíos por typos. */
function pickFilter(value: string | null, allowed: string[]): string {
  return value && allowed.includes(value) ? value : 'all';
}

/** `?page=` válido es un entero ≥ 1; cualquier otra cosa es la página 1. */
function parsePage(value: string | null): number {
  const page = Math.floor(Number(value ?? '1'));
  return Number.isFinite(page) && page >= 1 ? page : 1;
}

export function WikiList({ options }: WikiListProps) {
  // La URL es la única fuente de verdad (?search=&universe=&category=&page=): las tarjetas de la
  // landing, el hero y el footer enlazan a /wiki?…, y navegar dentro de /wiki actualiza la lista sin remontarla.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const urlSearch = searchParams.get('search') ?? '';
  const universe = pickFilter(searchParams.get('universe'), options.universes);
  const category = pickFilter(searchParams.get('category'), options.categories);
  const urlPage = parsePage(searchParams.get('page'));

  // El texto del input vive en local (cada tecla) y llega a la URL con debounce.
  const [search, setSearch] = React.useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = React.useState(urlSearch);

  // Cada vez que la URL cambia, si su ?search= no es el que ya aplicamos (footer, hero, atrás/adelante),
  // el input lo adopta. Se ajusta en el render (patrón de React para estado derivado) en lugar de en un
  // efecto. Cuando el cambio es el eco de nuestra propia escritura, urlSearch === debouncedSearch y no se
  // toca el input: lo que el usuario siga tecleando no se pisa.
  const [syncedQuery, setSyncedQuery] = React.useState(query);
  if (syncedQuery !== query) {
    setSyncedQuery(query);
    if (urlSearch !== debouncedSearch) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
    }
  }

  // Última query escrita en la URL. Cada escritura parte de la anterior (no de un searchParams que
  // React aún no ha re-renderizado), así que escrituras seguidas no pierden cambios.
  const queryRef = React.useRef(query);
  React.useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const replaceQuery = React.useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(queryRef.current);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '' || value === 'all' || (key === 'page' && value === '1')) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const qs = next.toString();
      queryRef.current = qs;
      // History API nativa: Next 16 sincroniza useSearchParams/usePathname con replaceState sin pedir un
      // payload RSC al servidor (los filtros responden al instante). Se conserva el hash (#explorar).
      const url = (qs ? `${pathname}?${qs}` : pathname) + window.location.hash;
      window.history.replaceState(null, '', url);
    },
    [pathname],
  );

  // Debounce del texto → URL (solo si difiere de lo último ENVIADO, no de lo ya confirmado: si una
  // navegación sigue pendiente, compararla con la URL vieja dejaría que su eco pisara el input).
  // La query usa debouncedSearch de inmediato, sin esperar a que el router confirme la navegación.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      const sent = new URLSearchParams(queryRef.current).get('search') ?? '';
      if (search !== sent) replaceQuery({ search, page: null });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, replaceQuery]);

  // Una búsqueda nueva siempre vuelve a la página 1; mientras llega a la URL ya lo sabemos.
  const page = debouncedSearch !== urlSearch ? 1 : urlPage;

  const handleUniverseChange = (value: string | null) =>
    replaceQuery({ universe: value ?? 'all', page: null });

  const handleCategoryChange = (value: string | null) =>
    replaceQuery({ category: value ?? 'all', page: null });

  const goToPage = (next: number) => {
    replaceQuery({ page: String(next) });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('explorar')
      ?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
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

  // ?page= fuera de rango (enlace viejo, filtros que reducen resultados): vuelve a la página 1 en la URL.
  // Solo con datos reales de esta query, no con el placeholder de la anterior.
  const resolvedTotalPages = !isPlaceholderData && data ? data.totalPages : null;
  React.useEffect(() => {
    if (resolvedTotalPages !== null && page > resolvedTotalPages) replaceQuery({ page: null });
  }, [resolvedTotalPages, page, replaceQuery]);

  return (
    <div className="space-y-10">
      <WikiFilters
        options={options}
        search={search}
        onSearchChange={setSearch}
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
              onClick={() => goToPage(Math.max(1, page - 1))}
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
                      onClick={() => goToPage(p)}
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
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
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

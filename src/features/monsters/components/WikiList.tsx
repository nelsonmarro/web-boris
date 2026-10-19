'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ContentCard } from '@/components/content/ContentCard';
import { WikiSearch } from './wiki/WikiSearch';
import { WikiFilters } from './wiki/WikiFilters';
import { WikiEmptyState } from './wiki/WikiEmptyState';
import { getWikiArticles, type WikiFilterOptions } from '../actions/get-wiki-articles';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface WikiListProps {
  options: WikiFilterOptions;
}

const PAGE_SIZE = 12;
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
  // La URL es la única fuente de verdad (?search=&tipo=&universe=&page=): la landing, el hero y el footer
  // enlazan a /wiki?…, y navegar dentro de /wiki actualiza la lista sin remontarla.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const urlSearch = searchParams.get('search') ?? '';
  const universe = pickFilter(searchParams.get('universe'), options.universes);
  const tipo = pickFilter(
    searchParams.get('tipo'),
    options.tipos.map((t) => t.id),
  );
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
      // payload RSC al servidor (los filtros responden al instante). Se conserva el hash (#catalogo).
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

  const handleTipoChange = (value: string) => replaceQuery({ tipo: value, page: null });

  /** Enlace de cada pestaña a partir de la URL actual: conserva búsqueda y universo y reinicia la página. */
  const hrefForTipo = (value: string) => {
    const next = new URLSearchParams(query);
    next.delete('page');
    if (value === 'all') next.delete('tipo');
    else next.set('tipo', value);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    replaceQuery({ search: null, tipo: null, universe: null, page: null });
  };

  const goToPage = (next: number) => {
    replaceQuery({ page: String(next) });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('catalogo')
      ?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const { data, isPending, isPlaceholderData, isFetching } = useQuery({
    queryKey: ['wiki-articles', page, debouncedSearch, universe, tipo],
    queryFn: () =>
      getWikiArticles({ page, pageSize: PAGE_SIZE, search: debouncedSearch, universe, tipo }),
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
    <div>
      <WikiSearch value={search} onSearch={setSearch} className="mb-6" />

      <WikiFilters
        options={options}
        counts={data?.counts ?? options}
        currentTipo={tipo}
        currentUniverse={universe}
        hrefForTipo={hrefForTipo}
        onTipoChange={handleTipoChange}
        onUniverseChange={handleUniverseChange}
      />

      {/* #explorar sigue vivo como alias de #catalogo: los enlaces antiguos (footer, landing) no se rompen. */}
      <span id="explorar" className="block scroll-mt-24" />
      <div id="catalogo" className="relative mt-8 min-h-[400px] scroll-mt-24">
        <p role="status" className="sr-only">
          {data ? `${data.total} ${data.total === 1 ? 'registro' : 'registros'}` : ''}
        </p>
        {isPending && !isPlaceholderData ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin text-primary motion-reduce:animate-none" />
          </div>
        ) : articles.length > 0 ? (
          <div
            className={cn(
              'grid gap-4 transition-opacity duration-300 motion-reduce:transition-none sm:grid-cols-2 lg:grid-cols-3',
              isFetching && isPlaceholderData ? 'opacity-50' : 'opacity-100',
            )}
          >
            {articles.map(({ slug, frontmatter: fm }) => (
              <ContentCard
                key={slug}
                href={`/wiki/${slug}`}
                title={fm.title}
                meta={[fm.category, fm.universe].filter(Boolean).join(' · ')}
                description={fm.description}
                image={fm.image}
                imagePosition={fm.imagePosition}
                category={fm.category}
                pending={fm.status === 'proximamente'}
                headingLevel={2}
              />
            ))}
          </div>
        ) : (
          <WikiEmptyState onClear={clearFilters} />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="eyebrow text-white/60">
            Mostrando página <span className="text-white">{page}</span> de{' '}
            <span className="text-white">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1 || isFetching}
              className="h-11 rounded-xl border-white/15 bg-[#061a2e] px-5 text-white hover:bg-white/5"
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
                        'h-11 w-11 rounded-xl text-xs font-bold transition-all motion-reduce:transition-none',
                        page === p
                          ? 'bg-primary text-[#00122E] shadow-[0_0_15px_rgba(255,115,0,0.4)]'
                          : 'text-white/60 hover:text-white hover:bg-white/5',
                      )}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === page - 2 || p === page + 2) {
                  return (
                    <span key={p} aria-hidden="true" className="text-white/50">
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
              className="h-11 rounded-xl border-white/15 bg-[#061a2e] px-5 text-white hover:bg-white/5"
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

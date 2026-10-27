'use client';

import * as React from 'react';
import { usePathname, useSearchParams, unstable_isUnrecognizedActionError } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, TriangleAlert } from 'lucide-react';
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

/**
 * Páginas que se pintan en la botonera: la primera, la última, la actual y `siblings` a cada lado.
 * Un hueco de una sola página se rellena con su número (un «…» no ahorraría nada); uno mayor es `'gap'`.
 */
function pageItems(page: number, total: number, siblings: number): Array<number | 'gap'> {
  const shown = new Set<number>([1, total]);
  for (let p = page - siblings; p <= page + siblings; p++) {
    if (p >= 1 && p <= total) shown.add(p);
  }
  const sorted = [...shown].sort((a, b) => a - b);
  const items: Array<number | 'gap'> = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) items.push(prev + 1);
    else if (prev !== undefined && p - prev > 2) items.push('gap');
    items.push(p);
  });
  return items;
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

  const searchInputRef = React.useRef<HTMLInputElement>(null);

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

  // Cada escritura parte de la URL real del navegador (no de un searchParams que React aún no ha
  // re-renderizado ni de una copia en un ref que puede ir por detrás): escrituras seguidas no pierden
  // cambios y nunca se pisa lo que una navegación (footer, atrás/adelante) acaba de poner.
  //
  // Historial (D1): los cambios discretos (pestaña, universo, página, limpiar, sugerencia) crean entrada
  // con pushState y Atrás los deshace paso a paso; el texto que se teclea y las correcciones automáticas
  // la reemplazan (replaceState). Con popstate, Next relee la URL y el efecto de «adoptar la URL» de
  // arriba devuelve el input a su valor.
  const writeQuery = React.useCallback(
    (patch: Record<string, string | null>, mode: 'push' | 'replace') => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '' || value === 'all' || (key === 'page' && value === '1')) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const qs = next.toString();
      // History API nativa: Next 16 sincroniza useSearchParams/usePathname con pushState/replaceState sin
      // pedir un payload RSC al servidor (los filtros responden al instante). Se conserva el hash (#catalogo).
      const url = (qs ? `${pathname}?${qs}` : pathname) + window.location.hash;
      // Sin cambios no hay entrada nueva (p. ej. pulsar la pestaña ya activa).
      if (url === window.location.pathname + window.location.search + window.location.hash) return;
      if (mode === 'push') window.history.pushState(null, '', url);
      else window.history.replaceState(null, '', url);
    },
    [pathname],
  );

  // Debounce del texto → URL (solo si difiere de lo último ENVIADO, no de lo ya confirmado: si una
  // navegación sigue pendiente, compararla con la URL vieja dejaría que su eco pisara el input).
  // La query usa debouncedSearch de inmediato, sin esperar a que el router confirme la navegación.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      const sent = new URLSearchParams(window.location.search).get('search') ?? '';
      if (search !== sent) writeQuery({ search, page: null }, 'replace');
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, writeQuery]);

  // Una búsqueda nueva siempre vuelve a la página 1; mientras llega a la URL ya lo sabemos.
  const page = debouncedSearch !== urlSearch ? 1 : urlPage;

  const handleUniverseChange = (value: string | null) =>
    writeQuery({ universe: value ?? 'all', page: null }, 'push');

  const handleTipoChange = (value: string) => writeQuery({ tipo: value, page: null }, 'push');

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
    writeQuery({ search: null, tipo: null, universe: null, page: null }, 'push');
    // El botón «Limpiar filtros» desaparece con el estado vacío: el foco pasa al campo de búsqueda.
    searchInputRef.current?.focus();
  };

  /** Pone la búsqueda al instante (sin esperar al debounce): lo usa «¿Quisiste decir…?». */
  const applySearch = (value: string) => {
    setSearch(value);
    setDebouncedSearch(value);
    writeQuery({ search: value, page: null }, 'push');
    searchInputRef.current?.focus();
  };

  const goToPage = (next: number) => {
    writeQuery({ page: String(next) }, 'push');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('catalogo')
      ?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const { data, error, isError, isPending, isPlaceholderData, isFetching, refetch } = useQuery({
    queryKey: ['wiki-articles', page, debouncedSearch, universe, tipo],
    queryFn: () =>
      getWikiArticles({ page, pageSize: PAGE_SIZE, search: debouncedSearch, universe, tipo }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    // Una pestaña abierta antes de un despliegue ya no reconoce la acción del servidor: reintentar no
    // sirve (el id no existe en el build nuevo), solo recargar.
    retry: (failures, err) => !unstable_isUnrecognizedActionError(err) && failures < 2,
  });
  const staleVersion = isError && unstable_isUnrecognizedActionError(error);

  const articles = data?.articles ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ?page= fuera de rango (enlace viejo, filtros que reducen resultados): vuelve a la página 1 en la URL.
  // Solo con datos reales de esta query, no con el placeholder de la anterior.
  const resolvedTotalPages = !isPlaceholderData && data ? data.totalPages : null;
  React.useEffect(() => {
    if (resolvedTotalPages !== null && page > resolvedTotalPages) writeQuery({ page: null }, 'replace');
  }, [resolvedTotalPages, page, writeQuery]);

  // Un ?page= que no aporta nada (1, 0, «abc», -3) se quita de la URL: la página 1 es la URL sin parámetro.
  const rawPage = searchParams.get('page');
  React.useEffect(() => {
    if (rawPage !== null && parsePage(rawPage) === 1) writeQuery({ page: null }, 'replace');
  }, [rawPage, writeQuery]);

  return (
    <div>
      <WikiSearch value={search} onSearch={setSearch} inputRef={searchInputRef} className="mb-6" />

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
        ) : isError ? (
          // Un fallo de la consulta no es «sin resultados»: se avisa y se deja reintentar.
          <div
            role="alert"
            className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-[#061a2e] px-6 py-12 text-center md:py-16"
          >
            <TriangleAlert aria-hidden="true" className="h-8 w-8 text-primary" />
            <div className="space-y-1">
              <p className="text-base font-bold text-white">
                {staleVersion ? 'Hay una versión nueva del archivo' : 'No se pudo cargar el archivo'}
              </p>
              <p className="text-sm text-white/70">
                {staleVersion
                  ? 'Recarga la página para ver los registros.'
                  : 'Revisa tu conexión e inténtalo de nuevo.'}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => (staleVersion ? window.location.reload() : void refetch())}
              className="h-11 rounded-xl px-6 font-bold"
            >
              {staleVersion ? 'Recargar' : 'Reintentar'}
            </Button>
          </div>
        ) : articles.length > 0 ? (
          <div
            className={cn(
              'grid gap-4 transition-opacity duration-300 motion-reduce:transition-none sm:grid-cols-2 lg:grid-cols-3',
              isFetching && isPlaceholderData ? 'opacity-50' : 'opacity-100',
            )}
          >
            {articles.map(({ slug, frontmatter: fm }, index) => (
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
                // La primera fila es lo que se ve al cargar: no se difiere (LCP).
                eager={index < 3}
              />
            ))}
          </div>
        ) : (
          <WikiEmptyState
            query={debouncedSearch.trim()}
            suggestion={isPlaceholderData ? undefined : data?.suggestion}
            popular={isPlaceholderData ? undefined : data?.popular}
            onClear={clearFilters}
            onSearch={applySearch}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="eyebrow text-white/60">
            Mostrando página <span className="text-white">{page}</span> de{' '}
            <span className="text-white">{totalPages}</span>
          </p>

          {/* Compacta en móvil («‹ 1 … 4 … 9 ›») y con vecinas desde sm; flex-wrap por si el menú
              lateral estrecha la columna. Anterior/Siguiente solo con icono hasta lg. */}
          <nav aria-label="Paginación" className="flex max-w-full flex-wrap items-center justify-center gap-1">
            <Button
              variant="outline"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1 || isFetching}
              aria-label="Página anterior"
              className={PAGER_ARROW}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              <span aria-hidden="true" className="hidden lg:inline">
                Anterior
              </span>
            </Button>

            <PageButtons items={pageItems(page, totalPages, 0)} page={page} onGo={goToPage} className="sm:hidden" />
            <PageButtons
              items={pageItems(page, totalPages, 1)}
              page={page}
              onGo={goToPage}
              className="hidden sm:flex"
            />

            <Button
              variant="outline"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isFetching}
              aria-label="Página siguiente"
              className={PAGER_ARROW}
            >
              <span aria-hidden="true" className="hidden lg:inline">
                Siguiente
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}

const PAGER_ARROW =
  'h-11 min-w-11 gap-2 rounded-xl border-white/15 bg-[#061a2e] px-3 text-white hover:bg-white/5 lg:px-5';

/** Números de página con sus «…»; el nombre accesible de cada botón dice a qué página lleva. */
function PageButtons({
  items,
  page,
  onGo,
  className,
}: {
  items: Array<number | 'gap'>;
  page: number;
  onGo: (page: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {items.map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-white/50">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onGo(item)}
            aria-current={page === item ? 'page' : undefined}
            aria-label={`Página ${item}`}
            className={cn(
              'h-11 min-w-11 rounded-xl px-1 text-xs font-bold outline-none transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none',
              page === item
                ? 'bg-primary text-[#00122E] shadow-[0_0_15px_rgba(255,115,0,0.4)]'
                : 'text-white/60 hover:bg-white/5 hover:text-white',
            )}
          >
            {item}
          </button>
        ),
      )}
    </div>
  );
}

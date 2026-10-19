'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/utils/cn';
import { normalize, type EntityEntry } from '@/core/search/entity-index';
import { MAX_QUERY_LENGTH, search, suggest, type SearchHit } from '@/core/search/search';
import { getWikiIndex } from '@/features/monsters/actions/get-wiki-articles';
import { RANDOM_ROUTE } from '@/features/monsters/config/wiki-routes';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { useSearchPalette } from './useSearchPalette';

const RESULT_LIMIT = 10;
const POPULAR_LIMIT = 8;
const POPULAR_FALLBACK_LIMIT = 6;
const NO_ENTRIES: readonly EntityEntry[] = [];
/** Cualquier modal abierto que no sea la paleta (hojas de vaul y diálogos de Radix / Base UI); la paleta lleva `data-search-palette`. */
const OTHER_MODAL = '[data-vaul-drawer]:not([data-search-palette]), [role="dialog"]:not([data-search-palette])';

type Row =
  | { kind: 'entry'; entry: EntityEntry; alias?: string }
  | { kind: 'all' }
  | { kind: 'random' }
  | { kind: 'suggest'; slug: string; title: string };

const toRow = (hit: SearchHit): Row => ({ kind: 'entry', entry: hit.entry, alias: hit.matchedAlias });

/** Miniatura de 40 px: la portada, o el icono de la categoría si no hay portada o es de marca. */
function Thumb({ entry }: { entry: EntityEntry }) {
  const cover = entry.image && !isBrandPlaceholder(entry.image) ? entry.image : undefined;
  const pending = entry.status === 'proximamente';
  return (
    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#00122E]">
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="40px"
          className={cn('object-cover', pending && 'opacity-70 grayscale')}
          style={{ objectPosition: entry.imagePosition ?? '50% 50%' }}
        />
      ) : (
        <CategoryPlaceholder
          category={entry.category}
          variant="corner"
          className="[&_svg]:inset-0 [&_svg]:m-auto [&_svg]:h-4 [&_svg]:w-4"
        />
      )}
    </span>
  );
}

function EntryRow({ entry, alias, active }: { entry: EntityEntry; alias?: string; active: boolean }) {
  const meta = [entry.category, entry.universe].filter(Boolean).join(' · ');
  return (
    <>
      <Thumb entry={entry} />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate font-display text-base font-bold uppercase italic leading-tight',
            active ? 'text-primary' : 'text-white',
          )}
        >
          {entry.title}
        </span>
        <span className="block truncate text-[12px] font-semibold text-white/60">
          {entry.status === 'proximamente' && (
            <span className="mr-2 text-[11px] font-bold uppercase tracking-wider text-primary">Próximamente</span>
          )}
          {meta}
        </span>
        {alias && <span className="block truncate text-[12px] text-white/60">también: {alias}</span>}
      </span>
    </>
  );
}

/**
 * Paleta de búsqueda global (spec Ola B §8): ⌘K / Ctrl+K y los disparadores `SearchTrigger`. Se monta una
 * vez en el layout raíz, dentro de `Providers` (necesita el QueryClient). A pantalla completa en móvil;
 * centrada, `max-w-xl`, desde md. Los resultados van sobre superficie sólida `#061a2e`.
 */
export function SearchPalette() {
  const router = useRouter();
  const open = useSearchPalette((s) => s.open);
  const query = useSearchPalette((s) => s.query);
  const setQuery = useSearchPalette((s) => s.setQuery);
  const close = useSearchPalette((s) => s.close);

  const listId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const [cursor, setCursor] = React.useState(0);

  // ⌘K / Ctrl+K abre o cierra la paleta desde cualquier página. No la abre encima de otro modal (la hoja del
  // índice, el visor de imágenes, el menú móvil…): dos diálogos a la vez se roban el foco y el scroll lock.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (event.repeat) return;
        const state = useSearchPalette.getState();
        if (state.open) state.close();
        else if (!document.querySelector(OTHER_MODAL)) state.openPalette();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { data: index, isPending, isError } = useQuery({
    queryKey: ['wiki-index'],
    queryFn: () => getWikiIndex(),
    staleTime: Infinity,
    enabled: open,
  });
  const entries = index ?? NO_ENTRIES;

  const hasQuery = normalize(query) !== '';
  const shownQuery = query.trim();

  const { rows, label, noResults } = React.useMemo((): { rows: Row[]; label: string | null; noResults: boolean } => {
    if (!index) return { rows: [], label: null, noResults: false };
    const popular = (limit: number) => search('', entries, { limit }).map(toRow);
    // «Expediente aleatorio» cierra la lista cuando no hay consulta y cuando no hay coincidencias: ahí el fan no sabe qué buscar.
    const random: Row = { kind: 'random' };
    if (!hasQuery) return { rows: [...popular(POPULAR_LIMIT), random], label: 'Populares', noResults: false };
    const hits = search(query, entries, { limit: RESULT_LIMIT });
    if (hits.length > 0) return { rows: [...hits.map(toRow), { kind: 'all' }], label: null, noResults: false };
    const hint = suggest(query, entries);
    return {
      rows: [...(hint ? [{ kind: 'suggest' as const, ...hint }] : []), ...popular(POPULAR_FALLBACK_LIMIT), random],
      label: 'Populares',
      noResults: true,
    };
  }, [index, entries, hasQuery, query]);

  // La selección vuelve a la primera fila al cambiar la consulta o al abrir (ajuste durante el render).
  const resetKey = `${open}|${query}`;
  const [prevResetKey, setPrevResetKey] = React.useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setCursor(0);
  }
  const active = Math.min(cursor, rows.length - 1);

  // Mantiene visible la fila activa (y vuelve arriba cuando llega una lista nueva).
  React.useEffect(() => {
    listRef.current?.querySelector(`[data-row="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, rows]);

  const go = (href: string) => {
    close();
    router.push(href as Route);
  };

  const activate = (row: Row | undefined) => {
    if (!row) return;
    if (row.kind === 'entry') go(`/wiki/${row.entry.slug}`);
    else if (row.kind === 'all') go(`/wiki?search=${encodeURIComponent(shownQuery)}#explorar`);
    else if (row.kind === 'random') go(RANDOM_ROUTE);
    else {
      setQuery(row.title);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor(Math.min(rows.length - 1, active + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor(Math.max(0, active - 1));
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      activate(rows[active]);
    }
  };

  // Texto para lectores de pantalla (región `role="status"`).
  const found = rows.filter((r) => r.kind === 'entry').length;
  let status = '';
  if (isError) status = 'No se pudo cargar el archivo';
  else if (isPending) status = 'Cargando el archivo';
  else if (noResults) status = `Sin coincidencias para ${shownQuery}`;
  else if (hasQuery) status = `${found} ${found === 1 ? 'resultado' : 'resultados'}`;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        showCloseButton={false}
        initialFocus={inputRef}
        data-search-palette=""
        className={cn(
          // Móvil: pantalla completa, sin bordes redondeados.
          'inset-0 flex w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-[#061a2e] p-0 ring-0',
          // md y más: centrada, max-w-xl.
          'md:inset-auto md:left-1/2 md:top-[12%] md:max-w-xl md:-translate-x-1/2 md:rounded-2xl md:border md:border-white/10 md:shadow-[0_40px_80px_rgba(0,0,0,0.7)]',
          'motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none',
        )}
      >
        <DialogTitle className="sr-only">Buscar en el archivo</DialogTitle>

        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4 transition-colors focus-within:border-primary/60 motion-reduce:transition-none">
          <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={rows.length > 0}
            aria-controls={rows.length > 0 ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={rows.length > 0 ? `${listId}-${active}` : undefined}
            aria-label="Buscar en el archivo"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            maxLength={MAX_QUERY_LENGTH}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar criaturas, personajes, especies…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-white outline-hidden placeholder:text-white/50"
          />
          <button
            type="button"
            onClick={close}
            className="inline-flex h-11 shrink-0 items-center rounded-lg px-3 text-sm font-bold text-white/70 transition-colors hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none md:hidden"
          >
            Cerrar
          </button>
          <kbd
            aria-hidden="true"
            className="hidden rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white/70 md:inline"
          >
            ESC
          </kbd>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 md:max-h-[60vh] md:flex-none">
          <p role="status" className="sr-only">
            {status}
          </p>

          {isPending && <p className="px-4 py-10 text-center text-sm text-white/60">Cargando el archivo…</p>}
          {isError && (
            <p className="px-4 py-10 text-center text-sm text-white/70">
              No se pudo cargar el archivo. Cierra la búsqueda y vuelve a intentarlo.
            </p>
          )}

          {noResults && (
            <p className="break-words px-3 pb-1 pt-4 text-base font-bold text-white">Sin coincidencias para «{shownQuery}»</p>
          )}

          {rows.length > 0 && (
            // Se evita mover el foco al pulsar una fila: el campo conserva el teclado y las flechas.
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={noResults ? 'Sugerencias' : label ?? 'Resultados'}
              onMouseDown={(e) => e.preventDefault()}
            >
              {rows.map((row, i) => {
                const selected = i === active;
                const separator = noResults && row.kind === 'entry' && rows[i - 1]?.kind !== 'entry';
                return (
                  <React.Fragment key={row.kind === 'entry' ? row.entry.slug : row.kind}>
                    {(i === 0 && !noResults && label) || separator ? (
                      <li
                        role="presentation"
                        className="px-3 pb-1 pt-3 text-xs font-semibold text-white/60"
                      >
                        {label}
                      </li>
                    ) : null}
                    <li
                      id={`${listId}-${i}`}
                      data-row={i}
                      role="option"
                      aria-selected={selected}
                      onClick={() => activate(row)}
                      onMouseMove={() => setCursor(i)}
                      className={cn(
                        'flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors motion-reduce:transition-none',
                        selected ? 'bg-primary/15' : 'hover:bg-white/5',
                      )}
                    >
                      {row.kind === 'entry' && <EntryRow entry={row.entry} alias={row.alias} active={selected} />}
                      {row.kind === 'all' && (
                        <span className={cn('flex-1 text-sm font-bold', selected ? 'text-primary' : 'text-white')}>
                          Ver todos en el explorador <span aria-hidden="true">→</span>
                        </span>
                      )}
                      {row.kind === 'random' && (
                        <span className={cn('flex-1 text-sm font-bold', selected ? 'text-primary' : 'text-white')}>
                          Expediente aleatorio <span aria-hidden="true">→</span>
                        </span>
                      )}
                      {row.kind === 'suggest' && (
                        <span className="flex-1 text-sm text-white/80">
                          ¿Quisiste decir{' '}
                          <strong className={cn('font-bold', selected ? 'text-primary' : 'text-white')}>{row.title}</strong>?
                        </span>
                      )}
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

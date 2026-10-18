'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Search, CornerDownLeft, ImageOff } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/utils/cn';
import { getWikiIndex, type WikiIndexEntry } from '@/features/monsters/actions/get-wiki-articles';

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const MAX_RESULTS = 10;

function filterIndex(index: WikiIndexEntry[], query: string): WikiIndexEntry[] {
  const q = normalize(query.trim());
  if (!q) return index.slice(0, MAX_RESULTS);
  const scored = index
    .map((entry) => {
      const title = normalize(entry.title);
      let score = 0;
      if (title.startsWith(q)) score = 3;
      else if (title.includes(q)) score = 2;
      else if (
        normalize(entry.universe).includes(q) ||
        (entry.category && normalize(entry.category).includes(q)) ||
        (entry.description && normalize(entry.description).includes(q))
      ) {
        score = 1;
      }
      return { entry, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'es'));
  return scored.slice(0, MAX_RESULTS).map((r) => r.entry);
}

/** Paleta de búsqueda global (⌘K / Ctrl+K). Chrome glass; resultados sobre superficie sólida. */
export function WikiCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [cursor, setCursor] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);

  const { data: index = [] } = useQuery({
    queryKey: ['wiki-index'],
    queryFn: () => getWikiIndex(),
    staleTime: Infinity,
    enabled: open,
  });

  const results = React.useMemo(() => filterIndex(index, query), [index, query]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    setCursor(0);
  }, [query, open]);

  React.useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const go = (entry: WikiIndexEntry | undefined) => {
    if (!entry) return;
    setOpen(false);
    setQuery('');
    router.push(`/wiki/${entry.slug}` as Route);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[cursor]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-10 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-white/60 transition-all hover:border-primary/40 hover:bg-white/10 hover:text-white"
      >
        <Search className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="sr-only sm:hidden">Buscar en la wiki</span>
        <span className="hidden text-xs font-medium sm:inline">Buscar en la wiki</span>
        <kbd className="hidden rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white/70 lg:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[12%] w-[min(92vw,640px)] max-w-none translate-y-0 gap-0 overflow-hidden rounded-2xl border border-white/10 bg-[#061a2e] p-0 ring-0 shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
        >
          <DialogTitle className="sr-only">Buscar en la wiki</DialogTitle>

          <div className="flex items-center gap-3 border-b border-white/10 bg-black/20 px-4">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Buscar criaturas, especies, organizaciones…"
              aria-label="Buscar"
              className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/40"
            />
            <kbd className="hidden rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white/70 sm:inline">
              ESC
            </kbd>
          </div>

          <ul ref={listRef} role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-white/40">
                {index.length === 0 ? 'Cargando índice…' : 'Sin resultados en el archivo.'}
              </li>
            )}
            {results.map((entry, i) => (
              <li key={entry.slug} role="option" aria-selected={i === cursor}>
                <button
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(entry)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    i === cursor ? 'bg-primary/15' : 'hover:bg-white/5',
                  )}
                >
                  <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    {entry.image ? (
                      <Image src={entry.image} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <ImageOff className="absolute inset-0 m-auto h-4 w-4 text-white/30" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-sm font-bold uppercase italic', i === cursor ? 'text-primary' : 'text-white')}>
                      {entry.title}
                    </span>
                    <span className="block truncate text-[11px] font-bold uppercase tracking-wider text-white/40">
                      {entry.universe}
                      {entry.category ? ` · ${entry.category}` : ''}
                    </span>
                  </span>
                  {i === cursor && <CornerDownLeft className="h-4 w-4 shrink-0 text-primary/70" />}
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

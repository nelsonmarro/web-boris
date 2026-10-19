'use client';

import * as React from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function SearchBar({ placeholder = '¿Qué criatura buscas?' }: { placeholder?: string }) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(`/wiki${q ? `?search=${encodeURIComponent(q)}` : ''}#explorar` as Route);
  };

  return (
    <form role="search" onSubmit={submit} className="group relative max-w-xl">
      <label htmlFor="hero-search" className="sr-only">Buscar en la wiki</label>
      <div className="flex items-center rounded-full border border-white/15 bg-[#061a2e] p-1 transition-colors group-focus-within:border-primary/40 group-focus-within:ring-2 group-focus-within:ring-primary motion-reduce:transition-none">
        <Search className="ml-4 mr-2 h-5 w-5 shrink-0 text-white/60 transition-colors group-focus-within:text-primary" />
        <input
          id="hero-search"
          type="search"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 min-w-0 flex-1 bg-transparent text-base font-bold tracking-tight text-white outline-none placeholder:text-white/50 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Limpiar búsqueda"
            className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-[11px] font-bold uppercase italic tracking-wider text-[#00122E] transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none sm:px-6"
        >
          <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">Buscar</span>
          <span className="sr-only sm:hidden">Buscar</span>
        </button>
      </div>
    </form>
  );
}

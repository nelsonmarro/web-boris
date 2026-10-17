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
    <form role="search" onSubmit={submit} className="group relative max-w-lg">
      <label htmlFor="hero-search" className="sr-only">Buscar en la wiki</label>
      <div className="glass-liquid flex items-center rounded-full border-white/10 bg-black/40 p-1 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all group-focus-within:border-primary/40 group-focus-within:ring-4 group-focus-within:ring-primary/30">
        <Search className="ml-4 mr-2 h-5 w-5 shrink-0 text-white/30 transition-colors group-focus-within:text-primary" />
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
            className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="flex h-10 shrink-0 items-center gap-2 rounded-full border-t border-white/20 bg-gradient-to-r from-primary to-orange-600 px-4 text-[11px] font-bold uppercase italic tracking-wider text-white shadow-[0_8px_20px_rgba(255,115,0,0.3)] transition-transform active:scale-95 sm:px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">Buscar</span>
          <span className="sr-only sm:hidden">Buscar</span>
        </button>
      </div>
    </form>
  );
}

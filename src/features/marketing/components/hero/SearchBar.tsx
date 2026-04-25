'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({ placeholder = "¿Qué criatura buscas?", onSearch }: SearchBarProps) {
  const [search, setSearch] = React.useState("");

  const handleClear = () => setSearch("");

  return (
    <div className="relative max-w-lg group">
      <div className="glass-liquid p-1 rounded-full border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex items-center bg-black/40 backdrop-blur-3xl group-focus-within:border-primary/40 group-focus-within:ring-4 group-focus-within:ring-primary/5 transition-all">
        <div className="pl-5 pr-3">
          <Search className="h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-12 bg-transparent outline-none text-white placeholder-white/20 font-bold text-base tracking-tight"
        />
        {search && (
          <button
            onClick={handleClear}
            className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-white/30 hover:text-white transition-all mr-2"
            aria-label="Limpiar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <Button 
          onClick={() => onSearch?.(search)}
          className="h-10 px-8 rounded-full font-bold uppercase tracking-wider text-[10px] italic bg-gradient-to-r from-primary to-orange-600 shadow-[0_8px_20px_rgba(255,115,0,0.3)] border-t border-white/20 transition-transform active:scale-95"
        >
          BUSCAR
        </Button>
      </div>
    </div>
  );
}

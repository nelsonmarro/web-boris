'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface WikiSearchProps {
  /** Texto actual (controlado por el padre). */
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

/** Buscador grande de la portada del archivo (spec #55 §4). El debounce y la URL los gestiona el padre. */
export function WikiSearch({
  value,
  onSearch,
  placeholder = 'Buscar criaturas, personajes, especies…',
  className,
  inputClassName,
}: WikiSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const clear = () => {
    onSearch('');
    // El botón desaparece al vaciar: devolvemos el foco al campo para no perderlo.
    inputRef.current?.focus();
  };

  return (
    <div className={cn('group relative w-full max-w-2xl', className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-primary motion-reduce:transition-none"
      />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'h-14 rounded-xl border-white/15 bg-[#061a2e] pl-14 pr-14 text-base font-medium text-white shadow-none backdrop-blur-none placeholder:text-white/60 focus-visible:border-primary/60 focus-visible:bg-[#061a2e] focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:shadow-[0_0_30px_rgba(255,115,0,0.12)] [&::-webkit-search-cancel-button]:hidden',
          inputClassName,
        )}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpiar búsqueda"
          className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

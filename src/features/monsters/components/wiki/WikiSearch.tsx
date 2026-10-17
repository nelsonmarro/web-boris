'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface WikiSearchProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
  inputClassName?: string;
}

export function WikiSearch({
  placeholder = 'Buscar en el archivo…',
  onSearch,
  className,
  inputClassName,
}: WikiSearchProps) {
  const [value, setValue] = React.useState('');

  const update = (next: string) => {
    setValue(next);
    onSearch(next);
  };

  return (
    <div className={cn('group relative w-full', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-primary" />
      <Input
        type="search"
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'h-12 rounded-xl border-white/15 bg-[#061a2e] pl-11 pr-11 text-base font-medium text-white shadow-none backdrop-blur-none placeholder:text-white/45 focus-visible:border-primary/60 focus-visible:bg-[#061a2e] focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:shadow-[0_0_30px_rgba(255,115,0,0.12)] [&::-webkit-search-cancel-button]:hidden',
          inputClassName,
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => update('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

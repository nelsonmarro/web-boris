'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface WikiSearchProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
  inputClassName?: string;
}

export function WikiSearch({ 
  placeholder = "Buscar en el archivo...", 
  onSearch, 
  className,
  inputClassName 
}: WikiSearchProps) {
  const [value, setValue] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    onSearch(newVal);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className={cn("relative group w-full", className)}>
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "h-16 pl-14 pr-12 bg-white/5 border-white/10 rounded-[1.5rem] focus:border-primary/50 transition-all font-bold text-white placeholder:text-white/20 text-lg",
          inputClassName
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

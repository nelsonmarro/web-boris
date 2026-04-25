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
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 group-focus-within:text-primary transition-all duration-500 group-focus-within:scale-110" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "h-16 pl-14 pr-12 bg-[#061d33] border-white/20 rounded-[1.5rem] focus:border-primary/60 focus:ring-primary/20 transition-all font-bold text-white placeholder:text-white/60 text-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)] focus:shadow-[0_0_30px_rgba(255,115,0,0.15)]",
          inputClassName
        )}
      />
      
      {/* Search Status Dot */}
      <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 group-focus-within:border-primary/40 transition-colors">
         <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", value ? "bg-primary animate-pulse" : "bg-white/60")} />
         <span className="text-[8px] font-bold uppercase tracking-wider text-white/60">Sync</span>
      </div>

      {value && (
        <button
          onClick={handleClear}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

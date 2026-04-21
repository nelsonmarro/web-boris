'use client';

import * as React from 'react';
import { WikiSearch } from './WikiSearch';

interface WikiFiltersProps {
  onSearchChange: (value: string) => void;
}

export function WikiFilters({ onSearchChange }: WikiFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center w-full">
      <WikiSearch 
        onSearch={onSearchChange} 
        placeholder="Filtrar por nombre o universo..."
        className="max-w-2xl"
      />
      {/* Space for future Universe/Category select filters */}
    </div>
  );
}

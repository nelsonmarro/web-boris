'use client';

import * as React from 'react';
import { WikiSearch } from './WikiSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WikiFiltersProps {
  onSearchChange: (value: string) => void;
  onUniverseChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;
  currentUniverse: string;
  currentCategory: string;
}

export function WikiFilters({ 
  onSearchChange, 
  onUniverseChange, 
  onCategoryChange,
  currentUniverse,
  currentCategory
}: WikiFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center w-full">
      <div className="flex-1 w-full lg:max-w-xl">
        <WikiSearch 
          onSearch={onSearchChange} 
          placeholder="Filtrar por nombre..."
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        {/* Universe Filter */}
        <Select value={currentUniverse} onValueChange={onUniverseChange}>
          <SelectTrigger className="w-full sm:w-[200px] h-14 bg-[#061a2e] border-white/10 rounded-2xl text-white font-bold focus:ring-primary/20">
            <SelectValue placeholder="Universo" />
          </SelectTrigger>
          <SelectContent className="bg-[#061a2e] border-white/10 text-white min-w-[200px]">
            <SelectItem value="all">Todos los Universos</SelectItem>
            <SelectItem value="Colosos">Colosos</SelectItem>
            <SelectItem value="Capitán de Galeón">Capitán de Galeón</SelectItem>
            <SelectItem value="Ellos Llegaron">Ellos Llegaron</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={currentCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px] h-14 bg-[#061a2e] border-white/10 rounded-2xl text-white font-bold focus:ring-primary/20">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-[#061a2e] border-white/10 text-white min-w-[200px]">
            <SelectItem value="all">Todas las Categorías</SelectItem>
            <SelectItem value="Especies">Especies</SelectItem>
            <SelectItem value="Animales">Animales</SelectItem>
            <SelectItem value="Humanos">Humanos</SelectItem>
            <SelectItem value="Organizaciones">Organizaciones</SelectItem>
            <SelectItem value="Colosos">Colosos</SelectItem>
            <SelectItem value="Titanes">Titanes</SelectItem>
            <SelectItem value="Medianos">Medianos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

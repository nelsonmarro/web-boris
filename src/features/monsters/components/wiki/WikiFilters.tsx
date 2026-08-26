'use client';

import * as React from 'react';
import { WikiSearch } from './WikiSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WikiFilterOptions } from '@/features/monsters/actions/get-wiki-articles';

interface WikiFiltersProps {
  options: WikiFilterOptions;
  onSearchChange: (value: string) => void;
  onUniverseChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;
  currentUniverse: string;
  currentCategory: string;
}

/** Etiquetas en plural para mostrar; el `value` es el string exacto del frontmatter. */
const CATEGORY_LABELS: Record<string, string> = {
  Coloso: 'Colosos',
  Titán: 'Titanes',
  Animal: 'Animales',
  Especie: 'Especies',
  Humano: 'Humanos',
  Organización: 'Organizaciones',
  Vehículo: 'Vehículos',
  Libro: 'Libros',
  Entidad: 'Entidades',
  Categoría: 'Categorías',
  Directorio: 'Directorios',
};

const triggerClass =
  'w-full sm:w-[200px] h-14 bg-[#061a2e] border-white/10 rounded-2xl text-white font-bold focus:ring-primary/20';
const contentClass = 'bg-[#061a2e] border-white/10 text-white min-w-[200px]';

export function WikiFilters({
  options,
  onSearchChange,
  onUniverseChange,
  onCategoryChange,
  currentUniverse,
  currentCategory,
}: WikiFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center w-full">
      <div className="flex-1 w-full lg:max-w-xl">
        <WikiSearch onSearch={onSearchChange} placeholder="Filtrar por nombre..." />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <Select value={currentUniverse} onValueChange={onUniverseChange}>
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Universo" />
          </SelectTrigger>
          <SelectContent className={contentClass}>
            <SelectItem value="all">Todos los Universos</SelectItem>
            {options.universes.map((universe) => (
              <SelectItem key={universe} value={universe}>
                {universe}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className={contentClass}>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {options.categories.map((category) => (
              <SelectItem key={category} value={category}>
                {CATEGORY_LABELS[category] ?? category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

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
  initialSearch?: string;
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
  'h-12 w-full rounded-xl border-white/15 bg-[#061a2e] px-4 text-sm font-semibold text-white focus-visible:ring-4 focus-visible:ring-primary/20 sm:w-[210px]';
const contentClass = 'bg-[#061a2e] border-white/10 text-white min-w-[200px]';

export function WikiFilters({
  options,
  onSearchChange,
  onUniverseChange,
  onCategoryChange,
  currentUniverse,
  currentCategory,
  initialSearch,
}: WikiFiltersProps) {
  // Base UI muestra el valor crudo salvo que reciba el mapa `items` valor → etiqueta.
  const universeItems = React.useMemo(
    () => ({ all: 'Todos los Universos', ...Object.fromEntries(options.universes.map((u) => [u, u])) }),
    [options.universes],
  );
  const categoryItems = React.useMemo(
    () => ({
      all: 'Todas las Categorías',
      ...Object.fromEntries(options.categories.map((c) => [c, CATEGORY_LABELS[c] ?? c])),
    }),
    [options.categories],
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center w-full">
      <div className="flex-1 w-full lg:max-w-xl">
        <WikiSearch onSearch={onSearchChange} defaultValue={initialSearch} placeholder="Filtrar por nombre..." />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <Select value={currentUniverse} onValueChange={onUniverseChange} items={universeItems}>
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

        <Select value={currentCategory} onValueChange={onCategoryChange} items={categoryItems}>
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

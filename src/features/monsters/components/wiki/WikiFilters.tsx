'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WikiFilterOptions } from '@/features/monsters/actions/get-wiki-articles';
import { cn } from '@/utils/cn';

interface WikiFiltersProps {
  options: WikiFilterOptions;
  /** `'all'` o el id de un tipo de `options.tipos`. */
  currentTipo: string;
  currentUniverse: string;
  /** URL de cada pestaña (`'all'` quita `?tipo=`); permite abrirla en otra pestaña del navegador. */
  hrefForTipo: (tipo: string) => string;
  onTipoChange: (tipo: string) => void;
  onUniverseChange: (value: string | null) => void;
}

// `ui/select` fija la altura con `data-[size=default]:h-8`: hay que sobrescribir esa misma variante.
const triggerClass =
  'h-11 data-[size=default]:h-11 w-full rounded-xl border-white/15 bg-[#061a2e] px-4 text-sm font-semibold text-white focus-visible:ring-4 focus-visible:ring-primary/20 sm:w-[210px]';
const contentClass = 'bg-[#061a2e] border-white/10 text-white min-w-[200px]';

const pillBase =
  'inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors motion-reduce:transition-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2339]';

/** Una pulsación normal cambia la URL sin navegar; Ctrl/Cmd/Mayús/botón medio siguen abriendo el enlace. */
function isPlainClick(e: React.MouseEvent) {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

export function WikiFilters({
  options,
  currentTipo,
  currentUniverse,
  hrefForTipo,
  onTipoChange,
  onUniverseChange,
}: WikiFiltersProps) {
  // Base UI muestra el valor crudo salvo que reciba el mapa `items` valor → etiqueta.
  const universeItems = React.useMemo(
    () => ({ all: 'Todos los universos', ...Object.fromEntries(options.universes.map((u) => [u, u])) }),
    [options.universes],
  );

  const tabs = [{ id: 'all', label: 'Todo', count: options.total }, ...options.tipos];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Enlaces que cambian la URL, no pestañas ARIA: la activa se marca con aria-current. */}
      <nav aria-label="Tipos de expediente" className="min-w-0">
        <div className="-mx-4 -my-1.5 flex gap-2 overflow-x-auto px-4 py-1.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {tabs.map(({ id, label, count }) => {
            const active = id === currentTipo;
            return (
              <Link
                key={id}
                href={hrefForTipo(id) as Route}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => {
                  if (!isPlainClick(e)) return;
                  e.preventDefault();
                  onTipoChange(id);
                }}
                className={cn(
                  pillBase,
                  active
                    ? 'bg-primary text-[#00122E]'
                    : 'border border-white/15 text-white/80 hover:border-primary/40',
                )}
              >
                {label} · {count}
              </Link>
            );
          })}
        </div>
      </nav>

      <Select value={currentUniverse} onValueChange={onUniverseChange} items={universeItems}>
        <SelectTrigger aria-label="Universo" className={triggerClass}>
          <SelectValue placeholder="Universo" />
        </SelectTrigger>
        <SelectContent className={contentClass}>
          <SelectItem value="all">Todos los universos</SelectItem>
          {options.universes.map((universe) => (
            <SelectItem key={universe} value={universe}>
              {universe}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

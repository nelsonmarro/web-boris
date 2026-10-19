'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSearchPalette } from './useSearchPalette';

interface SearchTriggerProps {
  /** `hero`: campo grande de la portada. `pill`: «Buscar ⌘K» de las cabeceras. `icon`: solo la lupa (móvil). */
  variant: 'hero' | 'pill' | 'icon';
  /** Solo `hero`: texto del campo. */
  placeholder?: string;
  className?: string;
}

const noopSubscribe = () => () => {};
const isApplePlatform = () => /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

/**
 * ⌘K en Mac, Ctrl K en el resto. `useSyncExternalStore` devuelve el valor del servidor durante la
 * hidratación (sin desajuste) y el del navegador justo después.
 */
function useShortcutHint(): string {
  const apple = React.useSyncExternalStore(noopSubscribe, isApplePlatform, () => false);
  return apple ? '⌘K' : 'Ctrl K';
}

const FOCUS = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary';

/** Abre la paleta de búsqueda global (`SearchPalette`). No navega ni tiene formulario. */
export function SearchTrigger({ variant, placeholder = '¿Qué criatura buscas?', className }: SearchTriggerProps) {
  const openPalette = useSearchPalette((s) => s.openPalette);
  const hint = useShortcutHint();

  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={() => openPalette()}
        aria-haspopup="dialog"
        className={cn(
          'flex w-full max-w-xl items-center rounded-full border border-white/15 bg-[#061a2e] p-1 text-left transition-colors hover:border-primary/40 motion-reduce:transition-none',
          FOCUS,
          className,
        )}
      >
        <Search aria-hidden="true" className="ml-4 mr-2 h-5 w-5 shrink-0 text-white/60" />
        <span className="flex h-12 min-w-0 flex-1 items-center">
          <span className="truncate text-base font-bold tracking-tight text-white/50">{placeholder}</span>
        </span>
        <span className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-[11px] font-bold uppercase italic tracking-wider text-[#00122E] sm:px-6">
          <Search aria-hidden="true" className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Buscar</span>
          <span className="sr-only sm:hidden">Buscar</span>
        </span>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={() => openPalette()}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className={cn(
          'inline-flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-white/60 transition-colors hover:border-primary/40 hover:bg-white/10 hover:text-white motion-reduce:transition-none',
          FOCUS,
          className,
        )}
      >
        <Search aria-hidden="true" className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium">Buscar</span>
        <kbd
          aria-hidden="true"
          className="rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white/70"
        >
          {hint}
        </kbd>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openPalette()}
      aria-haspopup="dialog"
      aria-label="Buscar en el archivo"
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/5 hover:text-white motion-reduce:transition-none',
        FOCUS,
        className,
      )}
    >
      <Search aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

'use client';

interface WikiEmptyStateProps {
  /** Borra la búsqueda, el tipo y el universo. */
  onClear: () => void;
}

export function WikiEmptyState({ onClear }: WikiEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-[#061a2e] px-6 py-16 text-center">
      <div className="space-y-1">
        <p className="text-base font-bold text-white">Ningún registro coincide</p>
        <p className="text-sm text-white/70">Prueba con otro nombre, o cambia el tipo o el universo.</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-bold text-white transition-colors hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
      >
        Limpiar filtros
      </button>
    </div>
  );
}

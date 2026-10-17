'use client';

import * as React from 'react';
import { SearchX } from 'lucide-react';

export function WikiEmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#061a2e] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <SearchX className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-bold text-white">Ningún registro coincide con la búsqueda</p>
        <p className="text-sm text-white/55">Prueba con otro nombre, o cambia el universo o la categoría del filtro.</p>
      </div>
    </div>
  );
}

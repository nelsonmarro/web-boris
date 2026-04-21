'use client';

import * as React from 'react';

export function WikiEmptyState() {
  return (
    <div className="col-span-full py-20 text-center glass-liquid rounded-[3rem] border-white/5">
       <p className="text-white/30 font-black uppercase tracking-widest text-sm italic">
         No se encontraron registros clasificados en el Archivo Central.
       </p>
    </div>
  );
}

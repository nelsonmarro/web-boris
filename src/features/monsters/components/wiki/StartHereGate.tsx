'use client';

import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Muestra «Empieza por aquí» solo con el explorador sin tocar: sin búsqueda, sin pestaña distinta de «Todo»,
 * sin universo y en la primera página. El estado vive en la URL (?search=&tipo=&universe=&page=).
 */
export function StartHereGate({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const active =
    Boolean(params.get('search')?.trim()) ||
    (params.get('tipo') ?? 'all') !== 'all' ||
    (params.get('universe') ?? 'all') !== 'all' ||
    (params.get('page') ?? '1') !== '1';
  return active ? null : <>{children}</>;
}

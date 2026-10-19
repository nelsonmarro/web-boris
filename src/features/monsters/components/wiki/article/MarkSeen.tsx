'use client';

import { useEffect } from 'react';
import { useRegistro } from '@/features/monsters/store/registro-store';

/** Marca la ficha como abierta en el registro del fan (solo en su navegador). No pinta nada. */
export function MarkSeen({ slug }: { slug: string }) {
  useEffect(() => {
    useRegistro.getState().markSeen(slug);
  }, [slug]);
  return null;
}

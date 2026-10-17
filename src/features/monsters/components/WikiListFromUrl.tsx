'use client';

import { useSearchParams } from 'next/navigation';
import { WikiList } from './WikiList';
import type { WikiFilterOptions } from '../actions/get-wiki-articles';

/** Remonta WikiList cuando cambia la query (navegación dentro de /wiki); la caché de React Query sobrevive. */
export function WikiListFromUrl({ options }: { options: WikiFilterOptions }) {
  const searchParams = useSearchParams();
  return <WikiList key={searchParams.toString()} options={options} />;
}

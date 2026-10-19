import { SearchTrigger } from '@/components/search/SearchTrigger';

/** Buscador grande del hero de la landing: abre la paleta de búsqueda global (no es un formulario). */
export function SearchBar({ placeholder = '¿Qué criatura buscas?' }: { placeholder?: string }) {
  return <SearchTrigger variant="hero" placeholder={placeholder} />;
}

import { create } from 'zustand';

interface SearchPaletteState {
  open: boolean;
  query: string;
  /** Abre la paleta, opcionalmente con una consulta inicial. Siempre se llama con `() => openPalette()`, nunca como handler directo. */
  openPalette: (initialQuery?: string) => void;
  close: () => void;
  setQuery: (query: string) => void;
}

/**
 * Estado de la paleta de búsqueda global (spec Ola B §8). Sin `persist`: no sobrevive a la recarga.
 * `close` conserva la consulta para que el texto no parpadee mientras el diálogo se desvanece;
 * `openPalette` la reinicia.
 */
export const useSearchPalette = create<SearchPaletteState>((set) => ({
  open: false,
  query: '',
  openPalette: (initialQuery = '') => set({ open: true, query: initialQuery }),
  close: () => set({ open: false }),
  setQuery: (query) => set({ query }),
}));

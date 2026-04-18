import { create } from 'zustand'

interface WikiState {
  searchQuery: string;
  selectedUniverse: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedUniverse: (universe: string | null) => void;
}

export const useWikiStore = create<WikiState>((set) => ({
  searchQuery: "",
  selectedUniverse: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedUniverse: (universe) => set({ selectedUniverse: universe }),
}));

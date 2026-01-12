import { create } from 'zustand';

type AppState = {
  searchQuery: string;
  selectedCategory: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  searchQuery: '',
  selectedCategory: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));

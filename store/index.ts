import { create } from 'zustand';

interface AppState {
  primaryFocus: string | null;
  setPrimaryFocus: (focus: string | null) => void;
  morningRitualComplete: boolean;
  setMorningRitualComplete: (complete: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  primaryFocus: null,
  setPrimaryFocus: (focus) => set({ primaryFocus: focus }),
  morningRitualComplete: false,
  setMorningRitualComplete: (complete) => set({ morningRitualComplete: complete }),
}));

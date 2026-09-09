import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UiState {
  commandPaletteOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  setCommandPaletteOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      commandPaletteOpen: false,
      sidebarCollapsed: false,
      theme: 'dark',
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'pcc-ui' },
  ),
);

// ─── Sync Store ───────────────────────────────────────────────────────────────

interface SyncState {
  status: 'idle' | 'syncing' | 'error';
  lastSynced: Date | null;
  setStatus: (status: SyncState['status']) => void;
  setLastSynced: (date: Date) => void;
}

export const useSyncStore = create<SyncState>()((set) => ({
  status: 'idle',
  lastSynced: null,
  setStatus: (status) => set({ status }),
  setLastSynced: (date) => set({ lastSynced: date }),
}));

// ─── App Store (morning ritual) ───────────────────────────────────────────────

interface AppState {
  primaryFocus: string | null;
  morningRitualComplete: boolean;
  setPrimaryFocus: (focus: string | null) => void;
  setMorningRitualComplete: (complete: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      primaryFocus: null,
      morningRitualComplete: false,
      setPrimaryFocus: (focus) => set({ primaryFocus: focus }),
      setMorningRitualComplete: (complete) => set({ morningRitualComplete: complete }),
    }),
    { name: 'pcc-app' },
  ),
);

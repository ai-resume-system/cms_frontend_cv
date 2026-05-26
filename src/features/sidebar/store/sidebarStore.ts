import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: true,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  close: () => set({ isCollapsed: true }),
  open: () => set({ isCollapsed: false }),
}));

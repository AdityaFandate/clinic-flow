import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  voiceWidgetOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleVoiceWidget: () => void;
  setVoiceWidgetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  voiceWidgetOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleVoiceWidget: () => set((s) => ({ voiceWidgetOpen: !s.voiceWidgetOpen })),
  setVoiceWidgetOpen: (voiceWidgetOpen) => set({ voiceWidgetOpen }),
}));

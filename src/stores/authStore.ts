import { create } from 'zustand';
import type { AppRole, Profile } from '@/types';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setProfile: (profile: Profile | null) => void;
  setRole: (role: AppRole | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, profile: null, role: null, isAuthenticated: false }),
}));

import { create } from "zustand";

interface AuthState {
  authenticated: boolean;
  email: string | null;
  loading: boolean;
  setAuth: (authenticated: boolean, email: string | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authenticated: false,
  email: null,
  loading: true,
  setAuth: (authenticated, email) => set({ authenticated, email, loading: false }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ authenticated: false, email: null, loading: false }),
}));

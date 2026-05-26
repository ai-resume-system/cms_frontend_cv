import { create } from "zustand";
import { EUserRole } from "@/constants/enums/user.enum";

export interface AuthUser {
  id: string;
  email: string;
  role: EUserRole;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) => {
    set({ accessToken, user, isAuthenticated: true });
  },

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  clearAuth: () => {
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));

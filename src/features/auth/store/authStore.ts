import { create } from "zustand";

import { EUserRole } from "@/constants/enums/user.enum";
import { LOCAL_STORAGE_KEYS } from "@/constants/constants/local-storage";

export interface AuthUser {
  id: string;
  email: string;
  role: EUserRole;
}

interface AuthState {
  accessToken: string | null;
  expiresAt: string | null;
  expiresIn: number | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (
    accessToken: string,
    user: AuthUser,
    expiresAt?: string | null,
    expiresIn?: number | null,
  ) => void;
  setAccessToken: (
    accessToken: string,
    expiresAt?: string | null,
    expiresIn?: number | null,
  ) => void;
  clearAuth: () => void;
  hydrateAuthStoreFromStorage: () => void;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readExpiresIn(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clearAccessTokenStorage() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_IN);
}

function persistAccessTokenToStorage(
  accessToken: string | null,
  expiresAt?: string | null,
  expiresIn?: number | null,
) {
  if (!isBrowser()) {
    return;
  }

  if (!accessToken) {
    clearAccessTokenStorage();
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);

  if (expiresAt) {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT,
      expiresAt,
    );
  } else {
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
  }

  if (typeof expiresIn === "number") {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_IN,
      String(expiresIn),
    );
  } else {
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_IN);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  expiresAt: null,
  expiresIn: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user, expiresAt = null, expiresIn = null) => {
    persistAccessTokenToStorage(accessToken, expiresAt, expiresIn);
    set({ accessToken, expiresAt, expiresIn, user, isAuthenticated: true });
  },

  setAccessToken: (accessToken, expiresAt = null, expiresIn = null) => {
    persistAccessTokenToStorage(accessToken, expiresAt, expiresIn);
    set((state) => ({
      ...state,
      accessToken,
      expiresAt,
      expiresIn,
      isAuthenticated: true,
    }));
  },

  clearAuth: () => {
    clearAccessTokenStorage();
    set({
      accessToken: null,
      expiresAt: null,
      expiresIn: null,
      user: null,
      isAuthenticated: false,
    });
  },

  hydrateAuthStoreFromStorage: () => {
    if (!isBrowser()) {
      return;
    }

    const accessToken = window.localStorage.getItem(
      LOCAL_STORAGE_KEYS.ACCESS_TOKEN,
    );
    const expiresAt = window.localStorage.getItem(
      LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT,
    );
    const expiresIn = readExpiresIn(
      window.localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_IN),
    );

    if (!accessToken) {
      set((state) => {
        if (!state.accessToken && !state.expiresAt && !state.expiresIn) {
          return state;
        }

        return {
          ...state,
          accessToken: null,
          expiresAt: null,
          expiresIn: null,
          isAuthenticated: Boolean(state.user),
        };
      });
      return;
    }

    set((state) => {
      if (
        state.accessToken === accessToken &&
        state.expiresAt === expiresAt &&
        state.expiresIn === expiresIn
      ) {
        return state;
      }

      return {
        ...state,
        accessToken,
        expiresAt,
        expiresIn,
        isAuthenticated: true,
      };
    });
  },
}));

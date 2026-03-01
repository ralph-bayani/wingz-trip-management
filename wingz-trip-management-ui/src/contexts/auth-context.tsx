"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { request } from "@/lib/api";
import type { TokenResponse } from "@/types/api";

const storageKeyAccess = "wingz_access_token";
const storageKeyRefresh = "wingz_refresh_token";

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(storageKeyAccess);
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(storageKeyRefresh);
}

function storeTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKeyAccess, access);
  localStorage.setItem(storageKeyRefresh, refresh);
}

function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKeyAccess);
  localStorage.removeItem(storageKeyRefresh);
}

type AuthState = {
  accessToken: string | null;
  isReady: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setAccessToken(getStoredAccessToken());
    setIsReady(true);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refresh = getStoredRefreshToken();
    if (!refresh) return null;
    try {
      const data = await request<TokenResponse>("/auth/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
      storeTokens(data.access, data.refresh);
      setAccessToken(data.access);
      return data.access;
    } catch {
      clearStoredTokens();
      setAccessToken(null);
      return null;
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await request<TokenResponse>("/auth/token/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      storeTokens(data.access, data.refresh);
      setAccessToken(data.access);
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredTokens();
    setAccessToken(null);
  }, []);

  const value: AuthContextValue = {
    accessToken,
    isReady,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

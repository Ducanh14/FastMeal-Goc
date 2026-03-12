"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

import { fetchUserProfile } from "@/lib/api";

function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname.includes('devtunnels.ms')) {
    return window.location.origin.replace('-3001', '-3000');
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}
const API_BASE_URL = getApiBaseUrl();

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthOpen: boolean;
  authMode: "login" | "register";
  isOrderHistoryOpen: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  openAuth: (mode?: "login" | "register") => void;
  closeAuth: () => void;
  openOrderHistory: () => void;
  closeOrderHistory: () => void;
  updateProfile: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("fastmeal_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("fastmeal_user");
      }
    }
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("fastmeal_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("fastmeal_user");
    }
  }, [user]);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: name, email, password }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          console.error("Register failed:", errorData);
          return false;
        }

        const data = await res.json();
        // data = { message: '...', userId: '...' }
        setUser({
          id: data.userId,
          name,
          email,
        });
        setIsAuthOpen(false);
        return true;
      } catch (err) {
        console.error("Register error:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });

        if (!res.ok) {
          return false;
        }

        const data = await res.json();
        setUser({
          id: data.userId,
          name: data.fullName,
          email: data.email,
          role: data.role,
        });
        setIsAuthOpen(false);
        return true;
      } catch {
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("fastmeal_user");
  }, []);

  const openAuth = useCallback((mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setIsAuthOpen(false), []);

  const openOrderHistory = useCallback(() => setIsOrderHistoryOpen(true), []);
  const closeOrderHistory = useCallback(
    () => setIsOrderHistoryOpen(false),
    []
  );

  const updateProfile = useCallback(
    (data: Partial<User>) => {
      if (user) {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
      }
    },
    [user]
  );

  // Periodic refresh to sync role changes from server
  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await fetchUserProfile(user.id);
      if (profile && profile.role !== user.role) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                role: profile.role,
                name: profile.fullName || prev.name,
              }
            : null
        );
      }
    } catch {
      // Silently ignore refresh errors
    }
  }, [user]);

  // Poll every 30 seconds + on window focus
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(refreshUser, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    };

    const handleFocus = () => {
      refreshUser();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthOpen,
        authMode,
        isOrderHistoryOpen,
        login,
        register,
        logout,
        openAuth,
        closeAuth,
        openOrderHistory,
        closeOrderHistory,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

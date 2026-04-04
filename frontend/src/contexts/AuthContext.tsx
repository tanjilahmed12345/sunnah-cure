"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { apiClient, setTokens, clearTokens, getAccessToken } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface LoginData {
  user: User;
  token: AuthTokens;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    phone: string;
    password: string;
    confirmPassword: string;
    address: string;
    age: number;
    gender: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = !!user;

  const fetchMe = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiSuccess<User>>(ENDPOINTS.auth.me);
      if (res.success) {
        setUser(res.data);
      }
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchMe().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  const login = async (phone: string, password: string) => {
    const res = await apiClient.post<ApiSuccess<LoginData>>(
      ENDPOINTS.auth.login,
      { phone, password },
      true
    );
    if (res.success) {
      setTokens(res.data.token.access, res.data.token.refresh);
      setUser(res.data.user);
    }
  };

  const register = async (data: {
    name: string;
    phone: string;
    password: string;
    confirmPassword: string;
    address: string;
    age: number;
    gender: string;
  }) => {
    const res = await apiClient.post<ApiSuccess<LoginData>>(
      ENDPOINTS.auth.register,
      data,
      true
    );
    if (res.success) {
      setTokens(res.data.token.access, res.data.token.refresh);
      setUser(res.data.user);
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const refreshUser = fetchMe;

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

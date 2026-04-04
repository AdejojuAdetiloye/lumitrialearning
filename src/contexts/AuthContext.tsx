import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "@/lib/api";

export type AppRole = "PARENT" | "ADMIN" | "MANAGER" | "INSTRUCTOR";

export type AuthUser = {
  id: string;
  email: string;
  role: AppRole;
  profile?: {
    id: string;
    salutation?: "MR" | "MRS" | "MS" | "MX";
    firstName: string;
    lastName: string;
    phone: string | null;
    country: string;
    children?: unknown[];
  } | null;
  staffProfile?: { firstName: string; lastName: string } | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  registerParent: (data: {
    email: string;
    password: string;
    salutation: "MR" | "MRS" | "MS" | "MX";
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<AuthUser>("/api/auth/me");
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>("/api/auth/login", { email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const registerParent = useCallback(
    async (data: {
      email: string;
      password: string;
      salutation: "MR" | "MRS" | "MS" | "MX";
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const res = await api.post<{ token: string; user: AuthUser }>("/api/auth/register", data);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, registerParent, logout, refresh }),
    [user, loading, login, registerParent, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}

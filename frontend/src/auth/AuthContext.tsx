import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api/client";

interface InfoResponse {
  auth_enabled: boolean;
}

interface AuthContextValue {
  ready: boolean;
  authRequired: boolean;
  hasToken: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authRequired, setAuthRequired] = useState(false);
  const [hasToken, setHasToken] = useState(Boolean(getToken()));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<InfoResponse>("/api/info")
      .then((info) => {
        setAuthRequired(info.auth_enabled);
        setReady(true);
      })
      .catch(() => {
        // /api/info returns 401 if a token is required and we don't have one.
        setAuthRequired(true);
        setReady(true);
      });
  }, [hasToken]);

  const login = useCallback(async (token: string) => {
    setToken(token);
    try {
      await api.get("/api/health");
      setHasToken(true);
      setError(null);
    } catch (err) {
      setToken("");
      setHasToken(false);
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setHasToken(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ ready, authRequired, hasToken, login, logout, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

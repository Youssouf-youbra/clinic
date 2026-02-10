import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "../api/clients";

/* ================= ROLES ================= */
// Rôles utilisés côté FRONTEND
export type AppRole = "Admin" | "Medecin" | "Personnel" | "Patient";

interface DecodedToken {
  email?: string;
  exp?: number;

  // Claim ASP.NET Identity
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?:
    | string
    | string[];

  // autres formats possibles
  role?: string | string[];
  roles?: string[];

  [key: string]: any;
}

interface AuthUser {
  email?: string;
  role?: AppRole;
  exp?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ================= HELPERS ================= */

// 🔁 NORMALISATION DES RÔLES BACKEND → FRONTEND
function normalizeRole(raw?: string): AppRole | undefined {
  if (!raw) return undefined;

  const r = raw.trim().toUpperCase();

  // rôles backend Identity
  if (r === "ADMIN") return "Admin";
  if (r === "PATIENT") return "Patient";

  // mapping IMPORTANT
  if (r === "DOCTOR") return "Medecin";
  if (r === "STAFF") return "Personnel";

  // compat anciens tokens
  if (r === "MEDECIN") return "Medecin";
  if (r === "PERSONNEL") return "Personnel";

  return undefined;
}

// 🔑 Extraction robuste du rôle depuis le JWT
function extractRole(decoded: DecodedToken): AppRole | undefined {
  const candidates = [
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    decoded.role,
    decoded.roles,
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && typeof c[0] === "string") {
      return normalizeRole(c[0]);
    }
    if (typeof c === "string") {
      return normalizeRole(c);
    }
  }
  return undefined;
}

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // 🔁 Charger le token au refresh
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // ⏰ token expiré
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        setUser(null);
        return;
      }

      setUser({
        email: decoded.email,
        role: extractRole(decoded),
        exp: decoded.exp,
      });
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  // 🔐 LOGIN
  const login = async (email: string, password: string) => {
    const res = await api.post("/Auth/login", { email, password });
    const token: string = res.data.token;

    localStorage.setItem("authToken", token);
    localStorage.setItem("token", token);

    const decoded = jwtDecode<DecodedToken>(token);

    setUser({
      email: decoded.email,
      role: extractRole(decoded),
      exp: decoded.exp,
    });
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  }
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type React from "react";
import { db } from "~/lib/db";
import type { Role, User } from "~/lib/db";

type AuthUser = Omit<User, "passwordHash"> & { role?: Role };

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  isAdmin: () => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const applyUser = useCallback(async (currentUser: AuthUser | null) => {
    if (!currentUser) {
      setUser(null);
      setPermissions(new Set());
      setAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const role = await db.roles.getById(currentUser.roleId);
      const { permissions: rolePermissions, admin: isAdminRole } = await db.auth.getPermissions(role);

      setUser({ ...currentUser, role: role ?? undefined });
      setPermissions(rolePermissions);
      setAdmin(isAdminRole);
    } catch (error) {
      console.error("[auth] No se pudieron cargar los permisos:", error);
      setUser(currentUser);
      setPermissions(new Set());
      setAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUser = useCallback(async () => {
    await applyUser(db.auth.getCurrentUser());
  }, [applyUser]);

  useEffect(() => {
    loadUser();
    const handleSeed = () => loadUser();
    window.addEventListener("crm:seed-complete", handleSeed);
    return () => window.removeEventListener("crm:seed-complete", handleSeed);
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await db.auth.login(email, password);
        if (!result) return false;

        await applyUser({ ...result.user, role: result.role ?? undefined });
        return true;
      } catch (error) {
        console.error("[auth] Error al iniciar sesión:", error);
        return false;
      }
    },
    [applyUser],
  );

  const logout = useCallback(() => {
    db.auth.logout();
    setUser(null);
    setPermissions(new Set());
    setAdmin(false);
    setLoading(false);
  }, []);

  const hasPermission = useCallback(
    (resource: string, action: string) =>
      admin || permissions.has(`${resource}:${action}`) || permissions.has(`${resource}:manage`),
    [admin, permissions],
  );

  const isAdmin = useCallback(() => admin, [admin]);

  const value = useMemo(
    () => ({ user, login, logout, hasPermission, isAdmin, loading }),
    [user, login, logout, hasPermission, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

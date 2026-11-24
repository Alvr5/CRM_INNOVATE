import { createContext, useContext, useState, useEffect } from "react";
import { db } from "~/lib/db";
import type { User, Role } from "~/lib/db";
import type React from "react";

interface AuthContextType {
  user: (User & { role?: Role }) | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { role?: Role }) | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const currentUser = db.auth.getCurrentUser();
    if (currentUser) {
      const role = await db.roles.getById(currentUser.roleId);
      if (role) {
        setUser({ ...currentUser, role });
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    const handleSeed = () => loadUser();
    window.addEventListener('crm:seed-complete', handleSeed);
    return () => window.removeEventListener('crm:seed-complete', handleSeed);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await db.auth.login(email, password);
    if (result) {
      const { user: userData, role } = result;
      const userWithRole = { ...userData, role };
      db.auth.setCurrentUser(userWithRole);
      setUser(userWithRole);
      setLoading(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    db.auth.logout();
    setUser(null);
    setLoading(false);
  };

  const hasPermission = async (resource: string, action: string) => {
    return db.auth.hasPermission(resource, action);
  };

  const isAdmin = async () => {
    return db.auth.isAdmin();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
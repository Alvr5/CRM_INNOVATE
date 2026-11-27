import { getSupabase } from "./client";
import { fromSnakeCase } from "./mappers";
import type { Permission, Role, User } from "./types";

const CURRENT_USER_KEY = "crm_current_user";
const CACHE_TTL_MS = 60_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CrudApi = {
  roles: { getById: (id: string) => Promise<Role | null> };
  permissions: { getAll: () => Promise<Permission[]> };
};

export type AuthUser = Omit<User, "passwordHash"> & { role?: Role };

export function createAuth(api: CrudApi) {
  const roleCache = new Map<string, { permissions: Set<string>; admin: boolean; at: number }>();
  let permissionMapCache: { byId: Map<string, Permission>; at: number } | null = null;

  async function getPermissionMap(): Promise<Map<string, Permission>> {
    if (permissionMapCache && Date.now() - permissionMapCache.at < CACHE_TTL_MS) {
      return permissionMapCache.byId;
    }

    const permissions = await api.permissions.getAll();
    const byId = new Map(permissions.map((permission) => [permission.id, permission]));
    permissionMapCache = { byId, at: Date.now() };
    return byId;
  }

  async function getPermissions(role: Role | null): Promise<{ permissions: Set<string>; admin: boolean }> {
    if (!role) return { permissions: new Set(), admin: false };

    const cached = roleCache.get(role.id);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return { permissions: cached.permissions, admin: cached.admin };
    }

    const admin = role.name === "Administrador";
    const permissions = new Set<string>();

    if (!admin) {
      const rawPermissions = role.permissions ?? [];
      const permissionIds = rawPermissions.filter((permission) => UUID_RE.test(permission));
      const legacyPermissions = rawPermissions.filter((permission) => !UUID_RE.test(permission));

      if (permissionIds.length) {
        const byId = await getPermissionMap();
        for (const id of permissionIds) {
          const permission = byId.get(id);
          if (permission) permissions.add(`${permission.resource}:${permission.action}`);
        }
      }

      for (const permission of legacyPermissions) {
        permissions.add(permission);
      }
    }

    const result = { permissions, admin };
    roleCache.set(role.id, { ...result, at: Date.now() });
    return result;
  }

  function getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;

    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;

    try {
      const user = JSON.parse(data) as AuthUser;

      // Sesiones antiguas guardaban un roleId que no era UUID.
      if (user.roleId && !UUID_RE.test(user.roleId)) {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem("crm_seeded");
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }

  function setCurrentUser(user: AuthUser): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  function logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  async function login(email: string, password: string) {
    const { data, error } = await getSupabase()
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) return null;

    const user = fromSnakeCase<User>(data);
    if (user.passwordHash !== `hashed_${password}` || !user.isActive) return null;

    const role = await api.roles.getById(user.roleId);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    const currentUser: AuthUser = { ...safeUser, role: role ?? undefined };

    setCurrentUser(currentUser);
    return { user: safeUser, role };
  }

  async function hasPermission(resource: string, action: string): Promise<boolean> {
    const user = getCurrentUser();
    if (!user) return false;

    const role = await api.roles.getById(user.roleId);
    const { permissions, admin } = await getPermissions(role);

    return admin || permissions.has(`${resource}:${action}`) || permissions.has(`${resource}:manage`);
  }

  async function isAdmin(): Promise<boolean> {
    const user = getCurrentUser();
    if (!user) return false;

    const role = await api.roles.getById(user.roleId);
    return role?.name === "Administrador";
  }

  function invalidateCache(): void {
    roleCache.clear();
    permissionMapCache = null;
  }

  return {
    getCurrentUser,
    setCurrentUser,
    logout,
    login,
    hasPermission,
    isAdmin,
    getPermissions,
    invalidateCache,
  };
}

import { getSupabase } from "./client";
import {
  DEFAULT_LEADS,
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  DEFAULT_USERS,
  DEMO_ACTIVITIES,
  DEMO_COMPANIES,
  DEMO_CONTACTS,
  DEMO_DEALS,
  DEMO_PRODUCTS,
  DEMO_SETTINGS,
  DEMO_TEAM_MEMBERS,
} from "./defaults";
import { fromSnakeCase, toSnakeCase } from "./mappers";
import type { Activity, Company, Contact, Deal, Permission, Product, Role, Setting, TeamMember, User } from "./types";

const SEED_FLAG = "crm_seeded";
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

async function getRows<T>(table: string): Promise<T[]> {
  const { data, error } = await getSupabase().from(table).select("*");
  if (error) throw error;
  return (data || []).map((row) => fromSnakeCase<T>(row));
}

async function insertRows<T>(table: string, rows: Record<string, any>[]): Promise<T[]> {
  if (!rows.length) return [];

  const { data, error } = await getSupabase().from(table).insert(rows).select();
  if (error) throw error;
  return (data || []).map((row) => fromSnakeCase<T>(row));
}

async function tableHasRows(table: string): Promise<boolean> {
  const { count, error } = await getSupabase()
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) return false;
  return (count ?? 0) > 0;
}

async function hasCoreData(): Promise<boolean> {
  const checks = await Promise.all([
    tableHasRows("permissions"),
    tableHasRows("roles"),
    tableHasRows("users"),
  ]);
  return checks.every(Boolean);
}

async function clearAll(): Promise<void> {
  const tables = [
    "activities",
    "deals",
    "contacts",
    "companies",
    "leads",
    "products",
    "invoices",
    "quotes",
    "team_members",
    "settings",
    "users",
    "roles",
    "permissions",
  ];

  for (const table of tables) {
    const { error } = await getSupabase().from(table).delete().neq("id", ZERO_UUID);
    if (error) throw error;
  }
}

export async function seedDatabase(force = false): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if (force) {
      localStorage.removeItem(SEED_FLAG);
      await clearAll();
    } else if (localStorage.getItem(SEED_FLAG) === "true" && (await hasCoreData())) {
      return;
    }

    // Permisos: se crean solo los que faltan para evitar duplicados.
    const existingPermissions = await getRows<Permission>("permissions");
    const permissionByKey = new Map(
      existingPermissions.map((permission) => [`${permission.resource}:${permission.action}`, permission]),
    );

    const missingPermissions = DEFAULT_PERMISSIONS.filter(
      (permission) => !permissionByKey.has(`${permission.resource}:${permission.action}`),
    );

    if (missingPermissions.length) {
      const created = await insertRows<Permission>("permissions", missingPermissions.map(toSnakeCase));
      for (const permission of created) {
        permissionByKey.set(`${permission.resource}:${permission.action}`, permission);
      }
    }

    // Roles: se crean solo los que faltan y se traducen sus permisos a UUIDs.
    const existingRoles = await getRows<Role>("roles");
    const roleByName = new Map(existingRoles.map((role) => [role.name, role]));

    for (const role of DEFAULT_ROLES) {
      if (roleByName.has(role.name)) continue;

      const permissionIds = role.permissions
        .map((key) => permissionByKey.get(key)?.id)
        .filter((id): id is string => Boolean(id));

      const [created] = await insertRows<Role>("roles", [
        toSnakeCase({ ...role, permissions: permissionIds }),
      ]);

      if (created) roleByName.set(created.name, created);
    }

    // Usuarios demo: se crean solo los que faltan (email es único).
    const existingUsers = await getRows<User>("users");
    const userByEmail = new Map(existingUsers.map((user) => [user.email, user]));

    const roleForUser = (index: number) => {
      if (index === 0) return roleByName.get("Administrador");
      if (index === 2) return roleByName.get("Gerente de Ventas");
      return roleByName.get("Vendedor");
    };

    for (const [index, user] of DEFAULT_USERS.entries()) {
      if (userByEmail.has(user.email)) continue;

      const [created] = await insertRows<User>("users", [
        toSnakeCase({ ...user, roleId: roleForUser(index)?.id ?? null }),
      ]);

      if (created) userByEmail.set(created.email, created);
    }

    const users = [...userByEmail.values()];

    // Leads demo.
    const existingLeads = await getRows<{ id: string }>("leads");
    if (!existingLeads.length) {
      await insertRows(
        "leads",
        DEFAULT_LEADS.map((lead, index) =>
          toSnakeCase({ ...lead, assignedTo: users[index % Math.max(users.length, 1)]?.id ?? null }),
        ),
      );
    }

    // Empresas, contactos y oportunidades demo (respetando las relaciones).
    let companies = await getRows<Company>("companies");
    if (!companies.length) {
      companies = await insertRows<Company>("companies", DEMO_COMPANIES.map(toSnakeCase));
    }

    let contacts = await getRows<Contact>("contacts");
    if (!contacts.length) {
      contacts = await insertRows<Contact>(
        "contacts",
        DEMO_CONTACTS.map((contact, index) =>
          toSnakeCase({ ...contact, companyId: companies[index]?.id ?? null }),
        ),
      );
    }

    let deals = await getRows<Deal>("deals");
    if (!deals.length) {
      deals = await insertRows<Deal>(
        "deals",
        DEMO_DEALS.map((deal, index) =>
          toSnakeCase({
            ...deal,
            contactId: contacts[index]?.id ?? null,
            companyId: companies[index]?.id ?? null,
          }),
        ),
      );
    }

    const existingActivities = await getRows<{ id: string }>("activities");
    if (!existingActivities.length) {
      await insertRows<Activity>(
        "activities",
        DEMO_ACTIVITIES.map((activity, index) =>
          toSnakeCase({
            ...activity,
            assigneeId: users[index % Math.max(users.length, 1)]?.id ?? null,
            contactId: contacts[index]?.id ?? null,
            companyId: companies[index]?.id ?? null,
            dealId: deals[index]?.id ?? null,
          }),
        ),
      );
    }

    // Configuración: se insertan solo claves nuevas, sin pisar valores existentes.
    const existingSettings = await getRows<Setting>("settings");
    const settingKeys = new Set(existingSettings.map((setting) => setting.key));
    const missingSettings = DEMO_SETTINGS.filter((setting) => !settingKeys.has(setting.key));
    if (missingSettings.length) {
      await insertRows<Setting>("settings", missingSettings.map(toSnakeCase));
    }

    // Productos: se insertan solo SKUs nuevos.
    const existingProducts = await getRows<Product>("products");
    const productSkus = new Set(existingProducts.map((product) => product.sku));
    const missingProducts = DEMO_PRODUCTS.filter((product) => !productSkus.has(product.sku));
    if (missingProducts.length) {
      await insertRows<Product>("products", missingProducts.map(toSnakeCase));
    }

    // Miembros del equipo demo.
    const existingTeamMembers = await getRows<{ id: string }>("team_members");
    if (!existingTeamMembers.length && users.length) {
      await insertRows<TeamMember>(
        "team_members",
        DEMO_TEAM_MEMBERS.map((member, index) =>
          toSnakeCase({ ...member, userId: users[index % users.length]?.id ?? null }),
        ),
      );
    }

    localStorage.setItem(SEED_FLAG, "true");
  } catch (error) {
    console.error("[db] Error al inicializar los datos:", error);
    throw error;
  }
}

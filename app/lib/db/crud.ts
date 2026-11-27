import { getSupabase } from "./client";
import { fromSnakeCase, toSnakeCase } from "./mappers";
import type {
  Activity,
  Company,
  Contact,
  Deal,
  Invoice,
  Lead,
  Permission,
  Product,
  Quote,
  Role,
  Setting,
  TeamMember,
  User,
} from "./types";

export type EntityMap = {
  contacts: Contact;
  companies: Company;
  deals: Deal;
  activities: Activity;
  leads: Lead;
  users: User;
  roles: Role;
  permissions: Permission;
  settings: Setting;
  products: Product;
  invoices: Invoice;
  quotes: Quote;
  teamMembers: TeamMember;
};

export const TABLE_NAMES: Record<keyof EntityMap, string> = {
  contacts: "contacts",
  companies: "companies",
  deals: "deals",
  activities: "activities",
  leads: "leads",
  users: "users",
  roles: "roles",
  permissions: "permissions",
  settings: "settings",
  products: "products",
  invoices: "invoices",
  quotes: "quotes",
  teamMembers: "team_members",
};

export function createCrud<T extends { id: string }>(entity: keyof EntityMap) {
  const table = TABLE_NAMES[entity];

  return {
    getAll: async (): Promise<T[]> => {
      const { data, error } = await getSupabase().from(table).select("*");
      if (error) throw error;
      return (data || []).map((item) => fromSnakeCase<T>(item));
    },

    getById: async (id: string): Promise<T | null> => {
      const { data, error } = await getSupabase().from(table).select("*").eq("id", id).maybeSingle();
      if (error || !data) return null;
      return fromSnakeCase<T>(data);
    },

    create: async (data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> => {
      const now = new Date().toISOString();
      const newItem = { ...data, createdAt: now, updatedAt: now };
      const { data: result, error } = await getSupabase()
        .from(table)
        .insert(toSnakeCase(newItem))
        .select()
        .single();

      if (error) throw error;
      return fromSnakeCase<T>(result);
    },

    update: async (id: string, data: Partial<T>): Promise<T | null> => {
      const updateData = { ...data } as Record<string, unknown>;
      delete updateData.id;
      delete updateData.createdAt;

      const { data: result, error } = await getSupabase()
        .from(table)
        .update({ ...toSnakeCase(updateData), updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error || !result) return null;
      return fromSnakeCase<T>(result);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await getSupabase().from(table).delete().eq("id", id);
      if (error) throw error;
    },
  };
}

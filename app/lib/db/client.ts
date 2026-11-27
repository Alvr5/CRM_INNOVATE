import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || "http://127.0.0.1:54321",
  supabaseAnonKey || "missing-anon-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY " +
        "en el archivo .env (o en las variables de entorno del despliegue) y vuelve a compilar.",
    );
  }

  return supabase;
}

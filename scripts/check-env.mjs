import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envFiles = [".env", ".env.local", ".env.production", ".env.production.local"];
const values = {};

for (const file of envFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;

  for (const line of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match || line.trim().startsWith("#")) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
}

const url = process.env.VITE_SUPABASE_URL || values.VITE_SUPABASE_URL || "";
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || values.VITE_SUPABASE_ANON_KEY || "";
const isPlaceholder = !url || !anonKey || url.includes("tu-proyecto") || anonKey.includes("tu-anon-key");

if (isPlaceholder) {
  console.error("\n[build] Falta configurar Supabase.");
  console.error("        Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
  console.error("        Local: copia .env.example a .env y completa los valores.");
  console.error("        CI/Vercel/Docker: configura las variables de entorno del proyecto.\n");
  process.exit(1);
}

console.log(`[build] Supabase configurado para ${url}`);

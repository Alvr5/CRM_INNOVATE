# InnovateFlow CRM

CRM de ventas construido con React Router (SPA), React 19, Tailwind CSS y Supabase.

## Requisitos

- Node.js 20+ (recomendado 24)
- Un proyecto de Supabase

## Configuración

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

   Completa:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   ```

3. Prepara la base de datos. Ejecuta [`schema-supabase.sql`](schema-supabase.sql) en el
   SQL Editor de Supabase. Si la base ya existía, ejecuta también la migración de
   [`supabase/migrations`](supabase/migrations).

4. Arranca en desarrollo:

   ```bash
   npm run dev
   ```

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Valida variables de entorno y genera `build/client` |
| `npm run start` | Sirve la build estática en `PORT` (por defecto 3000) |
| `npm run typecheck` | Genera tipos de rutas y ejecuta TypeScript |
| `npm run electron:dev` | Compila y abre la app de escritorio |
| `npm run electron:build` | Genera el instalador de Windows |

## Estructura

```
app/
  components/      Layout, inicializador de datos e iconos
  context/         Autenticación y permisos
  lib/db/          Capa de datos Supabase (tipos, CRUD, auth, seed)
  routes/          Rutas por módulo (leads, contactos, empresas, ...)
electron/          Shell de escritorio
scripts/           Validación de entorno y servidor estático
supabase/          Migraciones SQL
schema-supabase.sql Esquema completo idempotente
```

## Producción

### Vercel

Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en las variables de entorno
del proyecto. `vercel.json` publica `build/client` como SPA.

### Docker

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://tu-proyecto.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=tu-anon-key \
  -t innovateflow-crm .

docker run -p 3000:3000 innovateflow-crm
```

## Seguridad

- Nunca subas `.env` al repositorio (ya está en `.gitignore`).
- La clave anónima de Supabase es pública; la seguridad real debe aplicarse con RLS
  y Supabase Auth.
- Si el repositorio estuvo expuesto con el archivo `.env` antiguo, rota las claves de
  Supabase y revisa los accesos del proyecto.

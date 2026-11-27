# Base de datos (Supabase)

La aplicación usa Supabase directamente desde el navegador. No hay servidor SQLite.

## Instalación inicial

1. Crea un proyecto en <https://supabase.com>.
2. Abre **SQL Editor** y ejecuta el contenido de [`../schema-supabase.sql`](../schema-supabase.sql).
3. Copia `.env.example` a `.env` y completa:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Ejecuta `npm run dev`.

## Actualizar una base existente en producción

Si la base ya tenía datos antes del módulo de Tareas, ejecuta:

[`migrations/20261127_fix_production_schema.sql`](migrations/20261127_fix_production_schema.sql)

Esto agrega `activities.status` / `activities.assignee_id`, que son las columnas
que faltaban y rompían el guardado de tareas. El archivo es idempotente: se puede
ejecutar varias veces sin romper nada.

## Notas

- El seed de la aplicación es idempotente: solo crea registros que faltan.
- En desarrollo, para forzar una recarga completa desde la consola del navegador:
  `await window.forceReSeed()` (no está expuesto en producción).
- Las políticas RLS actuales permiten acceso con la clave anónima. Para un entorno
  real se recomienda migrar el login a Supabase Auth y restringir las políticas.

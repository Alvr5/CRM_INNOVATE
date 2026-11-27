-- Migración para bases de datos Supabase que ya existían antes del módulo de Tareas.
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query.
--
-- Soluciona el error "column activities.status does not exist" que rompía
-- el tablero Kanban y el seed en producción.
--
-- Es idempotente: se puede ejecutar varias veces sin efectos secundarios.

ALTER TABLE activities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS assignee_id UUID;

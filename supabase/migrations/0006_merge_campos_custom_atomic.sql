-- 0006_merge_campos_custom_atomic.sql — función para fusionar campos_custom de forma atómica.
--
-- Antes, lib/admin/leadsRepo.ts (patchRecord) hacía read → merge en JS → write sobre la
-- columna jsonb `campos_custom`, en dos round-trips separados. Dos PATCHes concurrentes al
-- mismo lead (ej. dos campos custom distintos guardados casi al mismo tiempo desde la Ficha
-- 360°) podían pisarse entre sí: el que completa el UPDATE último sobreescribe el jsonb leído
-- antes de que el otro escribiera, perdiendo ese cambio en silencio (encontrado en code review,
-- Fase 3 del CRM).
--
-- Esta función hace la fusión en una sola sentencia SQL dentro de Postgres (operador `||` de
-- jsonb), sin round-trip intermedio desde la app — atómica a nivel de fila.
create or replace function merge_campos_custom(p_lead_id uuid, p_patch jsonb)
returns void
language sql
as $$
  update leads
  set campos_custom = coalesce(campos_custom, '{}'::jsonb) || p_patch
  where id = p_lead_id;
$$;

-- Mismo criterio de "defensa en profundidad" que las tablas de 0004_leads_schema.sql: solo
-- service_role (server-side, vía getSupabaseServerClient()) puede ejecutar esta función.
revoke all on function merge_campos_custom(uuid, jsonb) from anon, authenticated;

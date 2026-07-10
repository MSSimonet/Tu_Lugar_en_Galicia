-- Comunidad de Acogida — restringe el acceso directo a la columna `email` para anon/authenticated.
-- Fix de un hallazgo CRÍTICO de la revisión de seguridad (2026-07-10): la policy RLS de
-- 0001_comunidad_schema.sql ("comunidad_select_public" ... using (true)) es row-level, no
-- column-level. Supabase otorga por defecto GRANT SELECT sobre TODAS las columnas de las
-- tablas del schema public a los roles anon/authenticated. Resultado real: cualquiera con la
-- anon key (pública en el bundle del navegador, visible en devtools) puede llamar directo a
--   GET https://<proyecto>.supabase.co/rest/v1/comunidad?select=email,nombre,lat,lng
-- y descargar el email real de cada persona registrada — sin pasar por el mapa ni por el
-- `select` explícito que usa components/comunidad/MapaComunidad.tsx (ese `select` es un gate
-- de la UI, no una restricción real: la REST API de PostgREST no lo impone). Dado que esta
-- tabla guarda el email de familias inmigrantes vulnerables, esto es una fuga de PII crítica.
--
-- Fix: revocar el GRANT SELECT de tabla completa sobre `comunidad` para anon/authenticated y
-- volver a otorgarlo columna por columna, excluyendo `email`. La policy de RLS
-- "comunidad_select_public" se mantiene igual (sigue siendo row-level: todas las filas visibles),
-- pero ahora PostgREST rechaza cualquier select que incluya `email` para esos roles con
-- "42501: permission denied for table comunidad" en vez de devolver el dato.
--
-- CÓMO EJECUTAR (mismo bloqueo que 0001 — no hay credenciales de Supabase en este entorno
-- para aplicarlo por CLI): pegar este archivo completo en el SQL Editor del dashboard de
-- Supabase (Project → SQL Editor → New query) y correrlo una vez contra el proyecto de
-- producción. Verificar después con una llamada anónima real:
--   curl "https://<proyecto>.supabase.co/rest/v1/comunidad?select=email" -H "apikey: <anon key>"
-- debe devolver 42501/permission denied. La misma llamada con
-- select=id,nombre,foto_url,lat,lng,disponibilidad,contacto,updated_at debe seguir funcionando
-- (es la que usa el mapa).

revoke select on comunidad from anon, authenticated;

grant select (
  id,
  nombre,
  foto_url,
  lat,
  lng,
  disponibilidad,
  contacto,
  updated_at
) on comunidad to anon, authenticated;

-- El backend (service_role) no se ve afectado: bypassea RLS y los grants de columna no
-- aplican a roles con privilegio de superusuario/bypass — sigue pudiendo leer `email` para
-- el upsert (lib/comunidad/perfil.ts) y para resolver destinatarios en /api/comunidad/mensaje.

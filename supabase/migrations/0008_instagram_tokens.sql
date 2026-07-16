-- Feed de Instagram en tiempo real (Fase de piloto de rediseño) — token de la Instagram API
-- with Instagram Login (graph.instagram.com). Guarda el access token de larga duración
-- (60 días) que se refresca por cron antes de expirar — ver lib/instagram/tokenRepo.ts y
-- app/api/admin/instagram/refrescar-token/route.ts.
--
-- CÓMO EJECUTAR (mismo bloqueo que 0004_leads_schema.sql — Claude no tiene credenciales para
-- correrlo): pegar este archivo completo en el SQL Editor del dashboard de Supabase y
-- correrlo una vez.

create table instagram_tokens (
  id uuid primary key default gen_random_uuid(),
  ig_user_id text not null unique,
  access_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_instagram_tokens_updated_at
  before update on instagram_tokens
  for each row execute function set_updated_at();

-- Mismo modelo de acceso que `leads`: solo server-side con service_role (bypassea RLS).
-- Ningún cliente (anon/authenticated) debe leer ni escribir el access token.
alter table instagram_tokens enable row level security;
revoke all on instagram_tokens from anon, authenticated;
-- No se crea ninguna policy: RLS habilitado + cero policies = deny-all.

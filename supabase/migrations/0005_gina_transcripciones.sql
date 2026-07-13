-- Transcript completo de la conversación con Gina — Fase 2 (ficha 360°)
-- Ver docs/crm-supabase-fase0.md y la sesión de Fase 2 para el diseño completo.
--
-- Guardado 100% ADITIVO en paralelo al guardado de `respuestas` que ya existe en
-- app/api/gina/route.ts — no reemplaza ni modifica ninguno de los 3 puntos de
-- guardado existentes (nivel1/parcial/completo), ni toca lib/gina/flowEngine.ts.
--
-- CÓMO EJECUTAR: pegar este archivo completo en el SQL Editor del dashboard de
-- Supabase (Project → SQL Editor → New query) y correrlo una vez, o `supabase db push`.

create table gina_transcripciones (
  id bigint generated always as identity primary key,
  lead_id uuid not null references leads(id) on delete cascade,
  rol text not null check (rol in ('gina', 'usuario')),
  mensaje text not null,
  paso_id text,
  created_at timestamptz not null default now()
);

comment on table gina_transcripciones is
  'Historial mensaje-por-mensaje de la conversación con Gina, para la ficha 360° del lead. Guardado en paralelo a leads.— los leads creados antes de esta migración no tienen filas acá (no se hizo backfill, no hace falta).';
comment on column gina_transcripciones.paso_id is
  'id del paso de flow.json que originó este mensaje — solo trazabilidad/debug, no se usa para lógica de negocio.';

create index idx_gina_transcripciones_lead_id on gina_transcripciones(lead_id, created_at asc, id asc);

alter table gina_transcripciones enable row level security;
revoke all on gina_transcripciones from anon, authenticated;
-- Deny-all: mismo criterio que las tablas de leads (Fase 1) — todo el acceso pasa
-- por service_role server-side, sin policies para anon/authenticated.

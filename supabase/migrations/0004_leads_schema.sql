-- CRM de leads — reemplazo 1:1 de Airtable (Fase 1)
-- Ver docs/crm-supabase-fase0.md para el diseño completo, ya aprobado (§1 el DDL, §7/§8 las
-- correcciones aplicadas al DDL final: orden de creación por FKs, fecha_llegada como text,
-- eliminación de inicio_contrato, solo nombre_completo/email not null, fuente_lead con 'contacto',
-- y el trigger de lead_actividad que bloquea solo UPDATE, no DELETE).
--
-- CÓMO EJECUTAR (bloqueo real — no lo puede ejecutar Claude sin credenciales que hoy no
-- existen en .env.local): pegar este archivo completo en el SQL Editor del dashboard de
-- Supabase (Project → SQL Editor → New query) y correrlo una vez. Alternativa: `supabase db
-- push` con el proyecto linkeado vía `supabase login` (requiere OAuth interactivo).

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── pipeline_etapas — Kanban editable ───────────────────────────────────────
create table pipeline_etapas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  orden numeric(12,4) not null,
  color text,
  etiqueta_origen text,
  es_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_pipeline_etapas_default on pipeline_etapas(es_default) where es_default = true;
create index idx_pipeline_etapas_orden on pipeline_etapas(orden);

create trigger trg_pipeline_etapas_updated_at
  before update on pipeline_etapas
  for each row execute function set_updated_at();

insert into pipeline_etapas (nombre, orden, color, etiqueta_origen, es_default) values
  ('Incompleto',            10, '#9CA3AF', 'incompleto',            true),
  ('Lead en preparación',   20, '#60A5FA', 'lead-en-preparacion',   false),
  ('Seguimiento futuro',    30, '#FBBF24', 'seguimiento-futuro',    false),
  ('Califica',              40, '#34D399', 'califica',              false),
  ('Contacto directo',      50, '#F472B6', 'contacto-directo',      false);

-- ── campos_custom_definiciones — metadata de campos custom del panel ────────
create table campos_custom_definiciones (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique,
  etiqueta text not null,
  tipo text not null
    check (tipo in ('text', 'number', 'boolean', 'date', 'select', 'multiselect')),
  opciones text[],
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_campos_custom_definiciones_activo on campos_custom_definiciones(activo, orden);

create trigger trg_campos_custom_definiciones_updated_at
  before update on campos_custom_definiciones
  for each row execute function set_updated_at();

-- ── leads — reemplazo 1:1 de Airtable ───────────────────────────────────────
create table leads (
  id uuid primary key default gen_random_uuid(),

  -- Datos personales — solo email/nombre son universales (ver §8 del doc)
  nombre_completo text not null,
  email text not null,
  telefono text,
  pais_residencia text,

  -- Composición del grupo familiar
  personas text,
  adultos text,
  ninos text,
  adolescentes text,
  mascotas text,
  detalle_mascotas text,
  mascota_tipo text[] not null default '{}',
  cantidad_perros text,
  cantidad_gatos text,
  mascota_peso text,

  -- Situación legal y laboral
  documentacion text,
  situacion_laboral text,
  ingresos_mensuales text,

  -- Garantías (multiselect)
  garantias text[] not null default '{}',

  -- Preferencias de vivienda
  ciudad_destino text,
  tipo_inmueble text,
  presupuesto_mensual text,
  habitaciones_minimas text,
  amueblado text,
  estacionamiento text,
  comodidades text[] not null default '{}',

  -- Perfil adicional (Nivel 2 de Gina)
  necesidades_especiales text,
  profesion text,
  imprescindibles text[] not null default '{}',

  -- Logística — no es una fecha real, es un bucket categórico (ver §7.1 del doc)
  fecha_llegada text,       -- 'menos-1-mes' | '1-3-meses' | '3-6-meses' | 'mas-6-meses' | 'sin-fecha'
  como_nos_conociste text,

  -- Scoring / clasificación (calculados por el motor, no editables a mano)
  calificacion text,
  etiqueta text,
  notas_contacto text,

  -- Perfil "ya en España" / Nivel 2
  modalidad text,
  cuenta_bancaria text,
  comprende_honorarios text,
  tipo_licencia text,
  ciudad_actual text,
  tiempo_en_espana text,
  objetivo_busqueda text,
  nivel_estudios text,

  -- Consentimientos (booleanos reales, estructurales)
  comprende_servicio boolean not null default false,
  consentimiento_rgpd boolean not null default false,
  consentimiento_rgpd_at timestamptz,             -- última confirmación: se pisa en cada guardado
  consentimiento_rgpd_primera_vez timestamptz,    -- inmutable: se fija una sola vez (trigger abajo)

  -- Origen del lead (estructural)
  fuente_lead text not null default 'web'
    check (fuente_lead in ('web', 'gina', 'contacto')),

  -- Agenda Cal.com (hoy vive en Airtable: codigoAgenda, fechaHabilitacion, citaAgendada, fechaCita)
  codigo_agenda text,
  fecha_habilitacion timestamptz,
  cita_agendada boolean not null default false,
  fecha_cita timestamptz,

  -- Pipeline (Kanban)
  etapa_id uuid references pipeline_etapas(id),

  -- Campos custom del admin
  campos_custom jsonb not null default '{}'::jsonb,

  -- Cruce opcional con comunidad
  comunidad_email text references comunidad(email) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column leads.etiqueta is
  'Clasificación automática del motor de scoring. Se usa solo para poblar etapa_id por defecto al crear el lead — no es la posición manual del Kanban.';
comment on column leads.etapa_id is
  'Posición manual en el Kanban, movida por el equipo. Independiente de etiqueta.';
comment on column leads.campos_custom is
  'Campos ad-hoc agregados desde el panel admin sin migración. Metadata en campos_custom_definiciones.';
comment on column leads.comunidad_email is
  'Cruce opcional con la tabla pública comunidad, cuando el mismo email aparece en ambos sistemas. Nullable, ON DELETE SET NULL: no forzar integridad si la persona borra su entrada de comunidad.';
comment on column leads.fecha_llegada is
  'Bucket categórico de plazo (no fecha real) — igual en Gina (p4_plazo) y en el formulario web.';
comment on column leads.nombre_completo is
  'Único campo de contenido, junto con email, garantizado en los 4 orígenes de leads (Gina nivel1/parcial/completo, formulario web, contacto). Todo lo demás es nullable — ver §8 del doc.';
comment on column leads.consentimiento_rgpd_at is
  'Última confirmación de consentimiento RGPD — la aplicación la re-escribe en cada guardado del lead.';
comment on column leads.consentimiento_rgpd_primera_vez is
  'Evidencia legal de CUÁNDO se dio el consentimiento por primera vez. Inmutable a nivel de base de datos (trigger set_consentimiento_rgpd_primera_vez): una vez fijada, ningún update posterior puede cambiarla ni borrarla, sin importar qué envíe la aplicación.';

create trigger trg_leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- consentimiento_rgpd_primera_vez es la evidencia legal de cuándo se dio el consentimiento
-- por primera vez (RGPD exige poder demostrarlo). A diferencia de consentimiento_rgpd_at
-- (que la aplicación re-escribe en cada guardado como "última confirmación"), este campo
-- se fija UNA sola vez y nunca se sobreescribe — la garantía se aplica acá, a nivel de
-- base de datos, no confiando en la disciplina de la capa de aplicación: si el consentimiento
-- ya estaba dado (columna no nula), cualquier UPDATE preserva el valor existente sin importar
-- qué value envíe el cliente; si es la primera vez que se da (INSERT, o UPDATE cuando todavía
-- era null), se fija a now().
create or replace function set_consentimiento_rgpd_primera_vez()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.consentimiento_rgpd = true then
      new.consentimiento_rgpd_primera_vez := now();
    end if;
  elsif TG_OP = 'UPDATE' then
    if old.consentimiento_rgpd_primera_vez is not null then
      new.consentimiento_rgpd_primera_vez := old.consentimiento_rgpd_primera_vez;
    elsif new.consentimiento_rgpd = true then
      new.consentimiento_rgpd_primera_vez := now();
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_leads_consentimiento_rgpd_primera_vez
  before insert or update on leads
  for each row execute function set_consentimiento_rgpd_primera_vez();

-- Nota sobre email: no es unique. Airtable permite reenvíos del mismo email
-- (findLeadByEmail busca, no upsertea a ciegas); forzar unicidad rompería ese comportamiento.
-- Se indexa igual para performance.
create index idx_leads_email on leads(email);
create index idx_leads_created_at on leads(created_at desc);
create index idx_leads_etapa on leads(etapa_id);
create index idx_leads_ciudad_destino on leads(ciudad_destino);
create index idx_leads_fuente on leads(fuente_lead);

create index idx_leads_fecha_cita on leads(fecha_cita) where fecha_cita is not null;

create index idx_leads_codigo_activo on leads(codigo_agenda)
  where codigo_agenda is not null and cita_agendada = false;

-- validateCodigoAgenda necesita resolver a UN lead exacto: el código debe ser único
create unique index idx_leads_codigo_agenda_unique on leads(codigo_agenda)
  where codigo_agenda is not null;

create index idx_leads_campos_custom_gin on leads using gin (campos_custom);
create index idx_leads_comunidad_email on leads(comunidad_email) where comunidad_email is not null;

-- ── notas_tareas — timeline de la ficha 360° ────────────────────────────────
create table notas_tareas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  tipo text not null check (tipo in ('nota', 'tarea')),
  contenido text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'completada')),
  fecha_vencimiento timestamptz,
  autor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notas_tareas_lead_id on notas_tareas(lead_id, created_at desc);
create index idx_notas_tareas_pendientes on notas_tareas(fecha_vencimiento)
  where tipo = 'tarea' and estado = 'pendiente' and fecha_vencimiento is not null;

create trigger trg_notas_tareas_updated_at
  before update on notas_tareas
  for each row execute function set_updated_at();

-- ── lead_actividad — log de actividad append-only ───────────────────────────
create table lead_actividad (
  id bigint generated always as identity primary key,
  lead_id uuid not null references leads(id) on delete cascade,
  tipo_evento text not null,   -- 'creacion' | 'cambio_etapa' | 'guardado_parcial_gina' | 'nota_agregada' | 'email_enviado' | ...
  descripcion text,
  payload jsonb,
  actor text,                  -- 'sistema' | 'gina' | 'admin:<email>' | null
  created_at timestamptz not null default now()
);

create index idx_lead_actividad_lead_id on lead_actividad(lead_id, created_at desc);

-- Append-only para EDICIONES: una fila de actividad no debe modificarse una vez escrita.
-- No se bloquea DELETE a propósito: bloquearlo también rompería el borrado en cascada
-- cuando se elimina un lead por un pedido RGPD de derecho al olvido (ON DELETE CASCADE
-- ejecuta un DELETE real sobre las filas hijas, y ese DELETE dispara igual cualquier
-- trigger BEFORE DELETE definido sobre la tabla hija).
create or replace function block_lead_actividad_update()
returns trigger as $$
begin
  raise exception 'lead_actividad es append-only: UPDATE no permitido';
end;
$$ language plpgsql;

create trigger trg_lead_actividad_no_update
  before update on lead_actividad
  for each row execute function block_lead_actividad_update();

-- ── RLS y permisos ───────────────────────────────────────────────────────────
-- Filosofía: estas 5 tablas se acceden SOLO server-side (API routes de /admin y de Gina) con
-- la service_role key (bypassea RLS por diseño en Supabase). Ningún cliente (anon/authenticated)
-- debe leer ni escribir estas tablas directamente — a diferencia de comunidad, que sí es pública.
-- No se toca la tabla comunidad existente ni sus policies.
alter table leads enable row level security;
alter table pipeline_etapas enable row level security;
alter table campos_custom_definiciones enable row level security;
alter table notas_tareas enable row level security;
alter table lead_actividad enable row level security;

-- Defensa en profundidad: revocar también el GRANT de tabla, no solo confiar en RLS.
revoke all on leads from anon, authenticated;
revoke all on pipeline_etapas from anon, authenticated;
revoke all on campos_custom_definiciones from anon, authenticated;
revoke all on notas_tareas from anon, authenticated;
revoke all on lead_actividad from anon, authenticated;

-- No se crea ninguna policy para anon/authenticated: RLS habilitado + cero policies = deny-all.
-- service_role no se toca (bypassea RLS y conserva sus grants de schema por defecto de Supabase).

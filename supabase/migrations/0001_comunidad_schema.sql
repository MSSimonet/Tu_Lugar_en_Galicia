-- Comunidad de Acogida — tabla y políticas RLS
-- Ver docs/comunidad-de-acogida.md §5 para la especificación de datos.
--
-- CÓMO EJECUTAR (bloqueo real — no lo puede ejecutar Claude sin credenciales que hoy no
-- existen en .env.local): pegar este archivo completo en el SQL Editor del dashboard de
-- Supabase (Project → SQL Editor → New query) y correrlo una vez. Alternativa: `supabase db
-- push` con el proyecto linkeado vía `supabase login` (requiere OAuth interactivo).

create table if not exists comunidad (
  email          text primary key,
  id             uuid not null default gen_random_uuid() unique,
  nombre         text not null,
  foto_url       text,
  lat            double precision not null,
  lng            double precision not null,
  disponibilidad text[] not null default '{}',
  contacto       text,
  updated_at     timestamptz not null default now()
);

comment on table comunidad is 'Comunidad de Acogida — perfiles de residentes que ofrecen recibir a familias nuevas. Ver docs/comunidad-de-acogida.md.';
comment on column comunidad.email is 'Clave única del upsert silencioso (Paso 2 del flujo). Nunca se expone en el cliente del mapa — la query pública del mapa selecciona columnas explícitas, no "select *", y omite email a propósito.';
comment on column comunidad.id is 'UUID público, agregado sobre el modelo de datos del §5 del doc (que no lo incluye) para poder referenciar un perfil desde "enviar mensaje privado" sin exponer su email al remitente. No reemplaza a email como llave del upsert.';
comment on column comunidad.lat is 'Centro del círculo de privacidad de 200m — no es la dirección exacta del usuario.';
comment on column comunidad.lng is 'Centro del círculo de privacidad de 200m — no es la dirección exacta del usuario.';
comment on column comunidad.contacto is 'Teléfono/WhatsApp opcional. Si es null, el mapa ofrece "enviar mensaje privado" en vez de un link directo.';

alter table comunidad enable row level security;

-- Lectura pública: el mapa (§4 del doc) consume Supabase directo desde el cliente para
-- evitar el límite de 5 req/seg de Airtable. Esto es una decisión de arquitectura ya cerrada,
-- pero tiene una consecuencia de seguridad real: cualquiera con la anon key (pública en el
-- bundle del navegador) puede leer la tabla completa vía la REST API de Supabase sin pasar
-- por el formulario de registro — el "acceso solo tras registro" de la UI es un gate blando,
-- no uno impuesto por RLS. Ver el informe final de la sesión de implementación para el detalle.
create policy "comunidad_select_public"
  on comunidad for select
  to anon, authenticated
  using (true);

-- Escritura: solo el backend (service_role, que además bypassea RLS por defecto). No se
-- crean políticas de insert/update/delete para anon/authenticated — quedan denegadas
-- implícitamente al no existir policy que las permita.

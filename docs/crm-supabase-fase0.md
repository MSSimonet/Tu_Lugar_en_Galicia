# CRM Supabase — Fase 0: Schema y planes de migración

> **Estado: ✅ Aprobado — las 3 preguntas de §6 se resolvieron el 2026-07-12. Arranca Fase 1.**
> Decisión de negocio ya cerrada (2026-07-12): abandonar Airtable por completo, unificar el 100%
> del sistema (leads + comunidad) en Supabase/Postgres. No hay arquitectura híbrida, no hay
> dual-write, no queda ningún puente ni fallback a Airtable en ningún punto — ni en Gina, ni en
> Comunidad, ni en ningún endpoint futuro. La web no lanzó, solo hay datos de test: es la ventana
> ideal para hacerlo de una sola vez.
>
> Producido con `Database Optimizer` (schema) + `Backend Architect` (planes de reescritura),
> coordinados por `Agents Orchestrator`, con una revisión final que corrigió 3 problemas reales
> encontrados en la propuesta de los agentes (detallados inline con 🔧 **Corrección**). Ver §7 para
> el detalle de qué se corrigió y por qué.

---

## 0. Qué cubre este documento

1. **§1 — Schema completo** (DDL): `leads` (reemplazo 1:1 de Airtable), `pipeline_etapas` (Kanban
   editable), `campos_custom_definiciones` (JSONB sin migraciones), `notas_tareas` (timeline),
   `lead_actividad` (activity log), revisión de `comunidad` (ya existe, no se toca), RLS.
2. **§2 — Plan de reescritura** de los 3 puntos de guardado de Gina (`guardar_nivel1`,
   `guardar_lead_parcial`, `guardar_lead_completo`) contra Supabase, preservando la garantía de
   "el lead nunca se pierde aunque el guardado inicial falle".
3. **§3 — Plan de eliminación** del puente Supabase→Airtable de Comunidad (ejecutar en Fase 5).
4. **§4 — Lista completa** de referencias a Airtable en el repo, para trackear que Fase 5 las
   elimine todas.
5. **§5 — Hallazgo nuevo, fuera del alcance original**: `/api/contacto` guarda directo a Airtable
   sin pasar por `lib/leads.ts` — no estaba cubierto por el plan de reescritura y necesita su
   propia migración en Fase 1.
6. **§6 — Preguntas abiertas** que necesitan tu decisión antes o durante la Fase 1.
7. **§7 — Correcciones aplicadas** a la propuesta original de los agentes, con la razón técnica.

---

## 1. Schema completo (DDL)

### 1.0 Extensión y función compartida

```sql
create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

### 1.1 Decisión de tipos: `text` en vez de enum nativo para valores de negocio

Los campos de selección definidos por `lib/gina/flow.json` y el formulario `/conocernos` van a
seguir evolucionando (nuevas opciones, nuevas ciudades, nuevas garantías) sin que eso deba ser un
evento de infraestructura. Un `CREATE TYPE ... AS ENUM` tiene el mismo problema que un `CHECK`:
agregar un valor exige una migración. Como el propio panel admin va a permitir campos y etapas
custom **sin migraciones**, sería inconsistente que el resto del schema sí las exigiera por cada
opción nueva de un desplegable.

**Decisión:** todos los campos de selección de negocio son `text` (o `text[]` para multiselect),
sin `CHECK`. La validez la garantiza Zod en la capa de aplicación (mismo criterio que ya usa hoy
el proyecto: Airtable tampoco valida server-side más allá del tipo de columna). Sí se usa `CHECK`
en campos **estructurales** (parte fija del motor, no del contenido de negocio de Gina):
`fuente_lead`, `notas_tareas.tipo/estado`, `campos_custom_definiciones.tipo`.

### 1.2 Convención de nombres

Columnas en `snake_case` (estándar Postgres/Supabase), no camelCase. El mapeo
`camelCase (LeadData) ↔ snake_case (columnas)` vive en un único punto de la capa de aplicación
(ver §2.1) — evita columnas citadas (`"nombreCompleto"`) que complican cualquier SQL/RLS futuro.

### 1.3 Orden de creación (🔧 corregido — ver §7.2)

`pipeline_etapas` y `campos_custom_definiciones` se crean **antes** que `leads`, porque `leads`
las referencia por FK.

```sql
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
```

**Por qué `orden numeric(12,4)` sin `unique`:** en un Kanban con drag-and-drop, mover una tarjeta
entre otras dos exige poder insertarla "entre 20 y 30" sin renumerar toda la tabla. Con
`numeric(12,4)` el nuevo valor es el punto medio (`25.0000`) — mismo patrón (fractional
indexing/"lexorank") que usan Trello y Linear. El índice único parcial en `es_default` garantiza
una sola etapa fallback.

**Relación `etiqueta` (scoring) vs `etapa_id` (Kanban):** son conceptos distintos, ambos se
conservan. `leads.etiqueta` sigue siendo la clasificación automática que calcula el motor de
scoring en cada guardado (no cambia su lógica). `etapa_id` es la posición manual que el equipo
mueve en el tablero. Al crear un lead, la aplicación busca la etapa cuyo `etiqueta_origen` matchea
`lead.etiqueta`; si `etiqueta` es null (guardado parcial de Gina antes de completar el scoring) o
no matchea ninguna, usa la marcada `es_default = true`.

**Seed por defecto:**

```sql
insert into pipeline_etapas (nombre, orden, color, etiqueta_origen, es_default) values
  ('Incompleto',            10, '#9CA3AF', 'incompleto',            true),
  ('Lead en preparación',   20, '#60A5FA', 'lead-en-preparacion',   false),
  ('Seguimiento futuro',    30, '#FBBF24', 'seguimiento-futuro',    false),
  ('Califica',              40, '#34D399', 'califica',              false),
  ('Contacto directo',      50, '#F472B6', 'contacto-directo',      false);
```

```sql
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
```

`tipo` sí lleva `CHECK` aquí: no es una opción de negocio de Gina, es el conjunto fijo de widgets
que el panel sabe renderizar — cambiarlo ya es un cambio de código de todos modos.

### 1.4 Tabla `leads` — reemplazo 1:1 de Airtable

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),

  -- Datos personales — 🔧 corregido: solo email/nombre son universales (ver §8)
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

  -- Logística — 🔧 corregido: NO es una fecha real, es un bucket categórico (ver §7.1)
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
  consentimiento_rgpd_at timestamptz,   -- evidencia RGPD: cuándo se dio el consentimiento

  -- Origen del lead (estructural) — 🔧 ampliado: 'contacto' es un tercer origen real (ver §8)
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
  'Único campo de contenido, junto con email, garantizado en los 4 orígenes de leads (Gina nivel1/parcial/completo, formulario web, contacto). Todo lo demás es nullable — ver §8.';

create trigger trg_leads_updated_at
  before update on leads
  for each row execute function set_updated_at();
```

**Nota sobre `email`:** no es `unique`. Airtable permite reenvíos del mismo email
(`findLeadByEmail` busca, no upsertea a ciegas); forzar unicidad rompería ese comportamiento. Se
indexa igual para performance.

**Índices:**

```sql
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
```

Índices GIN sobre los `text[]` (`garantias`, `mascota_tipo`, `comodidades`, `imprescindibles`) se
dejan fuera por ahora (YAGNI): son campos de exhibición en la ficha del lead, no de filtrado
masivo en el dashboard. Se agregan después con `CREATE INDEX CONCURRENTLY` si aparece esa
necesidad.

### 1.5 `notas_tareas` — timeline de la ficha 360°

```sql
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
```

`estado` se comparte entre `nota` y `tarea` por simplicidad (YAGNI: no se separan en dos tablas).

### 1.6 `lead_actividad` — log de actividad append-only (🔧 corregido — ver §7.3)

```sql
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
-- (No se bloquea DELETE — ver §7.3: bloquearlo también habría roto el borrado en cascada
-- cuando se elimina un lead por un pedido RGPD de derecho al olvido.)
create or replace function block_lead_actividad_update()
returns trigger as $$
begin
  raise exception 'lead_actividad es append-only: UPDATE no permitido';
end;
$$ language plpgsql;

create trigger trg_lead_actividad_no_update
  before update on lead_actividad
  for each row execute function block_lead_actividad_update();
```

`id bigint identity` en vez de `uuid`: es un log de alto volumen, estrictamente cronológico y sin
necesidad de ser impredecible externamente — mejor localidad de índice, desempata timestamps
iguales de forma barata.

### 1.7 Revisión de `comunidad` (ya existe en producción — no se toca)

**No hace falta ningún cambio en el schema de `comunidad`.** RLS en Postgres es por-tabla: una
policy abierta en `comunidad` no afecta a `leads` ni viceversa. La única adición es el FK opcional
`leads.comunidad_email` (ya incluido en §1.4) para que la ficha admin pueda mostrar "esta persona
también está en el mapa de comunidad" — nullable, sin trigger, sin forzar unicidad del lado de
`leads` (el mismo email puede volver a pasar por el formulario más de una vez).

No se toca la política `comunidad_select_public` ni el modelo de permisos por columna que ya
oculta `email` vía `GRANT` — sigue siendo correcto tal cual está.

### 1.8 RLS y permisos

Filosofía: `leads`, `pipeline_etapas`, `campos_custom_definiciones`, `notas_tareas` y
`lead_actividad` se acceden **solo** server-side (API routes de `/admin` y de Gina) con la
`service_role` key (bypassea RLS por diseño en Supabase). Ningún cliente (`anon`/`authenticated`)
debe leer ni escribir estas tablas directamente — a diferencia de `comunidad`, que sí es pública.

```sql
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
```

Si en el futuro `/admin` migra a sesiones reales de Supabase Auth (hoy usa su propio esquema de
tokens HMAC, ver §6.1), ahí valdría la pena escribir policies condicionadas a
`auth.jwt() ->> 'role' = 'admin'` en vez de depender 100% de `service_role` — señalado como
decisión futura, no se implementa ahora (YAGNI).

### 1.9 Resumen de decisiones no obvias

| Decisión | Dónde | Por qué |
|---|---|---|
| `text` sin `CHECK` para valores de negocio | `leads.*` | Evita migraciones cada vez que `flow.json` gana una opción |
| `CHECK` sí en campos estructurales | `fuente_lead`, `notas_tareas.tipo/estado`, `campos_custom_definiciones.tipo` | No dependen del contenido de negocio |
| `etiqueta` (scoring) ≠ `etapa_id` (Kanban) | `leads` | Uno es automático, el otro es posición manual movible |
| `orden numeric(12,4)` sin unique | `pipeline_etapas` | Fractional ordering: insertar entre dos etapas sin renumerar |
| `fecha_llegada` como `text`, NO `date` | `leads` | 🔧 Corregido — es un bucket categórico, no una fecha parseable (ver §7.1) |
| `inicio_contrato` eliminado del schema | `leads` | Confirmado código muerto en todo el repo — ver §6.3 |
| `codigo_agenda` con unique parcial | `leads` | `validateCodigoAgenda` necesita resolver a exactamente un lead |
| Solo `nombre_completo`/`email` `not null`, resto nullable | `leads` | 🔧 Corregido post-aprobación — no todos los orígenes (contacto, nivel1 de Gina) tienen el resto de campos (ver §8) |
| `id bigint identity` en vez de `uuid` | `lead_actividad` | Log de alto volumen, cronológico, sin necesidad de opacidad externa |
| Solo bloquear UPDATE, no DELETE | `lead_actividad` | 🔧 Corregido — bloquear DELETE rompía el borrado en cascada RGPD (ver §7.3) |
| `comunidad_email` como FK nullable, sin cascada dura | `leads` | Cruce informativo, no relación obligatoria |
| Deny-all (RLS + revoke) sin policies para anon/authenticated | tablas nuevas | Todo el acceso pasa por `service_role` server-side |
| `consentimiento_rgpd_at` (nuevo) | `leads` | Cumple CLAUDE.md §7: poder probar *cuándo* se dio el consentimiento |

---

## 2. Plan de reescritura de los 3 puntos de guardado de Gina

### 2.0 Decisiones previas

- **Nombres de columna:** `snake_case` en Postgres, mapeo explícito `camelCase → snake_case` en un
  único punto nuevo (`toRow()`), análogo a lo que hoy hace `guardarEnAirtable`.
- **Forma de retorno de los repositorios:** las nuevas funciones deben devolver
  `{ id: string, createdTime: string, fields: Record<string, unknown> }` — la misma forma que usa
  hoy `lib/admin/airtable.ts` — para que los templates de email de `recordatorio-silvana` y
  `resumen-diario` (250-430 líneas cargadas de `record.fields.xxx`) no necesiten reescribirse.

### 2.1 Cambios en `lib/leads.ts`

1. Sustituir los `fetch()` a la REST API de Airtable por `@supabase/supabase-js` con la
   `service_role` key. Generalizar `getSupabaseServerClient()` (hoy en `lib/comunidad/supabase.ts`)
   a un módulo compartido (p. ej. `lib/supabase/serverClient.ts`), porque leads y comunidad van a
   apuntar al mismo proyecto Supabase.
2. Mantener la firma pública para minimizar el diff en `app/api/gina/route.ts`:
   ```ts
   export async function saveLead(data: LeadData, leadId?: string): Promise<string>
   export async function getLead(leadId: string): Promise<LeadData>
   ```
3. `LeadData` (el tipo) **no cambia**. El mapeo vive en una función nueva y privada,
   `toRow(data: LeadData): Record<string, unknown>`.
4. **La regla "solo incluir un campo si fue respondido" se hereda gratis.** `supabase-js`
   serializa el body a JSON igual que hoy (`JSON.stringify` omite claves `undefined`) — mismo
   patrón `campo ? valor : undefined`, sin cambios. Punto de atención real: nunca mandar `null`
   explícito para "no respondido" — en un `update`/`upsert` de PostgREST, `null` SÍ pisa la
   columna existente, una clave ausente no la toca. El patrón actual ya usa siempre `undefined`,
   así que esto no requiere cambios de código, pero conviene un smoke test real antes de cerrar el
   punto.

### 2.2 De "recordId" de Airtable a "id" (uuid) de Supabase

1. Renombrar en `lib/gina/session.ts`: `airtableRecordId` → `leadId`, `airtableRecordSig` →
   `leadIdSig`. El patrón HMAC se mantiene idéntico.
2. **`lib/admin/tokens.ts` no necesita ningún cambio** — ya es agnóstico del backend (firma un
   string opaco).
3. La verificación IDOR en `app/api/gina/route.ts` (líneas 96-110) se mantiene con la misma
   lógica, solo renombrando variables.
4. **Cambio de formato con impacto real:** los ids de Airtable son `rec` + 14 alfanuméricos
   (`^rec[a-zA-Z0-9]{14}$`); los de Supabase son UUID v4. Ese regex está hardcodeado en:
   - `app/api/admin/habilitar-agenda/[recordId]/route.ts:36`
   - `app/api/plan/[recordId]/pdf/route.ts:36` (no estaba en el pedido original, encontrado en la
     lectura — también usa `getLead()` y el mismo regex)
   - `app/admin/lead/[recordId]/page.tsx:204`

   Extraer un único helper `isValidUuid()` (ya existe una implementación idéntica en
   `app/api/comunidad/mensaje/route.ts:26`) a `lib/utils/validation.ts` en vez de duplicar el
   regex una vez más.

### 2.3 Reintentos (`conReintentos`) y fallback "no perder el lead"

**Diseño base (preserva la garantía actual sin cambios de comportamiento):**

```ts
export async function saveLead(data: LeadData, leadId?: string): Promise<string> {
  const supabase = getSupabaseServerClient()
  const row = toRow(data)
  if (leadId) {
    const { data: r, error } = await supabase.from('leads').update(row).eq('id', leadId).select('id').single()
    if (error) throw new Error(`Supabase update leads: ${error.message}`)
    return r.id
  }
  const { data: r, error } = await supabase.from('leads').insert(row).select('id').single()
  if (error) throw new Error(`Supabase insert leads: ${error.message}`)
  return r.id
}
```

Si `guardar_nivel1` falla tras 3 intentos, `sesion.leadId` sigue `undefined`, y el guardado final
llama a `saveLead` sin `leadId` → hace `insert` (equivalente al POST-fallback actual) → el lead
nunca se pierde. `conReintentos` no requiere cambios.

**Mejora recomendada, opcional para el primer corte:** hay un riesgo preexistente (no reportado
antes, no es nuevo de la migración): `conReintentos` reintenta la función completa hasta 3 veces;
en `guardar_nivel1` cada intento hace un POST/insert nuevo e independiente. Si un intento falla en
el cliente por un motivo ambiguo (timeout justo después de que el servidor ya escribió la fila)
pero en realidad sí creó el registro, un reintento posterior crea una **fila duplicada** — no hay
clave de idempotencia entre reintentos. Con Supabase se puede cerrar barato: generar el `leadId`
una sola vez antes de entrar al loop de reintentos (`sesion.leadId ?? crypto.randomUUID()`), y que
cada intento haga `upsert(row, { onConflict: 'id' })` con ese mismo id fijo. Esto no cierra la
ambigüedad cross-call (si nivel1 responde ambiguo y el cliente nunca se entera de su id), pero sí
cierra el caso más común (duplicado por reintento dentro de la misma llamada).

### 2.4 Función que reemplaza a `guardarEnAirtable`

`guardarEnSupabase(sesion, incluirCalificacion, esGuardadoCompleto): Promise<string>` con
**exactamente la misma lógica de negocio** (cálculo de `calificacion`, derivación de `etiqueta` con
las mismas 4 reglas de prioridad, mapeo campo-por-campo). Único cambio real: la última línea pasa
de `saveLead(lead, sesion.airtableRecordId)` a `saveLead(lead, sesion.leadId)` — el resto del
cuerpo no cambia una línea.

### 2.5 Multiselect con exclusión mutua

Confirmado: el mapeo a `text[]` de Postgres es directo — `supabase-js` acepta arrays JS nativos
sin serialización manual (a diferencia de `lib/comunidad/airtable.ts`, que hace `.join(',')` por
una limitación de esa tabla Airtable específica). El patrón actual de `garantias`/`mascotaTipo`/
`imprescindibles`/`comodidades` se copia literal a `toRow()`.

### 2.6 Endpoints de admin — función equivalente que necesita cada uno

| Archivo | Usa hoy | Reemplazo Supabase |
|---|---|---|
| `app/api/admin/habilitar-agenda/[recordId]/route.ts` | `getRecord`, `patchRecord` | `.select('*').eq('id', leadId).single()`; `.update(fields).eq('id', leadId)`. Cambiar regex de validación de id. |
| `app/api/admin/expirar-codigos/route.ts` | `getLeadsConCodigoActivo`, `patchRecord` | `.select('*').not('codigo_agenda','is',null).neq('codigo_agenda','').neq('codigo_agenda','expirado')`, filtrando antigüedad en JS o en SQL. |
| `app/api/admin/recordatorio-silvana/route.ts` | `getLeadsConCitaProxima` | Adaptador `{id, createdTime, fields}` (ver §2.0) para no reescribir los templates HTML. |
| `app/api/admin/resumen-diario/route.ts` | `listAllRecords(filterByFormula)`, `patchRecord` | `.in('calificacion', [...])`, mismo adaptador. Sin paginación manual — ver riesgo en §2.7. |
| `app/api/webhooks/calcom/route.ts` | `findLeadByEmail`, `patchRecord` | `.ilike('email', email)` o columna generada (§2.7); aprovechar para pasar `cita_agendada` a booleano real. |
| `app/admin/lead/[recordId]/page.tsx` | `getRecord` | Mismo adaptador; cambiar regex de validación de id. |
| `app/api/plan/[recordId]/pdf/route.ts` | `getLead()` de `lib/leads.ts` | Se resuelve automáticamente al migrar §2.1, pero también tiene el regex `^rec[...]` hardcodeado — no olvidar. |

### 2.7 Riesgos y casos límite a vigilar en la implementación

1. **Regex de formato de id en 4 archivos** — si se olvida uno, ese endpoint devuelve 400 a todo
   tras el cutover. Centralizar en un solo helper reduce el riesgo.
2. **Case-sensitivity de email:** Gina hoy NO normaliza `email` a minúsculas al guardar, pero
   `findLeadByEmail` sí compara case-insensitive. Usar `.ilike('email', email)` para el primer
   corte, o una columna generada `email_lower` con índice si crece el volumen.
3. **`citaAgendada` como string `'true'`** (rareza heredada del "single select" de Airtable) →
   cambiar a `boolean` real y actualizar el único punto de escritura (`webhooks/calcom`) y el único
   de lectura (`getLeadsConCitaProxima`) en el mismo cambio — actualizar uno sin el otro rompe el
   recordatorio.
4. **`codigoAgenda` case-insensitive** (`UPPER()` en Airtable) — decidir guardarlo siempre en
   mayúsculas al generarse y comparar con `.eq()` plano.
5. **Límite de filas por defecto de PostgREST** (1000) en `resumen-diario` y `expirar-codigos`, que
   hoy paginan manualmente sobre Airtable sin límite. Irrelevante con el volumen actual
   (pre-lanzamiento), documentado para revisar si crece.
6. **Variable de entorno inconsistente:** `.env.local.example` define `NEXT_PUBLIC_SUPABASE_URL`,
   pero `lib/comunidad/supabase.ts:13` lee `SUPABASE_URL ?? NEXT_PUBLIC_SUPABASE_URL` como
   fallback. Fijar un solo nombre canónico ahora que se comparte el cliente entre leads y
   comunidad.
7. **Sin datos que migrar** (confirmado: solo datos de test) — no hace falta plan de backfill,
   solo creación de esquema + cutover. Se recomienda igual un smoke test real de punta a punta
   (nivel1 → parcial/completo) contra Supabase real antes de dar la migración por cerrada.
8. **Reparto de carriles (CLAUDE.md §3):** el SQL de `leads`/etc. (columnas, tipos, índices,
   constraints, RLS) es trabajo de `Database Optimizer`; la función de acceso a datos en
   `lib/leads.ts` y los cambios en `/app/api` son de `Backend Architect`. Dividir en dos tareas
   separadas en la Fase 1.

---

## 3. Plan de eliminación del puente Supabase→Airtable de Comunidad

> Se ejecuta en **Fase 5** (después de que §2 también se implemente). Documentado ahora para no
> perderlo.

### 3.1 Confirmación de que no rompe nada más

`upsertComunidadByEmail` y `ComunidadAirtableFields` se usan **únicamente** en:
- `lib/comunidad/airtable.ts` (definición)
- `app/api/comunidad/registro/route.ts` (import línea 7, llamada línea 156)

`app/api/comunidad/mensaje/route.ts` **no usa nada de este puente** — no requiere cambios. No hay
tests que referencien estos símbolos.

### 3.2 Archivo a eliminar por completo

**`lib/comunidad/airtable.ts`** — el archivo entero (interfaz, `mapearParaAirtable`, `config()`,
`findComunidadByEmail`, `upsertComunidadByEmail`). Nada reutilizable para otro propósito.

### 3.3 Cambios en `app/api/comunidad/registro/route.ts`

1. Eliminar `import { upsertComunidadByEmail } from '@/lib/comunidad/airtable'` (línea 7).
2. Eliminar la variable `ahora = new Date().toISOString()` (línea 144) — solo se usaba para el
   `updated_at` manual del puente; `upsertPerfilComunidad` ya calcula el suyo internamente.
3. Reemplazar el `Promise.allSettled([...])` (líneas 146-166) por una llamada directa:
   ```ts
   let perfil
   try {
     perfil = await upsertPerfilComunidad({
       email, nombre, fotoUrl,
       lat: coords.lat, lng: coords.lng,
       disponibilidad, contacto,
     })
   } catch (err) {
     console.error(`[comunidad/registro] Supabase upsert falló — ts: ${new Date().toISOString()}`, err instanceof Error ? err.name : 'unknown')
     return NextResponse.json({ error: 'No se pudo completar el registro. Intenta de nuevo.' }, { status: 500 })
   }
   ```
   Preserva el mismo mensaje y código 500 que hoy devuelve la rama rechazada de Supabase — solo
   cambia el control de flujo, no el comportamiento observable.
4. Eliminar el manejo de `resultadoAirtable` (líneas 174-177).
5. Actualizar el comentario de las líneas 137-143 ("doble escritura en paralelo — Vía B") por uno
   de una línea: registro escribe solo en Supabase.
6. El resto del archivo (validaciones, rate limiting, geocodificación) queda intacto.

### 3.4 Cambios en `.env.local.example`

Eliminar solo las líneas 40-42 (`AIRTABLE_COMUNIDAD_TABLE_NAME` y su comentario). No tocar
`AIRTABLE_API_KEY`/`AIRTABLE_BASE_ID`/`AIRTABLE_TABLE_NAME` en este paso — esas se retiran recién
cuando §2 (leads) también esté migrado, en la propia limpieza de Fase 5 (ver §4).

### 3.5 Fuera de alcance de este plan (pero a trackear)

- `docs/comunidad-de-acogida.md` §3 y §7 describen la "Vía B" como arquitectura vigente — quedará
  desactualizado. Actualizar ese doc es carril de `Product Manager`/`Software Architect`
  (dueños de `/docs`), no de `Backend Architect`.
- La tabla "Comunidad" en Airtable (producción) no se borra por este cambio — deja de recibir
  escrituras nuevas. Su archivado/eliminación es una decisión operativa aparte.

---

## 4. Lista completa de referencias a Airtable en el repo

Relevamiento por grep de todo el árbol (38 archivos). Categorizado para trackear qué debe migrar
en Fase 1 vs. qué solo se actualiza como documentación en Fase 5.

### 4.1 Código funcional — requiere migración real

| Archivo | Qué usa | Cuándo migra |
|---|---|---|
| `lib/leads.ts` | `saveLead`/`getLead`, tipo `LeadData` | Fase 1 |
| `app/api/gina/route.ts` | 3 puntos de guardado | Fase 1 |
| `lib/gina/session.ts` | `airtableRecordId`/`airtableRecordSig` | Fase 1 (renombrar) |
| `lib/gina/sessionStorage.ts` | comentario "lead ya enviado a Airtable" | Fase 1 |
| `lib/admin/airtable.ts` | todo el CRUD admin (`getRecord`, `patchRecord`, `listAllRecords`, `findLeadByEmail`, `validateCodigoAgenda`, `getLeadsConCodigoActivo`, `getLeadsConCitaProxima`) | Fase 1 |
| `app/api/lead/route.ts` | formulario web → `saveLead` | Fase 1 |
| **`app/api/contacto/route.ts`** | **guardado directo con `fetch()` propio a la REST API — NO pasa por `lib/leads.ts`** | Fase 1 — ver §5, hallazgo nuevo |
| `app/api/admin/habilitar-agenda/[recordId]/route.ts` | `getRecord`, `patchRecord` | Fase 1 |
| `app/api/admin/expirar-codigos/route.ts` | `getLeadsConCodigoActivo`, `patchRecord` | Fase 1 |
| `app/api/admin/recordatorio-silvana/route.ts` | `getLeadsConCitaProxima` | Fase 1 |
| `app/api/admin/resumen-diario/route.ts` | `listAllRecords`, `patchRecord` | Fase 1 |
| `app/api/webhooks/calcom/route.ts` | `findLeadByEmail`, `patchRecord` | Fase 1 |
| `app/api/plan/[recordId]/pdf/route.ts` | `getLead()` | Fase 1 |
| `app/admin/lead/[recordId]/page.tsx` | `getRecord`, regex de `recordId` | Fase 1 |
| `app/agenda/page.tsx` | `validateCodigoAgenda` | Fase 1 |
| `lib/plan/armador.ts` | comentario: "usa los nombres que Gina guarda en Airtable" | Fase 1 (actualizar comentario) |
| `lib/config/site.ts` | comentario histórico sobre validación de códigos | Fase 1 (actualizar comentario) |
| `.env.local.example` | `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`, `AIRTABLE_COMUNIDAD_TABLE_NAME` | Parcial en Fase 1 (comunidad), resto en Fase 5 |
| `test-gina-exhaustivo.ps1` | lee `sesion.airtableRecordId` en cada run de prueba | Fase 1 — **coordinar contigo antes de tocar tu script de testing** |
| `lib/comunidad/airtable.ts` | puente completo | Fase 5 (§3, eliminar archivo entero) |
| `app/api/comunidad/registro/route.ts` | invoca el puente | Fase 5 (§3) |

### 4.2 Solo documentación — se actualiza en Fase 5, no bloquea código

`README.md`, `CLAUDE.md` (§2, stack bloqueado), `docs/ARCHITECTURE.md`, `docs/roadmap.md`,
`docs/contexto-estrategico.md`, `docs/arranque.md`, `docs/pendientes-config.md`,
`docs/spec-flujo-agenda.md`, `docs/comunidad-de-acogida.md`, `docs/gina-flujo.md` (la tabla
"Mapa de campos → Airtable" pasa a "Mapa de campos → Supabase"), `docs/mapeo-gina-plan.md`,
`docs/archivo/auditoria-tecnica.md`, `docs/archivo/certificacion-fase-1.md`.

**Caso especial — `app/politica-de-privacidad/page.tsx`:** texto legal de cara al usuario que
menciona a "Airtable, Inc." como encargado del tratamiento de datos (RGPD). Esto no es solo
documentación interna — es contenido público con implicancia legal. Cuando Airtable se apague de
verdad (Fase 5), este texto debe actualizarse con el `Legal Compliance Checker` + la skill
`voz-tu-lugar-en-galicia`, no solo con un find-and-replace.

### 4.3 No relacionado — falso positivo del grep, ignorar

`.claude/skills/design-references/README.md` y
`.claude/skills/design-references/airtable/DESIGN.md` — son referencias de lenguaje visual de
Airtable.com para la skill de diseño de UI, sin ninguna relación con nuestra integración de datos.

---

## 5. Hallazgo nuevo: `/api/contacto` no pasa por `lib/leads.ts`

El plan de reescritura del §2 asumía que todo guardado de lead pasa por `saveLead()` de
`lib/leads.ts`. **No es así:** `app/api/contacto/route.ts` (formulario de contacto simple) hace su
propio `fetch()` inline a `https://api.airtable.com/v0/...` con
`AIRTABLE_API_KEY`/`AIRTABLE_BASE_ID`/`AIRTABLE_TABLE_NAME` leídos directo del entorno, sin usar el
tipo `LeadData` ni `saveLead()`. Guarda un registro con (al menos) `notasContacto` como campo
libre.

Esto significa que la Fase 1 necesita **un cuarto punto de migración**, no cubierto en el plan
original: reescribir el guardado de `/api/contacto` para usar la misma capa de datos Supabase
(`saveLead()` o un insert directo a `leads` con los campos mínimos que ese formulario captura). Es
de alcance pequeño (un solo endpoint, sin la complejidad de sesión/reintentos de Gina), pero hay
que incluirlo explícitamente en la lista de trabajo de Fase 1 para no perderlo.

---

## 6. Preguntas de §6 — resueltas (2026-07-12)

### 6.1 Auth de `/admin` — RESUELTO: NextAuth, cuenta única, dentro de Fase 1

**Decisión del usuario:** implementar ya, dentro de Fase 1, no diferirlo. Mecanismo: NextAuth
(Auth.js). Una sola cuenta (Silvana), sin roles ni multiusuario por ahora.

**Impacto en el schema:** **ninguno.** Con `next-auth` + `CredentialsProvider` + estrategia de
sesión `jwt` (sin adapter de base de datos), no hace falta ninguna tabla nueva — la única cuenta
válida se valida contra credenciales guardadas en variables de entorno (`ADMIN_EMAIL` +
`ADMIN_PASSWORD_HASH`, hash con `bcrypt`, nunca la contraseña en texto plano), y la sesión vive en
una cookie JWT firmada por `NEXTAUTH_SECRET`. Si en el futuro se necesita multiusuario/roles, ahí
sí conviene migrar a un adapter con tabla `usuarios_admin` en Supabase — no se construye ahora
(YAGNI), pero queda anotado como el punto de extensión natural.

**Impacto en alcance/tiempo de Fase 1:** se agrega como una pieza más de Fase 1, en paralelo al
resto (no la bloquea ni la bloquean):
- Nueva dependencia: `next-auth`.
- Archivos nuevos: `app/api/auth/[...nextauth]/route.ts` (config del provider), página de login
  (`app/admin/login/page.tsx` o similar), `middleware.ts` extendido para proteger todo `/admin/*`
  (hoy `middleware.ts` ya existe para CSP — se agrega la verificación de sesión ahí mismo, sin
  crear un middleware paralelo).
- Variables de entorno nuevas: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`,
  `ADMIN_PASSWORD_HASH`.
- Carril: `Backend Architect` implementa, `Security Engineer` revisa antes de merge (regla fija
  del proyecto para cualquier cosa de auth), sin depender del trabajo de `Database Optimizer` en
  el schema de `leads` — pueden avanzar en paralelo.
- Estimación: una tarea acotada de un día de trabajo de agente, no una fase aparte — no cambia la
  duración total de Fase 1 de forma significativa, pero sí agrega un ítem a su lista de tareas y a
  su checklist de cierre (login real probado end-to-end antes de certificar la fase).

### 6.2 Documento de referencia — SIN RESOLVER

El usuario indicó que dejaría `docs/Briefing_CRM_Tu_Lugar_en_Galicia.md` commiteado aparte. A la
fecha de esta actualización (2026-07-12), **el archivo sigue sin existir** en el working tree ni en
ningún commit del historial (`git log --all -- "*Briefing*"` no devuelve nada). No bloquea el inicio
de Fase 1 — este documento ya cubre todo lo pedido sin depender de él — pero queda pendiente de
confirmación: avisar cuando esté disponible para incorporar cualquier contexto adicional que
aporte.

### 6.3 `inicioContrato` — RESUELTO: código muerto, eliminado del schema

Grep exhaustivo en todo el repo (formularios, `flow.json`, mapper de `route.ts`, cualquier página):
- `lib/leads.ts` — declarado en el tipo `LeadData` y leído de vuelta en `getLead()`. Único lugar
  donde aparece.
- `app/api/gina/route.ts` (`guardarEnAirtable`) — **no aparece**: Gina nunca lo escribe (consistente
  con el propio comentario "omitido por Gina").
- `lib/gina/flow.json` — **no aparece**: ningún paso del cuestionario lo pregunta.
- `components/**` (incluyendo `FormularioDiagnostico.tsx` y sus subsecciones) — **no aparece**: cero
  `<input>`/`<select>` lo escribe, pese a que el comentario del tipo dice "obligatorio en el
  formulario web".

Conclusión: es un campo declarado que nunca tuvo una vía de escritura real, en ningún punto del
sistema. **Se elimina de `leads`** (ya no aparece en el DDL de §1.4) — no hay riesgo de pérdida de
datos porque no hay leads reales en producción (solo datos de test).

---

## 7. Correcciones aplicadas a la propuesta original — detalle técnico

Antes de mostrarte este documento, revisé la propuesta que devolvieron los agentes (no se acepta
en blanco: "un memo de un agente describe lo que intentó hacer, no necesariamente lo que hizo
bien"). Encontré y corregí 3 problemas reales:

### 7.1 `fecha_llegada` como `date` — incorrecto; `inicio_contrato` — eliminado tras verificación

La propuesta original de `Database Optimizer` tipaba `fecha_llegada date not null`, razonando que
"antes era texto libre pero representa una fecha real usada para alertas". **Verificado contra el
código real** (`docs/gina-flujo.md`, `components/conocernos/FormularioDiagnostico.tsx:558-562`,
`lib/gina/flow.json` paso `p4_plazo`): el valor SIEMPRE es un bucket categórico
(`menos-1-mes | 1-3-meses | 3-6-meses | mas-6-meses | sin-fecha`), nunca una fecha ISO parseable,
tanto en Gina como en el formulario web. Un `date not null` habría hecho fallar el primer insert
real. Corregido a `text not null` (§1.4), consistente con la filosofía de "text sin CHECK para
valores de negocio" que la propia propuesta defendía en otros campos.

La misma propuesta también incluía `inicio_contrato date` junto a `fecha_llegada`, con el mismo
razonamiento. El usuario pidió (§6.3) verificar antes de decidir si ese campo entra al schema: el
grep exhaustivo confirmó que es código muerto (declarado en `LeadData`, sin ninguna vía de
escritura real en Gina, en `flow.json` ni en el formulario web) — se eliminó la columna por
completo en vez de retiparla.

### 7.2 Orden de creación de tablas — el DDL original no compilaba

La propuesta original definía `leads` (con `etapa_id references pipeline_etapas(id)`) en su §1,
antes de definir `pipeline_etapas` en su §2 — el `CREATE TABLE leads` habría fallado con
"relation pipeline_etapas does not exist". Corregido reordenando: `pipeline_etapas` y
`campos_custom_definiciones` se crean antes que `leads` (§1.3-1.4).

### 7.3 Trigger de `lead_actividad` bloqueaba su propio borrado en cascada RGPD

La propuesta original agregaba un trigger `BEFORE DELETE ... RAISE EXCEPTION` incondicional para
hacer la tabla "verdaderamente append-only", con la intención de que la única baja posible fuera
el `ON DELETE CASCADE` desde `leads`. **Esto no funciona en Postgres:** un `ON DELETE CASCADE`
ejecuta un `DELETE` real sobre las filas hijas, y ese `DELETE` dispara igual cualquier trigger
`BEFORE DELETE` definido sobre la tabla hija — incluyendo uno que siempre lanza una excepción. En
la práctica, intentar borrar un lead (por ejemplo, ante un pedido de derecho al olvido RGPD)
habría fallado con un error, porque el propio trigger bloqueaba la cascada que se suponía que debía
permitir. Corregido: el trigger solo bloquea `UPDATE` (edición de una fila ya escrita); `DELETE`
queda sin trigger propio, protegido igual por RLS + `revoke all` de `anon`/`authenticated` (§1.8) —
solo `service_role` puede borrar, y en la práctica solo lo hace la cascada desde `leads`.

---

## 8. Corrección post-aprobación (2026-07-12, al arrancar Fase 1)

Al empezar la implementación de `/api/contacto` (§5) se encontró que ese endpoint captura hoy
**solo** `nombreCompleto`, `email`, `telefono` (opcional) y el mensaje libre — nada de
`documentacion`, `situacionLaboral`, `ingresosMensuales`, `mascotas`, `ciudadDestino`,
`presupuestoMensual`, `amueblado` ni `paisResidencia`. El DDL de §1.4, ya aprobado, marcaba todos
esos campos `not null`, lo que habría hecho fallar el primer insert real de `/api/contacto` con una
violación de constraint.

El mismo problema existe, de forma más sutil, en el propio guardado `guardar_nivel1` de Gina: en
ese punto **solo** están respondidos `nombreCompleto`, `email` y `telefono` — el resto de los
campos "obligatorios" del DDL original tampoco existen todavía en ese momento. El código actual
(`app/api/gina/route.ts:267`) ya refleja esto en el tipo de TypeScript
(`Partial<LeadData> & Pick<LeadData, 'nombreCompleto' | 'email' | 'consentimientoRGPD'>`) — es
decir, el propio contrato de tipos de la aplicación ya admite que casi todo es opcional al momento
de guardar. El DDL debía reflejar esa misma realidad, no la forma "completa" de un lead que llegó
al final del cuestionario.

**Corrección aplicada a §1.4:** de todos los campos de contenido, solo `nombre_completo` y `email`
quedan `not null` — son los únicos presentes en los 4 orígenes de leads (Gina nivel1/parcial/
completo, formulario web `/conocernos`, `/api/contacto`). `telefono`, `pais_residencia`,
`mascotas`, `documentacion`, `situacion_laboral`, `ingresos_mensuales`, `ciudad_destino`,
`presupuesto_mensual`, `amueblado` y `fecha_llegada` pasan a nullable. Es una relajación de
constraints (siempre segura/retrocompatible, nunca al revés) — la completitud de un lead para
mostrarlo como "listo" en el dashboard se valida en la capa de aplicación (Zod), no en la base de
datos, exactamente como ya lo hacía Airtable de facto al no forzar columnas requeridas.

**Segundo ajuste relacionado:** `fuente_lead` tenía solo `'web' | 'gina'` en el `CHECK`, pero
`/api/contacto` es un tercer origen real (ya tiene su propia `etiqueta: 'contacto-directo'` en el
código actual) — forzarlo a `'web'` habría sido impreciso. Se amplía a
`check (fuente_lead in ('web', 'gina', 'contacto'))`. Cada uno de los 3 endpoints de guardado debe
setear su propio valor explícitamente; el `default 'web'` queda solo como red de seguridad del
`NOT NULL`, no como comportamiento esperado.

---

## Próximo paso

Ok recibido (2026-07-12). Alcance completo de **Fase 1**, para dividir por carriles:

1. **`Database Optimizer`** — ejecutar el DDL de §1 (con `inicio_contrato` ya excluido) como
   migración real en Supabase.
2. **`Backend Architect`** — implementar §2 (los 3 puntos de guardado de Gina) + el hallazgo de §5
   (`/api/contacto`), migrar los 7 endpoints de admin de §2.6.
3. **`Backend Architect` + `Security Engineer`** — auth de `/admin` con NextAuth (§6.1): provider,
   middleware, página de login, variables de entorno. En paralelo a 1 y 2, sin dependencias
   cruzadas.
4. Checklist de cierre de fase (`Reality Checker`): `tsc`/`build`/`eslint` en 0, loop de
   verificación de Gina de siempre (mismo email de prueba, incluyendo multiselect con exclusión
   mutua) contra Supabase real, y login real de `/admin` probado end-to-end antes de certificar.

Pendiente sin bloquear el inicio: §6.2 (ubicar `Briefing_CRM_Tu_Lugar_en_Galicia.md`).

---

## 9. Ajuste post-implementación (2026-07-12): dos timestamps de consentimiento RGPD

Al reportar el cierre de Fase 1, `consentimiento_rgpd_at` había quedado sin escribir (no estaba en
el pedido explícito de reescritura). El usuario decidió:

- `consentimiento_rgpd_at` — se re-escribe en **cada guardado** del lead (última confirmación).
  Implementado en `lib/leads.ts` (`toRow()` la estampa con `new Date().toISOString()` en cada
  llamada a `saveLead`).
- **`consentimiento_rgpd_primera_vez` (nueva columna)** — evidencia legal real de cuándo se dio el
  consentimiento por primera vez, que RGPD exige poder demostrar. A diferencia de la anterior, es
  **inmutable**: se fija una sola vez y ningún guardado posterior puede pisarla. La inmutabilidad
  se garantiza con un trigger de Postgres (`set_consentimiento_rgpd_primera_vez`, ver
  `supabase/migrations/0004_leads_schema.sql`), no con disciplina de la capa de aplicación — así
  la garantía se sostiene aunque en el futuro otro código escriba en la tabla `leads` sin pasar por
  `lib/leads.ts`. La aplicación nunca escribe este campo explícitamente; `toRow()` no lo incluye a
  propósito, dejando que el trigger sea la única autoridad.

Ambas columnas quedan expuestas en `LeadData` (`consentimientoRGPDAt`, `consentimientoRGPDPrimeraVez`)
para que el panel admin pueda mostrarlas en la ficha del lead más adelante.

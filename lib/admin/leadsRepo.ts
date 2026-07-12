/**
 * lib/admin/leadsRepo.ts — Operaciones sobre `leads` en Supabase para el panel de admin.
 *
 * Reemplaza lib/admin/airtable.ts (migración a Supabase, ver docs/crm-supabase-fase0.md).
 * Trabaja con `fields` en camelCase — mismo shape que ya consumían los templates de email
 * (recordatorio-silvana, resumen-diario, webhook de Cal.com) y
 * app/admin/lead/[recordId]/page.tsx — para no tener que reescribirlos. El mapeo a las
 * columnas snake_case reales de `leads` vive únicamente en este archivo.
 *
 * `plataformaVideollamada` y `horaCita` no tienen columna propia en el schema aprobado:
 * se guardan dentro de la columna jsonb `campos_custom` (pensada para campos ad-hoc sin
 * migración) y se exponen de vuelta al mismo nivel que el resto de `fields` al leer.
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'

export interface AirtableRecord {
  id: string
  createdTime: string
  fields: Record<string, unknown>
}

// camelCase (fields) → snake_case (columna real de `leads`)
const COLUMN_MAP: Record<string, string> = {
  nombreCompleto: 'nombre_completo',
  email: 'email',
  telefono: 'telefono',
  paisResidencia: 'pais_residencia',
  personas: 'personas',
  adultos: 'adultos',
  ninos: 'ninos',
  adolescentes: 'adolescentes',
  mascotas: 'mascotas',
  detalleMascotas: 'detalle_mascotas',
  mascotaTipo: 'mascota_tipo',
  cantidadPerros: 'cantidad_perros',
  cantidadGatos: 'cantidad_gatos',
  mascotaPeso: 'mascota_peso',
  documentacion: 'documentacion',
  situacionLaboral: 'situacion_laboral',
  ingresosMensuales: 'ingresos_mensuales',
  garantias: 'garantias',
  ciudadDestino: 'ciudad_destino',
  tipoInmueble: 'tipo_inmueble',
  presupuestoMensual: 'presupuesto_mensual',
  habitacionesMinimas: 'habitaciones_minimas',
  amueblado: 'amueblado',
  estacionamiento: 'estacionamiento',
  comodidades: 'comodidades',
  necesidadesEspeciales: 'necesidades_especiales',
  profesion: 'profesion',
  imprescindibles: 'imprescindibles',
  fechaLlegada: 'fecha_llegada',
  comoNosConociste: 'como_nos_conociste',
  calificacion: 'calificacion',
  etiqueta: 'etiqueta',
  notasContacto: 'notas_contacto',
  modalidad: 'modalidad',
  cuentaBancaria: 'cuenta_bancaria',
  comprendeHonorarios: 'comprende_honorarios',
  tipoLicencia: 'tipo_licencia',
  ciudadActual: 'ciudad_actual',
  tiempoEnEspana: 'tiempo_en_espana',
  objetivoBusqueda: 'objetivo_busqueda',
  nivelEstudios: 'nivel_estudios',
  comprendeServicio: 'comprende_servicio',
  consentimientoRGPD: 'consentimiento_rgpd',
  consentimientoRGPDAt: 'consentimiento_rgpd_at',
  consentimientoRGPDPrimeraVez: 'consentimiento_rgpd_primera_vez',
  fuenteLead: 'fuente_lead',
  codigoAgenda: 'codigo_agenda',
  fechaHabilitacion: 'fecha_habilitacion',
  citaAgendada: 'cita_agendada',
  fechaCita: 'fecha_cita',
  etapaId: 'etapa_id',
  comunidadEmail: 'comunidad_email',
}

const REVERSE_COLUMN_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(COLUMN_MAP).map(([camel, snake]) => [snake, camel]),
)

/** Convierte una fila de Supabase (snake_case + campos_custom) al shape {id, createdTime, fields} camelCase. */
function rowToRecord(row: Record<string, unknown>): AirtableRecord {
  const fields: Record<string, unknown> = {}
  for (const [snakeKey, value] of Object.entries(row)) {
    if (snakeKey === 'id' || snakeKey === 'created_at' || snakeKey === 'updated_at') continue
    if (snakeKey === 'campos_custom') {
      if (value && typeof value === 'object') Object.assign(fields, value as Record<string, unknown>)
      continue
    }
    const camelKey = REVERSE_COLUMN_MAP[snakeKey] ?? snakeKey
    fields[camelKey] = value
  }
  return {
    id: String(row.id),
    createdTime: typeof row.created_at === 'string' ? row.created_at : '',
    fields,
  }
}

/** Separa un objeto `fields` en camelCase (input de patchRecord) en columnas conocidas + resto (campos_custom). */
function splitFields(
  fields: Record<string, unknown>,
): { columns: Record<string, unknown>; custom: Record<string, unknown> } {
  const columns: Record<string, unknown> = {}
  const custom: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    const snakeKey = COLUMN_MAP[key]
    if (snakeKey) columns[snakeKey] = value
    else custom[key] = value
  }
  return { columns, custom }
}

/** Lee todos los campos de un lead por su id (uuid). Incluye `_createdTime` (ISO string) como campo especial de metadata. */
export async function getRecord(leadId: string): Promise<Record<string, unknown>> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).maybeSingle()
  if (error) throw new Error(`Supabase getRecord: ${error.message}`)
  if (!data) throw new Error(`Registro ${leadId} no encontrado`)
  const { fields, createdTime } = rowToRecord(data as Record<string, unknown>)
  return { ...fields, _createdTime: createdTime }
}

const EXPIRACION_MS = 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos

/**
 * Devuelve leads con código de agenda activo (no vacío, no 'expirado')
 * cuya fechaHabilitacion tiene más de 7 días de antigüedad.
 * Estos son candidatos a marcar como 'expirado'.
 */
export async function getLeadsConCodigoActivo(): Promise<AirtableRecord[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .not('codigo_agenda', 'is', null)
    .neq('codigo_agenda', '')
    .neq('codigo_agenda', 'expirado')
  if (error) throw new Error(`Supabase getLeadsConCodigoActivo: ${error.message}`)

  const ahora = Date.now()
  return (data as Record<string, unknown>[])
    .map(rowToRecord)
    .filter((r) => {
      const fechaHab = r.fields.fechaHabilitacion
      if (typeof fechaHab !== 'string' || !fechaHab) return false
      const ms = new Date(fechaHab).getTime()
      return !isNaN(ms) && ahora - ms > EXPIRACION_MS
    })
}

/**
 * Lista leads filtrados por calificación (usado por resumen-diario).
 * Reemplaza al listAllRecords(filterByFormula) de Airtable — PostgREST no tiene el
 * límite de 100/página de Airtable, no hace falta paginar manualmente.
 */
export async function listRecordsPorCalificacion(calificaciones: string[]): Promise<AirtableRecord[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from('leads').select('*').in('calificacion', calificaciones)
  if (error) throw new Error(`Supabase listRecordsPorCalificacion: ${error.message}`)
  return (data as Record<string, unknown>[]).map(rowToRecord)
}

/**
 * Verifica si un código de agenda es válido: existe en Supabase y no está expirado.
 * Devuelve false si el código tiene formato inválido, no existe, está expirado, o si
 * Supabase falla (fail-closed).
 */
export async function validateCodigoAgenda(code: string): Promise<boolean> {
  // Solo alfanumérico A-Z 0-9, longitud razonable
  if (!code || !/^[A-Z0-9]{1,20}$/i.test(code)) return false

  try {
    const supabase = getSupabaseServerClient()
    // generateAgendaCode() (lib/admin/codes.ts) siempre genera en mayúsculas — comparación exacta.
    const { data, error } = await supabase
      .from('leads')
      .select('id')
      .eq('codigo_agenda', code.toUpperCase())
      .neq('codigo_agenda', 'expirado')
      .limit(1)
    if (error) throw new Error(error.message)
    return (data?.length ?? 0) > 0
  } catch {
    return false
  }
}

/** Busca un lead por su email (case-insensitive). Devuelve null si no existe. */
export async function findLeadByEmail(email: string): Promise<AirtableRecord | null> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from('leads').select('*').ilike('email', email).limit(1)
  if (error) throw new Error(`Supabase findLeadByEmail: ${error.message}`)
  const row = data?.[0]
  return row ? rowToRecord(row as Record<string, unknown>) : null
}

/**
 * Devuelve leads con cita confirmada cuya fechaCita cae entre ahora y ahora + 75 minutos.
 * Usado por el recordatorio horario.
 */
export async function getLeadsConCitaProxima(): Promise<AirtableRecord[]> {
  const supabase = getSupabaseServerClient()
  const ahora = Date.now()
  const limite = ahora + 75 * 60 * 1000
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('cita_agendada', true)
    .gte('fecha_cita', new Date(ahora).toISOString())
    .lte('fecha_cita', new Date(limite).toISOString())
  if (error) throw new Error(`Supabase getLeadsConCitaProxima: ${error.message}`)
  return (data as Record<string, unknown>[]).map(rowToRecord)
}

/**
 * Actualiza solo los campos indicados de un lead existente (fields en camelCase).
 * Los campos sin columna propia (ej. plataformaVideollamada, horaCita) se guardan
 * en la columna jsonb `campos_custom`, mezclados con lo que ya hubiera ahí.
 */
export async function patchRecord(leadId: string, fields: Record<string, unknown>): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { columns, custom } = splitFields(fields)

  let update: Record<string, unknown> = { ...columns }

  if (Object.keys(custom).length > 0) {
    const { data: current, error: readError } = await supabase
      .from('leads')
      .select('campos_custom')
      .eq('id', leadId)
      .maybeSingle()
    if (readError) throw new Error(`Supabase patchRecord (lectura campos_custom): ${readError.message}`)
    const existing = (current?.campos_custom as Record<string, unknown> | null) ?? {}
    update = { ...update, campos_custom: { ...existing, ...custom } }
  }

  const { error } = await supabase.from('leads').update(update).eq('id', leadId)
  if (error) throw new Error(`Supabase patchRecord: ${error.message}`)
}

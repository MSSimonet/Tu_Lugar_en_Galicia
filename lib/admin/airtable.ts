/**
 * Operaciones crudas de Airtable para el panel de admin.
 * Trabaja con campos arbitrarios (no tipadas a LeadData).
 * Usa las mismas variables de entorno que lib/leads.ts.
 */

export interface AirtableRecord {
  id: string
  createdTime: string
  fields: Record<string, unknown>
}

function config() {
  const apiKey  = process.env.AIRTABLE_API_KEY
  const baseId  = process.env.AIRTABLE_BASE_ID
  const table   = process.env.AIRTABLE_TABLE_NAME
  if (!apiKey || !baseId || !table) {
    throw new Error('Airtable no configurado: faltan variables de entorno')
  }
  return {
    apiKey,
    baseUrl: `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
  }
}

/** Lee todos los campos de un registro por su recordId.
 *  Incluye `_createdTime` (ISO string) como campo especial de metadata. */
export async function getRecord(recordId: string): Promise<Record<string, unknown>> {
  const { apiKey, baseUrl } = config()
  const res = await fetch(`${baseUrl}/${recordId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (res.status === 404) throw new Error(`Registro ${recordId} no encontrado en Airtable`)
  if (!res.ok) throw new Error(`Airtable GET ${res.status}`)
  const data = (await res.json()) as { fields: Record<string, unknown>; createdTime?: string }
  return { ...data.fields, _createdTime: data.createdTime }
}

const EXPIRACION_MS = 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos

/**
 * Devuelve leads con código de agenda activo (no vacío, no 'expirado')
 * cuya fechaHabilitacion tiene más de 7 días de antigüedad.
 * Estos son candidatos a marcar como 'expirado'.
 */
export async function getLeadsConCodigoActivo(): Promise<AirtableRecord[]> {
  // Filtra en Airtable los registros con código activo (no vacío, no 'expirado')
  const records = await listAllRecords('AND({codigoAgenda}!="",{codigoAgenda}!="expirado")')
  const ahora   = Date.now()
  return records.filter(r => {
    const fechaHab = r.fields.fechaHabilitacion
    if (typeof fechaHab !== 'string' || !fechaHab) return false
    const ms = new Date(fechaHab).getTime()
    return !isNaN(ms) && ahora - ms > EXPIRACION_MS
  })
}

/** Lista registros de la tabla, paginando automáticamente (máx. 100/página).
 *  Si se pasa filterByFormula, Airtable filtra en origen y se evita descargar toda la tabla. */
export async function listAllRecords(filterByFormula?: string): Promise<AirtableRecord[]> {
  const { apiKey, baseUrl } = config()
  const records: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const url = new URL(baseUrl)
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)
    if (filterByFormula) url.searchParams.set('filterByFormula', filterByFormula)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`Airtable list ${res.status}`)

    const data = (await res.json()) as {
      records: Array<{ id: string; createdTime: string; fields: Record<string, unknown> }>
      offset?: string
    }
    records.push(...data.records)
    offset = data.offset
  } while (offset)

  return records
}

/**
 * Verifica si un código de agenda es válido: existe en Airtable y no está expirado.
 * Usa filterByFormula para hacer una sola consulta sin traer toda la tabla.
 * Devuelve false si el código tiene formato inválido, no existe o está expirado.
 * Devuelve false también si Airtable falla (fail-closed).
 */
export async function validateCodigoAgenda(code: string): Promise<boolean> {
  // Solo alfanumérico A-Z 0-9, longitud razonable — previene inyección de fórmula
  if (!code || !/^[A-Z0-9]{1,20}$/i.test(code)) return false

  const { apiKey, baseUrl } = config()
  // UPPER() para comparación case-insensitive; excluir 'expirado' explícitamente
  const formula = `AND(UPPER({codigoAgenda})=UPPER("${code}"),{codigoAgenda}!="expirado")`

  const params = new URLSearchParams({ filterByFormula: formula, maxRecords: '1' })
  params.append('fields[]', 'codigoAgenda')

  const res = await fetch(`${baseUrl}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Airtable validate ${res.status}`)

  const data = (await res.json()) as { records: unknown[] }
  return data.records.length > 0
}

/**
 * Busca un lead por su email usando filterByFormula.
 * Devuelve null si no existe. Lanza si Airtable falla.
 */
export async function findLeadByEmail(email: string): Promise<AirtableRecord | null> {
  const { apiKey, baseUrl } = config()
  // Sanitizar para evitar inyección de fórmula Airtable
  const safe    = email.replace(/['"\\]/g, '').toLowerCase()
  const formula = `LOWER({email})="${safe}"`
  const params  = new URLSearchParams({ filterByFormula: formula, maxRecords: '1' })

  const res = await fetch(`${baseUrl}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Airtable findByEmail ${res.status}`)

  const data = (await res.json()) as {
    records: Array<{ id: string; createdTime: string; fields: Record<string, unknown> }>
  }
  return data.records[0] ?? null
}

/**
 * Devuelve leads con cita confirmada cuya fechaCita (ISO string de Cal.com)
 * cae entre ahora y ahora + 75 minutos. Usado por el recordatorio horario.
 */
export async function getLeadsConCitaProxima(): Promise<AirtableRecord[]> {
  // Filtra en Airtable solo leads con cita confirmada — evita descargar toda la tabla
  const records = await listAllRecords('{citaAgendada}="true"')
  const ahora   = Date.now()
  const limite  = ahora + 75 * 60 * 1000

  return records.filter(r => {
    const fecha = r.fields.fechaCita
    if (typeof fecha !== 'string' || !fecha) return false
    const ms = new Date(fecha).getTime()
    return !isNaN(ms) && ms >= ahora && ms <= limite
  })
}

/** Actualiza solo los campos indicados de un registro existente (PATCH). */
export async function patchRecord(
  recordId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const { apiKey, baseUrl } = config()
  const res = await fetch(`${baseUrl}/${recordId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Airtable PATCH ${res.status}: ${msg}`)
  }
}

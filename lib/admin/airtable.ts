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
  const records = await listAllRecords()
  const ahora   = Date.now()
  return records.filter(r => {
    const codigo = r.fields.codigoAgenda
    if (typeof codigo !== 'string' || !codigo || codigo === 'expirado') return false
    const fechaHab = r.fields.fechaHabilitacion
    if (typeof fechaHab !== 'string' || !fechaHab) return false
    const ms = new Date(fechaHab).getTime()
    return !isNaN(ms) && ahora - ms > EXPIRACION_MS
  })
}

/** Lista todos los registros de la tabla, paginando automáticamente (máx. 100/página). */
export async function listAllRecords(): Promise<AirtableRecord[]> {
  const { apiKey, baseUrl } = config()
  const records: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const url = new URL(baseUrl)
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
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
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Airtable PATCH ${res.status}: ${msg}`)
  }
}

/**
 * Puente Supabase → Airtable, Vía B (docs/comunidad-de-acogida.md §3 y §7): esta función
 * hace en Airtable el mismo upsert-por-email que se hace en Supabase, para que ambos
 * queden sincronizados sin duplicar filas.
 *
 * Usa una tabla NUEVA y separada de "leads" (AIRTABLE_COMUNIDAD_TABLE_NAME) — no mezcla
 * los perfiles de comunidad con los leads comerciales de Gina.
 *
 * La tabla "Comunidad" ya existe en la base de Airtable de producción (verificado
 * 2026-07-10 probando campo por campo contra la tabla real, porque el token de
 * AIRTABLE_API_KEY no tiene permiso de lectura del schema vía la Metadata API). Difiere del
 * esquema de Supabase en 3 puntos — `mapearParaAirtable` traduce los tres:
 *   1. El nombre de la persona vive en el campo primario por defecto de Airtable,
 *      literalmente llamado "Name" (no "nombre") — Airtable lo crea así en toda tabla nueva
 *      y no se renombró al crear esta.
 *   2. `lat`/`lng` son campos de texto en esta tabla, no numéricos — hay que mandarlos como
 *      string o Airtable responde INVALID_VALUE_FOR_COLUMN.
 *   3. `disponibilidad` es texto plano (no "Multiple select") — se manda como string
 *      separado por comas, no como array.
 */

export interface ComunidadAirtableFields {
  email: string
  nombre: string
  foto_url?: string
  lat: number
  lng: number
  disponibilidad: string[]
  contacto?: string
  updated_at: string
}

/** Traduce del esquema interno (alineado con Supabase) al esquema real de la tabla Airtable. */
function mapearParaAirtable(fields: ComunidadAirtableFields): Record<string, unknown> {
  const { nombre, lat, lng, disponibilidad, ...resto } = fields
  return {
    ...resto,
    Name: nombre,
    lat: String(lat),
    lng: String(lng),
    disponibilidad: disponibilidad.join(', '),
  }
}

function config() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const table = process.env.AIRTABLE_COMUNIDAD_TABLE_NAME

  if (!apiKey || !baseId || !table) {
    throw new Error('Airtable Comunidad no configurado: falta AIRTABLE_COMUNIDAD_TABLE_NAME (u otras variables de Airtable)')
  }

  return {
    apiKey,
    baseUrl: `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
  }
}

/** Busca un perfil de comunidad por email. Devuelve null si no existe. */
async function findComunidadByEmail(
  email: string,
): Promise<{ id: string; fields: Record<string, unknown> } | null> {
  const { apiKey, baseUrl } = config()
  // Mismo saneo que lib/admin/airtable.ts:126 — evita inyección de fórmula Airtable.
  const safe = email.replace(/['"\\]/g, '').toLowerCase()
  const formula = `LOWER({email})="${safe}"`
  const params = new URLSearchParams({ filterByFormula: formula, maxRecords: '1' })

  const res = await fetch(`${baseUrl}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Airtable Comunidad findByEmail ${res.status}`)

  const data = (await res.json()) as {
    records: Array<{ id: string; fields: Record<string, unknown> }>
  }
  return data.records[0] ?? null
}

/**
 * Upsert real por email: si existe, hace PATCH solo de los campos con valor (no pisa
 * datos previos con vacíos — mismo comportamiento "silencioso" que pide el §2 del doc
 * para Supabase). Si no existe, crea el registro.
 */
export async function upsertComunidadByEmail(fields: ComunidadAirtableFields): Promise<void> {
  const { apiKey, baseUrl } = config()
  const existing = await findComunidadByEmail(fields.email)
  const camposAirtable = mapearParaAirtable(fields)

  if (existing) {
    const patchFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(camposAirtable)) {
      const isEmpty = value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0)
      if (!isEmpty) patchFields[key] = value
    }

    const res = await fetch(`${baseUrl}/${existing.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: patchFields }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`Airtable Comunidad PATCH ${res.status}`)
    return
  }

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: camposAirtable }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Airtable Comunidad POST ${res.status}`)
}

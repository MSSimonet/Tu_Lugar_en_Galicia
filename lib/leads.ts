/**
 * lib/leads.ts — Integración con Airtable para guardar leads del formulario de diagnóstico.
 *
 * IMPORTANTE: Las columnas en Airtable deben crearse manualmente con los nombres exactos
 * de las keys del tipo LeadData (camelCase). Por ejemplo: "nombreCompleto", "email",
 * "telefono", "paisResidencia", "personas", "mascotas", "detalleMascotas",
 * "documentacion", "situacionLaboral", "ingresosMensuales", "garantias",
 * "ciudadDestino", "presupuestoMensual", "habitacionesMinimas", "amueblado",
 * "estacionamiento", "fechaLlegada", "inicioContrato", "modalidad",
 * "comprendeServicio", "consentimientoRGPD".
 *
 * La tabla debe configurarse en Airtable con los tipos apropiados:
 *   - Campos de texto largo: "personas", "detalleMascotas", "ingresosMensuales"
 *   - Campo de múltiple selección: "garantias"
 *   - Campos de casilla (checkbox): "comprendeServicio", "consentimientoRGPD"
 *   - El resto pueden ser texto de línea simple o selección única
 */

export type LeadData = {
  // Datos personales
  nombreCompleto: string
  email: string
  telefono: string
  paisResidencia: string

  // Composición del grupo familiar
  personas: string
  mascotas: 'si' | 'no'
  detalleMascotas?: string

  // Situación legal y laboral
  documentacion: 'pasaporte-ue' | 'visado-tie-nie' | 'en-tramite' | 'turista'
  situacionLaboral:
    | 'empleado-remoto'
    | 'busca-empleo'
    | 'autonomo'
    | 'jubilado'
    | 'estudiante'
    | 'otro'
  ingresosMensuales: string

  // Capacidad de garantías
  garantias: (
    | 'adelanto-6-12'
    | 'aval'
    | 'seguro-impago'
    | 'ninguna'
  )[]

  // Preferencias de vivienda
  ciudadDestino:
    | 'vigo'
    | 'a-coruna'
    | 'santiago'
    | 'pontevedra'
    | 'lugo'
    | 'indiferente'
  presupuestoMensual: 'menos-700' | '700-1000' | '1000-1400' | 'mas-1400'
  habitacionesMinimas: '1' | '2' | '3' | '4+'
  amueblado: 'si' | 'no' | 'indiferente'
  estacionamiento: 'indispensable' | 'no' | 'deseable'

  // Plazos
  fechaLlegada: string
  inicioContrato: string
  modalidad: 'antes-de-viajar' | 'ya-estando'

  // Consentimientos
  comprendeServicio: boolean
  consentimientoRGPD: boolean
}

/**
 * Guarda un lead en Airtable.
 *
 * Requiere las variables de entorno:
 *   AIRTABLE_API_KEY   — Personal access token de Airtable
 *   AIRTABLE_BASE_ID   — ID de la base (de la URL: airtable.com/[ID]/...)
 *   AIRTABLE_TABLE_NAME — Nombre exacto de la tabla (ej: "Leads Fase 1")
 *
 * Lanza Error si las variables no están configuradas o si Airtable devuelve error.
 * No loguea datos personales del usuario.
 */
export async function saveLead(data: LeadData): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_TABLE_NAME

  if (!apiKey) {
    throw new Error(
      'Airtable no configurado: falta AIRTABLE_API_KEY. Ver .env.local.example'
    )
  }
  if (!baseId) {
    throw new Error(
      'Airtable no configurado: falta AIRTABLE_BASE_ID. Ver .env.local.example'
    )
  }
  if (!tableName) {
    throw new Error(
      'Airtable no configurado: falta AIRTABLE_TABLE_NAME. Ver .env.local.example'
    )
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: { ...data } }),
  })

  if (!response.ok) {
    let airtableMessage = `HTTP ${response.status}`
    try {
      const errorBody = await response.json() as { error?: { message?: string } }
      if (errorBody?.error?.message) {
        airtableMessage += `: ${errorBody.error.message}`
      }
    } catch {
      // No se pudo parsear el cuerpo — usar solo el status
    }
    throw new Error(`Error al guardar en Airtable — ${airtableMessage}`)
  }

  console.log('Lead guardado OK')
}

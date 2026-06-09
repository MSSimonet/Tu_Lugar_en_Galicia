/**
 * lib/leads.ts — Integración con Airtable para guardar leads del formulario de diagnóstico
 * y del cuestionario de Avoa.
 *
 * IMPORTANTE: Las columnas en Airtable deben existir con los nombres exactos
 * de las keys del tipo LeadData (camelCase). Columnas y tipos:
 *
 *   Texto corto (Single line):
 *     nombreCompleto, email, telefono, paisResidencia, ingresosMensuales,
 *     fechaLlegada, inicioContrato
 *
 *   Texto largo (Long text):
 *     personas, detalleMascotas, necesidadesEspeciales, profesion
 *
 *   Selección única (Single select):
 *     mascotas           → si | no
 *     documentacion      → espanol | ue-otro | residencia-aprobada | en-tramite |
 *                          nacionalidad-en-tramite | turista
 *     situacionLaboral   → cuenta-ajena | autonomo | teletrabajo-extranjero |
 *                          rentista | jubilado | estudiante | busca-empleo
 *     ciudadDestino      → vigo | a-coruna | santiago | pontevedra | lugo | indiferente
 *     tipoInmueble       → habitacion | estudio | piso | casa | co-living
 *     presupuestoMensual → menos-700 | 700-1000 | 1000-1400 | mas-1400
 *     habitacionesMinimas → 1 | 2 | 3 | 4+
 *     amueblado          → si | no | indiferente
 *     estacionamiento    → indispensable | deseable | no
 *     modalidad          → antes-de-viajar | ya-estando
 *     comoNosConociste   → redes-sociales | recomendacion | google | facebook | otro
 *
 *   Selección múltiple (Multiple select):
 *     garantias      → adelanto-6-12 | aval | seguro-impago | ninguna
 *     imprescindibles → ascensor | garaje | calefaccion | terraza | no   ← NUEVO (Avoa p24)
 *     comodidades    → transporte | zona-tranquila | cerca-colegios | internet | ninguna
 *
 *   Casilla (Checkbox):
 *     comprendeServicio, consentimientoRGPD
 *
 * Fuente del canal del lead (campo interno de Airtable, no viene del formulario):
 *   Se puede distinguir formulario web vs. Avoa via el campo "fuenteLead" si se añade.
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
  documentacion:
    | 'espanol'
    | 'ue-otro'
    | 'residencia-aprobada'
    | 'en-tramite'
    | 'nacionalidad-en-tramite'
    | 'turista'
  situacionLaboral:
    | 'cuenta-ajena'
    | 'autonomo'
    | 'teletrabajo-extranjero'
    | 'rentista'
    | 'jubilado'
    | 'estudiante'
    | 'busca-empleo'
  ingresosMensuales: string

  // Capacidad de garantías (selección múltiple)
  garantias: ('adelanto-6-12' | 'aval' | 'seguro-impago' | 'ninguna')[]

  // Preferencias de vivienda
  ciudadDestino: 'vigo' | 'a-coruna' | 'santiago' | 'pontevedra' | 'lugo' | 'indiferente'
  tipoInmueble?: 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living'
  presupuestoMensual: 'menos-700' | '700-1000' | '1000-1400' | 'mas-1400'
  habitacionesMinimas: '1' | '2' | '3' | '4+'
  amueblado: 'si' | 'no' | 'indiferente'
  estacionamiento?: 'indispensable' | 'deseable' | 'no'   // opcional: Avoa no pregunta por esto
  comodidades?: ('transporte' | 'zona-tranquila' | 'cerca-colegios' | 'internet' | 'ninguna')[]

  // Perfil adicional (Nivel 2 de Avoa)
  necesidadesEspeciales?: string
  profesion?: string

  // Características físicas del inmueble (selección múltiple — Avoa p24)
  imprescindibles?: ('ascensor' | 'garaje' | 'calefaccion' | 'terraza' | 'no')[]

  // Plazos y modalidad
  fechaLlegada: string
  inicioContrato?: string   // obligatorio en el formulario web, omitido por Avoa
  modalidad: 'antes-de-viajar' | 'ya-estando'

  // Atribución
  comoNosConociste?: 'redes-sociales' | 'recomendacion' | 'google' | 'facebook' | 'otro'

  // Consentimientos
  comprendeServicio: boolean
  consentimientoRGPD: boolean
}

/**
 * Guarda un lead en Airtable.
 *
 * Requiere las variables de entorno:
 *   AIRTABLE_API_KEY    — Personal access token de Airtable
 *   AIRTABLE_BASE_ID    — ID de la base (de la URL: airtable.com/[ID]/...)
 *   AIRTABLE_TABLE_NAME — Nombre exacto de la tabla (ej: "Leads")
 *
 * Lanza Error si las variables no están configuradas o si Airtable devuelve error.
 * No loguea datos personales del usuario.
 */
export async function saveLead(data: LeadData): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_TABLE_NAME

  if (!apiKey) {
    throw new Error('Airtable no configurado: falta AIRTABLE_API_KEY. Ver .env.local.example')
  }
  if (!baseId) {
    throw new Error('Airtable no configurado: falta AIRTABLE_BASE_ID. Ver .env.local.example')
  }
  if (!tableName) {
    throw new Error('Airtable no configurado: falta AIRTABLE_TABLE_NAME. Ver .env.local.example')
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
      const errorBody = (await response.json()) as { error?: { message?: string } }
      if (errorBody?.error?.message) {
        airtableMessage += `: ${errorBody.error.message}`
      }
    } catch {
      // No se pudo parsear el cuerpo — usar solo el status
    }
    throw new Error(`Error al guardar en Airtable — ${airtableMessage}`)
  }
}

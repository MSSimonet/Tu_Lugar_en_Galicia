/**
 * lib/leads.ts — Integración con Airtable para guardar leads del formulario de diagnóstico
 * y del cuestionario de Gina.
 *
 * IMPORTANTE: Las columnas en Airtable deben existir con los nombres exactos
 * de las keys del tipo LeadData (camelCase). Columnas y tipos:
 *
 *   Texto corto (Single line):
 *     nombreCompleto, email, telefono, paisResidencia, ingresosMensuales,
 *     fechaLlegada, inicioContrato
 *
 *   Texto largo (Long text):
 *     personas, detalleMascotas, profesion
 *
 *   Selección única (Single select):
 *     mascotas           → si | no
 *     cantidadPerros     → 1 | 2 | 3+   (solo si mascotaTipo incluye perro)
 *     cantidadGatos      → 1 | 2 | 3+   (solo si mascotaTipo incluye gato)
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
 *     comoNosConociste      → instagram | facebook | tiktok | google | recomendacion | otro
     necesidadesEspeciales → si | no
 *
 *   Selección múltiple (Multiple select):
 *     garantias      → garantia-adicional | aval-bancario | avalista | seguro-impago | ninguna
 *     imprescindibles → ascensor | garaje | calefaccion | terraza | no   ← NUEVO (Gina p24)
 *     comodidades    → transporte | zona-tranquila | cerca-colegios | internet | ninguna
 *
 *   Casilla (Checkbox):
 *     comprendeServicio, consentimientoRGPD
 *
 * Fuente del canal del lead (campo interno de Airtable, no viene del formulario):
 *   Se puede distinguir formulario web vs. Gina via el campo "fuenteLead" si se añade.
 */

export type LeadData = {
  // Datos personales
  nombreCompleto: string
  email: string
  telefono: string
  paisResidencia: string

  // Composición del grupo familiar
  personas?: string
  adultos?: '1' | '2' | '3' | '4+'
  ninos?: '0' | '1' | '2' | '3+'
  adolescentes?: '0' | '1' | '2' | '3+'
  mascotas: 'si' | 'no'
  detalleMascotas?: string
  mascotaTipo?: ('perro' | 'gato' | 'otro')[]
  cantidadPerros?: '1' | '2' | '3+'
  cantidadGatos?: '1' | '2' | '3+'
  mascotaPeso?: '0-5 kg' | '5-10 kg' | '+10 kg'

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
  garantias: ('garantia-adicional' | 'aval-bancario' | 'avalista' | 'seguro-impago' | 'ninguna')[]

  // Preferencias de vivienda
  ciudadDestino: 'vigo' | 'a-coruna' | 'santiago' | 'pontevedra' | 'lugo' | 'indiferente'
  tipoInmueble?: 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living'
  presupuestoMensual: 'menos-700' | '700-1000' | '1000-1400' | 'mas-1400'
  habitacionesMinimas?: '1' | '2' | '3' | '4+'
  amueblado: 'si' | 'no' | 'indiferente'
  estacionamiento?: 'indispensable' | 'deseable' | 'no'   // opcional: Gina no pregunta por esto
  comodidades?: ('transporte' | 'zona-tranquila' | 'cerca-colegios' | 'internet' | 'ninguna')[]

  // Perfil adicional (Nivel 2 de Gina)
  necesidadesEspeciales?: 'si' | 'no'
  profesion?: string

  // Características físicas del inmueble (selección múltiple — Gina p24)
  imprescindibles?: ('ascensor' | 'garaje' | 'calefaccion' | 'terraza' | 'no')[]

  // Plazos
  fechaLlegada: string
  inicioContrato?: string   // obligatorio en el formulario web, omitido por Gina

  // Atribución
  comoNosConociste?: 'instagram' | 'facebook' | 'tiktok' | 'google' | 'recomendacion' | 'otro'

  // Calificación automática del lead
  calificacion?: 'potencial' | 'en-desarrollo' | 'bajo'

  // Campos de perfil ampliado (Nivel 2 Gina — no todos aparecen en el formulario web)
  cuentaBancaria?: 'si' | 'no'
  comprendeHonorarios?: 'entiende' | 'pide-explicacion'
  tipoLicencia?: 'espanola' | 'europea' | 'origen' | 'no-tiene'
  ciudadActual?: string
  tiempoEnEspana?: 'menos-1-ano' | '1-5-anos' | 'mas-5-anos'
  objetivoBusqueda?: 'busca-vivienda' | 'integrarse'
  nivelEstudios?: 'sin-estudios' | 'bachillerato' | 'tecnico' | 'universitario' | 'posgrado'

  // Consentimientos
  comprendeServicio: boolean
  consentimientoRGPD: boolean
}

/**
 * Guarda o actualiza un lead en Airtable.
 *
 * - Sin recordId → POST (crea fila nueva), devuelve el ID asignado por Airtable.
 * - Con recordId → PATCH (actualiza la fila existente), devuelve el mismo recordId.
 *
 * Requiere las variables de entorno:
 *   AIRTABLE_API_KEY    — Personal access token de Airtable
 *   AIRTABLE_BASE_ID    — ID de la base (de la URL: airtable.com/[ID]/...)
 *   AIRTABLE_TABLE_NAME — Nombre exacto de la tabla (ej: "Leads")
 *
 * Lanza Error si las variables no están configuradas o si Airtable devuelve error.
 * No loguea datos personales del usuario.
 */
export async function saveLead(data: LeadData, recordId?: string): Promise<string> {
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

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
  const url = recordId ? `${baseUrl}/${recordId}` : baseUrl
  const method = recordId ? 'PATCH' : 'POST'

  const response = await fetch(url, {
    method,
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

  const body = (await response.json()) as { id: string }
  return body.id
}

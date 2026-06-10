/**
 * app/api/lead/route.ts — Handler POST para guardar leads del formulario de diagnóstico.
 *
 * Flujo:
 *   1. Parsear body JSON
 *   2. Validar campos obligatorios en servidor
 *   3. Construir LeadData tipado
 *   4. Llamar a saveLead() de lib/leads.ts
 *   5. Responder con éxito o error apropiado
 *
 * Seguridad:
 *   - No loguea datos personales — solo tipo de error y timestamp
 *   - Header X-RateLimit-Policy documenta la política (rate limiting real en Vercel/Cloudflare)
 *   - Clave de Airtable nunca sale del servidor
 */

import { NextRequest, NextResponse } from 'next/server'
import { saveLead, type LeadData } from '@/lib/leads'

// ---------------------------------------------------------------------------
// Valores permitidos — fuente de verdad alineada con Airtable y flow.json
// ---------------------------------------------------------------------------
const VALID_ADULTOS = ['1', '2', '3', '4+'] as const
const VALID_MENORES_COUNT = ['0', '1', '2', '3+'] as const
const VALID_MASCOTA_TIPO = ['perro', 'gato', 'otro'] as const
const VALID_MASCOTA_PESO = ['0-5 kg', '5-10 kg', '+10 kg'] as const

const VALID_DOCUMENTACION = [
  'espanol',
  'ue-otro',
  'residencia-aprobada',
  'en-tramite',
  'nacionalidad-en-tramite',
  'turista',
] as const

const VALID_SITUACION_LABORAL = [
  'cuenta-ajena',
  'autonomo',
  'teletrabajo-extranjero',
  'rentista',
  'jubilado',
  'estudiante',
  'busca-empleo',
] as const

const VALID_INGRESOS = [
  'menos-1500',
  '1500-2500',
  '2500-4000',
  'mas-4000',
  'sin-ingresos',
] as const

const VALID_GARANTIAS = ['adelanto-6-12', 'aval', 'seguro-impago', 'ninguna'] as const

const VALID_CIUDAD_DESTINO = [
  'vigo',
  'a-coruna',
  'santiago',
  'pontevedra',
  'lugo',
  'indiferente',
] as const

const VALID_TIPO_INMUEBLE = [
  'habitacion',
  'estudio',
  'piso',
  'casa',
  'co-living',
] as const

const VALID_PRESUPUESTO = ['menos-700', '700-1000', '1000-1400', 'mas-1400'] as const

const VALID_HABITACIONES = ['1', '2', '3', '4+'] as const

const VALID_AMUEBLADO = ['si', 'no', 'indiferente'] as const

const VALID_IMPRESCINDIBLES = [
  'ascensor',
  'garaje',
  'calefaccion',
  'terraza',
  'no',
] as const

const VALID_COMODIDADES = [
  'transporte',
  'zona-tranquila',
  'cerca-colegios',
  'internet',
  'ninguna',
] as const

const VALID_NECESIDADES_ESPECIALES = ['si', 'no'] as const

const VALID_FECHA_LLEGADA = [
  'menos-1-mes',
  '1-3-meses',
  '3-6-meses',
  'mas-6-meses',
  'sin-fecha',
] as const

const VALID_MODALIDAD = ['antes-de-viajar', 'ya-estando'] as const

const VALID_COMO_NOS_CONOCISTE = [
  'instagram',
  'facebook',
  'tiktok',
  'google',
  'recomendacion',
  'otro',
] as const

const EMAIL_REGEX = /.+@.+\..+/

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMMON_HEADERS = { 'X-RateLimit-Policy': '1 req/s per IP' }

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status, headers: COMMON_HEADERS })
}

function successResponse(): NextResponse {
  return NextResponse.json(
    { success: true, message: 'Recibimos tu consulta. Te respondemos en 48 horas hábiles.' },
    { status: 200, headers: COMMON_HEADERS }
  )
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parsear body JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: Record<string, any>
    try {
      body = await request.json()
    } catch {
      return errorResponse('Cuerpo de la petición inválido', 400)
    }

    // 2. Validación de campos obligatorios

    // --- Strings simples no vacíos ---
    for (const field of ['nombreCompleto', 'email', 'telefono', 'paisResidencia'] as const) {
      const value = body[field]
      if (typeof value !== 'string' || value.trim() === '') {
        return errorResponse(`Campo requerido faltante o inválido: ${field}`, 400)
      }
    }

    // --- Formato email ---
    if (!EMAIL_REGEX.test(body.email as string)) {
      return errorResponse('Campo requerido faltante o inválido: email (formato inválido)', 400)
    }

    // --- adultos ---
    if (!VALID_ADULTOS.includes(body.adultos)) {
      return errorResponse('Campo requerido faltante o inválido: adultos', 400)
    }

    // --- mascotas ---
    if (body.mascotas !== 'si' && body.mascotas !== 'no') {
      return errorResponse('Campo requerido faltante o inválido: mascotas', 400)
    }

    // --- mascotaTipo (condicional: requerido si mascotas === 'si') ---
    if (body.mascotas === 'si') {
      if (!Array.isArray(body.mascotaTipo) || (body.mascotaTipo as string[]).length === 0) {
        return errorResponse('Campo requerido faltante o inválido: mascotaTipo', 400)
      }
      const invalid = (body.mascotaTipo as string[]).find(
        (v) => !VALID_MASCOTA_TIPO.includes(v as (typeof VALID_MASCOTA_TIPO)[number])
      )
      if (invalid) {
        return errorResponse(`Valor inválido en mascotaTipo: ${invalid}`, 400)
      }
      // mascotaPeso requerido si hay perro
      if ((body.mascotaTipo as string[]).includes('perro')) {
        if (!VALID_MASCOTA_PESO.includes(body.mascotaPeso)) {
          return errorResponse('Campo requerido faltante o inválido: mascotaPeso', 400)
        }
      }
    }

    // --- ninos / adolescentes (condicionales: presentes cuando hayMenores=si) ---
    if (body.ninos !== undefined && !VALID_MENORES_COUNT.includes(body.ninos)) {
      return errorResponse('Valor inválido: ninos', 400)
    }
    if (body.adolescentes !== undefined && !VALID_MENORES_COUNT.includes(body.adolescentes)) {
      return errorResponse('Valor inválido: adolescentes', 400)
    }

    // --- documentacion ---
    if (!VALID_DOCUMENTACION.includes(body.documentacion)) {
      return errorResponse('Campo requerido faltante o inválido: documentacion', 400)
    }

    // --- situacionLaboral ---
    if (!VALID_SITUACION_LABORAL.includes(body.situacionLaboral)) {
      return errorResponse('Campo requerido faltante o inválido: situacionLaboral', 400)
    }

    // --- ingresosMensuales (select, mismo catálogo que Avoa) ---
    if (!VALID_INGRESOS.includes(body.ingresosMensuales)) {
      return errorResponse('Campo requerido faltante o inválido: ingresosMensuales', 400)
    }

    // --- garantias (array no vacío) ---
    if (!Array.isArray(body.garantias) || (body.garantias as string[]).length === 0) {
      return errorResponse('Campo requerido faltante o inválido: garantias', 400)
    }
    const invalidGarantia = (body.garantias as string[]).find(
      (g) => !VALID_GARANTIAS.includes(g as (typeof VALID_GARANTIAS)[number])
    )
    if (invalidGarantia) {
      return errorResponse(`Valor inválido en garantias: ${invalidGarantia}`, 400)
    }

    // --- ciudadDestino ---
    if (!VALID_CIUDAD_DESTINO.includes(body.ciudadDestino)) {
      return errorResponse('Campo requerido faltante o inválido: ciudadDestino', 400)
    }

    // --- tipoInmueble (requerido en el formulario web) ---
    if (!VALID_TIPO_INMUEBLE.includes(body.tipoInmueble)) {
      return errorResponse('Campo requerido faltante o inválido: tipoInmueble', 400)
    }

    // --- presupuestoMensual ---
    if (!VALID_PRESUPUESTO.includes(body.presupuestoMensual)) {
      return errorResponse('Campo requerido faltante o inválido: presupuestoMensual', 400)
    }

    // --- habitacionesMinimas (condicional: solo si tipoInmueble !== 'estudio') ---
    if (body.tipoInmueble !== 'estudio') {
      if (!VALID_HABITACIONES.includes(body.habitacionesMinimas)) {
        return errorResponse('Campo requerido faltante o inválido: habitacionesMinimas', 400)
      }
    }

    // --- amueblado ---
    if (!VALID_AMUEBLADO.includes(body.amueblado)) {
      return errorResponse('Campo requerido faltante o inválido: amueblado', 400)
    }

    // --- imprescindibles (opcional, array) ---
    if (body.imprescindibles !== undefined) {
      if (!Array.isArray(body.imprescindibles)) {
        return errorResponse('Campo inválido: imprescindibles debe ser un array', 400)
      }
      const invalid = (body.imprescindibles as string[]).find(
        (v) => !VALID_IMPRESCINDIBLES.includes(v as (typeof VALID_IMPRESCINDIBLES)[number])
      )
      if (invalid) {
        return errorResponse(`Valor inválido en imprescindibles: ${invalid}`, 400)
      }
    }

    // --- comodidades (opcional, array) ---
    if (body.comodidades !== undefined) {
      if (!Array.isArray(body.comodidades)) {
        return errorResponse('Campo inválido: comodidades debe ser un array', 400)
      }
      const invalid = (body.comodidades as string[]).find(
        (c) => !VALID_COMODIDADES.includes(c as (typeof VALID_COMODIDADES)[number])
      )
      if (invalid) {
        return errorResponse(`Valor inválido en comodidades: ${invalid}`, 400)
      }
    }

    // --- necesidadesEspeciales (opcional) ---
    if (
      body.necesidadesEspeciales !== undefined &&
      !VALID_NECESIDADES_ESPECIALES.includes(body.necesidadesEspeciales)
    ) {
      return errorResponse('Valor inválido: necesidadesEspeciales', 400)
    }

    // --- fechaLlegada (select, mismo catálogo que Avoa) ---
    if (!VALID_FECHA_LLEGADA.includes(body.fechaLlegada)) {
      return errorResponse('Campo requerido faltante o inválido: fechaLlegada', 400)
    }

    // --- modalidad ---
    if (!VALID_MODALIDAD.includes(body.modalidad)) {
      return errorResponse('Campo requerido faltante o inválido: modalidad', 400)
    }

    // --- comoNosConociste (opcional) ---
    if (
      body.comoNosConociste !== undefined &&
      body.comoNosConociste !== '' &&
      !VALID_COMO_NOS_CONOCISTE.includes(body.comoNosConociste)
    ) {
      return errorResponse('Valor inválido: comoNosConociste', 400)
    }

    // --- comprendeServicio ---
    if (body.comprendeServicio !== true) {
      return errorResponse('Campo requerido faltante o inválido: comprendeServicio', 400)
    }

    // --- consentimientoRGPD ---
    if (body.consentimientoRGPD !== true) {
      return errorResponse('Se requiere el consentimiento de tratamiento de datos', 400)
    }

    // 3. Construir el objeto LeadData tipado
    const esEstudio = body.tipoInmueble === 'estudio'

    const leadData: LeadData = {
      // Datos personales
      nombreCompleto: (body.nombreCompleto as string).trim(),
      email: (body.email as string).trim(),
      telefono: (body.telefono as string).trim(),
      paisResidencia: (body.paisResidencia as string).trim(),

      // Grupo familiar
      adultos: body.adultos as LeadData['adultos'],
      ...(body.ninos !== undefined ? { ninos: body.ninos as LeadData['ninos'] } : {}),
      ...(body.adolescentes !== undefined
        ? { adolescentes: body.adolescentes as LeadData['adolescentes'] }
        : {}),
      mascotas: body.mascotas as 'si' | 'no',
      ...(body.mascotas === 'si' && Array.isArray(body.mascotaTipo)
        ? { mascotaTipo: body.mascotaTipo as LeadData['mascotaTipo'] }
        : {}),
      ...(body.mascotas === 'si' &&
      (body.mascotaTipo as string[])?.includes('perro') &&
      body.mascotaPeso
        ? { mascotaPeso: body.mascotaPeso as LeadData['mascotaPeso'] }
        : {}),

      // Situación legal y laboral
      documentacion: body.documentacion as LeadData['documentacion'],
      situacionLaboral: body.situacionLaboral as LeadData['situacionLaboral'],
      ingresosMensuales: body.ingresosMensuales as string,

      // Garantías
      garantias: body.garantias as LeadData['garantias'],

      // Preferencias de vivienda
      ciudadDestino: body.ciudadDestino as LeadData['ciudadDestino'],
      tipoInmueble: body.tipoInmueble as LeadData['tipoInmueble'],
      presupuestoMensual: body.presupuestoMensual as LeadData['presupuestoMensual'],
      ...(!esEstudio
        ? { habitacionesMinimas: body.habitacionesMinimas as LeadData['habitacionesMinimas'] }
        : {}),
      amueblado: body.amueblado as LeadData['amueblado'],
      ...(Array.isArray(body.imprescindibles) && body.imprescindibles.length > 0
        ? { imprescindibles: body.imprescindibles as LeadData['imprescindibles'] }
        : {}),
      ...(Array.isArray(body.comodidades) && body.comodidades.length > 0
        ? { comodidades: body.comodidades as LeadData['comodidades'] }
        : {}),

      // Perfil adicional (opcionales)
      ...(typeof body.necesidadesEspeciales === 'string' && body.necesidadesEspeciales
        ? { necesidadesEspeciales: body.necesidadesEspeciales }
        : {}),
      ...(typeof body.profesion === 'string' && body.profesion.trim()
        ? { profesion: body.profesion.trim() }
        : {}),

      // Plazos
      fechaLlegada: body.fechaLlegada as string,
      modalidad: body.modalidad as LeadData['modalidad'],

      // Atribución (opcional)
      ...(body.comoNosConociste
        ? { comoNosConociste: body.comoNosConociste as LeadData['comoNosConociste'] }
        : {}),

      // Consentimientos
      comprendeServicio: true,
      consentimientoRGPD: true,
    }

    // 4. Guardar el lead
    try {
      await saveLead(leadData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)

      if (errorMessage.startsWith('Airtable no configurado')) {
        console.error('[api/lead] Integración no configurada —', new Date().toISOString())
        return errorResponse(
          'El sistema de registro no está configurado aún. Tu consulta fue recibida y te contactaremos por email.',
          503
        )
      }

      console.error('[api/lead] Error al guardar lead —', new Date().toISOString())
      return errorResponse('Error al guardar tu consulta. Por favor intenta de nuevo.', 500)
    }

    // 5. Éxito
    return successResponse()
  } catch {
    console.error('[api/lead] Error inesperado —', new Date().toISOString())
    return errorResponse('Error interno del servidor. Por favor intenta de nuevo.', 500)
  }
}

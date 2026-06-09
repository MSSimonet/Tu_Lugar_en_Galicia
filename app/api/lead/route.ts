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
// Valores permitidos — fuente de verdad alineada con Airtable
// ---------------------------------------------------------------------------
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

const VALID_ESTACIONAMIENTO = ['indispensable', 'deseable', 'no'] as const

const VALID_MODALIDAD = ['antes-de-viajar', 'ya-estando'] as const

const VALID_GARANTIAS = ['adelanto-6-12', 'aval', 'seguro-impago', 'ninguna'] as const

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

const VALID_COMO_NOS_CONOCISTE = [
  'redes-sociales',
  'recomendacion',
  'google',
  'facebook',
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
    const stringFields = [
      'nombreCompleto',
      'email',
      'telefono',
      'paisResidencia',
      'personas',
      'fechaLlegada',
      // inicioContrato: opcional — obligatorio en el formulario web, omitido por Avoa
    ] as const

    for (const field of stringFields) {
      const value = body[field]
      if (typeof value !== 'string' || value.trim() === '') {
        return errorResponse(`Campo requerido faltante o inválido: ${field}`, 400)
      }
    }

    // --- Formato email ---
    if (!EMAIL_REGEX.test(body.email as string)) {
      return errorResponse('Campo requerido faltante o inválido: email (formato inválido)', 400)
    }

    // --- mascotas ---
    if (body.mascotas !== 'si' && body.mascotas !== 'no') {
      return errorResponse('Campo requerido faltante o inválido: mascotas', 400)
    }

    // --- documentacion ---
    if (!VALID_DOCUMENTACION.includes(body.documentacion)) {
      return errorResponse('Campo requerido faltante o inválido: documentacion', 400)
    }

    // --- situacionLaboral ---
    if (!VALID_SITUACION_LABORAL.includes(body.situacionLaboral)) {
      return errorResponse('Campo requerido faltante o inválido: situacionLaboral', 400)
    }

    // --- ciudadDestino ---
    if (!VALID_CIUDAD_DESTINO.includes(body.ciudadDestino)) {
      return errorResponse('Campo requerido faltante o inválido: ciudadDestino', 400)
    }

    // --- presupuestoMensual ---
    if (!VALID_PRESUPUESTO.includes(body.presupuestoMensual)) {
      return errorResponse('Campo requerido faltante o inválido: presupuestoMensual', 400)
    }

    // --- habitacionesMinimas ---
    if (!VALID_HABITACIONES.includes(body.habitacionesMinimas)) {
      return errorResponse('Campo requerido faltante o inválido: habitacionesMinimas', 400)
    }

    // --- amueblado ---
    if (!VALID_AMUEBLADO.includes(body.amueblado)) {
      return errorResponse('Campo requerido faltante o inválido: amueblado', 400)
    }

    // --- estacionamiento (opcional — Avoa no pregunta; el formulario web puede incluirlo) ---
    if (body.estacionamiento !== undefined && !VALID_ESTACIONAMIENTO.includes(body.estacionamiento)) {
      return errorResponse('Valor inválido: estacionamiento', 400)
    }

    // --- modalidad ---
    if (!VALID_MODALIDAD.includes(body.modalidad)) {
      return errorResponse('Campo requerido faltante o inválido: modalidad', 400)
    }

    // --- garantias (array, puede ser vacío) ---
    if (!Array.isArray(body.garantias)) {
      return errorResponse('Campo requerido faltante o inválido: garantias', 400)
    }
    const invalidGarantia = (body.garantias as string[]).find(
      (g) => !VALID_GARANTIAS.includes(g as (typeof VALID_GARANTIAS)[number])
    )
    if (invalidGarantia) {
      return errorResponse(`Valor inválido en garantias: ${invalidGarantia}`, 400)
    }

    // --- tipoInmueble (opcional) ---
    if (body.tipoInmueble !== undefined && !VALID_TIPO_INMUEBLE.includes(body.tipoInmueble)) {
      return errorResponse('Valor inválido: tipoInmueble', 400)
    }

    // --- comodidades (opcional, array) ---
    if (body.comodidades !== undefined) {
      if (!Array.isArray(body.comodidades)) {
        return errorResponse('Campo inválido: comodidades debe ser un array', 400)
      }
      const invalidComodidad = (body.comodidades as string[]).find(
        (c) => !VALID_COMODIDADES.includes(c as (typeof VALID_COMODIDADES)[number])
      )
      if (invalidComodidad) {
        return errorResponse(`Valor inválido en comodidades: ${invalidComodidad}`, 400)
      }
    }

    // --- inicioContrato (opcional — presente en formulario web, ausente en Avoa) ---
    if (body.inicioContrato !== undefined) {
      if (typeof body.inicioContrato !== 'string' || body.inicioContrato.trim() === '') {
        return errorResponse('Valor inválido: inicioContrato', 400)
      }
    }

    // --- imprescindibles (opcional, array) ---
    if (body.imprescindibles !== undefined) {
      if (!Array.isArray(body.imprescindibles)) {
        return errorResponse('Campo inválido: imprescindibles debe ser un array', 400)
      }
      const invalidImprescindible = (body.imprescindibles as string[]).find(
        (v) => !VALID_IMPRESCINDIBLES.includes(v as (typeof VALID_IMPRESCINDIBLES)[number])
      )
      if (invalidImprescindible) {
        return errorResponse(`Valor inválido en imprescindibles: ${invalidImprescindible}`, 400)
      }
    }

    // --- comoNosConociste (opcional) ---
    if (
      body.comoNosConociste !== undefined &&
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
    const leadData: LeadData = {
      // Datos personales
      nombreCompleto: (body.nombreCompleto as string).trim(),
      email: (body.email as string).trim(),
      telefono: (body.telefono as string).trim(),
      paisResidencia: (body.paisResidencia as string).trim(),

      // Grupo familiar
      personas: (body.personas as string).trim(),
      mascotas: body.mascotas as 'si' | 'no',
      ...(typeof body.detalleMascotas === 'string' && body.detalleMascotas.trim()
        ? { detalleMascotas: body.detalleMascotas.trim() }
        : {}),

      // Situación legal y laboral
      documentacion: body.documentacion as LeadData['documentacion'],
      situacionLaboral: body.situacionLaboral as LeadData['situacionLaboral'],
      ingresosMensuales: typeof body.ingresosMensuales === 'string' ? body.ingresosMensuales.trim() : '',

      // Garantías
      garantias: body.garantias as LeadData['garantias'],

      // Preferencias de vivienda
      ciudadDestino: body.ciudadDestino as LeadData['ciudadDestino'],
      ...(body.tipoInmueble ? { tipoInmueble: body.tipoInmueble as LeadData['tipoInmueble'] } : {}),
      presupuestoMensual: body.presupuestoMensual as LeadData['presupuestoMensual'],
      habitacionesMinimas: body.habitacionesMinimas as LeadData['habitacionesMinimas'],
      amueblado: body.amueblado as LeadData['amueblado'],
      ...(body.estacionamiento ? { estacionamiento: body.estacionamiento as LeadData['estacionamiento'] } : {}),
      ...(Array.isArray(body.imprescindibles) && body.imprescindibles.length > 0
        ? { imprescindibles: body.imprescindibles as LeadData['imprescindibles'] }
        : {}),
      ...(Array.isArray(body.comodidades) && body.comodidades.length > 0
        ? { comodidades: body.comodidades as LeadData['comodidades'] }
        : {}),

      // Perfil adicional
      ...(typeof body.necesidadesEspeciales === 'string' && body.necesidadesEspeciales.trim()
        ? { necesidadesEspeciales: body.necesidadesEspeciales.trim() }
        : {}),
      ...(typeof body.profesion === 'string' && body.profesion.trim()
        ? { profesion: body.profesion.trim() }
        : {}),

      // Plazos
      fechaLlegada: (body.fechaLlegada as string).trim(),
      ...(typeof body.inicioContrato === 'string' && body.inicioContrato.trim()
        ? { inicioContrato: body.inicioContrato.trim() }
        : {}),
      modalidad: body.modalidad as LeadData['modalidad'],

      // Atribución
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
      return errorResponse('Error al guardar tu consulta. Por favor intentá de nuevo.', 500)
    }

    // 5. Éxito
    return successResponse()
  } catch {
    console.error('[api/lead] Error inesperado —', new Date().toISOString())
    return errorResponse('Error interno del servidor. Por favor intentá de nuevo.', 500)
  }
}

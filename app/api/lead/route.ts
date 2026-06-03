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

// Valores permitidos para los campos enum
const VALID_DOCUMENTACION = ['pasaporte-ue', 'visado-tie-nie', 'en-tramite', 'turista'] as const
const VALID_SITUACION_LABORAL = ['empleado-remoto', 'busca-empleo', 'autonomo', 'jubilado', 'estudiante', 'otro'] as const
const VALID_CIUDAD_DESTINO = ['vigo', 'a-coruna', 'santiago', 'pontevedra', 'lugo', 'indiferente'] as const
const VALID_PRESUPUESTO = ['menos-700', '700-1000', '1000-1400', 'mas-1400'] as const
const VALID_HABITACIONES = ['1', '2', '3', '4+'] as const
const VALID_AMUEBLADO = ['si', 'no', 'indiferente'] as const
const VALID_ESTACIONAMIENTO = ['indispensable', 'no', 'deseable'] as const
const VALID_MODALIDAD = ['antes-de-viajar', 'ya-estando'] as const

const EMAIL_REGEX = /.+@.+\..+/

/** Cabeceras comunes a todas las respuestas de este endpoint */
const COMMON_HEADERS = {
  'X-RateLimit-Policy': '1 req/s per IP',
}

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status, headers: COMMON_HEADERS })
}

function successResponse(): NextResponse {
  return NextResponse.json(
    { success: true, message: 'Recibimos tu consulta. Te respondemos en 48 horas hábiles.' },
    { status: 200, headers: COMMON_HEADERS }
  )
}

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

    // 2. Validación de campos obligatorios en servidor

    // --- Strings simples no vacíos ---
    const stringFields = [
      'nombreCompleto',
      'email',
      'telefono',
      'paisResidencia',
      'personas',
      'fechaLlegada',
      'inicioContrato',
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

    // --- estacionamiento ---
    if (!VALID_ESTACIONAMIENTO.includes(body.estacionamiento)) {
      return errorResponse('Campo requerido faltante o inválido: estacionamiento', 400)
    }

    // --- modalidad ---
    if (!VALID_MODALIDAD.includes(body.modalidad)) {
      return errorResponse('Campo requerido faltante o inválido: modalidad', 400)
    }

    // --- comprendeServicio ---
    if (body.comprendeServicio !== true) {
      return errorResponse('Campo requerido faltante o inválido: comprendeServicio', 400)
    }

    // --- consentimientoRGPD (mensaje específico exigido) ---
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

      // Garantías — array opcional; se acepta array vacío
      garantias: Array.isArray(body.garantias) ? body.garantias : [],

      // Preferencias de vivienda
      ciudadDestino: body.ciudadDestino as LeadData['ciudadDestino'],
      presupuestoMensual: body.presupuestoMensual as LeadData['presupuestoMensual'],
      habitacionesMinimas: body.habitacionesMinimas as LeadData['habitacionesMinimas'],
      amueblado: body.amueblado as LeadData['amueblado'],
      estacionamiento: body.estacionamiento as LeadData['estacionamiento'],

      // Plazos
      fechaLlegada: (body.fechaLlegada as string).trim(),
      inicioContrato: (body.inicioContrato as string).trim(),
      modalidad: body.modalidad as LeadData['modalidad'],

      // Consentimientos
      comprendeServicio: true,
      consentimientoRGPD: true,
    }

    // 4. Guardar el lead
    try {
      await saveLead(leadData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)

      // Caso esperado: Airtable aún no está configurado en este entorno
      if (errorMessage.startsWith('Airtable no configurado')) {
        console.error('[api/lead] Integración no configurada —', new Date().toISOString())
        return errorResponse(
          'El sistema de registro no está configurado aún. Tu consulta fue recibida y la contactaremos por email.',
          503
        )
      }

      // Cualquier otro error de Airtable o de red
      console.error('[api/lead] Error al guardar lead —', new Date().toISOString(), '—', errorMessage)
      return errorResponse('Error al guardar tu consulta. Por favor intentá de nuevo.', 500)
    }

    // 5. Éxito
    return successResponse()
  } catch (err) {
    // Última línea de defensa — error completamente inesperado
    console.error('[api/lead] Error inesperado —', new Date().toISOString())
    return errorResponse('Error interno del servidor. Por favor intentá de nuevo.', 500)
  }
}

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
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { calcularCalificacion } from '@/lib/gina/scoring'
import {
  VALID_ADULTOS, VALID_MENORES_COUNT, VALID_MASCOTA_TIPO, VALID_MASCOTA_PESO, VALID_CANTIDAD_MASCOTA,
  VALID_DOCUMENTACION, VALID_SITUACION_LABORAL, VALID_INGRESOS, VALID_GARANTIAS,
  VALID_CIUDAD_DESTINO, VALID_TIPO_INMUEBLE, VALID_PRESUPUESTO, VALID_HABITACIONES,
  VALID_AMUEBLADO, VALID_IMPRESCINDIBLES, VALID_COMODIDADES, VALID_NECESIDADES_ESPECIALES,
  VALID_FECHA_LLEGADA, VALID_COMO_NOS_CONOCISTE, EMAIL_REGEX,
  VALID_ORIGEN_RESIDENCIA, VALID_CUENTA_BANCARIA, VALID_COMPRENDE_HONORARIOS,
  VALID_TIPO_LICENCIA, VALID_TIEMPO_EN_ESPANA, VALID_OBJETIVO_BUSQUEDA, VALID_NIVEL_ESTUDIOS,
} from '@/lib/validation'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        analytics: false,
      })
    : null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMMON_HEADERS = {}

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
    // 0. Verificación de origen — fail-closed: se rechaza si falta el header Origin
    // o si no matchea el allowlist. Este endpoint solo recibe POST desde fetch()
    // del navegador (useFormulario.ts) — no hay cron, webhook ni llamada
    // server-to-server que lo invoque, y los navegadores modernos siempre envían
    // Origin en requests POST (verificado en vivo: fetch same-origin desde el
    // propio sitio llega con Origin seteado). Un Origin ausente en este endpoint
    // solo puede venir de un cliente no-navegador (curl, script) — se rechaza.
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://tu-lugar-en-galicia.vercel.app',
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NODE_ENV === 'development' && 'http://localhost:3000',
    ].filter((x): x is string => Boolean(x))

    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Origen no permitido' },
        { status: 403 }
      )
    }

    // 1. Rate limiting (fail-closed: sin config, se rechaza en vez de saltar el chequeo — A2)
    if (!ratelimit) {
      console.error('[lead] ratelimit no configurado — faltan UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN en el entorno')
      return errorResponse('Servicio no disponible', 503)
    }
    const ip = getRealIp(request)
    const { success, limit, remaining, reset } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          },
        }
      )
    }

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
    for (const field of ['nombreCompleto', 'email', 'telefono'] as const) {
      const value = body[field]
      if (typeof value !== 'string' || value.trim() === '') {
        return errorResponse(`Campo requerido faltante o inválido: ${field}`, 400)
      }
    }

    // --- Formato email ---
    if (!EMAIL_REGEX.test(body.email as string)) {
      return errorResponse('Campo requerido faltante o inválido: email (formato inválido)', 400)
    }

    // --- origenResidencia + rama condicional (igual que Gina p3_origen) ---
    if (!VALID_ORIGEN_RESIDENCIA.includes(body.origenResidencia)) {
      return errorResponse('Campo requerido faltante o inválido: origenResidencia', 400)
    }
    const vieneDeFuera = body.origenResidencia === 'fuera'
    const yaViveEnEspana = body.origenResidencia === 'en_espana'

    if (vieneDeFuera && (typeof body.paisResidencia !== 'string' || body.paisResidencia.trim() === '')) {
      return errorResponse('Campo requerido faltante o inválido: paisResidencia', 400)
    }
    if (yaViveEnEspana) {
      if (typeof body.ciudadActual !== 'string' || body.ciudadActual.trim() === '') {
        return errorResponse('Campo requerido faltante o inválido: ciudadActual', 400)
      }
      if (!VALID_TIEMPO_EN_ESPANA.includes(body.tiempoEnEspana)) {
        return errorResponse('Campo requerido faltante o inválido: tiempoEnEspana', 400)
      }
      if (!VALID_OBJETIVO_BUSQUEDA.includes(body.objetivoBusqueda)) {
        return errorResponse('Campo requerido faltante o inválido: objetivoBusqueda', 400)
      }
    }
    // Igual que Gina (p20a_objetivo="integrarse"): se omite toda la búsqueda de vivienda
    const omiteBusquedaVivienda = yaViveEnEspana && body.objetivoBusqueda === 'integrarse'

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
      // cantidadPerros/mascotaPeso requeridos si hay perro; cantidadGatos si hay gato
      if ((body.mascotaTipo as string[]).includes('perro')) {
        if (!VALID_CANTIDAD_MASCOTA.includes(body.cantidadPerros)) {
          return errorResponse('Campo requerido faltante o inválido: cantidadPerros', 400)
        }
        if (!VALID_MASCOTA_PESO.includes(body.mascotaPeso)) {
          return errorResponse('Campo requerido faltante o inválido: mascotaPeso', 400)
        }
      }
      if ((body.mascotaTipo as string[]).includes('gato')) {
        if (!VALID_CANTIDAD_MASCOTA.includes(body.cantidadGatos)) {
          return errorResponse('Campo requerido faltante o inválido: cantidadGatos', 400)
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

    // --- ingresosMensuales (select, mismo catálogo que Gina) ---
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

    // --- cuentaBancaria / comprendeHonorarios (Gina p13/p14, siempre obligatorios) ---
    if (!VALID_CUENTA_BANCARIA.includes(body.cuentaBancaria)) {
      return errorResponse('Campo requerido faltante o inválido: cuentaBancaria', 400)
    }
    if (!VALID_COMPRENDE_HONORARIOS.includes(body.comprendeHonorarios)) {
      return errorResponse('Campo requerido faltante o inválido: comprendeHonorarios', 400)
    }

    // --- ciudadDestino ---
    if (!VALID_CIUDAD_DESTINO.includes(body.ciudadDestino)) {
      return errorResponse('Campo requerido faltante o inválido: ciudadDestino', 400)
    }

    // --- presupuestoMensual (siempre obligatorio, se pregunta antes de la rama "integrarse") ---
    if (!VALID_PRESUPUESTO.includes(body.presupuestoMensual)) {
      return errorResponse('Campo requerido faltante o inválido: presupuestoMensual', 400)
    }

    // --- tipoInmueble / habitacionesMinimas / amueblado — omitidos si omiteBusquedaVivienda ---
    if (!omiteBusquedaVivienda) {
      if (!VALID_TIPO_INMUEBLE.includes(body.tipoInmueble)) {
        return errorResponse('Campo requerido faltante o inválido: tipoInmueble', 400)
      }
      if (body.tipoInmueble !== 'estudio') {
        if (!VALID_HABITACIONES.includes(body.habitacionesMinimas)) {
          return errorResponse('Campo requerido faltante o inválido: habitacionesMinimas', 400)
        }
      }
      if (!VALID_AMUEBLADO.includes(body.amueblado)) {
        return errorResponse('Campo requerido faltante o inválido: amueblado', 400)
      }
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

    // --- tipoLicencia (Gina p17, siempre obligatorio) ---
    if (!VALID_TIPO_LICENCIA.includes(body.tipoLicencia)) {
      return errorResponse('Campo requerido faltante o inválido: tipoLicencia', 400)
    }

    // --- nivelEstudios (Gina p27, siempre obligatorio) ---
    if (!VALID_NIVEL_ESTUDIOS.includes(body.nivelEstudios)) {
      return errorResponse('Campo requerido faltante o inválido: nivelEstudios', 400)
    }

    // --- fechaLlegada (select, mismo catálogo que Gina) ---
    if (!VALID_FECHA_LLEGADA.includes(body.fechaLlegada)) {
      return errorResponse('Campo requerido faltante o inválido: fechaLlegada', 400)
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

    // calificacion/etiqueta — mismo cálculo que Gina (calcularCalificacion), para que los
    // leads del formulario queden igual de calificados que los de Gina (antes quedaban sin etiqueta).
    const calificacionCalc = calcularCalificacion({
      documentacion: body.documentacion,
      garantias: body.garantias,
      ingresosMensuales: body.ingresosMensuales,
      fechaLlegada: body.fechaLlegada,
      ciudadDestino: body.ciudadDestino,
      adultos: body.adultos,
      ninos: body.ninos,
      adolescentes: body.adolescentes,
      mascotas: body.mascotas,
      cantidadPerros: body.cantidadPerros,
      cantidadGatos: body.cantidadGatos,
      situacionLaboral: body.situacionLaboral,
      presupuestoMensual: body.presupuestoMensual,
      nivelEstudios: body.nivelEstudios,
    })
    const etiquetaCalc: LeadData['etiqueta'] = calificacionCalc === 'potencial' ? 'califica' : 'seguimiento-futuro'

    const leadData: Partial<LeadData> & Pick<LeadData, 'nombreCompleto' | 'email' | 'comprendeServicio' | 'consentimientoRGPD'> = {
      // Datos personales
      nombreCompleto: (body.nombreCompleto as string).trim(),
      email: (body.email as string).trim(),
      telefono: (body.telefono as string).trim(),
      // Igual que Gina: 'en_espana' fija paisResidencia='España'; 'fuera' usa el texto libre.
      paisResidencia: yaViveEnEspana ? 'España' : (body.paisResidencia as string).trim(),

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
      ...(body.mascotas === 'si' && (body.mascotaTipo as string[])?.includes('perro') && body.cantidadPerros
        ? { cantidadPerros: body.cantidadPerros as LeadData['cantidadPerros'] }
        : {}),
      ...(body.mascotas === 'si' && (body.mascotaTipo as string[])?.includes('gato') && body.cantidadGatos
        ? { cantidadGatos: body.cantidadGatos as LeadData['cantidadGatos'] }
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
      cuentaBancaria: body.cuentaBancaria as LeadData['cuentaBancaria'],
      comprendeHonorarios: body.comprendeHonorarios as LeadData['comprendeHonorarios'],

      // Preferencias de vivienda
      ciudadDestino: body.ciudadDestino as LeadData['ciudadDestino'],
      presupuestoMensual: body.presupuestoMensual as LeadData['presupuestoMensual'],
      ...(!omiteBusquedaVivienda
        ? {
            tipoInmueble: body.tipoInmueble as LeadData['tipoInmueble'],
            amueblado: body.amueblado as LeadData['amueblado'],
            ...(!esEstudio
              ? { habitacionesMinimas: body.habitacionesMinimas as LeadData['habitacionesMinimas'] }
              : {}),
            ...(Array.isArray(body.imprescindibles) && body.imprescindibles.length > 0
              ? { imprescindibles: body.imprescindibles as LeadData['imprescindibles'] }
              : {}),
            ...(Array.isArray(body.comodidades) && body.comodidades.length > 0
              ? { comodidades: body.comodidades as LeadData['comodidades'] }
              : {}),
          }
        : {}),

      // Perfil adicional
      ...(typeof body.necesidadesEspeciales === 'string' && body.necesidadesEspeciales
        ? { necesidadesEspeciales: body.necesidadesEspeciales as LeadData['necesidadesEspeciales'] }
        : {}),
      tipoLicencia: body.tipoLicencia as LeadData['tipoLicencia'],
      ...(yaViveEnEspana
        ? {
            ciudadActual: (body.ciudadActual as string).trim(),
            tiempoEnEspana: body.tiempoEnEspana as LeadData['tiempoEnEspana'],
            objetivoBusqueda: body.objetivoBusqueda as LeadData['objetivoBusqueda'],
          }
        : {}),
      ...(typeof body.profesion === 'string' && body.profesion.trim()
        ? { profesion: body.profesion.trim() }
        : {}),
      nivelEstudios: body.nivelEstudios as LeadData['nivelEstudios'],

      // Plazos
      fechaLlegada: body.fechaLlegada as string,

      // Atribución (opcional)
      ...(body.comoNosConociste
        ? { comoNosConociste: body.comoNosConociste as LeadData['comoNosConociste'] }
        : {}),

      // Modalidad — derivada de origenResidencia, igual que Gina
      modalidad: yaViveEnEspana ? 'ya-en-espana' : 'antes-de-viajar',

      // Calificación automática (igual que Gina — antes quedaba sin calificar)
      calificacion: calificacionCalc,
      etiqueta: etiquetaCalc,

      // Consentimientos
      comprendeServicio: true,
      consentimientoRGPD: true,
    }

    // 4. Guardar el lead
    try {
      await saveLead(leadData as LeadData)
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

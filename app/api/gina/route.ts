/**
 * app/api/gina/route.ts — Endpoint serverless del motor de Gina.
 *
 * POST /api/gina
 * Body: { sesion: GinaSession, respuesta: string | string[] }
 * Response: { sesionActualizada: GinaSession, siguientePaso: Paso }
 *
 * En Etapa 1 los pasos de tipo "llm" NO llaman a ninguna IA externa:
 * reciben el texto del usuario, lo guardan y devuelven el siguiente paso.
 */

import { NextRequest, NextResponse } from 'next/server'
import { procesarRespuesta, obtenerPaso } from '@/lib/gina/flowEngine'
import type { GinaSession } from '@/lib/gina/session'
import { saveLead } from '@/lib/leads'
import type { LeadData } from '@/lib/leads'
import { calcularCalificacion } from '@/lib/gina/scoring'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { generateAdminToken, verifyAdminToken } from '@/lib/admin/tokens'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        // Máx. 44 pasos en rama más larga del flow + 25% margen = 60
        limiter: Ratelimit.slidingWindow(60, '10 m'),
        analytics: false,
      })
    : null

type RequestBody = {
  sesion: GinaSession
  respuesta: string | string[]
}

export async function POST(req: NextRequest) {
  if (!ratelimit) {
    console.error(
      '[gina] ratelimit no configurado — faltan UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN en el entorno',
    )
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }

  const ip = getRealIp(req)
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
      { status: 429 },
    )
  }

  // Fail-closed: se rechaza si falta el header Origin o si no matchea el allowlist.
  // Este endpoint solo recibe POST desde fetch() del navegador (GinaConversation.tsx)
  // — no hay cron, webhook ni llamada server-to-server que lo invoque, y los navegadores
  // modernos siempre envían Origin en requests POST (verificado en vivo: fetch same-origin
  // desde el propio sitio llega con Origin seteado). Un Origin ausente en este endpoint
  // solo puede venir de un cliente no-navegador (curl, script) — se rechaza.
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'https://tu-lugar-en-galicia.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ].filter((x): x is string => Boolean(x))

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: 'Origen no permitido' },
      { status: 403 },
    )
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { sesion: sesionCruda, respuesta } = body

  if (!sesionCruda || !sesionCruda.pasoActual) {
    return NextResponse.json({ error: 'sesion inválida' }, { status: 400 })
  }

  // Seguridad (C1): sesionCruda.airtableRecordId viene del cliente sin control del
  // servidor — sin esta verificación, cualquiera podría inyectar el recordId de otro
  // lead y sobrescribir sus datos vía PATCH. Solo se confía en el recordId si viene
  // acompañado de una firma HMAC válida (emitida por este mismo servidor al crearlo
  // en guardar_nivel1). Si falta o no valida, se descarta silenciosamente — el flujo
  // continúa como si fuera una sesión nueva (crea un registro propio vía POST).
  let sesion = sesionCruda
  if (sesion.airtableRecordId) {
    let firmaValida = false
    if (typeof sesion.airtableRecordSig === 'string') {
      try {
        verifyAdminToken(sesion.airtableRecordId, sesion.airtableRecordSig)
        firmaValida = true
      } catch {
        firmaValida = false
      }
    }
    if (!firmaValida) {
      sesion = { ...sesion, airtableRecordId: undefined, airtableRecordSig: undefined }
    }
  }

  // Límite de tamaño en campos de texto libre — evita payloads abusivos (A4: cubre también arrays)
  if (typeof respuesta === 'string' && respuesta.length > 2000) {
    return NextResponse.json(
      { error: 'Respuesta demasiado larga (máx. 2000 caracteres)' },
      { status: 400 },
    )
  }
  if (Array.isArray(respuesta)) {
    if (respuesta.length > 50) {
      return NextResponse.json(
        { error: 'Demasiados elementos en la respuesta (máx. 50)' },
        { status: 400 },
      )
    }
    if (respuesta.some((r) => typeof r === 'string' && r.length > 2000)) {
      return NextResponse.json(
        { error: 'Respuesta demasiado larga (máx. 2000 caracteres por elemento)' },
        { status: 400 },
      )
    }
  }

  // Obtener definición del paso actual
  let paso
  try {
    paso = obtenerPaso(sesion.pasoActual)
  } catch {
    // Nunca exponer el mensaje interno — revela nombres de pasos de flow.json
    console.error(`[gina] Paso actual inválido — ts: ${new Date().toISOString()}`)
    return NextResponse.json(
      { error: 'Sesión inválida. Por favor, recarga la página.' },
      { status: 400 },
    )
  }

  // Procesar la respuesta en el motor de estados
  const { sesionActualizada, siguientePasoId } = procesarRespuesta(
    sesion,
    paso,
    respuesta,
  )

  // Obtener definición del siguiente paso para devolverlo al cliente
  let siguientePaso
  try {
    siguientePaso = obtenerPaso(siguientePasoId)
  } catch {
    // Nunca exponer el mensaje interno — revela nombres de pasos de flow.json
    console.error(`[gina] Siguiente paso inválido — ts: ${new Date().toISOString()}`)
    return NextResponse.json(
      { error: 'Ocurrió un error interno. Por favor, recarga la página.' },
      { status: 500 },
    )
  }

  // Guardado en Airtable según la acción del paso que se acaba de procesar.
  // nivel1: bloqueante para capturar el record ID; usa conReintentos, fallo no bloquea al usuario.
  // parcial/completo: awaited con reintentos; si fallan todos devuelve guardado:false al cliente.
  let sesionParaDevolver = sesionActualizada
  let guardado = true

  if (paso.accion === 'guardar_nivel1') {
    const recordId = await conReintentos(() => guardarEnAirtable(sesionActualizada))
    if (recordId) {
      sesionParaDevolver = {
        ...sesionActualizada,
        airtableRecordId: recordId,
        airtableRecordSig: generateAdminToken(recordId),
      }
    } else {
      console.error('[gina] nivel1 falló tras 3 intentos — el guardado completo hará POST como fallback')
    }
  } else if (paso.accion === 'guardar_lead_completo') {
    // Cuestionario completo: etiqueta derivada de calificacion ('califica' | 'seguimiento-futuro')
    const recordId = await conReintentos(() => guardarEnAirtable(sesionActualizada, true, true))
    if (!recordId) {
      guardado = false
      console.error('[gina] guardado completo falló tras 3 intentos — lead perdido, revisar logs')
    }
  } else if (paso.accion === 'guardar_lead_parcial') {
    // Salida temprana (lead-en-preparacion): etiqueta ya en sesion.etiqueta, no es guardado completo
    const recordId = await conReintentos(() => guardarEnAirtable(sesionActualizada, true, false))
    if (!recordId) {
      guardado = false
      console.error('[gina] guardado parcial falló tras 3 intentos — lead perdido, revisar logs')
    }
  } else if (paso.id === 'transicion_nivel2' && siguientePasoId === 'despedida') {
    // "No" al nivel 2: guardado incompleto (no llegó al paso atribucion)
    const recordId = await conReintentos(() => guardarEnAirtable(sesionActualizada, true, false))
    if (!recordId) {
      guardado = false
      console.error('[gina] guardado (transicion_nivel2→no) falló tras 3 intentos')
    }
  }

  return NextResponse.json({
    sesionActualizada: sesionParaDevolver,
    siguientePaso,
    guardado,
  })
}

/**
 * Mapea las respuestas de la sesión al tipo LeadData y llama a saveLead.
 * Pasa sesion.airtableRecordId a saveLead: si existe hace PATCH, si no hace POST.
 * Devuelve el record ID resultante (nuevo en POST, el mismo en PATCH).
 *
 * REGLA: un campo se incluye SOLO si fue respondido en sesion.respuestas.
 * Sin defaults: un campo no preguntado llega como undefined y JSON.stringify lo omite.
 */
/**
 * esGuardadoCompleto: true SOLO para accion=guardar_lead_completo (llegó al paso atribucion).
 * Determina si la etiqueta se deriva de la calificación ('califica'/'seguimiento-futuro')
 * o se marca como 'incompleto'. La etiqueta 'lead-en-preparacion' ya en sesion.etiqueta
 * tiene prioridad y nunca se pisa.
 */
async function guardarEnAirtable(
  sesion: GinaSession,
  incluirCalificacion = false,
  esGuardadoCompleto = false,
): Promise<string> {
  const r = sesion.respuestas

  // Calificación: se calcula cuando hay datos suficientes (incluirCalificacion=true).
  // Se extrae aquí para reutilizarla en la derivación de etiqueta.
  const calificacion: LeadData['calificacion'] | undefined = incluirCalificacion
    ? calcularCalificacion({
        documentacion: r['documentacion'] as string | undefined,
        garantias: r['garantias'] as string[] | undefined,
        ingresosMensuales: r['ingresosMensuales'] as string | undefined,
        fechaLlegada: r['fechaLlegada'] as string | undefined,
        ciudadDestino: r['ciudadDestino'] as string | undefined,
        adultos: r['adultos'] as string | undefined,
        ninos: r['ninos'] as string | undefined,
        adolescentes: r['adolescentes'] as string | undefined,
        mascotas: r['mascotas'] as string | undefined,
        cantidadPerros: r['cantidadPerros'] as string | undefined,
        cantidadGatos: r['cantidadGatos'] as string | undefined,
        situacionLaboral: r['situacionLaboral'] as string | undefined,
        presupuestoMensual: r['presupuestoMensual'] as string | undefined,
        nivelEstudios: r['nivelEstudios'] as string | undefined,
      })
    : undefined

  // Etiqueta — reglas en orden de prioridad:
  // 1. 'lead-en-preparacion' ya asignada por el motor → no tocar
  // 2. Guardado completo + calificacion potencial → 'califica'
  // 3. Guardado completo + calificacion en-desarrollo|bajo → 'seguimiento-futuro'
  // 4. Cualquier otro guardado (nivel1, transicion_nivel2→no) → 'incompleto'
  const etiqueta: LeadData['etiqueta'] = sesion.etiqueta
    ? (sesion.etiqueta as LeadData['etiqueta'])
    : esGuardadoCompleto && calificacion
      ? (calificacion === 'potencial' ? 'califica' : 'seguimiento-futuro')
      : 'incompleto'

  const lead: Partial<LeadData> & Pick<LeadData, 'nombreCompleto' | 'email' | 'consentimientoRGPD'> = {
    // Siempre presentes (nombre y email se capturan antes de cualquier guardado)
    nombreCompleto: String(r['nombreCompleto'] ?? ''),
    email: String(r['email'] ?? ''),
    consentimientoRGPD: sesion.respuestas['rgpd'] === 'acepto',

    // Datos personales
    telefono: r['telefono'] ? String(r['telefono']) : undefined,
    // p3_origen escribe 'en_espana'|'fuera' en r['paisResidencia']; p3b_pais lo sobreescribe con el país real.
    // Usamos origenResidencia como decisor para evitar guardar los valores sentinel del flujo.
    paisResidencia:
      sesion.origenResidencia === 'en_espana'
        ? 'España'
        : sesion.origenResidencia === 'fuera' && r['paisResidencia']
          ? String(r['paisResidencia'])
          : undefined,
    fechaLlegada: r['fechaLlegada'] ? String(r['fechaLlegada']) : undefined,

    // Destino
    ciudadDestino: r['ciudadDestino'] ? (r['ciudadDestino'] as LeadData['ciudadDestino']) : undefined,

    // Composición familiar
    adultos: r['adultos'] ? (r['adultos'] as LeadData['adultos']) : undefined,
    ninos: r['ninos'] ? (r['ninos'] as LeadData['ninos']) : undefined,
    adolescentes: r['adolescentes'] ? (r['adolescentes'] as LeadData['adolescentes']) : undefined,

    // Mascotas
    mascotas: r['mascotas'] ? (r['mascotas'] as LeadData['mascotas']) : undefined,
    mascotaTipo: Array.isArray(r['mascotaTipo']) && (r['mascotaTipo'] as string[]).length > 0
      ? (r['mascotaTipo'] as LeadData['mascotaTipo'])
      : undefined,
    cantidadPerros: r['cantidadPerros'] ? (r['cantidadPerros'] as LeadData['cantidadPerros']) : undefined,
    cantidadGatos: r['cantidadGatos'] ? (r['cantidadGatos'] as LeadData['cantidadGatos']) : undefined,
    mascotaPeso: r['mascotaPeso'] ? (r['mascotaPeso'] as LeadData['mascotaPeso']) : undefined,

    // Situación legal y laboral
    documentacion: r['documentacion'] ? (r['documentacion'] as LeadData['documentacion']) : undefined,
    situacionLaboral: r['situacionLaboral'] ? (r['situacionLaboral'] as LeadData['situacionLaboral']) : undefined,
    ingresosMensuales: r['ingresosMensuales'] ? String(r['ingresosMensuales']) : undefined,
    garantias: Array.isArray(r['garantias']) && (r['garantias'] as string[]).length > 0
      ? (r['garantias'] as LeadData['garantias'])
      : undefined,

    // Preferencias de vivienda
    presupuestoMensual: r['presupuestoMensual'] ? (r['presupuestoMensual'] as LeadData['presupuestoMensual']) : undefined,
    tipoInmueble: r['tipoInmueble'] ? (r['tipoInmueble'] as LeadData['tipoInmueble']) : undefined,
    habitacionesMinimas: r['habitacionesMinimas'] ? (r['habitacionesMinimas'] as LeadData['habitacionesMinimas']) : undefined,
    amueblado: r['amueblado'] ? (r['amueblado'] as LeadData['amueblado']) : undefined,
    imprescindibles: Array.isArray(r['imprescindibles']) && (r['imprescindibles'] as string[]).length > 0
      ? (r['imprescindibles'] as LeadData['imprescindibles'])
      : undefined,
    comodidades: r['comodidades'] ? (r['comodidades'] as LeadData['comodidades']) : undefined,

    // Perfil adicional (Nivel 2)
    necesidadesEspeciales: r['necesidadesEspeciales'] ? (r['necesidadesEspeciales'] as LeadData['necesidadesEspeciales']) : undefined,
    profesion: r['profesion'] ? String(r['profesion']) : undefined,
    comoNosConociste: r['comoNosConociste'] ? (r['comoNosConociste'] as LeadData['comoNosConociste']) : undefined,
    cuentaBancaria: r['cuentaBancaria'] ? (r['cuentaBancaria'] as LeadData['cuentaBancaria']) : undefined,
    comprendeHonorarios: r['comprendeHonorarios'] ? (r['comprendeHonorarios'] as LeadData['comprendeHonorarios']) : undefined,
    tipoLicencia: r['tipoLicencia'] ? (r['tipoLicencia'] as LeadData['tipoLicencia']) : undefined,
    ciudadActual: r['ciudadActual'] ? String(r['ciudadActual']) : undefined,
    tiempoEnEspana: r['tiempoEnEspana'] ? (r['tiempoEnEspana'] as LeadData['tiempoEnEspana']) : undefined,
    objetivoBusqueda: r['objetivoBusqueda'] ? (r['objetivoBusqueda'] as LeadData['objetivoBusqueda']) : undefined,
    nivelEstudios: r['nivelEstudios'] ? (r['nivelEstudios'] as LeadData['nivelEstudios']) : undefined,

    comprendeServicio: true,

    etiqueta,

    modalidad:
      sesion.origenResidencia === 'fuera' ? 'antes-de-viajar'
      : sesion.origenResidencia === 'en_espana' ? 'ya-en-espana'
      : undefined,

    ...(calificacion ? { calificacion } : {}),
  }

  return saveLead(lead as LeadData, sesion.airtableRecordId)
}

/**
 * Ejecuta fn hasta 3 veces (0 ms, 200 ms, 600 ms de espera entre intentos).
 * Devuelve el resultado si algún intento tiene éxito, o null si todos fallan.
 * No lanza excepciones: el caller decide qué hacer con null.
 */
async function conReintentos<T>(fn: () => Promise<T>): Promise<T | null> {
  const delays = [0, 200, 600]
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      await new Promise((r) => setTimeout(r, delays[i]))
    }
    try {
      return await fn()
    } catch (err) {
      const intento = i + 1
      const msg = err instanceof Error ? err.message : String(err)
      const status = msg.match(/HTTP (\d{3})/)?.[1]
      console.error(`[gina] intento ${intento}/3 falló — status: ${status ?? 'desconocido'}, ts: ${new Date().toISOString()}`)
    }
  }
  return null
}

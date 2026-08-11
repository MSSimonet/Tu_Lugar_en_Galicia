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
import type { Paso } from '@/lib/gina/flowEngine'
import type { GinaSession } from '@/lib/gina/session'
import { saveLead, getLead } from '@/lib/leads'
import type { LeadData } from '@/lib/leads'
import { calcularCalificacion } from '@/lib/gina/scoring'
import { guardarTranscripcion } from '@/lib/gina/transcripcion'
import type { TranscripcionEntry } from '@/lib/gina/transcripcion'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { generateAdminToken, verifyAdminToken } from '@/lib/admin/tokens'
import { armarPlan } from '@/lib/plan/armador'
import { generarPlanPdf } from '@/lib/plan/generarPdf'
import { sendEmail, buildPlanEmail, buildPlanEmailFallidoAlerta } from '@/lib/admin/email'

/** Mismo patrón que valida el cliente en components/gina/GinaInput.tsx. Acá es la
 *  validación que cuenta: el cliente se puede saltear con un POST directo. */
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        // Máx. 44 pasos en rama más larga del flow + 25% margen = 60
        limiter: Ratelimit.slidingWindow(60, '10 m'),
        analytics: false,
        prefix: 'ratelimit:gina',
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
    process.env.NODE_ENV === 'development' && 'http://localhost:3000',
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

  // Seguridad (C1): sesionCruda.leadId viene del cliente sin control del
  // servidor — sin esta verificación, cualquiera podría inyectar el leadId de otro
  // lead y sobrescribir sus datos vía update. Solo se confía en el leadId si viene
  // acompañado de una firma HMAC válida (emitida por este mismo servidor al crearlo
  // en guardar_nivel1). Si falta o no valida, se descarta silenciosamente — el flujo
  // continúa como si fuera una sesión nueva (crea un registro propio vía insert).
  let sesion = sesionCruda
  if (sesion.leadId) {
    let firmaValida = false
    if (typeof sesion.leadIdSig === 'string') {
      try {
        verifyAdminToken(sesion.leadId, sesion.leadIdSig)
        firmaValida = true
      } catch {
        firmaValida = false
      }
    }
    if (!firmaValida) {
      sesion = { ...sesion, leadId: undefined, leadIdSig: undefined }
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

  // Guardado en Supabase según la acción del paso que se acaba de procesar.
  // nivel1: bloqueante para capturar el id del lead; usa conReintentos, fallo no bloquea al usuario.
  // parcial/completo: awaited con reintentos; si fallan todos devuelve guardado:false al cliente.
  let sesionParaDevolver = sesionActualizada
  let guardado = true

  if (paso.accion === 'guardar_nivel1') {
    const leadId = await conReintentos(() => guardarEnSupabase(sesionActualizada))
    if (leadId) {
      sesionParaDevolver = {
        ...sesionActualizada,
        leadId,
        leadIdSig: generateAdminToken(leadId),
      }
    } else {
      console.error('[gina] nivel1 falló tras 3 intentos — el guardado completo hará insert como fallback')
    }
  } else if (paso.accion === 'guardar_lead_completo') {
    // Cuestionario completo: etiqueta derivada de calificacion ('califica' | 'seguimiento-futuro')
    const leadId = await conReintentos(() => guardarEnSupabase(sesionActualizada, true, true))
    if (!leadId) {
      guardado = false
      console.error('[gina] guardado completo falló tras 3 intentos — lead perdido, revisar logs')
    } else {
      // Best-effort en cuanto a errores: un fallo de envío nunca hace fallar la
      // respuesta al usuario (mismo criterio que guardarTranscripcion abajo).
      // OJO: sí BLOQUEA — está await-eado, así que el render del PDF y la llamada
      // a Resend (timeout 8s) corren antes de responder el último paso del
      // cuestionario. El comentario anterior decía "nunca bloquea" y era falso.
      await enviarPlanPorEmail(leadId)
    }
  } else if (paso.accion === 'guardar_lead_parcial') {
    // Salida temprana (lead-en-preparacion): etiqueta ya en sesion.etiqueta, no es guardado completo
    const leadId = await conReintentos(() => guardarEnSupabase(sesionActualizada, true, false))
    if (!leadId) {
      guardado = false
      console.error('[gina] guardado parcial falló tras 3 intentos — lead perdido, revisar logs')
    }
  } else if (paso.id === 'transicion_nivel2' && siguientePasoId === 'despedida') {
    // "No" al nivel 2: guardado incompleto (no llegó al paso atribucion)
    const leadId = await conReintentos(() => guardarEnSupabase(sesionActualizada, true, false))
    if (!leadId) {
      guardado = false
      console.error('[gina] guardado (transicion_nivel2→no) falló tras 3 intentos')
    }
  }

  // ── Transcript de la conversación (Fase 2, ficha 360°) — guardado 100% aditivo ──
  // No modifica ninguno de los guardados de arriba ni lib/gina/flowEngine.ts: solo
  // persiste, en paralelo, los mensajes de este turno. Antes de que exista leadId
  // (bienvenida→p2_email) se acumulan en sesion.transcripcionPendiente; en cuanto
  // hay leadId, cada turno se persiste directo y el buffer queda vacío. Un fallo acá
  // nunca bloquea la respuesta al usuario ni afecta `guardado`.
  const nuevasEntradasTranscript = construirNuevasEntradas(paso, respuesta, siguientePaso, sesionActualizada)
  const leadIdParaTranscript = sesionParaDevolver.leadId
  if (leadIdParaTranscript) {
    const pendientes = [...(sesion.transcripcionPendiente ?? []), ...nuevasEntradasTranscript]
    try {
      await guardarTranscripcion(leadIdParaTranscript, pendientes)
    } catch (err) {
      console.error(
        `[gina] fallo guardando transcripción (no bloquea el flujo) — ts: ${new Date().toISOString()}`,
        err instanceof Error ? err.name : 'unknown',
      )
    }
    sesionParaDevolver = { ...sesionParaDevolver, transcripcionPendiente: [] }
  } else {
    sesionParaDevolver = {
      ...sesionParaDevolver,
      transcripcionPendiente: [...(sesion.transcripcionPendiente ?? []), ...nuevasEntradasTranscript],
    }
  }

  return NextResponse.json({
    sesionActualizada: sesionParaDevolver,
    siguientePaso,
    guardado,
  })
}

/**
 * Interpola {{nombre}} en un texto de Gina con el nombre real de la sesión —
 * mismo placeholder que ya usa flow.json, resuelto acá solo para el transcript
 * (el widget hace su propia interpolación para lo que le muestra al usuario).
 */
function interpolarTexto(texto: string, sesion: GinaSession): string {
  return texto.replace(/\{\{nombre\}\}/g, sesion.nombre || '')
}

/** Traduce la respuesta cruda (value/values) a su label legible, si el paso tiene opciones. */
function formatearRespuestaUsuario(paso: Paso, respuesta: string | string[]): string {
  if (!paso.opciones || paso.opciones.length === 0) {
    return Array.isArray(respuesta) ? respuesta.join(', ') : String(respuesta)
  }
  const labelPorValor = new Map(paso.opciones.map((o) => [o.value, o.label]))
  const valores = Array.isArray(respuesta) ? respuesta : [respuesta]
  return valores.map((v) => labelPorValor.get(v) ?? v).join(', ')
}

/**
 * Arma las entradas nuevas del transcript para este turno: el mensaje de Gina que
 * se acaba de responder + la respuesta del usuario y, si el siguiente paso es
 * terminal ("fin"), también ese último mensaje de Gina — porque no va a haber
 * otro request que lo capture. Los pasos virtuales (texto vacío, cortocircuitados
 * por flowEngine) no generan entradas.
 */
function construirNuevasEntradas(
  paso: Paso,
  respuesta: string | string[],
  siguientePaso: Paso,
  sesion: GinaSession,
): TranscripcionEntry[] {
  if (!paso.texto) return []

  const entradas: TranscripcionEntry[] = [
    { rol: 'gina', mensaje: interpolarTexto(paso.texto, sesion), pasoId: paso.id },
    { rol: 'usuario', mensaje: formatearRespuestaUsuario(paso, respuesta), pasoId: paso.id },
  ]

  if (siguientePaso.accion === 'fin' && siguientePaso.texto) {
    entradas.push({
      rol: 'gina',
      mensaje: interpolarTexto(siguientePaso.texto, sesion),
      pasoId: siguientePaso.id,
    })
  }

  return entradas
}

/**
 * Mapea las respuestas de la sesión al tipo LeadData y llama a saveLead.
 * Pasa sesion.leadId a saveLead: si existe hace update, si no hace insert.
 * Devuelve el id resultante (nuevo en insert, el mismo en update).
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
async function guardarEnSupabase(
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
    fuenteLead: 'gina',

    modalidad:
      sesion.origenResidencia === 'fuera' ? 'antes-de-viajar'
      : sesion.origenResidencia === 'en_espana' ? 'ya-en-espana'
      : undefined,

    ...(calificacion ? { calificacion } : {}),
  }

  return saveLead(lead as LeadData, sesion.leadId)
}

/**
 * Arma el Plan Estratégico del lead recién completado y lo envía por email a la
 * dirección que declaró en el cuestionario (lead.email), adjunto en PDF.
 * Nunca lanza — un fallo acá no debe impedir que la conversación termine
 * normalmente para el usuario; solo se registra en logs.
 */
async function enviarPlanPorEmail(leadId: string): Promise<void> {
  let lead: Awaited<ReturnType<typeof getLead>> | undefined
  try {
    lead = await getLead(leadId)

    // El formato del email SOLO se validaba en el cliente (GinaInput.tsx): el
    // servidor guarda `respuesta` cruda en flowEngine. Mientras el email era
    // apenas un dato del lead eso era un problema de calidad; desde que este
    // endpoint MANDA correo a esa dirección, un POST directo a /api/gina con un
    // email arbitrario convertiría al sitio en emisor hacia cualquier
    // destinatario, con adjunto y desde el dominio verificado de Resend.
    // Se corta acá, antes del envío.
    if (!EMAIL_VALIDO.test(lead.email ?? '')) {
      console.error(
        `[gina] Email del lead con formato inválido — no se envía el Plan. leadId: ${leadId}, ts: ${new Date().toISOString()}`,
      )
      return
    }
    const planArmado = armarPlan({
      paisResidencia:        lead.paisResidencia,
      modalidad:             lead.modalidad,
      documentacion:         lead.documentacion,
      situacionLaboral:      lead.situacionLaboral,
      mascotas:              lead.mascotas,
      ninos:                 lead.ninos,
      adolescentes:          lead.adolescentes,
      cuentaBancaria:        lead.cuentaBancaria,
      tipoLicencia:          lead.tipoLicencia,
      nivelEstudios:         lead.nivelEstudios,
      presupuestoMensual:    lead.presupuestoMensual,
      garantias:             lead.garantias,
      fechaLlegada:          lead.fechaLlegada,
      necesidadesEspeciales: lead.necesidadesEspeciales,
      adultos:               lead.adultos,
    })
    const buffer = await generarPlanPdf(lead, planArmado)
    // El nombre lo escribe el usuario: se limpia a [a-z0-9-] para que no viaje
    // ningún separador de ruta ni comilla dentro del filename del adjunto.
    // `|| 'cliente'` cubre el nombre que queda vacío tras el filtrado (por
    // ejemplo, escrito íntegro en un alfabeto no latino).
    const slug =
      lead.nombreCompleto.trim().replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '') ||
      'cliente'

    await sendEmail({
      to: lead.email,
      subject: 'Tu Plan Estratégico — Tu Lugar en Galicia',
      html: buildPlanEmail(lead.nombreCompleto),
      attachments: [{ filename: `plan-${slug}.pdf`, content: buffer.toString('base64') }],
    })
  } catch (err) {
    console.error(
      `[gina] Error enviando el Plan Estratégico por email — leadId: ${leadId}, ts: ${new Date().toISOString()}`,
      err instanceof Error ? err.name : 'unknown',
    )
    // Alerta visible a Silvana — sin esto, un fallo de envío solo quedaba en logs
    // (auditoría de sesión 2026-07-19). Best-effort: si esta también falla, no hay
    // más fallback que el log de arriba.
    const adminEmail = process.env.SILVANA_EMAIL
    if (adminEmail) {
      try {
        await sendEmail({
          to: adminEmail,
          subject: `⚠️ Falló el envío del Plan Estratégico — ${lead?.nombreCompleto ?? leadId}`,
          html: buildPlanEmailFallidoAlerta({
            nombre: lead?.nombreCompleto ?? '(no disponible)',
            email: lead?.email ?? '(no disponible)',
            leadId,
          }),
        })
      } catch (alertErr) {
        console.error(
          `[gina] Además falló el envío de la alerta a Silvana — leadId: ${leadId}`,
          alertErr instanceof Error ? alertErr.name : 'unknown',
        )
      }
    } else {
      console.error('[gina] SILVANA_EMAIL no configurado — alerta de fallo omitida')
    }
  }
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

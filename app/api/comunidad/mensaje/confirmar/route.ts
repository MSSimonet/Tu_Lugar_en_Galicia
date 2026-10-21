/**
 * POST /api/comunidad/mensaje/confirmar — entrega un mensaje privado que estaba esperando que
 * su remitente confirmara el email (§5.12).
 *
 * Es la única puerta por la que sale un mensaje al destinatario. Llegar hasta acá prueba que
 * quien escribió controla la casilla que declaró, así que el `replyTo` deja de ser un dato
 * inventable: es la garantía que faltaba.
 *
 * POST y no GET, como los otros dos confirmadores: los escáneres de correo prefetchean los
 * enlaces de un mail, y un GET que entregara mandaría el mensaje sin que nadie hiciera clic.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { isValidUuid } from '@/lib/utils/validation'
import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import { consumirMensajePendiente } from '@/lib/comunidad/mensajes'
import { sendEmail } from '@/lib/admin/email'
import { buildComunidadMensajeEmail } from '@/lib/comunidad/email'
import type { ComunidadPerfil } from '@/lib/comunidad/types'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '10 m'),
        analytics: false,
        prefix: 'ratelimit:comunidad-mensaje-confirmar',
      })
    : null

const MENSAJES: Record<'invalido' | 'expirado' | 'usado', string> = {
  invalido: 'Este enlace no es válido. Vuelve a escribir el mensaje desde el mapa.',
  expirado: 'Este enlace caducó — vale una hora. Vuelve a escribir el mensaje desde el mapa.',
  usado: 'Este mensaje ya se envió, o pasó más de una hora desde que lo escribiste.',
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'https://tu-lugar-en-galicia.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.NODE_ENV === 'development' && 'http://localhost:3000',
  ].filter((x): x is string => Boolean(x))

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })
  }

  if (!ratelimit) {
    console.error('[comunidad/mensaje/confirmar] ratelimit no configurado — faltan variables de Upstash')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }
  const ip = getRealIp(req)
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  const { id, token } = body as Record<string, unknown>
  if (typeof id !== 'string' || !isValidUuid(id) || typeof token !== 'string' || !token) {
    return NextResponse.json({ error: MENSAJES.invalido }, { status: 400 })
  }

  const pendiente = await consumirMensajePendiente(id, token)
  if (!pendiente.ok) {
    return NextResponse.json({ error: MENSAJES[pendiente.motivo] }, { status: 400 })
  }

  // El destinatario se vuelve a buscar AHORA, no se guardó su email en el sobre. Dos motivos:
  // no dejar direcciones de terceros dando vueltas en Redis, y —desde que existe la baja
  // self-service del Toggle B— porque puede haberse dado de baja entre que el mensaje se
  // escribió y se confirmó. En ese caso no hay a quién entregarlo.
  let destinatario: Pick<ComunidadPerfil, 'email' | 'nombre'> | null = null
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('comunidad')
      .select('email,nombre')
      .eq('id', pendiente.mensaje.destinatarioId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    destinatario = data
  } catch (err) {
    console.error(
      `[comunidad/mensaje/confirmar] error buscando destinatario — ts: ${new Date().toISOString()}`,
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' }, { status: 500 })
  }

  if (!destinatario) {
    return NextResponse.json({ error: 'Ese perfil ya no está en el mapa.' }, { status: 404 })
  }

  try {
    await sendEmail({
      to: destinatario.email,
      subject: `${pendiente.mensaje.remitenteNombre} te escribió desde Formando comunidad`,
      html: buildComunidadMensajeEmail({
        destinatarioNombre: destinatario.nombre,
        remitenteNombre: pendiente.mensaje.remitenteNombre,
        mensaje: pendiente.mensaje.mensaje,
      }),
      // Ahora sí es una dirección verificada: el enlace que disparó esto llegó a ella.
      replyTo: pendiente.mensaje.remitenteEmail,
    })
  } catch (err) {
    const status = err instanceof Error ? err.message.match(/^Resend error (\d+)/)?.[1] : undefined
    console.error(`[comunidad/mensaje/confirmar] Resend falló — status: ${status ?? 'desconocido'}, ts: ${new Date().toISOString()}`)
    // El sobre ya se consumió, así que este enlace no sirve para reintentar. Se dice.
    return NextResponse.json(
      { error: 'No se pudo enviar el mensaje. Vuelve a escribirlo desde el mapa.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, destinatarioNombre: destinatario.nombre })
}

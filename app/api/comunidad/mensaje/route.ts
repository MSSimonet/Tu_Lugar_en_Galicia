import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import { sendEmail } from '@/lib/admin/email'
import { buildComunidadConfirmarMensajeEmail } from '@/lib/comunidad/email'
import { crearMensajePendiente } from '@/lib/comunidad/mensajes'
import type { ComunidadPerfil } from '@/lib/comunidad/types'
import { isValidUuid } from '@/lib/utils/validation'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, '10 m'),
        analytics: false,
        prefix: 'ratelimit:comunidad-mensaje',
      })
    : null

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Límites de longitud — sin esto, un cliente que no sea el formulario real puede mandar un
// "nombre" o "mensaje" arbitrariamente largo que termina interpolado en el HTML del mail
// enviado vía Resend (lib/comunidad/email.ts).
const MAX_NOMBRE = 80
const MAX_MENSAJE = 2000

export async function POST(req: NextRequest) {
  // 0. Verificación de origen — mismo patrón fail-closed que el resto de endpoints públicos.
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

  // 1. Rate limiting (fail-closed) — clave por IP, tope bajo: es mensajería, no un formulario masivo.
  if (!ratelimit) {
    console.error('[comunidad/mensaje] ratelimit no configurado — faltan variables de Upstash')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }
  const ip = getRealIp(req)
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Demasiados mensajes. Inténtalo más tarde.' }, { status: 429 })
  }

  // 2. Parseo y validación.
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  const { destinatarioId, remitenteEmail, remitenteNombre, mensaje } = body as Record<string, unknown>

  if (typeof destinatarioId !== 'string' || !isValidUuid(destinatarioId)) {
    return NextResponse.json({ error: 'Destinatario inválido.' }, { status: 400 })
  }
  if (typeof remitenteEmail !== 'string' || !isValidEmail(remitenteEmail.trim())) {
    return NextResponse.json({ error: 'Tu email no es válido.' }, { status: 400 })
  }
  if (typeof remitenteNombre !== 'string' || remitenteNombre.trim().length < 2 || remitenteNombre.trim().length > MAX_NOMBRE) {
    return NextResponse.json({ error: 'Tu nombre es obligatorio.' }, { status: 400 })
  }
  if (typeof mensaje !== 'string' || mensaje.trim().length < 5 || mensaje.trim().length > MAX_MENSAJE) {
    return NextResponse.json({ error: 'El mensaje es obligatorio.' }, { status: 400 })
  }

  const remitenteEmailLimpio = remitenteEmail.trim().toLowerCase()
  const remitenteNombreLimpio = remitenteNombre.trim()
  const mensajeLimpio = mensaje.trim()

  // 3. Buscar al destinatario por id (server-side, bypassea RLS) — su email real nunca
  //    viaja al cliente, ni antes ni después de este paso (docs/comunidad-de-acogida.md §4).
  let destinatario: Pick<ComunidadPerfil, 'email' | 'nombre'> | null = null
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('comunidad')
      .select('email,nombre')
      .eq('id', destinatarioId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    destinatario = data
  } catch (err) {
    console.error(`[comunidad/mensaje] Error buscando destinatario — ts: ${new Date().toISOString()}`, err instanceof Error ? err.name : 'unknown')
    return NextResponse.json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' }, { status: 500 })
  }

  if (!destinatario) {
    return NextResponse.json({ error: 'Ese perfil ya no está disponible.' }, { status: 404 })
  }

  // 4. El mensaje NO se entrega todavía.
  //
  //    Antes, acá se mandaba el correo al destinatario con `replyTo: remitenteEmail`, un dato
  //    que el cliente declaraba sin ninguna verificación. Eso permitía cosechar el email de un
  //    miembro: mandarle un mensaje creíble con un replyTo propio y esperar a que respondiera.
  //    El email de los miembros es justamente lo que la migración 0002 sacó del alcance de la
  //    anon key (§5.12 de docs/arranque.md).
  //
  //    Ahora el mensaje espera en un sobre y se le manda un enlace al REMITENTE. Solo al
  //    abrirlo se entrega — así el replyTo es siempre una casilla que quien escribe controla.
  const pendiente = await crearMensajePendiente({
    destinatarioId,
    remitenteNombre: remitenteNombreLimpio,
    remitenteEmail: remitenteEmailLimpio,
    mensaje: mensajeLimpio,
  })
  if (!pendiente) {
    console.error('[comunidad/mensaje] no se pudo crear el pendiente — faltan variables de Upstash')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }

  // 5. Mail al remitente. Si falla, no se entregó nada y el sobre expira solo en 1 h.
  try {
    await sendEmail({
      to: remitenteEmailLimpio,
      subject: 'Confirma tu mensaje en Formando comunidad',
      html: buildComunidadConfirmarMensajeEmail({
        remitenteNombre: remitenteNombreLimpio,
        destinatarioNombre: destinatario.nombre,
        mensaje: mensajeLimpio,
        id: pendiente.id,
        token: pendiente.token,
      }),
    })
  } catch (err) {
    const status = err instanceof Error ? err.message.match(/^Resend error (\d+)/)?.[1] : undefined
    console.error(`[comunidad/mensaje] Resend falló — status: ${status ?? 'desconocido'}, ts: ${new Date().toISOString()}`)
    return NextResponse.json({ error: 'No pudimos enviarte el correo de confirmación. Intenta de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

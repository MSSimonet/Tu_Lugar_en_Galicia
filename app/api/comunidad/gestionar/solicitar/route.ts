/**
 * POST /api/comunidad/gestionar/solicitar — manda el enlace para gestionar el propio perfil.
 *
 * LA REGLA QUE NO SE PUEDE ROMPER ACÁ: la respuesta es IDÉNTICA exista o no un perfil con ese
 * email. Si distinguiera los casos —por status, por texto, o por tardar distinto— este
 * endpoint se convertiría en un oráculo de "quién está registrado en el mapa", que es
 * exactamente el metadato que PII-01 vino a cerrar. Se puede probar con la dirección de
 * cualquier persona y no se aprende nada.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { leerPerfilParaGestion } from '@/lib/comunidad/perfil'
import { crearSesionGestion } from '@/lib/comunidad/gestion'
import { sendEmail } from '@/lib/admin/email'
import { buildComunidadGestionEmail } from '@/lib/comunidad/email'

// Tope bajo: es un disparador de correos hacia terceros. 3 cada 10 minutos alcanza de sobra
// para alguien que se equivocó al tipear su email y frena el uso del endpoint como forma de
// molestar a una casilla ajena.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(3, '10 m'),
        analytics: false,
        prefix: 'ratelimit:comunidad-gestion-solicitar',
      })
    : null

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * La única respuesta de éxito posible. Se devuelve tanto si se mandó un mail como si no
 * había perfil que gestionar — ver el bloque de arriba.
 */
function aceptado(): NextResponse {
  return NextResponse.json({ ok: true })
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
    console.error('[comunidad/gestionar] ratelimit no configurado — faltan variables de Upstash')
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

  const { email } = body as Record<string, unknown>
  // El formato SÍ se valida y sí devuelve error: eso no revela nada sobre quién está
  // registrado, solo que "asdf" no es una dirección.
  if (typeof email !== 'string' || !isValidEmail(email.trim())) {
    return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 })
  }
  const emailLimpio = email.trim().toLowerCase()

  try {
    const perfil = await leerPerfilParaGestion(emailLimpio)
    // Sin perfil: se corta acá y se responde igual. Nadie se entera de nada.
    if (!perfil) return aceptado()

    const sesion = await crearSesionGestion(emailLimpio)
    if (!sesion) {
      console.error('[comunidad/gestionar] no se pudo crear la sesion — faltan variables de Upstash')
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
    }

    await sendEmail({
      to: emailLimpio,
      subject: 'Gestiona tu perfil en Formando comunidad',
      html: buildComunidadGestionEmail({ nombre: perfil.nombre, id: sesion.id, token: sesion.token }),
    })
  } catch (err) {
    // Sin volcar `err` crudo (A02): puede arrastrar el email en el mensaje de Supabase/Resend.
    console.error(
      `[comunidad/gestionar] fallo al enviar el enlace — ts: ${new Date().toISOString()}`,
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'No se pudo enviar el enlace. Intenta de nuevo.' }, { status: 500 })
  }

  return aceptado()
}

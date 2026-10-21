/**
 * POST /api/comunidad/confirmar — completa un alta que estaba a la espera de que su dueño
 * confirmara el email. Es la ÚNICA puerta de escritura a la tabla `comunidad` (§5.6 de
 * docs/arranque.md).
 *
 * POR QUÉ ES POST Y NO GET:
 * el link del mail apunta a la PÁGINA /comunidad/confirmar, que no muta nada; recién su
 * botón llama acá. Los escáneres corporativos y los proxies de correo (SafeLinks, el proxy
 * de imágenes de Gmail) prefetchean los links de un mail, así que un GET que escribiera se
 * dispararía solo, sin que la persona hiciera nada. Un clic más y desaparece esa clase
 * entera de rarezas.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { isValidUuid } from '@/lib/utils/validation'
import { consumirPendiente } from '@/lib/comunidad/pendientes'
import { upsertPerfilComunidad } from '@/lib/comunidad/perfil'

// Tope generoso: acá no hay nada que enumerar —el token es HMAC-SHA256 sobre un uuid v4 que
// genera el servidor— así que el límite es anti-abuso, no el control de seguridad. Alcanza
// para que alguien reintente varias veces si le falla la conexión.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '10 m'),
        analytics: false,
        prefix: 'ratelimit:comunidad-confirmar',
      })
    : null

/** Mensajes de cara al usuario para cada final posible (voz: qué pasó y qué hacer). */
const MENSAJES: Record<'invalido' | 'expirado' | 'usado', string> = {
  invalido: 'Este enlace no es válido. Vuelve a registrarte y te mandamos uno nuevo.',
  expirado: 'Pasaron más de 24 horas y el enlace ya no es válido — nada grave, es solo por tu seguridad. Vuelve a registrarte y te mandamos uno nuevo.',
  usado: 'Este enlace ya no sirve: o ya lo usaste, o pasaron más de 24 horas. Si no te ves en el mapa, vuelve a registrarte.',
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 0. Verificación de origen — mismo patrón fail-closed que /registro y /mensaje. Acá sí
  //    aplica (a diferencia de /api/comunidad/[id]/contacto, ver su comentario): es un POST,
  //    y los navegadores mandan Origin en todo POST.
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

  // 1. Rate limiting (fail-closed).
  if (!ratelimit) {
    console.error('[comunidad/confirmar] ratelimit no configurado — faltan variables de Upstash')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }
  const ip = getRealIp(req)
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, { status: 429 })
  }

  // 2. Parseo.
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

  // 3. Verificar la firma y consumir el pendiente (atómico: lee y borra de una).
  const resultado = await consumirPendiente(id, token)
  if (!resultado.ok) {
    return NextResponse.json({ error: MENSAJES[resultado.motivo] }, { status: 400 })
  }

  // 4. Recién ahora se escribe en `comunidad`. Llegar hasta acá prueba que quien confirma
  //    recibió el mail en la casilla que declaró al registrarse.
  try {
    await upsertPerfilComunidad(resultado.perfil)
  } catch (err) {
    // Sin volcar `err` crudo (A02): el mensaje de Supabase puede arrastrar datos de la fila.
    console.error(
      `[comunidad/confirmar] Supabase upsert falló — ts: ${new Date().toISOString()}`,
      err instanceof Error ? err.name : 'unknown',
    )
    // El pendiente ya se consumió, así que este link no sirve para reintentar. Se dice.
    return NextResponse.json(
      { error: 'No pudimos completar tu registro. Vuelve a registrarte para intentarlo de nuevo.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}

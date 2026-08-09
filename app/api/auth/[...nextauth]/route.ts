/**
 * app/api/auth/[...nextauth]/route.ts — handlers de Auth.js, con rate limiting en el login
 * por credenciales (auditoría 2026-08-08, SEC-02).
 *
 * Antes exportaba los handlers pelados: no había throttling de ningún tipo contra el único
 * login del panel, con un email conocido y detrás toda la base de leads. bcrypt frena el
 * ritmo pero no es un límite — no había bloqueo ni ventana, así que la fuerza bruta era
 * ilimitada. Mismo patrón Upstash que los otros 7 endpoints del proyecto.
 *
 * ACOTADO AL CALLBACK DE CREDENCIALES a propósito, no a todo /api/auth. El POST de Auth.js
 * también sirve signout y otras rutas, y limitar el prefijo entero las castigaría de rebote.
 * El fetch de CSRF que hace signIn() antes de postear es un GET
 * (node_modules/next-auth/react.js:152), así que no consume cuota: cada intento de login
 * gasta exactamente un token.
 *
 * FORMA DE LA RESPUESTA: el cliente hace `new URL(data.url)` ANTES de mirar `res.ok`
 * (react.js:174). Un 429 sin campo `url` haría que signIn() lance en vez de devolver, y
 * app/admin/login/page.tsx no envuelve la llamada en try/catch: el formulario quedaría
 * colgado en "Entrando…". Por eso el cuerpo del rechazo trae una `url` absoluta con el
 * motivo en ?error=, que es el canal por el que el cliente ya transporta errores.
 *
 * FAIL-CLOSED si faltan las variables de Upstash, igual que los otros endpoints (A03). El
 * trade-off es real y está elegido: sin Upstash nadie entra al panel, incluida Silvana. Se
 * prefiere una caída de disponibilidad del panel interno antes que perder el límite justo
 * cuando un atacante podría haber provocado la caída.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { handlers } from '@/auth'
import { getRealIp } from '@/lib/utils/ip'

export const { GET } = handlers

// 10 intentos cada 10 minutos por IP: holgado para quien se equivoca tipeando,
// inservible para recorrer un diccionario.
const MAX_INTENTOS = 10
const VENTANA = '10 m'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(MAX_INTENTOS, VENTANA),
        analytics: false,
        prefix: 'ratelimit:admin-login',
      })
    : null

/** Rechazo con la forma que el cliente de Auth.js sabe parsear (ver nota arriba). */
function rechazo(req: NextRequest, status: number, error: string): NextResponse {
  const url = new URL('/admin/login', req.nextUrl.origin)
  url.searchParams.set('error', error)
  return NextResponse.json({ url: url.toString() }, { status })
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!req.nextUrl.pathname.endsWith('/callback/credentials')) {
    return handlers.POST(req)
  }

  if (!ratelimit) {
    console.error(
      '[admin-login] ratelimit no configurado — faltan UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN',
    )
    return rechazo(req, 503, 'RateLimitUnavailable')
  }

  const { success } = await ratelimit.limit(getRealIp(req))
  if (!success) {
    return rechazo(req, 429, 'RateLimited')
  }

  return handlers.POST(req)
}

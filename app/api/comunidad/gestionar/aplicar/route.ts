/**
 * POST /api/comunidad/gestionar/aplicar — ejecuta una acción sobre el propio perfil.
 *
 * Dos acciones, ambas detrás de la misma sesión firmada:
 *   'visibilidad' → cambia mostrar_contacto (PII-01)
 *   'borrar'      → elimina el perfil (RGPD art. 17, derecho de supresión)
 *
 * SUPERFICIE DE ESCRITURA A PROPÓSITO MÍNIMA: no reusa upsertPerfilComunidad, que escribe la
 * fila entera. Cada acción llama a una función que toca lo mínimo. Aunque alguien mande
 * nombre, lat o lng en el body, no existe el camino para que eso llegue a la base.
 *
 * Es POST y no GET por el mismo motivo que /api/comunidad/confirmar: los escáneres de correo
 * prefetchean enlaces, y acá una de las acciones borra una cuenta.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { isValidUuid } from '@/lib/utils/validation'
import { leerSesionGestion, cerrarSesionGestion } from '@/lib/comunidad/gestion'
import { actualizarMostrarContacto, borrarPerfil } from '@/lib/comunidad/perfil'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '10 m'),
        analytics: false,
        prefix: 'ratelimit:comunidad-gestion-aplicar',
      })
    : null

const MENSAJES: Record<'invalido' | 'expirado', string> = {
  invalido: 'Este enlace no es válido. Pide uno nuevo desde la página de gestión.',
  expirado: 'Este enlace caducó — vale una hora. Pide uno nuevo y lo tendrás en tu correo.',
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
    console.error('[comunidad/gestionar/aplicar] ratelimit no configurado — faltan variables de Upstash')
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

  const { id, token, accion, valor } = body as Record<string, unknown>

  if (typeof id !== 'string' || !isValidUuid(id) || typeof token !== 'string' || !token) {
    return NextResponse.json({ error: MENSAJES.invalido }, { status: 400 })
  }
  if (accion !== 'visibilidad' && accion !== 'borrar') {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }
  if (accion === 'visibilidad' && typeof valor !== 'boolean') {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  const sesion = await leerSesionGestion(id, token)
  if (!sesion.ok) {
    return NextResponse.json({ error: MENSAJES[sesion.motivo] }, { status: 400 })
  }

  try {
    if (accion === 'visibilidad') {
      await actualizarMostrarContacto(sesion.email, valor as boolean)
      return NextResponse.json({ ok: true, mostrarContacto: valor })
    }

    await borrarPerfil(sesion.email)
    // La sesión apunta a un email que ya no tiene perfil: se cierra para que el enlace no
    // vuelva a cargar una página vacía durante la hora que le quedaba de vida.
    await cerrarSesionGestion(id)
    return NextResponse.json({ ok: true, borrado: true })
  } catch (err) {
    console.error(
      `[comunidad/gestionar/aplicar] fallo la accion ${accion} — ts: ${new Date().toISOString()}`,
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'No se pudo completar la acción. Intenta de nuevo.' }, { status: 500 })
  }
}

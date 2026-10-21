/**
 * GET /api/comunidad/[id]/contacto — entrega el teléfono de UN perfil, y solo si su dueño
 * activó `mostrar_contacto` (migración 0010, PII-01).
 *
 * Por qué existe: la anon key ya no puede leer la columna `contacto`, así que el mapa no
 * la trae en su carga masiva. Este endpoint es la única puerta al número, y sirve de a uno.
 *
 * QUÉ PROTEGE Y QUÉ NO — importa no confundirse:
 * el mapa reparte todos los `id` públicamente, así que cualquiera puede enumerarlos y llamar
 * acá una vez por cada uno. El rate limit lo hace lento, no imposible. Lo que hace que eso no
 * sea una fuga es el flag: lo único que este endpoint devuelve son teléfonos que su dueño
 * eligió publicar. El rate limit es anti-abuso, NO es el control de seguridad — no tratarlo
 * como si lo fuera.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import { isValidUuid } from '@/lib/utils/validation'

// Tope más alto que el de /registro y /mensaje (5 por 10 min): aquellos son escrituras
// puntuales y este es una lectura que dispara la gente navegando el mapa. Aun así solo cuenta
// revelaciones reales —el cliente solo llama acá cuando alguien pide ver un número—, así que
// 20 sobra para cualquier uso humano y deja la enumeración completa en horas por IP.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, '10 m'),
        analytics: false,
        prefix: 'ratelimit:comunidad-contacto',
      })
    : null

/**
 * Respuesta única para TODO lo que no sea una revelación exitosa: id mal formado, perfil
 * inexistente, perfil que existe pero no activó el flag, y perfil con el flag activo pero sin
 * teléfono cargado. Los cuatro casos devuelven exactamente lo mismo, byte por byte.
 *
 * El motivo: que el perfil exista ya es público (el mapa lo muestra), pero si hay o no un
 * teléfono guardado detrás de un `mostrar_contacto` en false NO lo es. Distinguir los casos por
 * status o por texto de error convertiría este endpoint en un oráculo de "quién dejó su número",
 * que es justo el metadato que PII-01 vino a cerrar.
 */
function noDisponible(): NextResponse {
  return NextResponse.json({ error: 'No disponible.' }, { status: 404 })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Sin verificación de Origin, a diferencia de /api/comunidad/registro y /mensaje. No es un
  // olvido y no hace falta re-discutirlo: está MEDIDO contra el servidor real (2026-08-08) con
  // un fetch GET del mismo origen desde una página del sitio. Lo que llega es
  //   origin: null   |   sec-fetch-site: "same-origin"
  // Los navegadores solo agregan Origin en peticiones CORS o con método distinto de GET/HEAD,
  // así que exigirlo acá daría 403 a todas las llamadas legítimas de la tarjeta del mapa —
  // aquellos dos endpoints son POST y por eso allá sí funciona.
  //
  // Se evaluó usar Sec-Fetch-Site, que sí viaja, y se descartó: un atacante con curl lo pone a
  // mano en una línea (solo es infalsificable desde JS de página, no desde un script), así que
  // no frena la enumeración que importa, y exigirlo rompería navegadores viejos que no lo mandan.
  // El freno de este endpoint es el rate limit; la protección real es el flag por fila.
  if (!ratelimit) {
    console.error('[comunidad/contacto] ratelimit no configurado — faltan variables de Upstash')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }
  const ip = getRealIp(req)
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, { status: 429 })
  }

  const { id } = await params
  // Se descarta sin tocar la base: un uuid mal formado no puede corresponder a ningún perfil.
  if (!id || !isValidUuid(id)) return noDisponible()

  let fila: { contacto: string | null; mostrar_contacto: boolean } | null = null
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('comunidad')
      .select('contacto,mostrar_contacto')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    fila = data
  } catch (err) {
    // Sin volcar `err` crudo (A02): el mensaje de Supabase puede arrastrar datos de la fila.
    console.error(
      `[comunidad/contacto] Error consultando el perfil — ts: ${new Date().toISOString()}`,
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'No se pudo completar la solicitud.' }, { status: 500 })
  }

  if (!fila || !fila.mostrar_contacto || !fila.contacto?.trim()) return noDisponible()

  // El header Cache-Control: no-store lo pone middleware.ts para todo /api/ que no sea
  // /api/clima ni /api/marcador — este número no debe quedar cacheado en ningún proxy.
  return NextResponse.json({ contacto: fila.contacto.trim() })
}

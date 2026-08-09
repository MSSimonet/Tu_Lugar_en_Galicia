import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { geocodificarInterseccion } from '@/lib/comunidad/nominatim'
import { crearPendiente } from '@/lib/comunidad/pendientes'
import { sendEmail } from '@/lib/admin/email'
import { buildComunidadConfirmacionEmail } from '@/lib/comunidad/email'
import type { Actividad, ComunidadRegistroInput } from '@/lib/comunidad/types'

const ACTIVIDADES_VALIDAS: Actividad[] = ['cafe_cerveza_mate', 'caminata', 'apoyo_emocional']

// Misma lista que CIUDADES en components/comunidad/FormularioComunidad.tsx — el <select> del
// formulario ya restringe la ciudad, pero el cliente puede mandar cualquier string saltándose
// la UI, así que se revalida server-side (defensa en profundidad).
const CIUDADES_VALIDAS = ['Vigo', 'A Coruña', 'Santiago de Compostela', 'Pontevedra', 'Lugo']

// Límites de longitud — sin esto, un cliente que no sea el formulario real puede mandar
// strings arbitrariamente largos que se guardan tal cual en Supabase y se
// interpolan en el HTML del mail de mensaje privado.
const MAX_NOMBRE = 80
const MAX_CALLE = 120
const MAX_CONTACTO = 30
const MAX_FOTO_URL = 500

function isValidContacto(value: string): boolean {
  return value.length <= MAX_CONTACTO && /^[\d\s()+.\-]+$/.test(value)
}

function isValidFotoUrl(value: string): boolean {
  if (value.length > MAX_FOTO_URL) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, '10 m'),
        analytics: false,
        prefix: 'ratelimit:comunidad-registro',
      })
    : null

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  // 0. Verificación de origen — mismo patrón fail-closed que /api/contacto y /api/lead.
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
    console.error('[comunidad/registro] ratelimit no configurado — faltan variables de Upstash')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }
  const ip = getRealIp(req)
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, { status: 429 })
  }

  // 2. Parseo y validación del body.
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  const input = body as Partial<ComunidadRegistroInput>

  if (!input.email || typeof input.email !== 'string' || !isValidEmail(input.email.trim())) {
    return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 })
  }
  if (!input.nombre || typeof input.nombre !== 'string' || input.nombre.trim().length < 2 || input.nombre.trim().length > MAX_NOMBRE) {
    return NextResponse.json({ error: 'El nombre/alias es obligatorio.' }, { status: 400 })
  }
  if (
    !input.calle1 || typeof input.calle1 !== 'string' || input.calle1.trim().length > MAX_CALLE ||
    !input.calle2 || typeof input.calle2 !== 'string' || input.calle2.trim().length > MAX_CALLE
  ) {
    return NextResponse.json({ error: 'Indica las dos calles de tu intersección.' }, { status: 400 })
  }
  if (!input.ciudad || typeof input.ciudad !== 'string' || !CIUDADES_VALIDAS.includes(input.ciudad.trim())) {
    return NextResponse.json({ error: 'La ciudad es obligatoria.' }, { status: 400 })
  }
  if (!Array.isArray(input.disponibilidad) || !input.disponibilidad.every(a => ACTIVIDADES_VALIDAS.includes(a as Actividad))) {
    return NextResponse.json({ error: 'Actividades inválidas.' }, { status: 400 })
  }
  if (input.rgpd !== true) {
    return NextResponse.json({ error: 'Debes aceptar la política de privacidad para continuar.' }, { status: 400 })
  }
  if (typeof input.contacto === 'string' && input.contacto.trim() && !isValidContacto(input.contacto.trim())) {
    return NextResponse.json({ error: 'El teléfono/WhatsApp no es válido.' }, { status: 400 })
  }
  if (typeof input.fotoUrl === 'string' && input.fotoUrl.trim() && !isValidFotoUrl(input.fotoUrl.trim())) {
    return NextResponse.json({ error: 'La URL de la foto no es válida (debe ser https).' }, { status: 400 })
  }

  const email = input.email.trim().toLowerCase()
  const nombre = input.nombre.trim()
  const calle1 = input.calle1.trim()
  const calle2 = input.calle2.trim()
  const ciudad = input.ciudad.trim()
  const disponibilidad = input.disponibilidad as Actividad[]
  const contacto = typeof input.contacto === 'string' && input.contacto.trim() ? input.contacto.trim() : undefined
  const fotoUrl = typeof input.fotoUrl === 'string' && input.fotoUrl.trim() ? input.fotoUrl.trim() : undefined

  // 3. Geocodificar la intersección (Nominatim — decisión cerrada en el doc §7).
  const coords = await geocodificarInterseccion(calle1, calle2, ciudad)
  if (!coords) {
    return NextResponse.json(
      { error: 'No pudimos ubicar esa intersección. Revisa los nombres de las calles.' },
      { status: 422 },
    )
  }

  // 4. Guardar el alta a la espera de que su dueño confirme el email.
  //
  //    ESTE ENDPOINT YA NO ESCRIBE EN `comunidad`. Antes llamaba directo a
  //    upsertPerfilComunidad(), que hace upsert por email siendo el email la PK: cualquiera
  //    que supiera el email de una persona registrada le pisaba la fila entera, incluida su
  //    ubicación en el mapa. La escritura ahora vive en /api/comunidad/confirmar y solo
  //    ocurre después del clic en el mail. Ver lib/comunidad/pendientes.ts para el detalle.
  const pendiente = await crearPendiente({
    email,
    nombre,
    fotoUrl,
    lat: coords.lat,
    lng: coords.lng,
    disponibilidad,
    contacto,
  })
  if (!pendiente) {
    console.error('[comunidad/registro] no se pudo crear el pendiente — faltan variables de Upstash')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }

  // 5. Mandar el mail con el link firmado. Si esto falla, el alta no se completa: el
  //    pendiente queda en Redis y expira solo en 24 h, sin dejar rastro en la base.
  try {
    await sendEmail({
      to: email,
      subject: 'Confirma tu registro en Formando comunidad',
      html: buildComunidadConfirmacionEmail({
        nombre,
        id: pendiente.id,
        token: pendiente.token,
      }),
    })
  } catch (err) {
    const status = err instanceof Error ? err.message.match(/^Resend error (\d+)/)?.[1] : undefined
    console.error(`[comunidad/registro] Resend falló — status: ${status ?? 'desconocido'}, ts: ${new Date().toISOString()}`)
    return NextResponse.json({ error: 'No pudimos enviarte el correo de confirmación. Intenta de nuevo.' }, { status: 500 })
  }

  // Respuesta idéntica exista o no ya un perfil con ese email: este endpoint no debe servir
  // para averiguar quién está registrado.
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, buildContactoEmail } from '@/lib/admin/email'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getRealIp } from '@/lib/utils/ip'
import { saveLead, type LeadData } from '@/lib/leads'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, '10 m'),
        analytics: false,
        prefix: 'ratelimit:contacto',
      })
    : null

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  // 0. Verificación de origen (A1 — mismo patrón que /api/lead y /api/gina)
  // Fail-closed: se rechaza si falta el header Origin o si no matchea el allowlist.
  // Este endpoint solo recibe POST desde fetch() del navegador (FormularioContacto.tsx)
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
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })
  }

  // 1. Rate limiting (fail-closed: sin config, se rechaza — A1)
  if (!ratelimit) {
    console.error('[contacto] ratelimit no configurado — faltan UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN en el entorno')
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

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  const { nombre, email, telefono, mensaje } = body as Record<string, unknown>

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
    return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 })
  }
  if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length < 5) {
    return NextResponse.json({ error: 'El mensaje es obligatorio.' }, { status: 400 })
  }

  const nombreLimpio   = nombre.trim()
  const emailLimpio    = email.trim().toLowerCase()
  const telefonoLimpio = typeof telefono === 'string' && telefono.trim() ? telefono.trim() : undefined
  const mensajeLimpio  = mensaje.trim()

  // ── 1. Guardar en Supabase (tabla `leads`) PRIMERO ───────────────────────
  // Si falla aquí → error real al cliente (el contacto no quedó registrado).
  // Este formulario solo captura nombre/email/teléfono(opcional)/mensaje — el resto
  // de los campos de LeadData quedan sin responder (nullable en la tabla `leads`,
  // ver docs/crm-supabase-fase0.md §8).
  const lead: Partial<LeadData> & Pick<LeadData, 'nombreCompleto' | 'email' | 'consentimientoRGPD'> = {
    nombreCompleto: nombreLimpio,
    email: emailLimpio,
    etiqueta: 'contacto-directo',
    consentimientoRGPD: true,
    notasContacto: mensajeLimpio,
    fuenteLead: 'contacto',
    ...(telefonoLimpio ? { telefono: telefonoLimpio } : {}),
  }

  try {
    await saveLead(lead as LeadData)
  } catch (err) {
    // Nunca volcar el mensaje de error crudo — puede ecoar valores de campo (PII).
    console.error(`[contacto] Error al guardar en Supabase — ts: ${new Date().toISOString()}`, err instanceof Error ? err.name : 'unknown')
    return NextResponse.json({ error: 'No se pudo registrar tu consulta. Intenta de nuevo.' }, { status: 500 })
  }

  // ── 2. Notificación a Silvana — best-effort ───────────────────────────────
  // El lead ya está guardado en Supabase. Si el mail falla, el cliente ve éxito igualmente.
  // Log sin PII: no se registra nombre, email ni teléfono (auditoría A02).
  const adminEmail = process.env.SILVANA_EMAIL
  if (!adminEmail) {
    console.error('[contacto] SILVANA_EMAIL no configurado — notificación omitida')
  } else {
    try {
      await sendEmail({
        to: adminEmail,
        subject: `Nuevo contacto directo: ${nombreLimpio}`,
        html: buildContactoEmail({
          nombre: nombreLimpio,
          email: emailLimpio,
          telefono: telefonoLimpio,
          mensaje: mensajeLimpio,
        }),
        replyTo: emailLimpio,
      })
    } catch (err) {
      const status = err instanceof Error ? err.message.match(/^Resend error (\d+)/)?.[1] : undefined
      console.error(`[contacto] Notificación por mail falló (lead guardado en CRM) — status: ${status ?? 'desconocido'}, ts: ${new Date().toISOString()}`)
    }
  }

  return NextResponse.json({ ok: true })
}

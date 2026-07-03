import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, buildContactoEmail } from '@/lib/admin/email'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
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

  // ── 1. Guardar en Airtable PRIMERO ───────────────────────────────────────
  // Si falla aquí → error real al cliente (el contacto no quedó registrado).
  // Requiere columna "notasContacto" (Long text) en Airtable para guardar el mensaje.
  const apiKey    = process.env.AIRTABLE_API_KEY
  const baseId    = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_TABLE_NAME

  if (!apiKey || !baseId || !tableName) {
    console.error('[contacto] Airtable no configurado: faltan variables de entorno')
    return NextResponse.json({ error: 'Error interno. Intenta de nuevo.' }, { status: 500 })
  }

  const fields: Record<string, unknown> = {
    nombreCompleto:     nombreLimpio,
    email:              emailLimpio,
    etiqueta:           'contacto-directo',
    consentimientoRGPD: true,
    notasContacto:      mensajeLimpio,
    ...(telefonoLimpio ? { telefono: telefonoLimpio } : {}),
  }

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    )
    if (!airtableRes.ok) {
      const errSnippet = (await airtableRes.text()).slice(0, 200)
      console.error('[contacto] Airtable devolvió error:', airtableRes.status, errSnippet)
      return NextResponse.json({ error: 'No se pudo registrar tu consulta. Intenta de nuevo.' }, { status: 500 })
    }
  } catch (err) {
    console.error('[contacto] Error de red al guardar en Airtable:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'No se pudo registrar tu consulta. Intenta de nuevo.' }, { status: 500 })
  }

  // ── 2. Notificación a Silvana — best-effort ───────────────────────────────
  // El lead ya está en Airtable. Si el mail falla, el cliente ve éxito igualmente.
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
      console.error('[contacto] Notificación por mail falló (lead guardado en CRM):', err instanceof Error ? err.message : 'unknown')
    }
  }

  return NextResponse.json({ ok: true })
}

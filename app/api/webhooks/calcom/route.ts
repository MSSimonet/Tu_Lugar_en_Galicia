import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { findLeadByEmail, patchRecord } from '@/lib/admin/airtable'
import { generateAdminToken } from '@/lib/admin/tokens'
import { sendEmail } from '@/lib/admin/email'
import { TIMEZONE } from '@/lib/config/site'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tu-lugar-en-galicia.vercel.app'

// ── Verificación de firma Cal.com ─────────────────────────────────────────────

function verifySignature(rawBody: string, sig: string | null): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET
  if (!secret || !sig) return false
  // Cal.com envía: sha256=<hex> o solo <hex>
  const sigHex  = sig.startsWith('sha256=') ? sig.slice(7) : sig
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(sigHex,   'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// ── Tipos del payload Cal.com ─────────────────────────────────────────────────

interface CalPayload {
  triggerEvent: string
  payload: {
    startTime?: string
    attendees?: Array<{ name: string; email: string }>
    location?: string
  }
}

// ── Helpers de formato ────────────────────────────────────────────────────────

function formatFechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: TIMEZONE,
  })
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
    timeZone: TIMEZONE,
  })
}

// ── Template de mail de confirmación a Silvana ────────────────────────────────

function buildConfirmacionEmail(
  nombre:     string,
  email:      string,
  fechaLarga: string,
  hora:       string,
  plataforma: string,
  profileUrl: string,
): string {
  const fechaCap = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1)

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f0e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:28px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

          <tr>
            <td style="background:#1E1C19;padding:20px 28px;border-radius:8px 8px 0 0;">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#D4B96A;
                         letter-spacing:0.12em;text-transform:uppercase;">
                Tu Lugar en Galicia &mdash; Admin
              </p>
              <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#FFFCF7;font-weight:400;">
                &#10003; Nueva cita confirmada
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#FFFCF7;padding:24px 28px 28px;border-radius:0 0 8px 8px;">

              <div style="background:#e8f5e9;border:1px solid #c8e6c9;border-radius:6px;padding:16px 20px;margin-bottom:20px;">
                <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:16px;font-weight:600;color:#1E1C19;">
                  ${nombre}
                </p>
                <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#555;">
                  ${email}
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e0d8cc;border-radius:6px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e0d8cc;background:#FAFAF8;">
                    <span style="font-family:Arial,sans-serif;font-size:11px;color:#888480;
                                 text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:3px;">
                      Fecha
                    </span>
                    <span style="font-family:Arial,sans-serif;font-size:14px;color:#1E1C19;">
                      &#128197; ${fechaCap}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e0d8cc;background:#FAFAF8;">
                    <span style="font-family:Arial,sans-serif;font-size:11px;color:#888480;
                                 text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:3px;">
                      Hora (hora España)
                    </span>
                    <span style="font-family:Arial,sans-serif;font-size:14px;color:#1E1C19;">
                      &#128336; ${hora}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#FAFAF8;">
                    <span style="font-family:Arial,sans-serif;font-size:11px;color:#888480;
                                 text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:3px;">
                      Plataforma
                    </span>
                    <span style="font-family:Arial,sans-serif;font-size:14px;color:#1E1C19;">
                      &#128250; ${plataforma}
                    </span>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${profileUrl}"
                       style="display:inline-block;padding:10px 20px;background:#1E1C19;color:#ffffff;
                              text-decoration:none;border-radius:4px;font-size:12px;font-weight:500;
                              letter-spacing:0.04em;font-family:Arial,sans-serif;">
                      Ver perfil completo &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-family:Arial,sans-serif;font-size:11px;color:#B0ADA8;
                         margin-top:24px;border-top:1px solid #e0d8cc;padding-top:14px;">
                Generado autom&aacute;ticamente &middot; Tu Lugar en Galicia Admin
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()

  // Cal.com usa X-Cal-Signature-256 (Next.js lo expone en minúsculas)
  const sig = req.headers.get('x-cal-signature-256') ?? req.headers.get('cal-signature')

  if (!verifySignature(rawBody, sig)) {
    console.warn('[calcom] Firma inválida — posible llamada no autorizada')
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  let data: CalPayload
  try {
    data = JSON.parse(rawBody) as CalPayload
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Ignorar eventos que no sean BOOKING_CREATED
  if (data.triggerEvent !== 'BOOKING_CREATED') {
    return NextResponse.json({ ok: true })
  }

  const { startTime, attendees, location } = data.payload
  const attendee = attendees?.[0]

  if (!attendee?.email || !startTime) {
    console.error('[calcom] Payload BOOKING_CREATED incompleto — faltan campos: startTime o attendees')
    return NextResponse.json({ ok: true }) // no bloquear Cal.com
  }

  const { name: nombre, email: clientEmail } = attendee
  const fechaLarga = formatFechaLarga(startTime)
  const horaCita   = formatHora(startTime)
  const plataforma = location && location !== 'integrations:google_meet' && location !== 'integrations:zoom_video'
    ? location
    : location === 'integrations:google_meet' ? 'Google Meet'
    : location === 'integrations:zoom_video'  ? 'Zoom'
    : 'Por confirmar'

  let record
  try {
    record = await findLeadByEmail(clientEmail)
  } catch (err) {
    console.error('[calcom] Error buscando lead por email:', err)
    // Continuamos sin lead — al menos notificamos a Silvana
  }

  const silvanaEmail = process.env.SILVANA_EMAIL
  const tasks: Promise<unknown>[] = []

  if (record) {
    tasks.push(
      patchRecord(record.id, {
        citaAgendada:          'true',
        fechaCita:             startTime,  // ISO string — usado en getLeadsConCitaProxima()
        horaCita,
        plataformaVideollamada: plataforma,
      }).catch(err => console.error(`[calcom] PATCH Airtable ${record.id}:`, err))
    )

    if (silvanaEmail) {
      const token      = generateAdminToken(record.id)
      const profileUrl = `${SITE_URL}/admin/lead/${record.id}?token=${encodeURIComponent(token)}`
      tasks.push(
        sendEmail({
          to:      silvanaEmail,
          subject: `✓ Nueva cita — ${nombre} — ${fechaLarga}`,
          html:    buildConfirmacionEmail(nombre, clientEmail, fechaLarga, horaCita, plataforma, profileUrl),
        }).catch(err => console.error('[calcom] Resend error:', err))
      )
    }
  } else {
    console.warn(`[calcom] Lead no encontrado para email: ${clientEmail.substring(0, 3)}***`)
    if (silvanaEmail) {
      tasks.push(
        sendEmail({
          to:      silvanaEmail,
          subject: `⚠ Nueva cita (lead no encontrado) — ${nombre} — ${fechaLarga}`,
          html:    buildConfirmacionEmail(nombre, clientEmail, fechaLarga, horaCita, plataforma, SITE_URL),
        }).catch(err => console.error('[calcom] Resend error (sin lead):', err))
      )
    }
  }

  await Promise.allSettled(tasks)

  return NextResponse.json({ ok: true })
}

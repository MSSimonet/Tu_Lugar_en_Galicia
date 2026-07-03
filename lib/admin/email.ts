/**
 * Envío de mails transaccionales vía Resend REST API.
 * No usa SDK — solo fetch para mantener dependencias mínimas.
 *
 * Variable de entorno:
 *   RESEND_API_KEY       — clave de Resend (obligatoria)
 *   RESEND_FROM_EMAIL    — dirección "from" (opcional; fallback: onboarding@resend.dev)
 */

const FROM =
  process.env.RESEND_FROM_EMAIL ?? 'Tu Lugar en Galicia <onboarding@resend.dev>'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tu-lugar-en-galicia.vercel.app'

interface EmailParams {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: EmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY no configurado')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
}

/**
 * Template de notificación inmediata a Silvana cuando alguien usa el formulario de contacto.
 */
export function buildContactoEmail(params: {
  nombre: string
  email: string
  telefono?: string
  mensaje: string
}): string {
  const { nombre, email, telefono, mensaje } = params
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Nuevo contacto directo — Tu Lugar en Galicia</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:#141210;padding:28px 40px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:400;font-style:italic;color:#D4AF6A;letter-spacing:0.06em;">
                Tu Lugar en Galicia
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;color:#2D2926;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#B8943F;">
                Contacto directo — formulario web
              </p>
              <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border:1px solid #E8E0D2;border-radius:6px;overflow:hidden;">
                <tr style="background:#F5F0E8;">
                  <td style="padding:10px 16px;font-size:12px;color:#696560;width:120px;">Nombre</td>
                  <td style="padding:10px 16px;font-size:14px;font-weight:500;color:#1E1C19;">${nombre}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:12px;color:#696560;border-top:1px solid #E8E0D2;">Email</td>
                  <td style="padding:10px 16px;font-size:14px;font-weight:500;color:#1E1C19;border-top:1px solid #E8E0D2;">${email}</td>
                </tr>
                ${telefono ? `<tr style="background:#F5F0E8;">
                  <td style="padding:10px 16px;font-size:12px;color:#696560;border-top:1px solid #E8E0D2;">Teléfono</td>
                  <td style="padding:10px 16px;font-size:14px;font-weight:500;color:#1E1C19;border-top:1px solid #E8E0D2;">${telefono}</td>
                </tr>` : ''}
              </table>
              <p style="margin:20px 0 8px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#696560;">Mensaje</p>
              <div style="background:#F5F0E8;border-radius:6px;padding:16px 20px;font-size:14px;line-height:1.7;color:#1E1C19;white-space:pre-wrap;">${mensaje}</div>
              <p style="margin:28px 0 0;font-size:13px;color:#696560;">
                Puedes responder directamente a este mail para contactar a ${nombre}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f0e8;padding:16px 40px;text-align:center;font-size:11px;color:#696560;font-family:Georgia,serif;">
              Formulario de contacto — Tu Lugar en Galicia
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Template del mail de habilitación de agenda al cliente.
 * Voz de Silvana, tú neutro (brand voice — voz-tu-lugar-en-galicia skill).
 */
export function buildAgendaEmail(nombre: string, codigo: string): string {
  const primerNombre = nombre.split(' ')[0] || nombre
  const agendaUrl   = `${SITE_URL}/agenda?code=${codigo}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Tu cita con Tu Lugar en Galicia está lista</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Cabecera -->
          <tr>
            <td style="background:#141210;padding:28px 40px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:400;font-style:italic;color:#D4AF6A;letter-spacing:0.06em;">
                Tu Lugar en Galicia
              </span>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding:40px 40px 32px;color:#2D2926;font-size:16px;line-height:1.7;">

              <p style="margin:0 0 20px;">Hola ${primerNombre},</p>

              <p style="margin:0 0 20px;">
                Revisé tu historia con atención y me alegra mucho decirte que creo que puedo
                acompañarte en este proceso. Lo que describes es exactamente el tipo de situación
                en la que más podemos ayudar.
              </p>

              <p style="margin:0 0 20px;">
                El siguiente paso es una videollamada de unos 30 minutos para conocernos,
                entender mejor tu situación y explicarte cómo trabajamos. Sin compromisos.
              </p>

              <p style="margin:0 0 12px;font-weight:600;">Para agendar tu cita, solo necesitas:</p>

              <ol style="margin:0 0 28px;padding-left:20px;">
                <li style="margin-bottom:8px;">
                  Entrar a
                  <a href="${SITE_URL}/agenda"
                     style="color:#7A5F22;text-decoration:none;border-bottom:1px solid #7A5F22;">
                    tulugarengalicia.com/agenda
                  </a>
                </li>
                <li style="margin-bottom:8px;">
                  Ingresar tu código personal:
                  <strong style="letter-spacing:0.12em;color:#141210;font-size:18px;">${codigo}</strong>
                </li>
                <li style="margin-bottom:8px;">Elegir el día y horario que mejor te quede</li>
              </ol>

              <!-- Botón CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#B8943F;border-radius:4px;">
                    <a href="${agendaUrl}"
                       style="display:inline-block;padding:14px 32px;font-family:Georgia,serif;
                              font-size:14px;font-weight:500;letter-spacing:0.08em;
                              color:#141210;text-decoration:none;text-transform:uppercase;">
                      Ir a mi cita →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:13px;color:#696560;">
                Tu código es personal e intransferible. Tienes 7 días para usarlo antes de que expire.
              </p>

              <p style="margin:0 0 28px;">
                Si tienes alguna pregunta antes de la llamada, puedes escribirme directamente
                respondiendo este mail.
              </p>

              <p style="margin:0;">¡Nos vemos pronto!</p>
              <p style="margin:8px 0 0;font-style:italic;color:#2D2926;">
                Silvana<br />
                <span style="font-size:13px;color:#696560;">Tu Lugar en Galicia</span>
              </p>

            </td>
          </tr>

          <!-- Footer legal -->
          <tr>
            <td style="background:#f5f0e8;padding:20px 40px;text-align:center;
                        font-size:11px;color:#696560;font-family:Georgia,serif;">
              Recibiste este mail porque completaste el cuestionario de Tu Lugar en Galicia.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

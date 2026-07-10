import { escapeHtml, buildEmailShell } from '@/lib/admin/email'

/**
 * Template del mensaje privado de Comunidad de Acogida (docs/comunidad-de-acogida.md §4).
 * Nunca incluye el email del remitente en el cuerpo visible más allá del nombre — el
 * destinatario responde vía reply-to (ver app/api/comunidad/mensaje/route.ts), sin que la
 * plataforma necesite almacenar ni mostrar la dirección del remitente en ningún otro lugar.
 */
export function buildComunidadMensajeEmail(params: {
  destinatarioNombre: string
  remitenteNombre: string
  mensaje: string
}): string {
  const destinatarioNombre = escapeHtml(params.destinatarioNombre)
  const remitenteNombre = escapeHtml(params.remitenteNombre)
  const mensaje = escapeHtml(params.mensaje)

  const rows = `
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
                Comunidad de Acogida — mensaje privado
              </p>
              <p style="margin:0 0 20px;">Hola ${destinatarioNombre},</p>
              <p style="margin:0 0 20px;">
                <strong>${remitenteNombre}</strong> te escribió desde el mapa de Comunidad de Acogida:
              </p>
              <div style="background:#F5F0E8;border-radius:6px;padding:16px 20px;font-size:14px;line-height:1.7;color:#1E1C19;white-space:pre-wrap;">${mensaje}</div>
              <p style="margin:28px 0 0;font-size:13px;color:#696560;">
                Puedes responder directamente a este mail para contactar a ${remitenteNombre} —
                tu dirección de email no se comparte con nadie más que con quien te escribió.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f0e8;padding:16px 40px;text-align:center;font-size:11px;color:#696560;font-family:Georgia,serif;">
              Comunidad de Acogida — Tu Lugar en Galicia
            </td>
          </tr>`

  return buildEmailShell({
    title: 'Nuevo mensaje — Comunidad de Acogida',
    tableWidth: 600,
    tableStyle: 'background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;',
    rows,
  })
}

import { escapeHtml, buildEmailShell, EMAIL_BASE_URL } from '@/lib/admin/email'

/**
 * Mail de confirmación del alta en el mapa (§5.6 de docs/arranque.md). Es la pieza que
 * convierte "declaré este email" en "soy dueño de este email": hasta que este link se abre,
 * la fila en `comunidad` no existe.
 *
 * El copy tiene dos destinatarios a la vez y por eso cierra como cierra: quien sí se
 * registró, y quien recibe esto porque un tercero puso su dirección. Al segundo hay que
 * decirle, sin alarmarlo, que no tiene que hacer nada — la última línea es exactamente la
 * garantía técnica del módulo lib/comunidad/pendientes.ts, dicha en castellano.
 */
export function buildComunidadConfirmacionEmail(params: {
  nombre: string
  id: string
  token: string
}): string {
  const primerNombre = escapeHtml(params.nombre.split(' ')[0] || params.nombre)
  // encodeURIComponent en los dos: el token es base64url (seguro en URL) y el id es un uuid
  // generado por el servidor, pero codificarlos igual evita que un cambio de formato futuro
  // rompa el link en silencio.
  const url = `${EMAIL_BASE_URL}/comunidad/confirmar?id=${encodeURIComponent(params.id)}&token=${encodeURIComponent(params.token)}`
  // El `&` que separa los dos parametros va escapado a `&amp;` porque esto se interpola en
  // HTML, no en texto plano. Con `token` da igual, pero HTML5 resuelve un puñado de entidades
  // legadas SIN punto y coma final (`&copy`, `&reg`, `&not`, `&para`, `&times`...): el dia que
  // alguien renombre un parametro a uno de esos, el link se rompe en silencio y solo para
  // algunas personas. Un caracter ahora cierra esa puerta. Los clientes de correo lo decodifican
  // de vuelta a `&`, asi que la URL que abre la persona es identica.
  const urlHtml = escapeHtml(url)

  const rows = `
          <tr>
            <td style="background:#141210;padding:28px 40px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:400;font-style:italic;color:#D4AF6A;letter-spacing:0.06em;">
                Tu Lugar en Galicia
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;color:#2D2926;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#B8943F;">
                Formando comunidad
              </p>

              <p style="margin:0 0 20px;">Hola ${primerNombre},</p>

              <p style="margin:0 0 28px;">
                Ya casi estás en el mapa. Solo falta confirmar que este correo es tuyo:
              </p>

              <p style="margin:0 0 28px;">
                <a href="${urlHtml}"
                   style="display:inline-block;background:#D4AF6A;color:#1A1410;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.10em;text-transform:uppercase;padding:16px 32px;border-radius:999px;">
                  Confirmar mi registro
                </a>
              </p>

              <p style="margin:0 0 20px;">
                El enlace vale 24 horas. Si no lo usas, tu perfil no se crea.
              </p>

              <p style="margin:0 0 20px;">
                ¿No te registraste? No hagas nada. Sin ese clic, nadie puede poner tus datos
                en el mapa.
              </p>

              <p style="margin:28px 0 0;font-size:13px;color:#696560;">
                Si el botón no funciona, copia y pega esta dirección en tu navegador:<br>
                <span style="word-break:break-all;color:#7A5F22;">${urlHtml}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f0e8;padding:16px 40px;text-align:center;font-size:11px;color:#696560;font-family:Georgia,serif;">
              Formando comunidad — Tu Lugar en Galicia
            </td>
          </tr>`

  return buildEmailShell({
    title: 'Confirma tu registro — Formando comunidad',
    tableWidth: 600,
    tableStyle: 'background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;',
    rows,
  })
}

/**
 * Mail con el enlace para gestionar el propio perfil (Toggle B / PII-01).
 *
 * Mismo doble destinatario que el de confirmación, y por eso cierra igual: quien pidió el
 * enlace, y quien recibe esto porque un tercero escribió su dirección en el formulario. Al
 * segundo hay que decirle que no tiene que hacer nada.
 *
 * El enlace vale 1 hora, no 24: desde esa página se puede publicar un teléfono o borrar una
 * cuenta. Se dice en el cuerpo para que nadie lo guarde pensando que sirve mañana.
 */
export function buildComunidadGestionEmail(params: {
  nombre: string
  id: string
  token: string
}): string {
  const primerNombre = escapeHtml(params.nombre.split(' ')[0] || params.nombre)
  const url = `${EMAIL_BASE_URL}/comunidad/gestionar/sesion?id=${encodeURIComponent(params.id)}&token=${encodeURIComponent(params.token)}`
  const urlHtml = escapeHtml(url)

  const rows = `
          <tr>
            <td style="background:#141210;padding:28px 40px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:400;font-style:italic;color:#D4AF6A;letter-spacing:0.06em;">
                Tu Lugar en Galicia
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;color:#2D2926;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#B8943F;">
                Formando comunidad
              </p>

              <p style="margin:0 0 20px;">Hola ${primerNombre},</p>

              <p style="margin:0 0 28px;">
                Aquí tienes el enlace para gestionar tu perfil del mapa. Desde ahí puedes
                mostrar u ocultar tu teléfono, o darte de baja.
              </p>

              <p style="margin:0 0 28px;">
                <a href="${urlHtml}"
                   style="display:inline-block;background:#D4AF6A;color:#1A1410;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.10em;text-transform:uppercase;padding:16px 32px;border-radius:999px;">
                  Gestionar mi perfil
                </a>
              </p>

              <p style="margin:0 0 20px;">
                El enlace vale una hora. Si se te pasa, pide otro y listo.
              </p>

              <p style="margin:0 0 20px;">
                ¿No lo pediste? No hagas nada. Sin abrir ese enlace, nadie puede tocar tu perfil.
              </p>

              <p style="margin:28px 0 0;font-size:13px;color:#696560;">
                Si el botón no funciona, copia y pega esta dirección en tu navegador:<br>
                <span style="word-break:break-all;color:#7A5F22;">${urlHtml}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f0e8;padding:16px 40px;text-align:center;font-size:11px;color:#696560;font-family:Georgia,serif;">
              Formando comunidad — Tu Lugar en Galicia
            </td>
          </tr>`

  return buildEmailShell({
    title: 'Gestiona tu perfil — Formando comunidad',
    tableWidth: 600,
    tableStyle: 'background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;',
    rows,
  })
}

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
                Formando comunidad — mensaje privado
              </p>
              <p style="margin:0 0 20px;">Hola ${destinatarioNombre},</p>
              <p style="margin:0 0 20px;">
                <strong>${remitenteNombre}</strong> te escribió desde el mapa de Formando comunidad:
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
              Formando comunidad — Tu Lugar en Galicia
            </td>
          </tr>`

  return buildEmailShell({
    title: 'Nuevo mensaje — Formando comunidad',
    tableWidth: 600,
    tableStyle: 'background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;',
    rows,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/admin/auth'
import { getLeadsConCitaProxima, type AirtableRecord } from '@/lib/admin/airtable'
import { generateAdminToken } from '@/lib/admin/tokens'
import { sendEmail, escapeHtml } from '@/lib/admin/email'
import { TIMEZONE } from '@/lib/config/site'

// ── Etiquetas legibles (subconjunto necesario para el mail de recordatorio) ──

const SITUACION: Record<string, string> = {
  'cuenta-ajena':           'cuenta ajena',
  'autonomo':               'autónomo/a',
  'teletrabajo-extranjero': 'teletrabajo (extranjero)',
  'rentista':               'rentista',
  'jubilado':               'jubilado/a',
  'estudiante':             'estudiante',
  'busca-empleo':           'busca empleo',
}

const PLAZO: Record<string, string> = {
  'menos-1-mes': 'menos de 1 mes',
  '1-3-meses':   '1 a 3 meses',
  '3-6-meses':   '3 a 6 meses',
  'mas-6-meses': 'más de 6 meses',
  'sin-fecha':   'sin fecha definida',
}

const PRESUPUESTO: Record<string, string> = {
  'menos-700': 'hasta €700/mes',
  '700-1000':  '€700–1000/mes',
  '1000-1400': '€1000–1400/mes',
  'mas-1400':  '+€1400/mes',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  return String(v ?? '—')
}

function formatHoraEspana(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
    timeZone: TIMEZONE,
  })
}

function formatFechaLarga(iso: string): string {
  const f = new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: TIMEZONE,
  })
  return f.charAt(0).toUpperCase() + f.slice(1)
}

function minutosHasta(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
}

// ── Template HTML del recordatorio ───────────────────────────────────────────

function buildRecordatorio(record: AirtableRecord, profileUrl: string): string {
  const f          = record.fields
  const nombre     = str(f.nombreCompleto)
  const email      = str(f.email)
  const ciudad     = str(f.ciudadDestino)
  const origen     = str(f.paisResidencia)
  const plazo      = PLAZO[str(f.fechaLlegada)]        ?? str(f.fechaLlegada)
  const presup     = PRESUPUESTO[str(f.presupuestoMensual)] ?? str(f.presupuestoMensual)
  const situacion  = SITUACION[str(f.situacionLaboral)] ?? str(f.situacionLaboral)
  const plataforma = str(f.plataformaVideollamada)
  const fechaCita  = str(f.fechaCita)
  const fechaLarga = fechaCita !== '—' ? formatFechaLarga(fechaCita) : '—'
  const hora       = fechaCita !== '—' ? formatHoraEspana(fechaCita) : '—'
  const minutos    = fechaCita !== '—' ? minutosHasta(fechaCita) : 0

  const esUrl = plataforma.startsWith('http')
  const plataformaEscapada = escapeHtml(plataforma)
  const plataformaHtml = esUrl
    ? `<a href="${plataformaEscapada}" style="color:#1565c0;font-family:Arial,sans-serif;font-size:14px;">${plataformaEscapada}</a>`
    : `<span style="font-family:Arial,sans-serif;font-size:14px;color:#1E1C19;">${plataformaEscapada}</span>`

  return `
<div style="background:#ffffff;border:1px solid #e0d8cc;border-radius:8px;padding:20px 24px;margin-bottom:16px;">

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
    <tr>
      <td>
        <strong style="font-size:16px;color:#1E1C19;font-family:Arial,sans-serif;">${nombre}</strong>
        <span style="font-size:12px;color:#888480;margin-left:8px;font-family:Arial,sans-serif;">${email}</span>
      </td>
      <td align="right" style="white-space:nowrap;">
        <span style="background:#1565c0;color:#ffffff;padding:4px 12px;border-radius:10px;
                     font-size:11px;font-weight:600;font-family:Arial,sans-serif;">
          ~${minutos} min
        </span>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0"
         style="border:1px solid #e8e2d8;border-radius:6px;overflow:hidden;margin-bottom:14px;">
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e8e2d8;background:#FAFAF8;" width="50%">
        <span style="font-family:Arial,sans-serif;font-size:10px;color:#888480;
                     text-transform:uppercase;letter-spacing:0.06em;display:block;">Fecha</span>
        <span style="font-family:Arial,sans-serif;font-size:13px;color:#1E1C19;">${fechaLarga}</span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #e8e2d8;background:#FAFAF8;">
        <span style="font-family:Arial,sans-serif;font-size:10px;color:#888480;
                     text-transform:uppercase;letter-spacing:0.06em;display:block;">Hora (España)</span>
        <span style="font-family:Arial,sans-serif;font-size:13px;color:#1E1C19;">${hora}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e8e2d8;background:#FAFAF8;" width="50%">
        <span style="font-family:Arial,sans-serif;font-size:10px;color:#888480;
                     text-transform:uppercase;letter-spacing:0.06em;display:block;">Destino</span>
        <span style="font-family:Arial,sans-serif;font-size:13px;color:#1E1C19;">&#128205; ${ciudad}</span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #e8e2d8;background:#FAFAF8;">
        <span style="font-family:Arial,sans-serif;font-size:10px;color:#888480;
                     text-transform:uppercase;letter-spacing:0.06em;display:block;">Origen</span>
        <span style="font-family:Arial,sans-serif;font-size:13px;color:#1E1C19;">&#127758; ${origen}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 14px;background:#FAFAF8;" width="50%">
        <span style="font-family:Arial,sans-serif;font-size:10px;color:#888480;
                     text-transform:uppercase;letter-spacing:0.06em;display:block;">Plazo llegada</span>
        <span style="font-family:Arial,sans-serif;font-size:13px;color:#1E1C19;">${plazo}</span>
      </td>
      <td style="padding:10px 14px;background:#FAFAF8;">
        <span style="font-family:Arial,sans-serif;font-size:10px;color:#888480;
                     text-transform:uppercase;letter-spacing:0.06em;display:block;">Presupuesto</span>
        <span style="font-family:Arial,sans-serif;font-size:13px;color:#1E1C19;">${presup}</span>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 10px;font-size:12px;color:#696560;border-left:3px solid #D4B96A;
             padding-left:10px;line-height:1.6;font-family:Arial,sans-serif;">
    Situación: ${situacion}
  </p>

  <div style="margin-bottom:14px;">
    <span style="font-family:Arial,sans-serif;font-size:11px;color:#888480;
                 text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:4px;">
      Plataforma videollamada
    </span>
    ${plataformaHtml}
  </div>

  <table cellpadding="0" cellspacing="0">
    <tr>
      <td>
        <a href="${profileUrl}"
           style="display:inline-block;padding:9px 18px;background:#1E1C19;color:#ffffff;
                  text-decoration:none;border-radius:4px;font-size:12px;font-weight:500;
                  letter-spacing:0.04em;font-family:Arial,sans-serif;">
          Ver perfil completo &rarr;
        </a>
      </td>
    </tr>
  </table>

</div>`
}

// ── Template HTML completo ────────────────────────────────────────────────────

function buildEmail(records: AirtableRecord[], siteUrl: string): string {
  const hora = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
    timeZone: TIMEZONE,
  })

  const cartas = records.map(r => {
    const token      = generateAdminToken(r.id)
    const profileUrl = `${siteUrl}/admin/lead/${r.id}?token=${encodeURIComponent(token)}`
    return buildRecordatorio(r, profileUrl)
  }).join('\n')

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
            <td style="background:#1565c0;padding:20px 28px;border-radius:8px 8px 0 0;">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;
                         color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;">
                Tu Lugar en Galicia &mdash; Admin
              </p>
              <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#ffffff;font-weight:400;">
                &#128276; Videollamada${records.length > 1 ? 's' : ''} en ~1 hora &middot; ${hora}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#FFFCF7;padding:24px 28px 28px;border-radius:0 0 8px 8px;">

              ${cartas}

              <p style="font-family:Arial,sans-serif;font-size:11px;color:#B0ADA8;
                         margin-top:16px;border-top:1px solid #e0d8cc;padding-top:14px;">
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

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const silvanaEmail = process.env.SILVANA_EMAIL
  if (!silvanaEmail) {
    return NextResponse.json({ error: 'SILVANA_EMAIL no configurado' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tu-lugar-en-galicia.vercel.app'

  let records
  try {
    records = await getLeadsConCitaProxima()
  } catch (err) {
    console.error('[recordatorio-silvana] Airtable error:', err)
    return NextResponse.json({ error: 'Error consultando Airtable' }, { status: 500 })
  }

  if (records.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  const hora = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
    timeZone: TIMEZONE,
  })

  const html = buildEmail(records, siteUrl)

  try {
    await sendEmail({
      to:      silvanaEmail,
      subject: `Recordatorio: ${records.length} videollamada${records.length > 1 ? 's' : ''} en ~1 hora (${hora} España)`,
      html,
    })
  } catch (err) {
    console.error('[recordatorio-silvana] Resend error:', err)
    return NextResponse.json({ error: 'Error enviando mail' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, enviados: records.length })
}

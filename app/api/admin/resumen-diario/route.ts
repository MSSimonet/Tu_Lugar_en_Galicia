import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/admin/auth'
import { listAllRecords, patchRecord, type AirtableRecord } from '@/lib/admin/airtable'
import { generateAdminToken } from '@/lib/admin/tokens'
import { sendEmail } from '@/lib/admin/email'

// ── Constantes ────────────────────────────────────────────────────────────────

const EXPIRACION_MS = 7 * 24 * 60 * 60 * 1000

// ── Agrupación por calificación ───────────────────────────────────────────────

type Grupo = 'potencial' | 'en-desarrollo' | 'otro'

function getGrupo(cal: unknown): Grupo {
  const c = String(cal ?? '')
  if (c === 'potencial' || c === 'potencial-alto') return 'potencial'
  if (c === 'en-desarrollo') return 'en-desarrollo'
  return 'otro'
}

// ── Etiquetas legibles ────────────────────────────────────────────────────────

const SITUACION: Record<string, string> = {
  'teletrabajo-extranjero': 'teletrabajo (extranjero)',
  'autonomo':               'autónomo/a',
  'empleado-espana':        'empleado/a en España',
  'busca-empleo':           'busca empleo',
  'jubilado':               'jubilado/a',
  'estudiante':             'estudiante',
}

const PLAZO: Record<string, string> = {
  'menos-1-mes':   'menos de 1 mes',
  '1-3-meses':     '1 a 3 meses',
  '3-6-meses':     '3 a 6 meses',
  '6-12-meses':    '6 a 12 meses',
  'mas-12-meses':  'más de 12 meses',
  'ya-en-galicia': 'ya en Galicia',
}

const PRESUPUESTO: Record<string, string> = {
  'menos-600':  'hasta €600/mes',
  '600-900':    '€600–900/mes',
  '900-1200':   '€900–1200/mes',
  '1200-1400':  '€1200–1400/mes',
  'mas-1400':   '+€1400/mes',
}

const DOCS: Record<string, string> = {
  'espanol':           'pasaporte ES',
  'ue':                'pasaporte UE',
  'nie-residente':     'NIE residente',
  'nie-no-lucrativa':  'NIE no lucrativa',
  'visado-solicitado': 'visado solicitado',
  'sin-documentacion': 'sin docs UE',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function diasDesde(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000)
}

function urgColor(dias: number): string {
  if (dias > 7) return '#b71c1c'
  if (dias > 3) return '#e65100'
  return '#388e3c'
}

function str(v: unknown): string {
  return String(v ?? '—')
}

function buildSummary(fields: Record<string, unknown>): string {
  const parts: string[] = []
  if (fields.situacionLaboral) {
    parts.push(`Trabajo: ${SITUACION[str(fields.situacionLaboral)] ?? str(fields.situacionLaboral)}`)
  }
  if (fields.documentacion) {
    parts.push(`Docs: ${DOCS[str(fields.documentacion)] ?? str(fields.documentacion)}`)
  }
  if (fields.presupuestoMensual) {
    parts.push(`Presupuesto: ${PRESUPUESTO[str(fields.presupuestoMensual)] ?? str(fields.presupuestoMensual)}`)
  }
  return parts.join(' · ') || '(sin datos de resumen)'
}

// ── Tarjeta de lead (secciones principales) ───────────────────────────────────

function buildCard(record: AirtableRecord, siteUrl: string): string {
  const f       = record.fields
  const nombre  = str(f.nombreCompleto)
  const email   = str(f.email)
  const ciudad  = str(f.ciudadDestino)
  const origen  = str(f.paisResidencia)
  const plazo   = PLAZO[str(f.fechaLlegada)] ?? str(f.fechaLlegada)
  const codigo  = typeof f.codigoAgenda === 'string' ? f.codigoAgenda : undefined
  const dias    = diasDesde(record.createdTime)
  const uc      = urgColor(dias)
  const summary = buildSummary(f)
  const token   = generateAdminToken(record.id)
  const profileUrl = `${siteUrl}/admin/lead/${record.id}?token=${encodeURIComponent(token)}`

  const habilitarBtn = codigo && codigo !== 'expirado'
    ? `<span style="display:inline-block;padding:8px 16px;background:#e8f5e9;color:#2e7d32;
                    border-radius:4px;font-size:12px;font-weight:500;font-family:Arial,sans-serif;">
         &#10003; Agenda habilitada &middot; ${codigo}
       </span>`
    : `<a href="${profileUrl}#habilitar"
          style="display:inline-block;padding:8px 16px;background:#B8943F;color:#1E1C19;
                 text-decoration:none;border-radius:4px;font-size:12px;font-weight:600;
                 letter-spacing:0.04em;font-family:Arial,sans-serif;">
         Habilitar agenda &rarr;
       </a>`

  return `
<div style="background:#ffffff;border:1px solid #e0d8cc;border-radius:8px;padding:20px;margin-bottom:14px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
    <tr>
      <td>
        <strong style="font-size:15px;color:#1E1C19;font-family:Arial,sans-serif;">${nombre}</strong>
        <span style="font-size:12px;color:#888480;margin-left:8px;font-family:Arial,sans-serif;">${email}</span>
      </td>
      <td align="right" style="white-space:nowrap;">
        <span style="background:${uc};color:#ffffff;padding:3px 10px;border-radius:10px;
                     font-size:11px;font-weight:600;font-family:Arial,sans-serif;">
          ${dias} d&iacute;a${dias !== 1 ? 's' : ''}
        </span>
      </td>
    </tr>
  </table>
  <p style="margin:0 0 8px;font-size:13px;color:#2D2926;font-family:Arial,sans-serif;">
    &#128205; ${ciudad} &nbsp;&middot;&nbsp; &#127758; ${origen} &nbsp;&middot;&nbsp; &#128197; ${plazo}
  </p>
  <p style="margin:0 0 14px;font-size:12px;color:#696560;border-left:3px solid #D4B96A;
             padding-left:10px;line-height:1.6;font-family:Arial,sans-serif;">
    ${summary}
  </p>
  <table cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding-right:8px;">
        <a href="${profileUrl}"
           style="display:inline-block;padding:8px 16px;background:#1E1C19;color:#ffffff;
                  text-decoration:none;border-radius:4px;font-size:12px;font-weight:500;
                  letter-spacing:0.04em;font-family:Arial,sans-serif;">
          Ver perfil completo &rarr;
        </a>
      </td>
      <td>${habilitarBtn}</td>
    </tr>
  </table>
</div>`
}

// ── Tarjeta de seguimiento (código expirado) ──────────────────────────────────

function buildSeguimientoCard(record: AirtableRecord, siteUrl: string): string {
  const f          = record.fields
  const nombre     = str(f.nombreCompleto)
  const email      = str(f.email)
  const token      = generateAdminToken(record.id)
  const profileUrl = `${siteUrl}/admin/lead/${record.id}?token=${encodeURIComponent(token)}`
  const fechaHab   = typeof f.fechaHabilitacion === 'string' ? f.fechaHabilitacion : record.createdTime
  const diasExp    = diasDesde(fechaHab)

  return `
<div style="background:#fff8f0;border:1px solid #ffe0b2;border-radius:8px;padding:16px 20px;margin-bottom:10px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
    <tr>
      <td>
        <strong style="font-size:14px;color:#1E1C19;font-family:Arial,sans-serif;">${nombre}</strong>
        <span style="font-size:12px;color:#888480;margin-left:8px;font-family:Arial,sans-serif;">${email}</span>
      </td>
      <td align="right" style="white-space:nowrap;">
        <span style="font-size:11px;color:#e65100;font-family:Arial,sans-serif;font-weight:500;">
          Código expirado (${diasExp} d&iacute;as sin agendar)
        </span>
      </td>
    </tr>
  </table>
  <table cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding-right:8px;">
        <a href="${profileUrl}#habilitar"
           style="display:inline-block;padding:8px 16px;background:#e65100;color:#ffffff;
                  text-decoration:none;border-radius:4px;font-size:12px;font-weight:600;
                  letter-spacing:0.04em;font-family:Arial,sans-serif;">
          Regenerar c&oacute;digo &rarr;
        </a>
      </td>
      <td>
        <a href="${profileUrl}"
           style="display:inline-block;padding:8px 16px;background:#f5f0e8;color:#1E1C19;
                  text-decoration:none;border-radius:4px;font-size:12px;font-weight:500;
                  font-family:Arial,sans-serif;">
          Ver perfil &rarr;
        </a>
      </td>
    </tr>
  </table>
</div>`
}

// ── Section header ────────────────────────────────────────────────────────────

function buildSectionHeader(title: string, count: number, bg: string): string {
  return `
<div style="background:${bg};border-radius:6px;padding:10px 16px;margin-bottom:12px;">
  <strong style="font-family:Arial,sans-serif;font-size:13px;color:#1E1C19;
                 letter-spacing:0.06em;text-transform:uppercase;">
    ${title}
  </strong>
  <span style="font-size:12px;color:#555;margin-left:8px;font-family:Arial,sans-serif;">(${count})</span>
</div>`
}

// ── Template HTML completo ────────────────────────────────────────────────────

function buildEmail(
  potencial:    AirtableRecord[],
  enDesarrollo: AirtableRecord[],
  seguimiento:  AirtableRecord[],
  noCalifica:   number,
  siteUrl:      string,
): string {
  const fechaLarga = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Europe/Madrid',
  })
  const fecha = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1)

  const potencialHtml = potencial.length > 0
    ? buildSectionHeader('Potencial alto', potencial.length, '#e8f5e9') +
      potencial.map(r => buildCard(r, siteUrl)).join('\n')
    : `<p style="font-family:Arial,sans-serif;font-size:13px;color:#888480;margin-bottom:16px;">
         No hay leads de potencial alto pendientes hoy.
       </p>`

  const desarrolloHtml = enDesarrollo.length > 0
    ? buildSectionHeader('En desarrollo', enDesarrollo.length, '#fff8e1') +
      enDesarrollo.map(r => buildCard(r, siteUrl)).join('\n')
    : `<p style="font-family:Arial,sans-serif;font-size:13px;color:#888480;margin-bottom:16px;">
         No hay leads en desarrollo hoy.
       </p>`

  const seguimientoHtml = seguimiento.length > 0
    ? `<div style="height:20px;"></div>
       ${buildSectionHeader('Seguimiento pendiente', seguimiento.length, '#fff3e0')}
       ${seguimiento.map(r => buildSeguimientoCard(r, siteUrl)).join('\n')}`
    : ''

  const noCalificaHtml = noCalifica > 0
    ? `<p style="font-family:Arial,sans-serif;font-size:13px;color:#888480;
                 margin-top:20px;border-top:1px solid #e0d8cc;padding-top:16px;">
         ${noCalifica} persona${noCalifica !== 1 ? 's' : ''} consultaron y no califican de momento.
       </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Resumen de leads &middot; ${fecha}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:28px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1E1C19;padding:20px 28px;border-radius:8px 8px 0 0;">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#D4B96A;
                         letter-spacing:0.12em;text-transform:uppercase;">
                Tu Lugar en Galicia &mdash; Admin
              </p>
              <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#FFFCF7;font-weight:400;">
                Resumen de leads &middot; ${fecha}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFCF7;padding:24px 28px 28px;border-radius:0 0 8px 8px;">

              ${potencialHtml}

              <div style="height:20px;"></div>

              ${desarrolloHtml}

              ${seguimientoHtml}

              ${noCalificaHtml}

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const silvanaEmail = process.env.SILVANA_EMAIL
  if (!silvanaEmail) {
    return NextResponse.json({ error: 'SILVANA_EMAIL no configurado' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tu-lugar-en-galicia.vercel.app'

  let records: AirtableRecord[]
  try {
    records = await listAllRecords()
  } catch (err) {
    console.error('[resumen-diario] Airtable error:', err)
    return NextResponse.json({ error: 'Error consultando Airtable' }, { status: 500 })
  }

  // ── 1. Expirar códigos vencidos (>7 días) antes de construir el mail ─────────
  const ahora       = Date.now()
  const seguimiento: AirtableRecord[] = []

  const toExpire = records.filter(r => {
    const codigo = r.fields.codigoAgenda
    if (typeof codigo !== 'string' || !codigo || codigo === 'expirado') return false
    const fechaHab = r.fields.fechaHabilitacion
    if (typeof fechaHab !== 'string' || !fechaHab) return false
    const ms = new Date(fechaHab).getTime()
    return !isNaN(ms) && ahora - ms > EXPIRACION_MS
  })

  await Promise.allSettled(
    toExpire.map(async r => {
      try {
        await patchRecord(r.id, { codigoAgenda: 'expirado' })
        r.fields.codigoAgenda = 'expirado' // actualizar en memoria
        seguimiento.push(r)
      } catch (err) {
        console.error(`[resumen-diario] Error expirando ${r.id}:`, err)
      }
    })
  )

  // ── 2. Agrupar por calificación ───────────────────────────────────────────────
  const potencial:    AirtableRecord[] = []
  const enDesarrollo: AirtableRecord[] = []
  let noCalifica = 0

  for (const record of records) {
    const grupo = getGrupo(record.fields.calificacion)
    if      (grupo === 'potencial')     potencial.push(record)
    else if (grupo === 'en-desarrollo') enDesarrollo.push(record)
    else                                noCalifica++
  }

  const sortByAge = (a: AirtableRecord, b: AirtableRecord) =>
    new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime()
  potencial.sort(sortByAge)
  enDesarrollo.sort(sortByAge)

  // ── 3. Construir y enviar mail ────────────────────────────────────────────────
  const fechaCorta = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Europe/Madrid',
  })

  const html = buildEmail(potencial, enDesarrollo, seguimiento, noCalifica, siteUrl)

  try {
    await sendEmail({
      to: silvanaEmail,
      subject: `Tu Lugar en Galicia — Resumen de leads · ${fechaCorta}`,
      html,
    })
  } catch (err) {
    console.error('[resumen-diario] Resend error:', err)
    return NextResponse.json({ error: 'Error enviando mail' }, { status: 500 })
  }

  const total = potencial.length + enDesarrollo.length
  return NextResponse.json({ ok: true, enviados: total, expirados: seguimiento.length })
}

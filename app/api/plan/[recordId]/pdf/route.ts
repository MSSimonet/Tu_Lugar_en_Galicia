import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getLead } from '@/lib/leads'
import { armarPlan } from '@/lib/plan/armador'
import { generarPlanPdf } from '@/lib/plan/generarPdf'
import { verifyScopedToken } from '@/lib/admin/tokens'
import { getRealIp } from '@/lib/utils/ip'
import { isValidUuid } from '@/lib/utils/validation'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, '10 m'),
        analytics: false,
        prefix: 'ratelimit:plan-pdf',
      })
    : null

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  if (!ratelimit) {
    console.error('[plan/pdf] ratelimit no configurado — faltan UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN en el entorno')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }
  const ip = getRealIp(req)
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, { status: 429 })
  }

  const { recordId } = await params

  if (!recordId || !isValidUuid(recordId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const token = req.nextUrl.searchParams.get('token') ?? ''
  try {
    verifyScopedToken('admin', recordId, token)
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let lead
  try {
    lead = await getLead(recordId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    const status = msg === 'Lead no encontrado' ? 404 : 500
    return NextResponse.json(
      { error: status === 404 ? 'Lead no encontrado' : 'Error interno' },
      { status },
    )
  }

  const planArmado = armarPlan({
    paisResidencia:        lead.paisResidencia,
    modalidad:             lead.modalidad,
    documentacion:         lead.documentacion,
    situacionLaboral:      lead.situacionLaboral,
    mascotas:              lead.mascotas,
    ninos:                 lead.ninos,
    adolescentes:          lead.adolescentes,
    cuentaBancaria:        lead.cuentaBancaria,
    tipoLicencia:          lead.tipoLicencia,
    nivelEstudios:         lead.nivelEstudios,
    presupuestoMensual:    lead.presupuestoMensual,
    garantias:             lead.garantias,
    fechaLlegada:          lead.fechaLlegada,
    necesidadesEspeciales: lead.necesidadesEspeciales,
    adultos:               lead.adultos,
  })

  let buffer
  try {
    buffer = await generarPlanPdf(lead, planArmado)
  } catch {
    // Nunca devolver err.message al cliente — la plantilla puede interpolar datos
    // del lead en el mensaje de error. Detalle solo server-side, sin el mensaje.
    console.error(`[plan/pdf] Error generando PDF — recordId: ${recordId}, ts: ${new Date().toISOString()}`)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }

  // El nombre lo escribe el usuario: se limpia a [a-z0-9-] para que no viaje ningún separador
  // de ruta ni comilla dentro del filename del adjunto (F2, mismo patrón que app/api/gina).
  // `|| 'cliente'` cubre el nombre que queda vacío tras el filtrado (p. ej. alfabeto no latino).
  const slug =
    lead.nombreCompleto.trim().replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '') ||
    'cliente'
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="plan-${slug}.pdf"`,
    },
  })
}

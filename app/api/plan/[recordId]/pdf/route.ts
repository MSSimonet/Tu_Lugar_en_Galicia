import { NextRequest, NextResponse } from 'next/server'
import { getLead } from '@/lib/leads'
import { armarPlan } from '@/lib/plan/armador'
import { generarPlanPdf } from '@/lib/plan/generarPdf'
import { verifyAdminToken } from '@/lib/admin/tokens'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const { recordId } = await params

  if (!recordId || !/^rec[a-zA-Z0-9]{14}$/.test(recordId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const token = req.nextUrl.searchParams.get('token') ?? ''
  try {
    verifyAdminToken(recordId, token)
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let lead
  try {
    lead = await getLead(recordId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    const status = msg.includes('HTTP 404') ? 404 : 500
    return NextResponse.json(
      { error: status === 404 ? 'Lead no encontrado' : 'Error interno' },
      { status },
    )
  }

  const planArmado = armarPlan({
    paisResidencia:        lead.paisResidencia,
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

  const slug = lead.nombreCompleto.trim().replace(/\s+/g, '-').toLowerCase()
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="plan-${slug}.pdf"`,
    },
  })
}

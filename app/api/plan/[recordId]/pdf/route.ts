import { NextRequest, NextResponse } from 'next/server'
import { getLead } from '@/lib/leads'
import { armarPlan } from '@/lib/plan/armador'
import { generarPlanPdf } from '@/lib/plan/generarPdf'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const { recordId } = await params

  if (!recordId || !/^[a-zA-Z0-9]{10,20}$/.test(recordId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  let lead
  try {
    lead = await getLead(recordId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al leer el lead'
    const status = msg.includes('HTTP 404') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }

  const planArmado = armarPlan({
    paisResidencia:   lead.paisResidencia,
    documentacion:    lead.documentacion,
    situacionLaboral: lead.situacionLaboral,
    mascotas:         lead.mascotas,
    ninos:            lead.ninos,
    adolescentes:     lead.adolescentes,
    cuentaBancaria:   lead.cuentaBancaria,
    tipoLicencia:     lead.tipoLicencia,
    nivelEstudios:    lead.nivelEstudios,
  })

  let buffer
  try {
    buffer = await generarPlanPdf(lead, planArmado)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al generar el PDF'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const slug = lead.nombreCompleto.trim().replace(/\s+/g, '-').toLowerCase()
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="plan-${slug}.pdf"`,
    },
  })
}

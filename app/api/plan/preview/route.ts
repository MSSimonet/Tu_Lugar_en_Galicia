// Endpoint temporal — permite ver el PDF en el navegador para aprobar el diseño.
// Eliminar o proteger antes de producción.
import { NextResponse } from 'next/server'
import { armarPlan } from '@/lib/plan/armador'
import { generarPlanPdf } from '@/lib/plan/generarPdf'
import type { LeadData } from '@/lib/leads'

// Ejemplo 1 — familia argentina, en trámite de visado, cuenta ajena
// (mismas respuestas del test case 1 del armador)
const EJEMPLO_LEAD: LeadData = {
  nombreCompleto: 'Valentina López',
  email: 'valentina@ejemplo.com',
  telefono: '+54 9 11 1234 5678',
  paisResidencia: 'Argentina',
  documentacion: 'en-tramite',
  situacionLaboral: 'cuenta-ajena',
  mascotas: 'no',
  ninos: '2',
  adolescentes: '0',
  cuentaBancaria: 'no',
  tipoLicencia: 'origen',
  nivelEstudios: 'universitario',
  ingresosMensuales: '3500',
  garantias: ['ninguna'],
  ciudadDestino: 'vigo',
  presupuestoMensual: '1000-1400',
  amueblado: 'si',
  fechaLlegada: '2026-10-01',
  comprendeServicio: true,
  consentimientoRGPD: true,
}

export async function GET() {
  const planArmado = armarPlan({
    paisResidencia: EJEMPLO_LEAD.paisResidencia,
    documentacion: EJEMPLO_LEAD.documentacion,
    situacionLaboral: EJEMPLO_LEAD.situacionLaboral,
    mascotas: EJEMPLO_LEAD.mascotas,
    ninos: EJEMPLO_LEAD.ninos,
    adolescentes: EJEMPLO_LEAD.adolescentes,
    cuentaBancaria: EJEMPLO_LEAD.cuentaBancaria,
    tipoLicencia: EJEMPLO_LEAD.tipoLicencia,
    nivelEstudios: EJEMPLO_LEAD.nivelEstudios,
  })

  const buffer = await generarPlanPdf(EJEMPLO_LEAD, planArmado)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="plan-estrategico-ejemplo.pdf"',
    },
  })
}

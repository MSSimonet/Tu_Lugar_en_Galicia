/**
 * app/api/gina/route.ts — Endpoint serverless del motor de Gina.
 *
 * POST /api/gina
 * Body: { sesion: GinaSession, respuesta: string | string[] }
 * Response: { sesionActualizada: GinaSession, siguientePaso: Paso }
 *
 * En Etapa 1 los pasos de tipo "llm" NO llaman a ninguna IA externa:
 * reciben el texto del usuario, lo guardan y devuelven el siguiente paso.
 */

import { NextRequest, NextResponse } from 'next/server'
import { procesarRespuesta, obtenerPaso } from '@/lib/gina/flowEngine'
import type { GinaSession } from '@/lib/gina/session'
import { saveLead } from '@/lib/leads'
import type { LeadData } from '@/lib/leads'

export const runtime = 'edge'

type RequestBody = {
  sesion: GinaSession
  respuesta: string | string[]
}

export async function POST(req: NextRequest) {
  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { sesion, respuesta } = body

  if (!sesion || !sesion.pasoActual) {
    return NextResponse.json({ error: 'sesion inválida' }, { status: 400 })
  }

  // Límite de tamaño en campos de texto libre — evita payloads abusivos
  if (typeof respuesta === 'string' && respuesta.length > 2000) {
    return NextResponse.json(
      { error: 'Respuesta demasiado larga (máx. 2000 caracteres)' },
      { status: 400 },
    )
  }

  // Obtener definición del paso actual
  let paso
  try {
    paso = obtenerPaso(sesion.pasoActual)
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 400 },
    )
  }

  // Procesar la respuesta en el motor de estados
  const { sesionActualizada, siguientePasoId } = procesarRespuesta(
    sesion,
    paso,
    respuesta,
  )

  // Obtener definición del siguiente paso para devolverlo al cliente
  let siguientePaso
  try {
    siguientePaso = obtenerPaso(siguientePasoId)
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    )
  }

  // Guardado en Airtable según la acción del paso que se acaba de procesar.
  // nivel1 es blocking para capturar el record ID y devolverlo al cliente.
  // parcial/completo son fire-and-forget; usan el record ID ya almacenado para hacer PATCH.
  let sesionParaDevolver = sesionActualizada

  if (paso.accion === 'guardar_nivel1') {
    try {
      const recordId = await guardarEnAirtable(sesionActualizada)
      sesionParaDevolver = { ...sesionActualizada, airtableRecordId: recordId }
    } catch (err) {
      console.error('[gina] Error al guardar nivel1:', (err as Error).message)
      // Sin record ID: el guardado final hará POST como fallback, no se pierde el lead
    }
  } else if (paso.accion === 'guardar_lead_completo' || paso.accion === 'guardar_lead_parcial') {
    guardarEnAirtable(sesionActualizada).catch((err) => {
      console.error('[gina] Error al guardar lead:', (err as Error).message)
    })
  }

  return NextResponse.json({
    sesionActualizada: sesionParaDevolver,
    siguientePaso,
  })
}

/**
 * Mapea las respuestas de la sesión al tipo LeadData y llama a saveLead.
 * Pasa sesion.airtableRecordId a saveLead: si existe hace PATCH, si no hace POST.
 * Devuelve el record ID resultante (nuevo en POST, el mismo en PATCH).
 */
async function guardarEnAirtable(sesion: GinaSession): Promise<string> {
  const r = sesion.respuestas

  const lead: Partial<LeadData> & Pick<LeadData, 'nombreCompleto' | 'email' | 'consentimientoRGPD'> = {
    nombreCompleto: String(r['nombreCompleto'] ?? ''),
    email: String(r['email'] ?? ''),
    telefono: String(r['telefono'] ?? ''),
    paisResidencia: String(r['paisResidencia'] ?? ''),
    adultos: r['adultos'] as LeadData['adultos'] ?? undefined,
    ninos: r['ninos'] as LeadData['ninos'] ?? undefined,
    adolescentes: r['adolescentes'] as LeadData['adolescentes'] ?? undefined,
    mascotas: (r['mascotas'] as 'si' | 'no') ?? 'no',
    mascotaTipo: r['mascotaTipo'] as LeadData['mascotaTipo'] ?? undefined,
    cantidadPerros: r['cantidadPerros'] as LeadData['cantidadPerros'] ?? undefined,
    cantidadGatos: r['cantidadGatos'] as LeadData['cantidadGatos'] ?? undefined,
    mascotaPeso: r['mascotaPeso'] as LeadData['mascotaPeso'] ?? undefined,
    documentacion: (r['documentacion'] as LeadData['documentacion']) ?? 'turista',
    situacionLaboral: (r['situacionLaboral'] as LeadData['situacionLaboral']) ?? 'busca-empleo',
    ingresosMensuales: String(r['ingresosMensuales'] ?? ''),
    garantias: (r['garantias'] as LeadData['garantias']) ?? [],
    ciudadDestino: (r['ciudadDestino'] as LeadData['ciudadDestino']) ?? 'indiferente',
    tipoInmueble: r['tipoInmueble'] as LeadData['tipoInmueble'] ?? undefined,
    presupuestoMensual: (r['presupuestoMensual'] as LeadData['presupuestoMensual']) ?? 'menos-700',
    habitacionesMinimas: (r['habitacionesMinimas'] as LeadData['habitacionesMinimas']) ?? '1',
    amueblado: (r['amueblado'] as LeadData['amueblado']) ?? 'indiferente',
    ...(Array.isArray(r['imprescindibles']) && (r['imprescindibles'] as string[]).length > 0
      ? { imprescindibles: r['imprescindibles'] as LeadData['imprescindibles'] }
      : {}),
    comodidades: r['comodidades'] as LeadData['comodidades'] ?? undefined,
    necesidadesEspeciales: r['necesidadesEspeciales'] ? String(r['necesidadesEspeciales']) : undefined,
    profesion: r['profesion'] ? String(r['profesion']) : undefined,
    fechaLlegada: String(r['fechaLlegada'] ?? ''),
    comoNosConociste: r['comoNosConociste'] as LeadData['comoNosConociste'] ?? undefined,
    comprendeServicio: true,
    consentimientoRGPD: true,
  }

  return saveLead(lead as LeadData, sesion.airtableRecordId)
}

/**
 * app/api/avoa/route.ts — Endpoint serverless del motor de Avoa.
 *
 * POST /api/avoa
 * Body: { sesion: AvoaSession, respuesta: string | string[] }
 * Response: { sesionActualizada: AvoaSession, siguientePaso: Paso }
 *
 * En Etapa 1 los pasos de tipo "llm" NO llaman a ninguna IA externa:
 * reciben el texto del usuario, lo guardan y devuelven el siguiente paso.
 */

import { NextRequest, NextResponse } from 'next/server'
import { procesarRespuesta, obtenerPaso } from '@/lib/avoa/flowEngine'
import type { AvoaSession } from '@/lib/avoa/session'
import { saveLead } from '@/lib/leads'
import type { LeadData } from '@/lib/leads'

export const runtime = 'edge'

type RequestBody = {
  sesion: AvoaSession
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

  // Disparar guardado en Airtable según la acción del paso que se acaba de procesar
  if (paso.accion === 'guardar_nivel1' || paso.accion === 'guardar_lead_completo' || paso.accion === 'guardar_lead_parcial') {
    // No bloqueamos la respuesta al cliente — guardamos en background (fire and forget)
    guardarEnAirtable(sesionActualizada).catch((err) => {
      // Solo log interno, nunca datos personales
      console.error('[avoa] Error al guardar lead:', (err as Error).message)
    })
  }

  return NextResponse.json({
    sesionActualizada,
    siguientePaso,
  })
}

/**
 * Mapea las respuestas de la sesión al tipo LeadData y llama a saveLead.
 * Los campos opcionales que no se hayan completado se omiten.
 */
async function guardarEnAirtable(sesion: AvoaSession): Promise<void> {
  const r = sesion.respuestas

  // Construir payload con los campos disponibles
  // Los campos obligatorios en LeadData pueden estar vacíos si el usuario
  // abandonó antes de completarlos; usamos defaults seguros.
  const lead: Partial<LeadData> & Pick<LeadData, 'nombreCompleto' | 'email' | 'consentimientoRGPD'> = {
    nombreCompleto: String(r['nombreCompleto'] ?? ''),
    email: String(r['email'] ?? ''),
    telefono: String(r['telefono'] ?? ''),
    paisResidencia: String(r['paisResidencia'] ?? ''),
    personas: String(r['personas'] ?? ''),
    mascotas: (r['mascotas'] as 'si' | 'no') ?? 'no',
    detalleMascotas: r['detalleMascotas'] ? String(r['detalleMascotas']) : undefined,
    documentacion: (r['documentacion'] as LeadData['documentacion']) ?? 'turista',
    situacionLaboral: (r['situacionLaboral'] as LeadData['situacionLaboral']) ?? 'busca-empleo',
    ingresosMensuales: String(r['ingresosMensuales'] ?? ''),
    garantias: (r['garantias'] as LeadData['garantias']) ?? [],
    ciudadDestino: (r['ciudadDestino'] as LeadData['ciudadDestino']) ?? 'indiferente',
    tipoInmueble: r['tipoInmueble'] as LeadData['tipoInmueble'] ?? undefined,
    presupuestoMensual: (r['presupuestoMensual'] as LeadData['presupuestoMensual']) ?? 'menos-700',
    habitacionesMinimas: (r['habitacionesMinimas'] as LeadData['habitacionesMinimas']) ?? '1',
    amueblado: (r['amueblado'] as LeadData['amueblado']) ?? 'indiferente',
    // imprescindibles: características físicas del inmueble (ascensor/garaje/calefaccion/terraza/no)
    // El formulario web captura estacionamiento por separado; Avoa usa imprescindibles (multiselect)
    ...(Array.isArray(r['imprescindibles']) && (r['imprescindibles'] as string[]).length > 0
      ? { imprescindibles: r['imprescindibles'] as LeadData['imprescindibles'] }
      : {}),
    comodidades: r['comodidades'] as LeadData['comodidades'] ?? undefined,
    necesidadesEspeciales: r['necesidadesEspeciales'] ? String(r['necesidadesEspeciales']) : undefined,
    profesion: r['profesion'] ? String(r['profesion']) : undefined,
    fechaLlegada: String(r['fechaLlegada'] ?? ''),
    // inicioContrato: no se pregunta en el cuestionario Avoa → se omite (campo opcional)
    modalidad: (r['modalidad'] as LeadData['modalidad']) ?? 'ya-estando',
    comoNosConociste: r['comoNosConociste'] as LeadData['comoNosConociste'] ?? undefined,
    comprendeServicio: true,
    consentimientoRGPD: true,
  }

  await saveLead(lead as LeadData)
}

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
import { calcularCalificacion } from '@/lib/gina/scoring'

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
    guardarEnAirtable(sesionActualizada, true).catch((err) => {
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
 *
 * REGLA: un campo se incluye SOLO si fue respondido en sesion.respuestas.
 * Sin defaults: un campo no preguntado llega como undefined y JSON.stringify lo omite.
 */
async function guardarEnAirtable(sesion: GinaSession, incluirCalificacion = false): Promise<string> {
  const r = sesion.respuestas

  const lead: Partial<LeadData> & Pick<LeadData, 'nombreCompleto' | 'email' | 'consentimientoRGPD'> = {
    // Siempre presentes (nombre y email se capturan antes de cualquier guardado)
    nombreCompleto: String(r['nombreCompleto'] ?? ''),
    email: String(r['email'] ?? ''),
    consentimientoRGPD: true,

    // Datos personales
    telefono: r['telefono'] ? String(r['telefono']) : undefined,
    paisResidencia: r['paisResidencia'] ? String(r['paisResidencia']) : undefined,
    fechaLlegada: r['fechaLlegada'] ? String(r['fechaLlegada']) : undefined,

    // Destino
    ciudadDestino: r['ciudadDestino'] ? (r['ciudadDestino'] as LeadData['ciudadDestino']) : undefined,

    // Composición familiar
    adultos: r['adultos'] ? (r['adultos'] as LeadData['adultos']) : undefined,
    ninos: r['ninos'] ? (r['ninos'] as LeadData['ninos']) : undefined,
    adolescentes: r['adolescentes'] ? (r['adolescentes'] as LeadData['adolescentes']) : undefined,

    // Mascotas
    mascotas: r['mascotas'] ? (r['mascotas'] as LeadData['mascotas']) : undefined,
    mascotaTipo: Array.isArray(r['mascotaTipo']) && (r['mascotaTipo'] as string[]).length > 0
      ? (r['mascotaTipo'] as LeadData['mascotaTipo'])
      : undefined,
    cantidadPerros: r['cantidadPerros'] ? (r['cantidadPerros'] as LeadData['cantidadPerros']) : undefined,
    cantidadGatos: r['cantidadGatos'] ? (r['cantidadGatos'] as LeadData['cantidadGatos']) : undefined,
    mascotaPeso: r['mascotaPeso'] ? (r['mascotaPeso'] as LeadData['mascotaPeso']) : undefined,

    // Situación legal y laboral
    documentacion: r['documentacion'] ? (r['documentacion'] as LeadData['documentacion']) : undefined,
    situacionLaboral: r['situacionLaboral'] ? (r['situacionLaboral'] as LeadData['situacionLaboral']) : undefined,
    ingresosMensuales: r['ingresosMensuales'] ? String(r['ingresosMensuales']) : undefined,
    garantias: Array.isArray(r['garantias']) && (r['garantias'] as string[]).length > 0
      ? (r['garantias'] as LeadData['garantias'])
      : undefined,

    // Preferencias de vivienda
    presupuestoMensual: r['presupuestoMensual'] ? (r['presupuestoMensual'] as LeadData['presupuestoMensual']) : undefined,
    tipoInmueble: r['tipoInmueble'] ? (r['tipoInmueble'] as LeadData['tipoInmueble']) : undefined,
    habitacionesMinimas: r['habitacionesMinimas'] ? (r['habitacionesMinimas'] as LeadData['habitacionesMinimas']) : undefined,
    amueblado: r['amueblado'] ? (r['amueblado'] as LeadData['amueblado']) : undefined,
    imprescindibles: Array.isArray(r['imprescindibles']) && (r['imprescindibles'] as string[]).length > 0
      ? (r['imprescindibles'] as LeadData['imprescindibles'])
      : undefined,
    comodidades: r['comodidades'] ? (r['comodidades'] as LeadData['comodidades']) : undefined,

    // Perfil adicional (Nivel 2)
    necesidadesEspeciales: r['necesidadesEspeciales'] ? (r['necesidadesEspeciales'] as LeadData['necesidadesEspeciales']) : undefined,
    profesion: r['profesion'] ? String(r['profesion']) : undefined,
    comoNosConociste: r['comoNosConociste'] ? (r['comoNosConociste'] as LeadData['comoNosConociste']) : undefined,
    cuentaBancaria: r['cuentaBancaria'] ? (r['cuentaBancaria'] as LeadData['cuentaBancaria']) : undefined,
    comprendeHonorarios: r['comprendeHonorarios'] ? (r['comprendeHonorarios'] as LeadData['comprendeHonorarios']) : undefined,
    tipoLicencia: r['tipoLicencia'] ? (r['tipoLicencia'] as LeadData['tipoLicencia']) : undefined,
    ciudadActual: r['ciudadActual'] ? String(r['ciudadActual']) : undefined,
    tiempoEnEspana: r['tiempoEnEspana'] ? (r['tiempoEnEspana'] as LeadData['tiempoEnEspana']) : undefined,
    objetivoBusqueda: r['objetivoBusqueda'] ? (r['objetivoBusqueda'] as LeadData['objetivoBusqueda']) : undefined,
    nivelEstudios: r['nivelEstudios'] ? (r['nivelEstudios'] as LeadData['nivelEstudios']) : undefined,

    // comprendeServicio: derivado, solo cuando la pregunta fue respondida
    comprendeServicio: r['comprendeHonorarios'] !== undefined
      ? r['comprendeHonorarios'] === 'entiende'
      : undefined,

    ...(incluirCalificacion
      ? {
          calificacion: calcularCalificacion({
            documentacion: r['documentacion'] as string | undefined,
            garantias: r['garantias'] as string[] | undefined,
            ingresosMensuales: r['ingresosMensuales'] as string | undefined,
            fechaLlegada: r['fechaLlegada'] as string | undefined,
            ciudadDestino: r['ciudadDestino'] as string | undefined,
            adultos: r['adultos'] as string | undefined,
            ninos: r['ninos'] as string | undefined,
            adolescentes: r['adolescentes'] as string | undefined,
            mascotas: r['mascotas'] as string | undefined,
            cantidadPerros: r['cantidadPerros'] as string | undefined,
            cantidadGatos: r['cantidadGatos'] as string | undefined,
            situacionLaboral: r['situacionLaboral'] as string | undefined,
            presupuestoMensual: r['presupuestoMensual'] as string | undefined,
            nivelEstudios: r['nivelEstudios'] as string | undefined,
          }),
        }
      : {}),
  }

  return saveLead(lead as LeadData, sesion.airtableRecordId)
}

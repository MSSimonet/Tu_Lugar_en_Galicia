/**
 * lib/admin/dashboardRepo.ts — Agregaciones de `leads` para el dashboard analítico de /admin.
 *
 * Todas las funciones leen directo de Supabase con getSupabaseServerClient() (service_role,
 * bypassea RLS) — solo se llaman desde Server Components de /admin, nunca desde el cliente.
 *
 * Nota sobre `calificacion`: tanto Gina (app/api/gina/route.ts) como el formulario web
 * (app/api/lead/route.ts, vía calcularCalificacion() de lib/gina/scoring.ts) calculan y
 * guardan `calificacion` en cada guardado — no es un campo exclusivo de un solo origen.
 * calcularCalificacion() hoy solo devuelve 'potencial' | 'en-desarrollo' | 'bajo': el valor
 * 'potencial-alto' del tipo LeadData nunca lo produce el motor automático (existe para un
 * eventual override manual desde el panel, todavía no implementado). El resto del código del
 * proyecto ya trata 'potencial' y 'potencial-alto' como equivalentes para KPIs/agrupación
 * (ver CALIFICACION_STYLE en app/admin/lead/[recordId]/page.tsx y getGrupo() en
 * app/api/admin/resumen-diario/route.ts) — este archivo sigue el mismo criterio.
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import { clasificarOrigen, type SegmentoOrigen } from '@/lib/admin/paisClasificador'

const CALIFICACIONES_ALTO_POTENCIAL = ['potencial', 'potencial-alto']

const MESES_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function formatMesEs(fecha: Date): string {
  return `${MESES_ES[fecha.getUTCMonth()]} ${fecha.getUTCFullYear()}`
}

/** Primer instante (00:00:00 UTC) del mes calendario que contiene `fecha`. */
function inicioDeMes(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1))
}

export type KpisDelMes = {
  leadsDelMes: number
  porcentajeAltoPotencial: number // 0-100 redondeado a entero
  citasConfirmadas: number
}

export async function getKpisDelMes(): Promise<KpisDelMes> {
  const supabase = getSupabaseServerClient()
  const ahora = new Date()
  const inicioMes = inicioDeMes(ahora)
  const inicioMesSiguiente = new Date(Date.UTC(inicioMes.getUTCFullYear(), inicioMes.getUTCMonth() + 1, 1))
  const inicioMesIso = inicioMes.toISOString()
  const finMesIso = inicioMesSiguiente.toISOString()

  const [leadsDelMesResult, calificadosResult, altoPotencialResult, citasResult] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', inicioMesIso)
      .lt('created_at', finMesIso),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', inicioMesIso)
      .lt('created_at', finMesIso)
      .not('calificacion', 'is', null),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', inicioMesIso)
      .lt('created_at', finMesIso)
      .in('calificacion', CALIFICACIONES_ALTO_POTENCIAL),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('cita_agendada', true)
      .gte('fecha_cita', inicioMesIso)
      .lt('fecha_cita', finMesIso),
  ])

  for (const result of [leadsDelMesResult, calificadosResult, altoPotencialResult, citasResult]) {
    if (result.error) throw new Error(`Supabase getKpisDelMes: ${result.error.message}`)
  }

  const totalCalificados = calificadosResult.count ?? 0
  const totalAltoPotencial = altoPotencialResult.count ?? 0
  const porcentajeAltoPotencial =
    totalCalificados === 0 ? 0 : Math.round((totalAltoPotencial / totalCalificados) * 100)

  return {
    leadsDelMes: leadsDelMesResult.count ?? 0,
    porcentajeAltoPotencial,
    citasConfirmadas: citasResult.count ?? 0,
  }
}

export type PuntoEvolucionMensual = { mes: string; leads: number }

/** Evolución mensual de leads creados, orden cronológico ascendente. Default: últimos 6 meses (incluye el actual). */
export async function getEvolucionMensual(meses = 6): Promise<PuntoEvolucionMensual[]> {
  const supabase = getSupabaseServerClient()
  const ahora = new Date()
  const inicioMesActual = inicioDeMes(ahora)
  const inicioRango = new Date(
    Date.UTC(inicioMesActual.getUTCFullYear(), inicioMesActual.getUTCMonth() - (meses - 1), 1),
  )

  const { data, error } = await supabase
    .from('leads')
    .select('created_at')
    .gte('created_at', inicioRango.toISOString())

  if (error) throw new Error(`Supabase getEvolucionMensual: ${error.message}`)

  // Buckets inicializados en 0 para los `meses` meses del rango, en orden cronológico —
  // así un mes sin leads aparece en el gráfico igual, en vez de faltar directamente.
  const buckets = new Map<string, PuntoEvolucionMensual>()
  for (let i = 0; i < meses; i++) {
    const fechaBucket = new Date(Date.UTC(inicioRango.getUTCFullYear(), inicioRango.getUTCMonth() + i, 1))
    const clave = `${fechaBucket.getUTCFullYear()}-${fechaBucket.getUTCMonth()}`
    buckets.set(clave, { mes: formatMesEs(fechaBucket), leads: 0 })
  }

  for (const row of data ?? []) {
    const createdAt = row.created_at as string | null
    if (!createdAt) continue
    const fecha = new Date(createdAt)
    const clave = `${fecha.getUTCFullYear()}-${fecha.getUTCMonth()}`
    const bucket = buckets.get(clave)
    if (bucket) bucket.leads += 1
  }

  return Array.from(buckets.values())
}

export type PuntoSegmentacion = { segmento: SegmentoOrigen; cantidad: number }

/**
 * Segmentación de origen de TODOS los leads (no solo el mes actual): es un gráfico de
 * distribución total del pipeline, no una métrica temporal — mismo criterio que
 * getCiudadesMasSolicitadas() más abajo. El fuzzy-matching de clasificarOrigen() no se
 * puede expresar en SQL, así que se trae `modalidad`/`pais_residencia` y se clasifica en
 * memoria.
 */
export async function getSegmentacionOrigen(): Promise<PuntoSegmentacion[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from('leads').select('modalidad, pais_residencia')
  if (error) throw new Error(`Supabase getSegmentacionOrigen: ${error.message}`)

  const conteo = new Map<SegmentoOrigen, number>()
  for (const row of data ?? []) {
    const segmento = clasificarOrigen(
      row.modalidad as string | null,
      row.pais_residencia as string | null,
    )
    conteo.set(segmento, (conteo.get(segmento) ?? 0) + 1)
  }

  return Array.from(conteo.entries()).map(([segmento, cantidad]) => ({ segmento, cantidad }))
}

export type PuntoCiudad = { ciudad: string; cantidad: number }

/** Top N ciudades más solicitadas (ciudad_destino), excluye null y 'indiferente'. */
export async function getCiudadesMasSolicitadas(limite = 10): Promise<PuntoCiudad[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('leads')
    .select('ciudad_destino')
    .not('ciudad_destino', 'is', null)
    .neq('ciudad_destino', 'indiferente')

  if (error) throw new Error(`Supabase getCiudadesMasSolicitadas: ${error.message}`)

  const conteo = new Map<string, number>()
  for (const row of data ?? []) {
    const ciudad = row.ciudad_destino as string | null
    if (!ciudad) continue
    conteo.set(ciudad, (conteo.get(ciudad) ?? 0) + 1)
  }

  return Array.from(conteo.entries())
    .map(([ciudad, cantidad]) => ({ ciudad, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite)
}

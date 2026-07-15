/**
 * lib/admin/pipelineRepo.ts — Kanban de pipeline editable (tabla `pipeline_etapas`) y
 * asignación de etapa a un lead (`leads.etapa_id`). RLS deny-all en `pipeline_etapas`:
 * todo el acceso pasa por getSupabaseServerClient() (service_role), server-side únicamente.
 *
 * `lead_actividad` es append-only — cualquier cambio de etapa se registra ahí vía
 * registrarActividad() de lib/admin/notasTareasRepo.ts, nunca reescrita acá.
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import { fromRow } from '@/lib/leads'
import { generarResumenHumano } from '@/lib/admin/resumenHumano'
import { registrarActividad } from '@/lib/admin/notasTareasRepo'
import { ValidationError } from '@/lib/admin/errors'

export type PipelineEtapa = {
  id: string
  nombre: string
  orden: number
  color: string | null
  etiquetaOrigen: string | null
  esDefault: boolean
}

const NOMBRE_MAX_LENGTH = 60
const ORDEN_INICIAL = 10
const ORDEN_INCREMENTO = 10
// #RRGGBB — mismo formato que `color` sembrado en la migración 0004 (ej. '#9CA3AF').
const COLOR_HEX_REGEX = /^#[0-9A-Fa-f]{6}$/

function rowToPipelineEtapa(row: Record<string, unknown>): PipelineEtapa {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    orden: Number(row.orden),
    color: (row.color as string | null) ?? null,
    etiquetaOrigen: (row.etiqueta_origen as string | null) ?? null,
    esDefault: row.es_default === true,
  }
}

function validarNombre(nombre: string): string {
  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) {
    throw new ValidationError('nombre no puede estar vacío')
  }
  if (nombreLimpio.length > NOMBRE_MAX_LENGTH) {
    throw new ValidationError(`nombre supera el máximo de ${NOMBRE_MAX_LENGTH} caracteres`)
  }
  return nombreLimpio
}

/** Lista las etapas del pipeline, ordenadas por `orden` ascendente. */
export async function listarEtapas(): Promise<PipelineEtapa[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('pipeline_etapas')
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw new Error(`Supabase listarEtapas: ${error.message}`)
  return (data ?? []).map(rowToPipelineEtapa)
}

/**
 * Crea una etapa nueva al final del pipeline (`orden` = máximo actual + 10, o 10 si no hay
 * ninguna). Las etapas creadas a mano desde el panel no tienen auto-asignación por
 * etiqueta (`etiqueta_origen = null`) — esa asociación solo existe para las 5 etapas
 * sembradas originalmente en la migración.
 */
export async function crearEtapa(nombre: string, color?: string): Promise<PipelineEtapa> {
  const nombreValidado = validarNombre(nombre)
  if (color !== undefined && !COLOR_HEX_REGEX.test(color)) {
    throw new ValidationError('color inválido: debe ser un hex de 6 dígitos (ej. "#9CA3AF")')
  }

  const supabase = getSupabaseServerClient()
  const { data: existentes, error: readError } = await supabase
    .from('pipeline_etapas')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
  if (readError) throw new Error(`Supabase crearEtapa (lectura orden): ${readError.message}`)

  const ordenMaxima = existentes?.[0]?.orden as number | undefined
  const ordenNueva = ordenMaxima !== undefined ? Number(ordenMaxima) + ORDEN_INCREMENTO : ORDEN_INICIAL

  const { data, error } = await supabase
    .from('pipeline_etapas')
    .insert({
      nombre: nombreValidado,
      orden: ordenNueva,
      color: color ?? null,
      etiqueta_origen: null,
      es_default: false,
    })
    .select('*')
    .single()

  if (error) throw new Error(`Supabase crearEtapa: ${error.message}`)
  return rowToPipelineEtapa(data as Record<string, unknown>)
}

/** Renombra una etapa existente. Solo actualiza `nombre`. */
export async function renombrarEtapa(etapaId: string, nombreNuevo: string): Promise<void> {
  const nombreValidado = validarNombre(nombreNuevo)

  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('pipeline_etapas')
    .update({ nombre: nombreValidado })
    .eq('id', etapaId)

  if (error) throw new Error(`Supabase renombrarEtapa: ${error.message}`)
}

/**
 * Idempotente: si el lead ya tiene etapa_id, no hace nada y lo devuelve. Si no, busca la
 * etapa cuyo etiqueta_origen matchea lead.etiqueta (o la es_default=true si no hay match o
 * etiqueta es null), asigna leads.etapa_id, y registra la actividad. Devuelve el etapa_id
 * final.
 */
export async function asegurarEtapaAsignada(lead: {
  id: string
  etapaId: string | null
  etiqueta: string | null
}): Promise<string> {
  if (lead.etapaId) return lead.etapaId

  const etapas = await listarEtapas()
  const etapaPorEtiqueta = lead.etiqueta
    ? etapas.find((etapa) => etapa.etiquetaOrigen === lead.etiqueta)
    : undefined
  const etapaDefault = etapas.find((etapa) => etapa.esDefault)
  const etapaAsignada = etapaPorEtiqueta ?? etapaDefault

  if (!etapaAsignada) {
    throw new Error('No hay ninguna etapa es_default=true configurada en pipeline_etapas')
  }

  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('leads')
    .update({ etapa_id: etapaAsignada.id })
    .eq('id', lead.id)
  if (error) throw new Error(`Supabase asegurarEtapaAsignada: ${error.message}`)

  await registrarActividad(lead.id, 'etapa_inicial_asignada', etapaAsignada.nombre, undefined, 'sistema')
  return etapaAsignada.id
}

/**
 * Mueve un lead a otra etapa (drag-and-drop en el Kanban) y registra la actividad con los
 * nombres de la etapa anterior y la nueva.
 */
export async function moverLeadDeEtapa(leadId: string, nuevaEtapaId: string, actor: string): Promise<void> {
  const supabase = getSupabaseServerClient()

  const { data: leadRow, error: leadError } = await supabase
    .from('leads')
    .select('etapa_id')
    .eq('id', leadId)
    .maybeSingle()
  if (leadError) throw new Error(`Supabase moverLeadDeEtapa (lectura lead): ${leadError.message}`)
  if (!leadRow) throw new ValidationError(`Lead ${leadId} no encontrado`)

  const etapas = await listarEtapas()
  const etapaAnteriorId = (leadRow.etapa_id as string | null) ?? null
  const etapaAnterior = etapas.find((etapa) => etapa.id === etapaAnteriorId)
  const etapaNueva = etapas.find((etapa) => etapa.id === nuevaEtapaId)
  if (!etapaNueva) {
    throw new ValidationError(`Etapa ${nuevaEtapaId} no encontrada`)
  }

  const { error: updateError } = await supabase
    .from('leads')
    .update({ etapa_id: nuevaEtapaId })
    .eq('id', leadId)
  if (updateError) throw new Error(`Supabase moverLeadDeEtapa (update): ${updateError.message}`)

  await registrarActividad(
    leadId,
    'cambio_etapa',
    `De "${etapaAnterior?.nombre ?? 'sin etapa'}" a "${etapaNueva.nombre}"`,
    { etapaAnteriorId, etapaNuevaId: nuevaEtapaId },
    actor,
  )
}

export type LeadKanbanCard = {
  id: string
  nombreCompleto: string
  email: string
  etapaId: string
  calificacion: string | null
  resumenHumano: string
}

/**
 * Trae todos los leads para el tablero, asegurando que todos tengan etapa_id asignado
 * (llamando asegurarEtapaAsignada solo para los que no lo tienen todavía) antes de
 * agruparlos.
 */
export async function listarLeadsParaKanban(): Promise<LeadKanbanCard[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from('leads').select('*')
  if (error) throw new Error(`Supabase listarLeadsParaKanban: ${error.message}`)

  const rows = (data ?? []) as Record<string, unknown>[]

  const cards = await Promise.all(
    rows.map(async (row) => {
      const id = row.id as string
      const leadData = fromRow(row)
      const etapaIdActual = (row.etapa_id as string | null) ?? null
      const etapaId = await asegurarEtapaAsignada({
        id,
        etapaId: etapaIdActual,
        etiqueta: leadData.etiqueta ?? null,
      })

      const card: LeadKanbanCard = {
        id,
        nombreCompleto: leadData.nombreCompleto,
        email: leadData.email,
        etapaId,
        calificacion: leadData.calificacion ?? null,
        resumenHumano: generarResumenHumano({ ...leadData, id }),
      }
      return card
    }),
  )

  return cards
}

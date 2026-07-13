/**
 * lib/admin/notasTareasRepo.ts — Notas/tareas manuales y log de actividad de la ficha 360°
 * de un lead (tablas `notas_tareas` y `lead_actividad`, ver docs/crm-supabase-fase0.md §1.5
 * y §1.6). Ambas tablas son RLS deny-all: solo se acceden server-side con
 * getSupabaseServerClient() (service_role) — nunca desde un componente cliente.
 *
 * `lead_actividad` es append-only (un trigger de Postgres bloquea UPDATE, ver la migración):
 * registrarActividad() solo hace INSERT, nunca actualiza una fila existente.
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import type { LeadData } from '@/lib/leads'
import { clasificarOrigen } from '@/lib/admin/paisClasificador'

export type NotaTarea = {
  id: string
  leadId: string
  tipo: 'nota' | 'tarea'
  contenido: string
  estado: 'pendiente' | 'completada'
  fechaVencimiento: string | null
  autor: string | null
  createdAt: string
}

function rowToNotaTarea(row: Record<string, unknown>): NotaTarea {
  return {
    id: row.id as string,
    leadId: row.lead_id as string,
    tipo: row.tipo as NotaTarea['tipo'],
    contenido: row.contenido as string,
    estado: row.estado as NotaTarea['estado'],
    fechaVencimiento: (row.fecha_vencimiento as string | null) ?? null,
    autor: (row.autor as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

/** Lista las notas/tareas de un lead, más recientes primero. */
export async function listarNotasTareas(leadId: string): Promise<NotaTarea[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('notas_tareas')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Supabase listarNotasTareas: ${error.message}`)
  return (data ?? []).map(rowToNotaTarea)
}

export type CrearNotaInput = {
  tipo: 'nota' | 'tarea'
  contenido: string
  autor?: string
  fechaVencimiento?: string
}

/** Crea una nota o tarea manual (autor humano, ej. Silvana desde el panel). */
export async function crearNota(leadId: string, input: CrearNotaInput): Promise<NotaTarea> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('notas_tareas')
    .insert({
      lead_id: leadId,
      tipo: input.tipo,
      contenido: input.contenido,
      autor: input.autor ?? null,
      fecha_vencimiento: input.fechaVencimiento ?? null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`Supabase crearNota: ${error.message}`)
  return rowToNotaTarea(data as Record<string, unknown>)
}

/** Marca una nota/tarea existente como completada. */
export async function marcarCompletada(notaId: string): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('notas_tareas')
    .update({ estado: 'completada' })
    .eq('id', notaId)

  if (error) throw new Error(`Supabase marcarCompletada: ${error.message}`)
}

export type ActividadEntry = {
  id: number
  tipoEvento: string
  descripcion: string | null
  payload: unknown
  actor: string | null
  createdAt: string
}

function rowToActividad(row: Record<string, unknown>): ActividadEntry {
  return {
    id: row.id as number,
    tipoEvento: row.tipo_evento as string,
    descripcion: (row.descripcion as string | null) ?? null,
    payload: row.payload ?? null,
    actor: (row.actor as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

/** Lista el log de actividad de un lead, más reciente primero. */
export async function listarActividad(leadId: string): Promise<ActividadEntry[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('lead_actividad')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Supabase listarActividad: ${error.message}`)
  return (data ?? []).map(rowToActividad)
}

/** Agrega una entrada al log de actividad (append-only, nunca UPDATE). */
export async function registrarActividad(
  leadId: string,
  tipoEvento: string,
  descripcion?: string,
  payload?: unknown,
  actor?: string,
): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('lead_actividad').insert({
    lead_id: leadId,
    tipo_evento: tipoEvento,
    descripcion: descripcion ?? null,
    payload: payload ?? null,
    actor: actor ?? null,
  })

  if (error) throw new Error(`Supabase registrarActividad: ${error.message}`)
}

// ---------------------------------------------------------------------------
// Tareas automáticas por regla de negocio
// ---------------------------------------------------------------------------

const CONTENIDO_TASA_CONSULAR = 'Revisar estado de tasa consular'

/**
 * Garantiza que exista la tarea automática "Revisar estado de tasa consular" para leads
 * Extracomunitarios. Idempotente: se llama en cada apertura de la ficha 360°
 * (getFicha360() de lib/admin/inboxRepo.ts), así que primero verifica si la tarea ya
 * existe para no duplicarla en cada visita.
 */
export async function asegurarTareasAutomaticas(lead: LeadData & { id: string }): Promise<void> {
  const segmento = clasificarOrigen(lead.modalidad, lead.paisResidencia)
  if (segmento !== 'Extracomunitario') return

  const supabase = getSupabaseServerClient()
  const { data: existentes, error } = await supabase
    .from('notas_tareas')
    .select('id')
    .eq('lead_id', lead.id)
    .eq('contenido', CONTENIDO_TASA_CONSULAR)
    .limit(1)

  if (error) throw new Error(`Supabase asegurarTareasAutomaticas (lectura): ${error.message}`)
  if ((existentes?.length ?? 0) > 0) return

  await crearNota(lead.id, { tipo: 'tarea', contenido: CONTENIDO_TASA_CONSULAR, autor: 'sistema' })
  await registrarActividad(lead.id, 'tarea_automatica_creada', CONTENIDO_TASA_CONSULAR, undefined, 'sistema')
}

/**
 * lib/admin/inboxRepo.ts — Inbox de leads y ficha 360° para /admin. Estas funciones las
 * consumen directo Server Components de /admin (no hay endpoint API de lectura — decisión
 * ya tomada: las páginas de admin llaman a los repos directo, sin API routes intermedias).
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import { fromRow, type LeadData } from '@/lib/leads'
import { generarResumenHumano } from '@/lib/admin/resumenHumano'
import {
  asegurarTareasAutomaticas,
  listarActividad,
  listarNotasTareas,
  type ActividadEntry,
  type NotaTarea,
} from '@/lib/admin/notasTareasRepo'
import { listarTranscripcion, type TranscripcionRow } from '@/lib/gina/transcripcion'

export type LeadInboxItem = {
  id: string
  nombreCompleto: string
  email: string
  etiqueta: string | null
  calificacion: string | null
  ciudadDestino: string | null
  createdAt: string
  resumenHumano: string
}

// Menor número = mayor prioridad en el inbox.
const RANK_CALIFICACION: Record<string, number> = {
  'potencial-alto': 0,
  potencial: 1,
  'en-desarrollo': 2,
  bajo: 3,
}
const RANK_SIN_CALIFICAR = 4

function rankDe(calificacion: string | null): number {
  if (!calificacion) return RANK_SIN_CALIFICAR
  return RANK_CALIFICACION[calificacion] ?? RANK_SIN_CALIFICAR
}

/**
 * Lista todos los leads para el inbox, ordenados por prioridad de calificación
 * (potencial-alto > potencial > en-desarrollo > bajo > sin calificar) y, dentro de cada
 * rango, por fecha de creación descendente.
 */
export async function listarLeadsInbox(): Promise<LeadInboxItem[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Supabase listarLeadsInbox: ${error.message}`)

  const items = (data ?? []).map((row) => {
    const rawRow = row as Record<string, unknown>
    const id = rawRow.id as string
    const createdAt = rawRow.created_at as string
    const lead = fromRow(rawRow)

    return {
      id,
      nombreCompleto: lead.nombreCompleto,
      email: lead.email,
      etiqueta: lead.etiqueta ?? null,
      calificacion: lead.calificacion ?? null,
      ciudadDestino: lead.ciudadDestino ?? null,
      createdAt,
      resumenHumano: generarResumenHumano({ ...lead, id }),
    }
  })

  return items.sort((a, b) => {
    const rankDiff = rankDe(a.calificacion) - rankDe(b.calificacion)
    if (rankDiff !== 0) return rankDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export type Ficha360 = {
  lead: LeadData & { id: string; createdAt: string }
  esNacional: boolean
  notasTareas: NotaTarea[]
  actividad: ActividadEntry[]
  transcripcion: TranscripcionRow[]
}

/** Ficha 360° completa de un lead. Devuelve null si el id no existe. */
export async function getFicha360(leadId: string): Promise<Ficha360 | null> {
  const supabase = getSupabaseServerClient()
  const { data: row, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .maybeSingle()

  if (error) throw new Error(`Supabase getFicha360: ${error.message}`)
  if (!row) return null

  const rawRow = row as Record<string, unknown>
  const leadData = fromRow(rawRow)
  const lead = { ...leadData, id: leadId, createdAt: rawRow.created_at as string }

  // Debe correr ANTES de leer notasTareas, para que una tarea automática recién creada
  // (ej. "Revisar estado de tasa consular") ya aparezca en esta misma carga de la ficha.
  await asegurarTareasAutomaticas(lead)

  const [notasTareas, actividad, transcripcion] = await Promise.all([
    listarNotasTareas(leadId),
    listarActividad(leadId),
    listarTranscripcion(leadId),
  ])

  return {
    lead,
    esNacional: lead.modalidad === 'ya-en-espana',
    notasTareas,
    actividad,
    transcripcion,
  }
}

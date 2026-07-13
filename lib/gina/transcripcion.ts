/**
 * lib/gina/transcripcion.ts — Persistencia del historial mensaje-por-mensaje de Gina.
 *
 * Guardado 100% ADITIVO en paralelo al guardado de `respuestas` que ya existe en
 * app/api/gina/route.ts (guardar_nivel1/parcial/completo) — no reemplaza nada de
 * eso, ni toca lib/gina/flowEngine.ts. Ver supabase/migrations/0005_gina_transcripciones.sql.
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'

export type TranscripcionEntry = {
  rol: 'gina' | 'usuario'
  mensaje: string
  pasoId: string
}

export type TranscripcionRow = TranscripcionEntry & {
  id: number
  createdAt: string
}

/**
 * Inserta nuevas entradas del transcript para un lead. No lanza si falla —
 * la conversación con Gina no debe romperse porque el transcript no se pudo
 * guardar (el guardado de `respuestas` ya verificado no depende de esto).
 */
export async function guardarTranscripcion(
  leadId: string,
  entradas: TranscripcionEntry[],
): Promise<void> {
  if (entradas.length === 0) return

  const supabase = getSupabaseServerClient()
  const rows = entradas.map((e) => ({
    lead_id: leadId,
    rol: e.rol,
    mensaje: e.mensaje,
    paso_id: e.pasoId,
  }))

  const { error } = await supabase.from('gina_transcripciones').insert(rows)
  if (error) throw new Error(`Supabase insert gina_transcripciones: ${error.message}`)
}

/** Lee el transcript completo de un lead, en orden cronológico. Usado por la ficha 360°. */
export async function listarTranscripcion(leadId: string): Promise<TranscripcionRow[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('gina_transcripciones')
    .select('id, rol, mensaje, paso_id, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw new Error(`Supabase select gina_transcripciones: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id as number,
    rol: row.rol as TranscripcionEntry['rol'],
    mensaje: row.mensaje as string,
    pasoId: row.paso_id as string,
    createdAt: row.created_at as string,
  }))
}

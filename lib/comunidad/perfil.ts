import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import type { ComunidadPerfil, Actividad } from './types'

export interface UpsertPerfilInput {
  email: string
  nombre: string
  fotoUrl?: string
  lat: number
  lng: number
  disponibilidad: Actividad[]
  contacto?: string
}

/**
 * Upsert silencioso por email (docs/comunidad-de-acogida.md §2, Paso 2): si el usuario ya
 * existe, completa/actualiza solo los campos con valor nuevo y conserva el resto — nunca
 * pisa un campo existente con un valor vacío. Si no existe, lo crea.
 */
export async function upsertPerfilComunidad(input: UpsertPerfilInput): Promise<ComunidadPerfil> {
  const supabase = getSupabaseServerClient()
  const emailLimpio = input.email.trim().toLowerCase()

  const { data: existente, error: errorLectura } = await supabase
    .from('comunidad')
    .select('*')
    .eq('email', emailLimpio)
    .maybeSingle()

  if (errorLectura) throw new Error(`Supabase select: ${errorLectura.message}`)

  const fila = {
    email: emailLimpio,
    nombre: input.nombre,
    foto_url: input.fotoUrl ?? existente?.foto_url ?? null,
    lat: input.lat,
    lng: input.lng,
    disponibilidad: input.disponibilidad.length > 0
      ? input.disponibilidad
      : (existente?.disponibilidad ?? []),
    contacto: input.contacto ?? existente?.contacto ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('comunidad')
    .upsert(fila, { onConflict: 'email' })
    .select()
    .single()

  if (error) throw new Error(`Supabase upsert: ${error.message}`)
  return data as ComunidadPerfil
}

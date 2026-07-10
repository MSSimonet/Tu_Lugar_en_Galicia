export type Actividad = 'cafe_cerveza_mate' | 'caminata' | 'apoyo_emocional'

export const ACTIVIDADES: { id: Actividad; label: string }[] = [
  { id: 'cafe_cerveza_mate', label: 'Café, cerveza o mate' },
  { id: 'caminata', label: 'Caminata por el barrio' },
  { id: 'apoyo_emocional', label: 'Apoyo emocional / escucha' },
]

/** Fila tal como vive en la tabla `comunidad` de Supabase (ver migración 0001). */
export interface ComunidadPerfil {
  email: string
  id: string
  nombre: string
  foto_url: string | null
  lat: number
  lng: number
  disponibilidad: Actividad[]
  contacto: string | null
  updated_at: string
}

/** Lo que devuelve la query pública del mapa — sin email, ver migración 0001. */
export type ComunidadPerfilPublico = Omit<ComunidadPerfil, 'email'>

/** Body que envía el formulario de registro a POST /api/comunidad/registro. */
export interface ComunidadRegistroInput {
  email: string
  nombre: string
  fotoUrl?: string
  calle1: string
  calle2: string
  ciudad: string
  disponibilidad: Actividad[]
  contacto?: string
  rgpd: boolean
}

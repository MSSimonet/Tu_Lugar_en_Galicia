export type Actividad = 'cafe_cerveza_mate' | 'caminata' | 'apoyo_emocional'

export const ACTIVIDADES: { id: Actividad; label: string }[] = [
  { id: 'cafe_cerveza_mate', label: 'Café, cerveza o mate' },
  { id: 'caminata', label: 'Caminata por el barrio' },
  { id: 'apoyo_emocional', label: 'Apoyo emocional / escucha' },
]

/** Fila tal como vive en la tabla `comunidad` de Supabase (ver migraciones 0001 y 0010). */
export interface ComunidadPerfil {
  email: string
  id: string
  nombre: string
  foto_url: string | null
  lat: number
  lng: number
  disponibilidad: Actividad[]
  contacto: string | null
  mostrar_contacto: boolean
  updated_at: string
}

/**
 * Lo que devuelve la query pública del mapa. Excluye dos columnas, por motivos distintos:
 * `email` desde la migración 0002 y `contacto` desde la 0010 (PII-01). En ambos casos la anon
 * key perdió el grant, así que no es solo que el mapa no las pida: pedirlas haría fallar la
 * consulta ENTERA con 42501 y el mapa quedaría sin un solo pin. El teléfono de quien activó
 * `mostrar_contacto` se pide de a uno a /api/comunidad/[id]/contacto, nunca acá.
 */
export type ComunidadPerfilPublico = Omit<ComunidadPerfil, 'email' | 'contacto'>

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

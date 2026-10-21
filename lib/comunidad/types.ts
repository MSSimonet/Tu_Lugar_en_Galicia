export type Actividad = 'cafe_cerveza_mate' | 'caminata' | 'apoyo_emocional'

export const ACTIVIDADES: { id: Actividad; label: string }[] = [
  { id: 'cafe_cerveza_mate', label: 'Café, cerveza o mate' },
  { id: 'caminata', label: 'Caminata por el barrio' },
  { id: 'apoyo_emocional', label: 'Apoyo emocional / escucha' },
]

/** Fila tal como vive en la tabla `comunidad` de Supabase (ver migraciones 0001, 0010 y 0011). */
export interface ComunidadPerfil {
  email: string
  id: string
  nombre: string
  foto_url: string | null
  /** Null desde la migración 0011: el perfil se dio de alta sin intersección y no tiene pin. */
  lat: number | null
  lng: number | null
  disponibilidad: Actividad[]
  contacto: string | null
  mostrar_contacto: boolean
  /** Aprobación manual de la foto (migración 0012). */
  foto_aprobada: boolean
  updated_at: string
}

/**
 * Lo que devuelve la query pública del mapa. Excluye TRES columnas, por motivos distintos:
 * `email` desde la migración 0002, `contacto` desde la 0010 (PII-01) y `foto_url` desde la
 * 0012 (B2). En los tres casos la anon key perdió el grant, así que no es solo que el mapa no
 * las pida: pedirlas haría fallar la consulta ENTERA con 42501 y el mapa quedaría sin un solo
 * pin. El teléfono de quien activó `mostrar_contacto` se pide de a uno a
 * /api/comunidad/[id]/contacto, nunca acá.
 *
 * En lugar de `foto_url` viaja `foto_publica`, la columna generada que solo tiene valor cuando
 * la foto está aprobada.
 */
export type ComunidadPerfilPublico = Omit<
  ComunidadPerfil,
  'email' | 'contacto' | 'foto_url' | 'foto_aprobada'
> & {
  foto_publica: string | null
}

/** Perfil que sí tiene pin. Estrecha lat/lng a `number` para que el mapa no tenga que
 *  comprobarlo en cada uso — el filtro se hace una vez, en `separarPorUbicacion`. */
export type ComunidadPerfilUbicado = ComunidadPerfilPublico & { lat: number; lng: number }

export function tieneUbicacion(perfil: ComunidadPerfilPublico): perfil is ComunidadPerfilUbicado {
  return typeof perfil.lat === 'number' && typeof perfil.lng === 'number'
}

/** Body que envía el formulario de registro a POST /api/comunidad/registro. */
export interface ComunidadRegistroInput {
  email: string
  nombre: string
  fotoUrl?: string
  /** Opcionales desde B1. Van juntas: una intersección con una sola calle no ubica nada. */
  calle1?: string
  calle2?: string
  ciudad: string
  disponibilidad: Actividad[]
  contacto?: string
  /**
   * Opt-in para mostrar el teléfono (PII-01, migración 0010). Viaja desde el formulario,
   * pero NO se aplica al enviarlo: va dentro del pendiente y solo llega a la fila cuando la
   * persona confirma su email (§5.6). Ese es el único motivo por el que este campo puede ser
   * controlado por el cliente sin reabrir el agujero que cerró aquel fix.
   */
  mostrarContacto?: boolean
  rgpd: boolean
}

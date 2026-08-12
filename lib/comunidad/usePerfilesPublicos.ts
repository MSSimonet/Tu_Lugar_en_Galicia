'use client'

import { useEffect, useMemo, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/comunidad/supabaseBrowser'
import { tieneUbicacion, type ComunidadPerfilPublico, type ComunidadPerfilUbicado } from '@/lib/comunidad/types'

export type EstadoPerfiles = 'cargando' | 'listo' | 'error'

export interface PerfilesPublicos {
  estado: EstadoPerfiles
  /** Los que tienen intersección geocodificada: son los pines del mapa. */
  ubicados: ComunidadPerfilUbicado[]
  /** Los que se dieron de alta sin calles (migración 0011): van al listado, no al mapa. */
  sinUbicacion: ComunidadPerfilPublico[]
}

/**
 * Única lectura de la tabla `comunidad` del lado del navegador.
 *
 * Vive acá y no dentro de MapaComunidad porque desde B1 hay dos consumidores de la misma
 * consulta —el mapa y el listado de perfiles sin pin— y duplicar el fetch significaría dos
 * viajes a Supabase por visita para traer exactamente la misma tabla.
 */
export function usePerfilesPublicos(): PerfilesPublicos {
  const [estado, setEstado] = useState<EstadoPerfiles>('cargando')
  const [perfiles, setPerfiles] = useState<ComunidadPerfilPublico[]>([])

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const supabase = getSupabaseBrowserClient()
        const columnas = 'id,nombre,lat,lng,disponibilidad,mostrar_contacto,updated_at'
        // Lista explícita de columnas, y tres ausencias obligatorias: 'email' (clave primaria,
        // desde la migración 0002), 'contacto' (el teléfono, desde la 0010 — PII-01) y
        // 'foto_url' (desde la 0012 — B2, se pide 'foto_publica' en su lugar). La anon key no
        // tiene grant sobre ninguna de las tres: agregar cualquiera acá no devolvería esa
        // columna "de más", haría fallar la consulta ENTERA con 42501 y el mapa quedaría sin un
        // solo pin. Es lo que pasó entre las migraciones 0002 y 0003.
        // 'mostrar_contacto' sí viaja: es un booleano, no un dato personal, y es lo que decide
        // si TarjetaPerfil ofrece el teléfono o el formulario de mensaje privado.
        const { data, error } = await supabase.from('comunidad').select(`${columnas},foto_publica`)

        // Red de seguridad para la ventana entre desplegar este código y correr la migración
        // 0012, que es la que crea `foto_publica`. Sin esto, en esa ventana PostgREST rechaza
        // la consulta ENTERA (no la columna que falta: la consulta) y el mapa queda SIN UN
        // SOLO PIN. Ya pasó dos veces en este proyecto, entre las migraciones 0002 y 0003.
        //
        // El reintento pide todo menos la foto: los pines, los nombres y el botón de mensaje
        // privado siguen funcionando, y las tarjetas muestran las iniciales hasta que la
        // migración corra. Degradar la foto es aceptable; quedarse sin mapa no lo es.
        //
        // 42703 = undefined_column en Postgres. Se comprueba ese código y no el texto del
        // mensaje: cualquier otro error (permisos, red) tiene que seguir siendo un error.
        if (error?.code === '42703') {
          const reintento = await supabase.from('comunidad').select(columnas)
          if (reintento.error) throw new Error(reintento.error.message)
          if (!activo) return
          console.warn('[comunidad] falta la columna foto_publica — ¿está sin correr la migración 0012? El mapa carga sin fotos.')
          setPerfiles(
            (reintento.data ?? []).map((fila) => ({ ...fila, foto_publica: null })) as ComunidadPerfilPublico[],
          )
          setEstado('listo')
          return
        }

        if (error) throw new Error(error.message)
        if (!activo) return
        setPerfiles((data ?? []) as ComunidadPerfilPublico[])
        setEstado('listo')
      } catch (err) {
        console.error(
          '[comunidad] Error cargando perfiles:',
          err instanceof Error ? err.message : 'error desconocido',
        )
        if (activo) setEstado('error')
      }
    }

    cargar()
    return () => {
      activo = false
    }
  }, [])

  // useMemo no es cosmético acá: `ubicados` es una dependencia del efecto que monta Leaflet.
  // Sin memoizar, cada render devolvería un array nuevo, el efecto se dispararía otra vez y
  // el mapa se destruiría y reconstruiría entero — perdiendo el zoom, el paneo y cualquier
  // popup abierto — cada vez que algo de la página cambiara de estado.
  const ubicados = useMemo(() => perfiles.filter(tieneUbicacion), [perfiles])
  const sinUbicacion = useMemo(() => perfiles.filter((perfil) => !tieneUbicacion(perfil)), [perfiles])

  return { estado, ubicados, sinUbicacion }
}

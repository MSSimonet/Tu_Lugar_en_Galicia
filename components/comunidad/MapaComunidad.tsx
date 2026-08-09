'use client'

import { useEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Map as LeafletMap, MarkerClusterGroup, PopupEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { getSupabaseBrowserClient } from '@/lib/comunidad/supabaseBrowser'
import type { ComunidadPerfilPublico } from '@/lib/comunidad/types'
import { TarjetaPerfil } from './TarjetaPerfil'

// Íconos por defecto de Leaflet — copiados a /public/leaflet/ y referenciados como rutas
// estáticas simples (mismo origen, cumple el img-src 'self' de middleware.ts). Se probó
// primero con `import png from 'leaflet/dist/images/...'` + `.src`, pero bajo Turbopack esa
// importación no resuelve a una URL fetcheable (`.src` queda undefined) — Leaflet fallaba en
// runtime con "iconUrl not set in Icon options" y ningún marcador se renderizaba. Copiar los
// archivos a public/ evita depender de cómo Turbopack procese ese import específico.
const MARKER_ICON_2X = '/leaflet/marker-icon-2x.png'
const MARKER_ICON = '/leaflet/marker-icon.png'
const MARKER_SHADOW = '/leaflet/marker-shadow.png'

const GALICIA_CENTER: [number, number] = [42.75, -7.9]
const GALICIA_ZOOM = 9

// Encuadre que cubre el territorio gallego sin llegar a mostrar Portugal ni el resto de
// España — límite duro de paneo/zoom (setMaxBounds), no solo el encuadre inicial.
const GALICIA_BOUNDS: [[number, number], [number, number]] = [
  [41.79, -9.42], // suroeste
  [43.85, -6.68], // noreste
]
const GALICIA_MIN_ZOOM = 8

// Un color por ciudad, elegido para máxima distinción entre sí (5 hues separados en la
// rueda de color) y coherentes en saturación/peso con la paleta Deslumbrante — ninguno
// domina sobre los demás. Cada perfil se asigna a la ciudad más cercana por distancia — la
// tabla `comunidad` no guarda la ciudad, solo lat/lng geocodificados en el alta (ver
// lib/comunidad/nominatim.ts).
const CIUDAD_COLORES: Record<string, string> = {
  'A Coruña': '#C0392B', // rojo teja
  Vigo: '#2E5A8C', // azul petróleo
  Pontevedra: '#E0932E', // dorado — dz-accent
  'Santiago de Compostela': '#6B4A8C', // violeta
  Lugo: '#4A7856', // verde bosque
}

const CIUDAD_CENTROS: { nombre: string; lat: number; lng: number }[] = [
  { nombre: 'A Coruña', lat: 43.3623, lng: -8.4115 },
  { nombre: 'Vigo', lat: 42.2406, lng: -8.7207 },
  { nombre: 'Pontevedra', lat: 42.431, lng: -8.6444 },
  { nombre: 'Santiago de Compostela', lat: 42.8782, lng: -8.5448 },
  { nombre: 'Lugo', lat: 43.0097, lng: -7.5567 },
]

function colorPorCiudadMasCercana(lat: number, lng: number): string {
  let masCercana = CIUDAD_CENTROS[0]
  let distanciaMinima = Infinity
  for (const ciudad of CIUDAD_CENTROS) {
    const distancia = (ciudad.lat - lat) ** 2 + (ciudad.lng - lng) ** 2
    if (distancia < distanciaMinima) {
      distanciaMinima = distancia
      masCercana = ciudad
    }
  }
  return CIUDAD_COLORES[masCercana.nombre]
}

type EstadoMapa = 'cargando' | 'listo' | 'error'

export function MapaComunidad() {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<LeafletMap | null>(null)
  const [estado, setEstado] = useState<EstadoMapa>('cargando')

  useEffect(() => {
    let activo = true
    const raicesPopup: Root[] = []

    async function iniciarMapa() {
      if (!contenedorRef.current) return

      // Leaflet y leaflet.markercluster tocan `window`/`document` en la carga del módulo, así
      // que se importan de forma dinámica acá (solo corre en el navegador, dentro de un
      // efecto) en vez de con un `import` estático arriba del archivo. Esto evita el error de
      // SSR sin depender de next/dynamic con { ssr: false }, que Next.js no permite usar desde
      // Server Components — y app/comunidad/mapa/page.tsx debe seguir siendo uno.
      const L = (await import('leaflet')).default
      await import('leaflet.markercluster')

      if (!activo || !contenedorRef.current) return

      // Fix estándar: los íconos por defecto de Leaflet rompen con bundlers porque sus rutas
      // de imagen relativas no resuelven. Se reapuntan a los assets ya importados arriba.
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: MARKER_ICON_2X,
        iconUrl: MARKER_ICON,
        shadowUrl: MARKER_SHADOW,
      })

      const mapa = L.map(contenedorRef.current, {
        maxBounds: GALICIA_BOUNDS,
        maxBoundsViscosity: 1,
        minZoom: GALICIA_MIN_ZOOM,
      }).setView(GALICIA_CENTER, GALICIA_ZOOM)
      mapa.fitBounds(GALICIA_BOUNDS)
      mapaRef.current = mapa

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
        maxZoom: 19,
        minZoom: GALICIA_MIN_ZOOM,
      }).addTo(mapa)

      // Retoca el chrome del popup de Leaflet (blanco por defecto) con los tokens Pedra e
      // Ouro — no hay stylesheet propio en el carril de este componente, así que se aplica
      // como estilo inline sobre los nodos que Leaflet ya crea al abrir cada popup.
      mapa.on('popupopen', (e: PopupEvent) => {
        const el = e.popup.getElement()
        if (!el) return
        const wrapper = el.querySelector<HTMLElement>('.leaflet-popup-content-wrapper')
        const contenido = el.querySelector<HTMLElement>('.leaflet-popup-content')
        const tip = el.querySelector<HTMLElement>('.leaflet-popup-tip')
        if (wrapper) {
          wrapper.style.backgroundColor = 'var(--dz-luz)'
          wrapper.style.border = '1px solid var(--dz-borde)'
          wrapper.style.borderRadius = '4px'
          wrapper.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)'
        }
        if (contenido) {
          contenido.style.margin = '0'
        }
        if (tip) {
          tip.style.backgroundColor = 'var(--dz-luz)'
        }
      })

      const grupoClusters: MarkerClusterGroup = L.markerClusterGroup()

      try {
        const supabase = getSupabaseBrowserClient()
        // Lista explícita de columnas, y dos ausencias obligatorias: 'email' (clave primaria,
        // desde la migración 0002) y 'contacto' (el teléfono, desde la 0010 — PII-01). La anon
        // key no tiene grant sobre ninguna de las dos: agregar cualquiera acá no devolvería esa
        // columna "de más", haría fallar la consulta ENTERA con 42501 y el mapa quedaría sin un
        // solo pin. Es lo que pasó entre las migraciones 0002 y 0003.
        // 'mostrar_contacto' sí viaja: es un booleano, no un dato personal, y es lo que decide
        // si TarjetaPerfil ofrece el teléfono o el formulario de mensaje privado.
        const { data, error } = await supabase
          .from('comunidad')
          .select('id,nombre,foto_url,lat,lng,disponibilidad,mostrar_contacto,updated_at')

        if (error) throw new Error(error.message)
        const perfiles = (data ?? []) as ComunidadPerfilPublico[]

        perfiles.forEach((perfil) => {
          const color = colorPorCiudadMasCercana(perfil.lat, perfil.lng)
          const icono = L.divIcon({
            className: '',
            html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></span>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, -8],
          })
          // `alt` es opción de Marker (no de Icon) — reemplaza el "Marker" genérico
          // por un nombre accesible real (A3-5).
          const marcador = L.marker([perfil.lat, perfil.lng], {
            icon: icono,
            alt: perfil.nombre ? `Familia ${perfil.nombre} en el mapa` : 'Familia en el mapa de comunidad',
          })
          const contenedorPopup = document.createElement('div')
          const raiz = createRoot(contenedorPopup)
          raicesPopup.push(raiz)
          raiz.render(<TarjetaPerfil perfil={perfil} />)
          marcador.bindPopup(contenedorPopup, { minWidth: 260, maxWidth: 300 })
          grupoClusters.addLayer(marcador)
        })

        mapa.addLayer(grupoClusters)
        if (!activo) return
        setEstado('listo')
      } catch (err) {
        console.error('[MapaComunidad] Error cargando perfiles:', err instanceof Error ? err.message : 'error desconocido')
        if (activo) setEstado('error')
      }
    }

    iniciarMapa()

    return () => {
      activo = false
      // Desmontar en el próximo tick evita el warning de React por desmontar una raíz
      // mientras otra (la de este mismo mapa) todavía está en su propio commit de limpieza.
      raicesPopup.forEach((raiz) => {
        setTimeout(() => raiz.unmount(), 0)
      })
      mapaRef.current?.remove()
      mapaRef.current = null
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      <div
        ref={contenedorRef}
        className="h-full w-full"
        style={{ backgroundColor: 'var(--dz-papel)' }}
        aria-label="Mapa de familias en Galicia"
      />

      {estado === 'cargando' && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'var(--dz-papel)' }}
        >
          <p style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-sm)', color: 'var(--dz-muted)' }}>
            Cargando el mapa de la comunidad…
          </p>
        </div>
      )}

      {estado === 'error' && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <p
            role="alert"
            className="pointer-events-auto px-4 py-3"
            style={{
              fontFamily: 'var(--font-dz-ui)',
              fontSize: 'var(--text-sm)',
              color: 'var(--dz-ink)',
              backgroundColor: 'var(--dz-luz)',
              border: '1px solid var(--dz-borde)',
              borderRadius: '4px',
            }}
          >
            No pudimos cargar el mapa de la comunidad. Recarga la página para intentar de nuevo.
          </p>
        </div>
      )}
    </div>
  )
}

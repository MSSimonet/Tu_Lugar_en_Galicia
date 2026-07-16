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

      const mapa = L.map(contenedorRef.current).setView(GALICIA_CENTER, GALICIA_ZOOM)
      mapaRef.current = mapa

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
        maxZoom: 19,
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
          wrapper.style.backgroundColor = 'var(--po-luz)'
          wrapper.style.border = '1px solid var(--po-borde)'
          wrapper.style.borderRadius = '4px'
          wrapper.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)'
        }
        if (contenido) {
          contenido.style.margin = '0'
        }
        if (tip) {
          tip.style.backgroundColor = 'var(--po-luz)'
        }
      })

      const grupoClusters: MarkerClusterGroup = L.markerClusterGroup()

      try {
        const supabase = getSupabaseBrowserClient()
        // Lista explícita de columnas — nunca 'email' (clave primaria de la tabla). El mapa
        // público no debe recibir ni exponer el email de nadie (docs/comunidad-de-acogida.md §4).
        const { data, error } = await supabase
          .from('comunidad')
          .select('id,nombre,foto_url,lat,lng,disponibilidad,contacto,updated_at')

        if (error) throw new Error(error.message)
        const perfiles = (data ?? []) as ComunidadPerfilPublico[]

        perfiles.forEach((perfil) => {
          // `alt` es opción de Marker (no de Icon) — reemplaza el "Marker" genérico
          // por un nombre accesible real (A3-5).
          const marcador = L.marker([perfil.lat, perfil.lng], {
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
        style={{ backgroundColor: 'var(--po-areia)' }}
        aria-label="Mapa de familias en Galicia"
      />

      {estado === 'cargando' && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'var(--po-areia)' }}
        >
          <p style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-sm)', color: 'var(--po-muted)' }}>
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
              fontFamily: 'var(--font-lato)',
              fontSize: 'var(--text-sm)',
              color: 'var(--po-pedra)',
              backgroundColor: 'var(--po-luz)',
              border: '1px solid var(--po-borde)',
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

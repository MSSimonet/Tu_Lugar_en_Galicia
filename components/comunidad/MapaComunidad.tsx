'use client'

import { useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Map as LeafletMap, MarkerClusterGroup, PopupEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { ComunidadPerfilUbicado } from '@/lib/comunidad/types'
import type { EstadoPerfiles } from '@/lib/comunidad/usePerfilesPublicos'
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

// Pin de gota con la bolita interior coloreada. Reemplaza al círculo plano de 16px que había
// antes y a los íconos por defecto de Leaflet.
//
// Es SVG dibujado acá y NO el PNG `pin point rojo.png` con un `filter: hue-rotate()` encima,
// que era el otro camino posible. Tres motivos, en orden de peso:
//   1. `hue-rotate` gira el tono de la imagen ENTERA — el borde blanco y la sombra se tiñen
//      con la bolita, así que el pin deja de ser el mismo dibujo en cada ciudad.
//   2. El ángulo de giro no es el color: para llegar a un verde bosque desde un rojo teja hay
//      que buscar el grado a ojo, y el resultado no coincide con el hex de CIUDAD_COLORES.
//      Los cinco colores dejarían de ser los cinco colores declarados arriba.
//   3. Un `<svg>` inline pesa ~400 bytes y no suma una petición de red por pin.
const PIN_ANCHO = 22
const PIN_ALTO = 30

function pinSvg(color: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_ANCHO}" height="${PIN_ALTO}" viewBox="0 0 22 30" aria-hidden="true">`,
    // Cuerpo: gota con la punta abajo. El relleno es oscuro y fijo en las cinco ciudades —
    // lo que identifica a la ciudad es la bolita, igual que en el pin de referencia.
    '<path d="M11 29.2C11 29.2 20.4 17.9 20.4 11.3 20.4 5.6 16.2 1 11 1S1.6 5.6 1.6 11.3C1.6 17.9 11 29.2 11 29.2Z"',
    ' fill="#241F17" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/>',
    `<circle cx="11" cy="11" r="4.6" fill="${color}"/>`,
    '</svg>',
  ].join('')
}

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

export interface MapaComunidadProps {
  /** Solo perfiles con pin. El filtro y la consulta viven en `usePerfilesPublicos`. */
  perfiles: ComunidadPerfilUbicado[]
  estado: EstadoPerfiles
}

export function MapaComunidad({ perfiles, estado }: MapaComunidadProps) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    // Se espera a tener los perfiles antes de montar Leaflet: montarlo vacío y volver a
    // montarlo al llegar los datos significaría construir y destruir el mapa dos veces en
    // cada visita, con su parpadeo correspondiente.
    if (estado !== 'listo') return

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

      perfiles.forEach((perfil) => {
        const icono = L.divIcon({
          className: '',
          html: pinSvg(colorPorCiudadMasCercana(perfil.lat, perfil.lng)),
          iconSize: [PIN_ANCHO, PIN_ALTO],
          // La punta del pin es la que apunta a la coordenada, no su centro: el ancla va al
          // pie (mitad del ancho, alto completo). Con el ancla al centro el pin señalaría
          // ~14px más al norte de donde está la persona.
          iconAnchor: [PIN_ANCHO / 2, PIN_ALTO],
          popupAnchor: [0, -PIN_ALTO],
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
  }, [perfiles, estado])

  return (
    <div className="relative h-full w-full">
      <div
        ref={contenedorRef}
        className="h-full w-full"
        style={{
          backgroundColor: 'var(--dz-papel)',
          // `isolation: isolate` crea un contexto de apilamiento y encierra ahí dentro TODOS
          // los z-index internos de Leaflet. Sin esto, el mapa tapa el header al hacer scroll.
          //
          // El motivo, medido (2026-08-09): el CSS de Leaflet asigna 200-700 a los panes y
          // 1000 a los controles (.leaflet-top/.leaflet-bottom), y el header sticky vale 50.
          // El contenedor del mapa es `position: relative` con `z-index: auto`, que NO crea
          // contexto de apilamiento, y ningún ancestro lo creaba tampoco — se comprobó la
          // cadena entera hasta <main>. Así que esos 1000 competían contra el 50 del header
          // en el contexto raíz, y ganaban.
          //
          // Se ve sobre todo en móvil: ahí el mapa ocupa todo el ancho y su borde izquierdo
          // —donde vive el control de zoom— queda justo debajo del header. En escritorio el
          // mapa es de 720px centrado y el control cae más adentro, así que pasa desapercibido.
          //
          // `isolation` en vez de `z-index: 0`: dice la intención ("los z-index de este
          // subárbol son asunto suyo") y no agrega un número que alguien tenga que mantener
          // sincronizado con el del header.
          isolation: 'isolate',
        }}
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

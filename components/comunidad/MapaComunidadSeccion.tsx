'use client'

import { MapaComunidad } from './MapaComunidad'
import { TarjetaPerfil } from './TarjetaPerfil'
import { usePerfilesPublicos } from '@/lib/comunidad/usePerfilesPublicos'

/**
 * Mapa + listado de perfiles sin pin.
 *
 * Existe como componente propio porque `app/comunidad/mapa/page.tsx` es un Server Component y
 * las dos piezas comparten una consulta que solo se puede hacer en el navegador (la anon key
 * de Supabase y la política RLS de lectura pública, ver migración 0001).
 */
export function MapaComunidadSeccion() {
  const { estado, ubicados, sinUbicacion } = usePerfilesPublicos()

  return (
    <section style={{ backgroundColor: 'var(--dz-papel)' }}>
      <div
        style={{
          // 3cm exactos en desktop; en mobile el margen fijo dejaba el mapa en
          // 148px de ancho (auditoría 2026-07-19, A1.2) — se escala con el viewport.
          padding: 'clamp(16px, 4vw, 3cm)',
          boxSizing: 'border-box',
        }}
      >
        {/* Mapa — contenedor rectangular 16:9 y centrado. Era cuadrado (720×720): el 1:1
            desperdiciaba ancho justo en el eje donde Galicia no lo necesita —el territorio es
            más alto que ancho, así que el encuadre de GALICIA_BOUNDS dejaba franjas de océano
            y de Castilla a los costados— y a la vez obligaba a un alto que empujaba el resto
            de la página fuera de pantalla. En 16:9 el mapa gana ancho útil y pierde alto
            muerto. */}
        <div className="flex justify-center">
          <div
            style={{
              width: '100%',
              // Sube de 720 a 1100 junto con el cambio de proporción: a 720px de ancho el 16:9
              // daba 405px de alto y el mapa quedaba más chico que antes en las dos
              // dimensiones a la vez.
              maxWidth: 'min(1100px, 100%)',
              aspectRatio: '16 / 9',
              // Piso para móvil: a 375px de viewport el contenedor mide ~343px de ancho, y
              // 16:9 lo dejaría en 193px de alto — una banda donde no entran ni los clusters
              // ni el popup de un perfil.
              minHeight: '320px',
            }}
          >
            <MapaComunidad perfiles={ubicados} estado={estado} />
          </div>
        </div>

        {/* Perfiles sin pin (B1). Quien se registró sin indicar una intersección no aparece en
            el mapa —no se le inventa una ubicación— pero sigue siendo parte de la comunidad y
            se puede contactar exactamente igual: es la misma TarjetaPerfil del popup. */}
        {estado === 'listo' && sinUbicacion.length > 0 && (
          <div className="mx-auto mt-[var(--dz-section-y)]" style={{ maxWidth: 'min(1100px, 100%)' }}>
            <h2
              style={{
                fontFamily: 'var(--font-dz-display)',
                fontWeight: 'var(--dz-weight-h2)',
                fontSize: 'var(--dz-text-h2)',
                lineHeight: 'var(--dz-leading-h2)',
                color: 'var(--dz-ink)',
                margin: 0,
              }}
            >
              También están por aquí
            </h2>
            <p
              className="mt-[var(--space-2)] leading-[var(--leading-cuerpo)] max-w-[68ch]"
              style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-sm)', color: 'var(--dz-muted)' }}
            >
              Prefirieron no marcar su zona en el mapa. Puedes escribirles igual.
            </p>
            <ul
              className="mt-[var(--space-6)] grid list-none gap-[var(--space-4)] p-0"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
            >
              {sinUbicacion.map((perfil) => (
                <li
                  key={perfil.id}
                  style={{
                    backgroundColor: 'var(--dz-luz)',
                    border: '1px solid var(--dz-borde)',
                    borderRadius: 'var(--dz-radius-card)',
                  }}
                >
                  <TarjetaPerfil perfil={perfil} enListado />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

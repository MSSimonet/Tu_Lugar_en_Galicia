import type { Metadata } from 'next'
import { MapaComunidad } from '@/components/comunidad/MapaComunidad'
import { ComunidadMapaHero } from '@/components/comunidad/ComunidadMapaHero'

export const metadata: Metadata = {
  title: 'Formando comunidad',
  description:
    'Encuentra a otras familias y vecinos en Galicia dispuestos a tomar un café, salir a caminar o simplemente escucharte. Mira quién está cerca de ti.',
}

export default function ComunidadMapaPage() {
  return (
    <>
      <ComunidadMapaHero />

      {/* Mapa — contenedor cuadrado y centrado, con margen de 3cm hacia el resto de la sección */}
      <section style={{ backgroundColor: 'var(--dz-papel)' }}>
        <div
          style={{
            // 3cm exactos en desktop; en mobile el margen fijo dejaba el mapa en
            // 148px de ancho (auditoría 2026-07-19, A1.2) — se escala con el viewport.
            padding: 'clamp(16px, 4vw, 3cm)',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: 'min(720px, 100%)', aspectRatio: '1 / 1' }}>
            <MapaComunidad />
          </div>
        </div>
      </section>
    </>
  )
}

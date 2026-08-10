import { getNextMetadata } from '@/lib/seo/metadata'
import { MapaComunidad } from '@/components/comunidad/MapaComunidad'
import { ComunidadMapaHero } from '@/components/comunidad/ComunidadMapaHero'

// El título ("Encuentra a tu gente en Galicia", distinto del de /comunidad por la auditoría
// 2026-07-25 I8) vive ahora en PAGE_METADATA como `comunidadMapa`, con el razonamiento anotado
// ahí para que no se unifique por parecer duplicado.
export const metadata = getNextMetadata('comunidadMapa')

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

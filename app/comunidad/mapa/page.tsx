import { getNextMetadata } from '@/lib/seo/metadata'
import { MapaComunidadSeccion } from '@/components/comunidad/MapaComunidadSeccion'
import { ComunidadMapaHero } from '@/components/comunidad/ComunidadMapaHero'

// El título ("Encuentra a tu gente en Galicia", distinto del de /comunidad por la auditoría
// 2026-07-25 I8) vive ahora en PAGE_METADATA como `comunidadMapa`, con el razonamiento anotado
// ahí para que no se unifique por parecer duplicado.
export const metadata = getNextMetadata('comunidadMapa')

export default function ComunidadMapaPage() {
  return (
    <>
      <ComunidadMapaHero />
      <MapaComunidadSeccion />
    </>
  )
}

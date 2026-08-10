import { getNextMetadata } from '@/lib/seo/metadata'
import { ComunidadContenido } from '@/components/comunidad/ComunidadContenido'

export const metadata = getNextMetadata('comunidad')

export default function ComunidadPage() {
  return <ComunidadContenido />
}

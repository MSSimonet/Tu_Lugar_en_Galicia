import { getNextMetadata } from '@/lib/seo/metadata'
import { SobreSilvanaContenido } from '@/components/sobre-silvana/SobreSilvanaContenido'

export const metadata = getNextMetadata('sobreSilvana')

// TODO: reemplazar imagen placeholder con foto real de Silvana

export default function SobreSilvanaPage() {
  return <SobreSilvanaContenido />
}

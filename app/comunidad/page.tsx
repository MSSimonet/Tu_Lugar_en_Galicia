import type { Metadata } from 'next'
import { ComunidadContenido } from '@/components/comunidad/ComunidadContenido'

export const metadata: Metadata = {
  title: 'Formando comunidad',
  description:
    'Únete a la comunidad de Galicia: ofrece un café, una caminata o simplemente escuchar a quien acaba de llegar.',
}

export default function ComunidadPage() {
  return <ComunidadContenido />
}

import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/config/site'
import { ComunidadContenido } from '@/components/comunidad/ComunidadContenido'

export const metadata: Metadata = {
  title: 'Formando comunidad',
  description:
    'Únete a la comunidad de Galicia: ofrece un café, una caminata o simplemente escuchar a quien acaba de llegar.',
  alternates: { canonical: `${SITE_URL}/comunidad` },
}

export default function ComunidadPage() {
  return <ComunidadContenido />
}

import type { Metadata } from 'next'
import { getNextMetadata } from '@/lib/seo/metadata'
import { ConocernosContenido } from '@/components/conocernos/ConocernosContenido'

export const metadata: Metadata = getNextMetadata('conocernos')

export default function ConocernosPage() {
  return <ConocernosContenido />
}

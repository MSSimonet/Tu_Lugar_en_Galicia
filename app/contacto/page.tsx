import { getNextMetadata } from '@/lib/seo/metadata'
import { ContactoContenido } from '@/components/contacto/ContactoContenido'

export const metadata = getNextMetadata('contacto')

export default function ContactoPage() {
  return <ContactoContenido />
}

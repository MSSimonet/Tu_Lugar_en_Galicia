import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/config/site'
import { ContactoContenido } from '@/components/contacto/ContactoContenido'

export const metadata: Metadata = {
  title: 'Contáctanos',
  description: 'Escríbenos directamente. Te respondemos en 24 horas hábiles.',
  alternates: { canonical: `${SITE_URL}/contacto` },
}

export default function ContactoPage() {
  return <ContactoContenido />
}

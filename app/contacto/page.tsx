import type { Metadata } from 'next'
import { ContactoContenido } from '@/components/contacto/ContactoContenido'

export const metadata: Metadata = {
  title: 'Contáctanos',
  description: 'Escríbenos directamente. Te respondemos en 24 horas hábiles.',
}

export default function ContactoPage() {
  return <ContactoContenido />
}

import type { Metadata } from 'next'
import { FormularioContacto } from '@/components/contacto/FormularioContacto'

export const metadata: Metadata = {
  title: 'Contáctanos | Tu Lugar en Galicia',
  description: 'Escríbenos directamente. Te respondemos en 24 horas hábiles.',
}

export default function ContactoPage() {
  return (
    <>
      {/* Hero — bookend fijo oscuro (Pedra e Ouro) */}
      <section
        className="px-6"
        style={{ backgroundColor: 'var(--po-hero-bg)', paddingTop: 'calc(64px + 60px)', paddingBottom: '3rem' }}
      >
        <div className="mx-auto max-w-2xl">
          <p
            className="mb-2 [font-size:var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-ouro)' }}
          >
            Hablemos
          </p>
          <h1
            className="leading-[var(--leading-titulo)]"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--po-hero-text)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            ¿Tienes alguna pregunta?
          </h1>
          <p
            className="mt-4 leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-md)', color: 'var(--po-hero-muted)' }}
          >
            Cuéntanos tu situación. Te respondemos en las próximas 24 horas hábiles.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-16 px-6" style={{ backgroundColor: 'var(--po-luz)' }}>
        <div className="mx-auto max-w-2xl">
          <FormularioContacto />
        </div>
      </section>
    </>
  )
}

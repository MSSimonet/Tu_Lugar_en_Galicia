import type { Metadata } from 'next'
import { FormularioContacto } from '@/components/contacto/FormularioContacto'

export const metadata: Metadata = {
  title: 'Contáctanos | Tu Lugar en Galicia',
  description: 'Escríbenos directamente. Te respondemos en 24 horas hábiles.',
}

export default function ContactoPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="bg-[var(--color-granito)] px-6"
        style={{ paddingTop: 'calc(64px + 60px)', paddingBottom: '3rem' }}
      >
        <div className="mx-auto max-w-2xl">
          <p
            className="mb-2 font-[family-name:var(--font-ui)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
            style={{ color: 'var(--color-laton-claro)' }}
          >
            Hablemos
          </p>
          <h1
            className="font-[family-name:var(--font-titular)] leading-[var(--leading-titulo)] text-[var(--color-niebla)]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            ¿Tienes alguna pregunta?
          </h1>
          <p
            className="mt-4 font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)]"
            style={{ fontSize: 'var(--text-md)', color: 'var(--color-laton-claro)' }}
          >
            Cuéntanos tu situación. Te respondemos en las próximas 24 horas hábiles.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="bg-[var(--color-niebla)] py-16 px-6">
        <div className="mx-auto max-w-2xl">
          <FormularioContacto />
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import { FormularioComunidad } from '@/components/comunidad/FormularioComunidad'

export const metadata: Metadata = {
  title: 'Comunidad de Acogida | Tu Lugar en Galicia',
  description:
    'Únete a la comunidad de acogida de Galicia: ofrece un café, una caminata o simplemente escuchar a quien acaba de llegar.',
}

export default function ComunidadPage() {
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
            Comunidad de acogida
          </p>
          <h1
            className="leading-[var(--leading-titulo)]"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--po-hero-text)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            Sé la primera cara amiga en Galicia
          </h1>
          <p
            className="mt-4 leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-md)', color: 'var(--po-hero-muted)' }}
          >
            Regístrate en el mapa de la comunidad y ofrece un café, una caminata o simplemente
            escuchar a quien acaba de llegar. Tu ubicación nunca se muestra con exactitud — solo
            una zona aproximada de tu barrio.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-16 px-6" style={{ backgroundColor: 'var(--po-luz)' }}>
        <div className="mx-auto max-w-2xl">
          <FormularioComunidad />
        </div>
      </section>
    </>
  )
}

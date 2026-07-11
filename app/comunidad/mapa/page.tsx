import type { Metadata } from 'next'
import { MapaComunidad } from '@/components/comunidad/MapaComunidad'

export const metadata: Metadata = {
  title: 'Comunidad de Acogida',
  description:
    'Encuentra a otras familias y vecinos en Galicia dispuestos a tomar un café, salir a caminar o simplemente escucharte. Mira quién está cerca de ti.',
}

export default function ComunidadMapaPage() {
  return (
    <>
      {/* Hero — bookend fijo oscuro (Pedra e Ouro), mismo patrón que /faq y /agenda */}
      <section style={{ backgroundColor: 'var(--po-hero-bg)', padding: '48px 80px 32px' }}>
        <div className="mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}
          >
            <span style={{ display: 'block', width: '32px', height: '1px', backgroundColor: 'var(--po-ouro)' }} />
            <span
              style={{
                fontFamily: 'var(--font-lato)',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--po-ouro)',
              }}
            >
              Comunidad de Acogida
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(32px, 4.5vw, 56px)',
              fontWeight: 900,
              color: 'var(--po-hero-text)',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            Encuentra a tu gente en Galicia
          </h1>
          <p
            className="mt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-md)', color: 'var(--po-hero-muted)' }}
          >
            Café, una caminata o alguien que escuche — mira quién está cerca y con qué te puede acompañar.
          </p>
        </div>
      </section>

      {/* Mapa — ocupa el resto del alto visible debajo del hero */}
      <section style={{ backgroundColor: 'var(--po-areia)' }}>
        <div style={{ height: 'calc(100dvh - 220px)', minHeight: '480px' }}>
          <MapaComunidad />
        </div>
      </section>
    </>
  )
}

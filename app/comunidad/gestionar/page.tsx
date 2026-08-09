import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { SolicitarGestion } from '@/components/comunidad/SolicitarGestion'

export const metadata: Metadata = {
  title: 'Gestiona tu perfil del mapa',
  description: 'Cambia la visibilidad de tu teléfono o date de baja del mapa de Formando comunidad.',
  // Página de servicio para quien ya está registrado, no de captación: no aporta nada en
  // resultados de búsqueda y prefiere no aparecer. Tampoco entra en app/sitemap.ts.
  robots: { index: false, follow: false },
}

export default function GestionarPage() {
  return (
    <section
      style={{
        backgroundColor: 'var(--dz-papel)',
        paddingTop: 'var(--dz-section-y)',
        paddingBottom: 'var(--dz-section-y)',
        paddingLeft: 'var(--space-6)',
        paddingRight: 'var(--space-6)',
      }}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-[var(--space-5)]">
          <Eyebrow>Formando comunidad</Eyebrow>
        </div>

        <h1
          className="mb-[var(--space-4)]"
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontSize: 'var(--dz-text-h1)',
            fontWeight: 'var(--dz-weight-h1)',
            color: 'var(--dz-ink)',
            lineHeight: 'var(--dz-leading-h1)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          Gestiona tu perfil
        </h1>

        <p
          className="mb-[var(--space-8)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-md)', color: 'var(--dz-ink)' }}
        >
          Muestra u oculta tu teléfono, o date de baja del mapa. Te enviamos un enlace a tu
          correo para comprobar que el perfil es tuyo.
        </p>

        <SolicitarGestion />
      </div>
    </section>
  )
}

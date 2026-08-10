import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ConfirmarMensaje } from '@/components/comunidad/ConfirmarMensaje'

export const metadata: Metadata = {
  title: 'Confirma tu mensaje',
  description: 'Confirma tu correo para que tu mensaje llegue a su destinatario.',
  // URL de un solo uso con un token firmado: nada que indexar. Fuera de app/sitemap.ts.
  robots: { index: false, follow: false },
}

export default async function ConfirmarMensajePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>
}) {
  const { id, token } = await searchParams

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
          className="mb-[var(--space-6)]"
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
          Confirma tu mensaje
        </h1>

        <ConfirmarMensaje id={id} token={token} />
      </div>
    </section>
  )
}

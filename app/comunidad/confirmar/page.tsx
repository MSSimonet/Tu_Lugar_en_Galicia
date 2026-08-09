import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ConfirmarRegistro } from '@/components/comunidad/ConfirmarRegistro'

export const metadata: Metadata = {
  title: 'Confirma tu registro',
  description: 'Confirma tu correo para aparecer en el mapa de Formando comunidad.',
  // URL de un solo uso, con un token firmado en la query: no tiene nada que indexar y no
  // debe salir en resultados de búsqueda. Por lo mismo queda fuera de app/sitemap.ts.
  robots: { index: false, follow: false },
}

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>
}) {
  // Se leen en el servidor y se pasan como props: así el componente cliente no necesita
  // useSearchParams() ni, por lo tanto, un límite de Suspense alrededor.
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
          Confirma tu registro
        </h1>

        <ConfirmarRegistro id={id} token={token} />
      </div>
    </section>
  )
}

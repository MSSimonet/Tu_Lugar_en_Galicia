import type { Metadata } from 'next'
import { LegalHero } from '@/components/legal/LegalHero'
import { LegalSection } from '@/components/legal/LegalSection'

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Política de cookies de Tu Lugar en Galicia, agencia de relocation especializada en Galicia.',
}

export default function PoliticaDeCookiesPage() {
  return (
    <>
      <LegalHero titulo="Política de Cookies" />

      <article className="mx-auto max-w-3xl px-[var(--space-6)] py-[var(--space-16)]" style={{ backgroundColor: 'var(--dz-luz)' }}>
        <div
          className="flex flex-col gap-[var(--space-10)] [font-size:var(--text-sm)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
        >

          <LegalSection ariaLabelledby="construccion">
            <div className="p-[var(--space-8)]" style={{ borderRadius: 'var(--dz-radius-card)', border: '1px solid var(--dz-borde)', backgroundColor: 'var(--dz-papel)' }}>
              <h2
                id="construccion"
                className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
                style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-accent-text)' }}
              >
                Página en construcción
              </h2>
              <p className="mb-[var(--space-4)]">
                Estamos preparando el contenido completo de nuestra política de cookies. Si tienes alguna
                pregunta sobre cómo usamos las cookies en este sitio, ponte en contacto con nosotros.
              </p>
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="font-medium underline underline-offset-2"
                style={{ color: 'var(--dz-accent-text)' }}
              >
                hola@tulugarengalicia.com
              </a>
            </div>
          </LegalSection>

          <LegalSection ariaLabelledby="que-son">
            <h2
              id="que-son"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-accent-text)' }}
            >
              ¿Qué son las cookies?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu navegador para
              recordar preferencias y mejorar tu experiencia de navegación.
            </p>
          </LegalSection>

          <LegalSection ariaLabelledby="contacto">
            <h2
              id="contacto"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-accent-text)' }}
            >
              Contacto
            </h2>
            <p>
              Para cualquier consulta sobre esta política, escríbenos a{' '}
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="underline underline-offset-2"
                style={{ color: 'var(--dz-accent-text)' }}
              >
                hola@tulugarengalicia.com
              </a>
              .
            </p>
          </LegalSection>

        </div>
      </article>
    </>
  )
}

import type { Metadata } from 'next'
import { LegalHero } from '@/components/legal/LegalHero'
import { LegalSection } from '@/components/legal/LegalSection'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal de Tu Lugar en Galicia, agencia de relocation especializada en Galicia.',
}

export default function AvisoLegalPage() {
  return (
    <>
      <LegalHero titulo="Aviso Legal" />

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
                Estamos preparando el contenido completo de este aviso legal. Si tienes alguna pregunta
                sobre el uso de este sitio web o necesitas información legal, ponte en contacto con nosotros.
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

          <LegalSection ariaLabelledby="titular">
            <h2
              id="titular"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-accent-text)' }}
            >
              Titular del sitio web
            </h2>
            <p>
              <strong>Tu Lugar en Galicia</strong> es un servicio de relocation especializado en Galicia,
              gestionado por Silvana Lorenzo.
            </p>
            <p className="mt-[var(--space-3)]">
              Contacto:{' '}
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="underline underline-offset-2"
                style={{ color: 'var(--dz-accent-text)' }}
              >
                hola@tulugarengalicia.com
              </a>
            </p>
          </LegalSection>

        </div>
      </article>
    </>
  )
}

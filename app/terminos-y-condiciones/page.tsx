import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/config/site'
import { LegalHero } from '@/components/legal/LegalHero'
import { LegalSection } from '@/components/legal/LegalSection'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones del servicio de Tu Lugar en Galicia, agencia de relocation especializada en Galicia.',
  alternates: { canonical: `${SITE_URL}/terminos-y-condiciones` },
}

export default function TerminosYCondicionesPage() {
  return (
    <>
      <LegalHero titulo="Términos y Condiciones" />

      <article className="mx-auto max-w-3xl px-[var(--space-6)] py-[var(--space-16)]" style={{ backgroundColor: 'var(--dz-luz)' }}>
        <div
          className="flex flex-col gap-[var(--space-12)] [font-size:var(--text-sm)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
        >

          <LegalSection ariaLabelledby="construccion">
            <div className="p-[var(--space-8)]" style={{ borderRadius: 'var(--dz-radius-card)', border: '1px solid var(--dz-borde)', backgroundColor: 'var(--dz-papel)' }}>
              <h2
                id="construccion"
                className="mb-[var(--space-4)]"
                style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h2)', color: 'var(--dz-accent-text)', fontSize: 'var(--dz-text-h2)', lineHeight: 'var(--dz-leading-h2)' }}
              >
                Página en construcción
              </h2>
              <p className="mb-[var(--space-4)]">
                Estamos preparando el contenido completo de los términos y condiciones del servicio. Si tienes
                alguna pregunta sobre el servicio o su contratación, ponte en contacto con nosotros.
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

          <LegalSection ariaLabelledby="servicio">
            <h2
              id="servicio"
              className="mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h2)', color: 'var(--dz-accent-text)', fontSize: 'var(--dz-text-h2)', lineHeight: 'var(--dz-leading-h2)' }}
            >
              Sobre el servicio
            </h2>
            <p>
              <strong>Tu Lugar en Galicia</strong> ofrece un servicio de relocation para familias que desean
              establecerse en Galicia, ayudándoles a encontrar vivienda y facilitando su proceso de llegada.
            </p>
          </LegalSection>

          <LegalSection ariaLabelledby="contacto">
            <h2
              id="contacto"
              className="mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h2)', color: 'var(--dz-accent-text)', fontSize: 'var(--dz-text-h2)', lineHeight: 'var(--dz-leading-h2)' }}
            >
              Contacto
            </h2>
            <p>
              Para cualquier consulta sobre estos términos, escríbenos a{' '}
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

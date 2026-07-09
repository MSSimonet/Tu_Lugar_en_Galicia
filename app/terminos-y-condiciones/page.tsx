import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Tu Lugar en Galicia',
  description: 'Términos y condiciones del servicio de Tu Lugar en Galicia, agencia de relocation especializada en Galicia.',
}

export default function TerminosYCondicionesPage() {
  return (
    <>
      <section
        className="pb-[var(--space-16)] px-[var(--space-6)]"
        style={{ backgroundColor: 'var(--po-hero-bg)', paddingTop: 'calc(64px + 60px)' }}
      >
        <div className="mx-auto max-w-3xl">
          <h1
            className="[font-size:var(--text-2xl)] leading-[var(--leading-titulo)] md:[font-size:var(--text-3xl)]"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--po-hero-text)' }}
          >
            Términos y Condiciones
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-[var(--space-6)] py-[var(--space-16)]" style={{ backgroundColor: 'var(--po-luz)' }}>
        <div
          className="flex flex-col gap-[var(--space-10)] [font-size:var(--text-sm)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}
        >

          <section aria-labelledby="construccion">
            <div className="p-[var(--space-8)]" style={{ borderRadius: '4px', border: '1px solid var(--po-borde)', backgroundColor: 'var(--po-areia)' }}>
              <h2
                id="construccion"
                className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
                style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
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
                style={{ color: 'var(--po-ouro-text)' }}
              >
                hola@tulugarengalicia.com
              </a>
            </div>
          </section>

          <section aria-labelledby="servicio">
            <h2
              id="servicio"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
            >
              Sobre el servicio
            </h2>
            <p>
              <strong>Tu Lugar en Galicia</strong> ofrece un servicio de relocation para familias que desean
              establecerse en Galicia, ayudándoles a encontrar vivienda y facilitando su proceso de llegada.
            </p>
          </section>

          <section aria-labelledby="contacto">
            <h2
              id="contacto"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
            >
              Contacto
            </h2>
            <p>
              Para cualquier consulta sobre estos términos, escríbenos a{' '}
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="underline underline-offset-2"
                style={{ color: 'var(--po-ouro-text)' }}
              >
                hola@tulugarengalicia.com
              </a>
              .
            </p>
          </section>

        </div>
      </article>
    </>
  )
}

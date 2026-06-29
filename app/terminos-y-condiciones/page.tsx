import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Tu Lugar en Galicia',
  description: 'Términos y condiciones del servicio de Tu Lugar en Galicia, agencia de relocation especializada en Galicia.',
}

export default function TerminosYCondicionesPage() {
  return (
    <>
      <section
        className="bg-[var(--color-granito)] pb-[var(--space-16)] px-[var(--space-6)]"
        style={{ paddingTop: 'calc(64px + 60px)' }}
      >
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-titular)] [font-size:var(--text-2xl)] leading-[var(--leading-titulo)] [color:var(--color-niebla)] md:[font-size:var(--text-3xl)]">
            Términos y Condiciones
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-[var(--space-6)] py-[var(--space-16)]">
        <div className="flex flex-col gap-[var(--space-10)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-granito)] leading-[var(--leading-cuerpo)]">

          <section aria-labelledby="construccion">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-arena)] bg-[var(--color-niebla)] p-[var(--space-8)]">
              <h2
                id="construccion"
                className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              >
                Página en construcción
              </h2>
              <p className="mb-[var(--space-4)]">
                Estamos preparando el contenido completo de los términos y condiciones del servicio. Si tienes
                alguna pregunta sobre el servicio o su contratación, ponte en contacto con nosotros.
              </p>
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="font-medium text-[var(--color-laton)] underline underline-offset-2 hover:text-[var(--color-laton-oscuro)]"
              >
                hola@tulugarengalicia.com
              </a>
            </div>
          </section>

          <section aria-labelledby="servicio">
            <h2
              id="servicio"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
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
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              Contacto
            </h2>
            <p>
              Para cualquier consulta sobre estos términos, escríbenos a{' '}
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="text-[var(--color-laton)] underline underline-offset-2 hover:text-[var(--color-laton-oscuro)]"
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

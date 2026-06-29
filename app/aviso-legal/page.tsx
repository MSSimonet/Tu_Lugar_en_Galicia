import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal — Tu Lugar en Galicia',
  description: 'Aviso legal de Tu Lugar en Galicia, agencia de relocation especializada en Galicia.',
}

export default function AvisoLegalPage() {
  return (
    <>
      <section
        className="bg-[var(--color-granito)] pb-[var(--space-16)] px-[var(--space-6)]"
        style={{ paddingTop: 'calc(64px + 60px)' }}
      >
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-titular)] [font-size:var(--text-2xl)] leading-[var(--leading-titulo)] [color:var(--color-niebla)] md:[font-size:var(--text-3xl)]">
            Aviso Legal
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
                Estamos preparando el contenido completo de este aviso legal. Si tienes alguna pregunta
                sobre el uso de este sitio web o necesitas información legal, ponte en contacto con nosotros.
              </p>
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="font-medium text-[var(--color-laton)] underline underline-offset-2 hover:text-[var(--color-laton-oscuro)]"
              >
                hola@tulugarengalicia.com
              </a>
            </div>
          </section>

          <section aria-labelledby="titular">
            <h2
              id="titular"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
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
                className="text-[var(--color-laton)] underline underline-offset-2 hover:text-[var(--color-laton-oscuro)]"
              >
                hola@tulugarengalicia.com
              </a>
            </p>
          </section>

        </div>
      </article>
    </>
  )
}

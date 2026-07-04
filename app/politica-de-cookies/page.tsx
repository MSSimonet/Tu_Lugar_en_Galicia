import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies — Tu Lugar en Galicia',
  description: 'Política de cookies de Tu Lugar en Galicia, agencia de relocation especializada en Galicia.',
}

export default function PoliticaDeCookiesPage() {
  return (
    <>
      <section
        className="bg-[var(--color-granito)] pb-[var(--space-16)] px-[var(--space-6)]"
        style={{ paddingTop: 'calc(64px + 60px)' }}
      >
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-titular)] [font-size:var(--text-2xl)] leading-[var(--leading-titulo)] [color:var(--color-niebla)] md:[font-size:var(--text-3xl)]">
            Política de Cookies
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-[var(--space-6)] py-[var(--space-16)]">
        <div className="flex flex-col gap-[var(--space-10)] font-[family-name:var(--font-ui)] [font-size:var(--text-sm)] [color:var(--color-granito)] leading-[var(--leading-cuerpo)]">

          <section aria-labelledby="construccion">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-arena)] bg-[var(--color-niebla)] p-[var(--space-8)]">
              <h2
                id="construccion"
                className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              >
                Página en construcción
              </h2>
              <p className="mb-[var(--space-4)]">
                Estamos preparando el contenido completo de nuestra política de cookies. Si tienes alguna
                pregunta sobre cómo usamos las cookies en este sitio, ponte en contacto con nosotros.
              </p>
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="font-medium [color:var(--color-laton)] underline underline-offset-2 hover:[color:var(--color-laton-oscuro)]"
              >
                hola@tulugarengalicia.com
              </a>
            </div>
          </section>

          <section aria-labelledby="que-son">
            <h2
              id="que-son"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              ¿Qué son las cookies?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu navegador para
              recordar preferencias y mejorar tu experiencia de navegación.
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
              Para cualquier consulta sobre esta política, escríbenos a{' '}
              <a
                href="mailto:hola@tulugarengalicia.com"
                className="[color:var(--color-laton)] underline underline-offset-2 hover:[color:var(--color-laton-oscuro)]"
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

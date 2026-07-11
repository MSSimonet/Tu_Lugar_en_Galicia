import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal de Tu Lugar en Galicia, agencia de relocation especializada en Galicia.',
}

export default function AvisoLegalPage() {
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
            Aviso Legal
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
                Estamos preparando el contenido completo de este aviso legal. Si tienes alguna pregunta
                sobre el uso de este sitio web o necesitas información legal, ponte en contacto con nosotros.
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

          <section aria-labelledby="titular">
            <h2
              id="titular"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
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
                style={{ color: 'var(--po-ouro-text)' }}
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

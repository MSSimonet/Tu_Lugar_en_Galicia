'use client'

function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

export function CTAFinal() {
  return (
    <section
      className="px-[var(--space-6)] py-[var(--space-24)]"
      style={{ backgroundColor: 'var(--po-hero-bg)' }}
      aria-labelledby="cta-final-heading"
    >
      <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
        <h2
          id="cta-final-heading"
          className="[font-size:var(--text-2xl)] leading-[var(--leading-titulo)] md:[font-size:var(--text-3xl)]"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--po-hero-text)' }}
        >
          ¿Listo para encontrar tu lugar en{" "}
          <span style={{ color: 'var(--po-ouro)' }}>Galicia</span>?
        </h2>

        <p
          className="mx-auto mt-[var(--space-6)] max-w-lg [font-size:var(--text-md)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-hero-muted)' }}
        >
          Cuéntanos tu situación y te decimos si podemos
          ayudarte. Sin compromiso, sin costo de consulta.
        </p>

        <div className="mt-[var(--space-8)] flex justify-center">
          <button
            type="button"
            onClick={abrirGina}
            className="inline-flex items-center justify-center px-[var(--space-8)] py-[var(--space-4)] text-[var(--text-sm)] font-bold uppercase tracking-[0.10em] transition-brand focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: 'var(--font-lato)',
              borderRadius: '4px',
              backgroundColor: 'var(--po-ouro)',
              color: '#1A1410',
              border: 'none',
              cursor: 'pointer',
              outlineColor: 'var(--po-ouro)',
            }}
          >
            Cuéntame de ti
          </button>
        </div>
      </div>
    </section>
  );
}

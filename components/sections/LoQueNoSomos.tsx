'use client'

export default function LoQueNoSomos() {
  const cards = [
    {
      title: 'Una inmobiliaria',
      body: 'Trabajamos para ti, no para el propietario. Sin carteras propias ni comisiones cruzadas. Nuestra única lealtad es conseguirte el mejor piso posible.',
    },
    {
      title: 'Pagados por el dueño',
      body: 'Sin conflicto de interés. Tu búsqueda es nuestra única prioridad desde el primer mensaje hasta que firmas el contrato.',
    },
    {
      title: 'Un contrato garantizado',
      body: 'Garantizamos la búsqueda activa, el filtro de calidad y el acompañamiento completo. El resultado depende del mercado; el esfuerzo, de nosotros.',
    },
  ]

  return (
    <>
      <style>{`
        .lqns-section {
          padding: 48px 80px 52px;
          /* ── tokens de modo claro ── */
          --lqns-bg:              var(--color-niebla);
          --lqns-card-bg:         var(--color-blanco);
          --lqns-card-border:     var(--color-arena);
          --lqns-card-hover-bg:   var(--color-arena);
          --lqns-accent:          var(--color-laton);
          --lqns-accent-hover:    var(--color-laton-oscuro);
          --lqns-num:             var(--color-laton-text);
          --lqns-title:           var(--color-granito);
          --lqns-body:            var(--color-pizarra);
          --lqns-em:              var(--color-atlantico);
          --lqns-badge-text:      var(--color-pizarra);
          --lqns-badge-border:    var(--color-arena);
          --lqns-dot:             var(--color-atlantico);
        }

        /* ── tokens de modo oscuro ── */
        .dark .lqns-section {
          --lqns-bg:              #0D0D0D;
          --lqns-card-bg:         #1A1710;
          --lqns-card-border:     #302B25;
          --lqns-card-hover-bg:   #221E18;
          --lqns-accent:          var(--color-laton);
          --lqns-accent-hover:    var(--color-laton-claro);
          --lqns-num:             var(--color-laton-claro);
          --lqns-title:           #F0EBE2;
          --lqns-body:            #8C8278;
          --lqns-em:              var(--color-atlantico-claro);
          --lqns-badge-text:      #8C8278;
          --lqns-badge-border:    #302B25;
          --lqns-dot:             var(--color-atlantico-claro);
        }

        .lqns-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

        @media (max-width: 640px) {
          .lqns-section { padding: 32px 24px 36px; }
          .lqns-grid   { grid-template-columns: 1fr; }
        }
      `}</style>

      <section
        className="lqns-section"
        style={{ background: 'var(--lqns-bg)', fontFamily: 'var(--font-ui)' }}
      >
        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '26px' }}>
          <h2 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: '44px', fontWeight: 400, color: 'var(--lqns-title)',
            lineHeight: 1.1, margin: 0, letterSpacing: '-0.01em',
          }}>
            Lo que{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--lqns-em)' }}>no</em>
            {' '}somos
          </h2>

          {/* Badge TRANSPARENCIA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px' }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--lqns-dot)', flexShrink: 0, display: 'inline-block',
            }} />
            <span style={{
              fontSize: '11px', fontWeight: 400, color: 'var(--lqns-badge-text)',
              letterSpacing: '0.18em', textTransform: 'uppercase' as const,
              border: '1px solid var(--lqns-badge-border)',
              borderRadius: '2px', padding: '2px 8px',
            }}>
              Transparencia
            </span>
          </div>
        </div>

        {/* ── Grid de cards ── */}
        <div className="lqns-grid">
          {cards.map((card, i) => (
            <Card key={i} {...card} />
          ))}
        </div>
      </section>
    </>
  )
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        background: 'var(--lqns-card-bg)',
        border: '0.5px solid var(--lqns-card-border)',
        borderLeft: '3px solid var(--lqns-accent)',
        padding: '22px 24px 26px',
        transition: 'border-left-color 220ms ease, background 220ms ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderLeftColor = 'var(--lqns-accent-hover)'
        el.style.background = 'var(--lqns-card-hover-bg)'
        const divider = el.querySelector('.card-divider') as HTMLElement
        if (divider) { divider.style.width = '44px'; divider.style.background = 'var(--lqns-accent-hover)' }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderLeftColor = 'var(--lqns-accent)'
        el.style.background = 'var(--lqns-card-bg)'
        const divider = el.querySelector('.card-divider') as HTMLElement
        if (divider) { divider.style.width = '28px'; divider.style.background = 'var(--lqns-accent)' }
      }}
    >
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '10px', fontWeight: 600, color: 'var(--lqns-num)',
        letterSpacing: '0.16em', display: 'block', marginBottom: '10px',
      }}>
        NO somos
      </span>

      <h3 style={{
        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
        fontSize: '24px', fontWeight: 400, color: 'var(--lqns-title)',
        lineHeight: 1.2, margin: '0 0 14px 0', letterSpacing: '0.01em',
      }}>
        {title}
      </h3>

      <div
        className="card-divider"
        style={{
          width: '28px', height: '1px', background: 'var(--lqns-accent)',
          marginBottom: '18px', transition: 'width 220ms ease, background 220ms ease',
        }}
      />

      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '14px', fontWeight: 300, color: 'var(--lqns-body)',
        lineHeight: 1.85, margin: 0,
      }}>
        {body}
      </p>
    </div>
  )
}

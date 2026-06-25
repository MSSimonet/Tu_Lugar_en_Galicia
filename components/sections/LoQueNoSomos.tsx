'use client'

export default function LoQueNoSomos() {
  const cards = [
    {
      num: 'No. 01',
      title: 'Una inmobiliaria',
      body: 'Trabajamos para ti, no para el propietario. Sin carteras propias ni comisiones cruzadas. Nuestra única lealtad es conseguirte el mejor piso posible.',
    },
    {
      num: 'No. 02',
      title: 'Pagados por el dueño',
      body: 'Sin conflicto de interés. Tu búsqueda es nuestra única prioridad desde el primer mensaje hasta que firmas el contrato.',
    },
    {
      num: 'No. 03',
      title: 'Un contrato garantizado',
      body: 'Garantizamos la búsqueda activa, el filtro de calidad y el acompañamiento completo. El resultado depende del mercado; el esfuerzo, de nosotros.',
    },
  ]

  return (
    <>
      <style>{`
        .lqns-section { padding: 48px 80px 52px; }
        .lqns-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 640px) {
          .lqns-section { padding: 32px 24px 36px; }
          .lqns-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <section
        className="lqns-section"
        style={{
          background: '#0D0D0D',
          fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '26px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '44px', fontWeight: 400, color: '#F0EDE6',
            lineHeight: 1.1, margin: 0, letterSpacing: '-0.01em',
          }}>
            Lo que{' '}
            <em style={{ fontStyle: 'italic', color: '#1D9E75' }}>no</em>
            {' '}somos
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1D9E75', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: 400, color: '#7A7A7A', letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>
              Transparencia
            </span>
          </div>
        </div>

        <div className="lqns-grid">
          {cards.map((card, i) => (
            <Card key={i} {...card} />
          ))}
        </div>
      </section>
    </>
  )
}

function Card({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div
      style={{
        background: '#111111',
        border: '0.5px solid #222',
        borderLeft: '3px solid #1D6A4A',
        padding: '22px 24px 26px',
        transition: 'border-left-color 220ms ease, background 220ms ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderLeftColor = '#1D9E75'
        el.style.background = '#141414'
        const divider = el.querySelector('.card-divider') as HTMLElement
        if (divider) { divider.style.width = '44px'; divider.style.background = '#1D9E75' }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderLeftColor = '#1D6A4A'
        el.style.background = '#111111'
        const divider = el.querySelector('.card-divider') as HTMLElement
        if (divider) { divider.style.width = '28px'; divider.style.background = '#1D6A4A' }
      }}
    >
      <span style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '11px', fontWeight: 500, color: '#B8943F',
        letterSpacing: '0.18em', textTransform: 'uppercase' as const,
        display: 'block', marginBottom: '20px',
      }}>
        {num}
      </span>

      <h3 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '24px', fontWeight: 400, color: '#F0EDE6',
        lineHeight: 1.2, margin: '0 0 14px 0', letterSpacing: '0.01em',
      }}>
        {title}
      </h3>

      <div
        className="card-divider"
        style={{
          width: '28px', height: '1px', background: '#1D6A4A',
          marginBottom: '18px', transition: 'width 220ms ease, background 220ms ease',
        }}
      />

      <p style={{
        fontSize: '14px', fontWeight: 300, color: '#A8A8A8',
        lineHeight: 1.85, margin: 0,
      }}>
        {body}
      </p>
    </div>
  )
}

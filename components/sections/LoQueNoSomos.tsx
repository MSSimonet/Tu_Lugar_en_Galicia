'use client'

import { motion } from 'motion/react'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

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
          --lqns-bg:            var(--dz-papel);
          --lqns-card-bg:       var(--dz-luz);
          --lqns-card-border:   var(--dz-borde);
          --lqns-card-hover-bg: var(--dz-papel);
          --lqns-accent:        var(--dz-accent);
          --lqns-accent-hover:  var(--dz-accent-hover);
          --lqns-num:           var(--dz-accent-text);
          --lqns-title:         var(--dz-ink);
          --lqns-body:          var(--dz-muted);
          --lqns-em:            var(--dz-accent-text);
          --lqns-badge-text:    var(--dz-muted);
          --lqns-badge-border:  var(--dz-borde);
          --lqns-dot:           var(--dz-accent);
        }

        .lqns-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

        @media (max-width: 640px) {
          .lqns-section { padding: var(--space-8) var(--space-6) 36px; }
          .lqns-grid   { grid-template-columns: 1fr; }
        }
      `}</style>

      <section
        className="lqns-section"
        style={{ background: 'var(--lqns-bg)', fontFamily: 'var(--font-dz-ui)' }}
      >
        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '26px' }}>
          {/* Token compartido. El 34px hardcodeado anterior se había achicado a mano para
              no superar al H1 de la página (38px); con el H1 ya en --dz-text-h1 esa
              compensación dejó de ser necesaria (auditoría, §5). */}
          <h2 style={{
            fontFamily: 'var(--font-dz-display)',
            fontSize: 'var(--dz-text-h2)', fontWeight: 'var(--dz-weight-h2)', color: 'var(--lqns-title)',
            lineHeight: 'var(--dz-leading-h2)', margin: 0, letterSpacing: '-0.01em',
          }}>
            Lo que{' '}
            {/* font-dz-display no tiene itálica cargada (ver DESIGN.md §3) — itálica real
                explícita en Playfair para este acento, no una oblicua sintetizada */}
            <em style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: 'var(--lqns-em)' }}>no</em>
            {' '}somos
          </h2>

          {/* Badge TRANSPARENCIA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px' }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--lqns-dot)', flexShrink: 0, display: 'inline-block',
            }} />
            <span style={{
              fontSize: '11px', fontWeight: 700, color: 'var(--lqns-badge-text)',
              letterSpacing: '0.18em', textTransform: 'uppercase' as const,
              border: '1px solid var(--lqns-badge-border)',
              borderRadius: '2px', padding: '2px 8px',
            }}>
              Transparencia
            </span>
          </div>
        </div>

        {/* ── Grid de cards ── */}
        <motion.div
          className="lqns-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {cards.map((card, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card {...card} />
            </motion.div>
          ))}
        </motion.div>
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
        // Radio solo en las esquinas derechas — el borde izquierdo de acento queda a
        // escuadra a propósito, redondearlo completo chocaría con esa barra.
        borderRadius: '0 var(--dz-radius-card) var(--dz-radius-card) 0',
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
        fontFamily: 'var(--font-dz-ui)',
        fontSize: '10px', fontWeight: 700, color: 'var(--lqns-num)',
        letterSpacing: '0.16em', display: 'block', marginBottom: '10px',
      }}>
        NO somos
      </span>

      <h3 style={{
        fontFamily: 'var(--font-dz-display)',
        fontSize: 'var(--dz-text-h3)', fontWeight: 'var(--dz-weight-h3)', color: 'var(--lqns-title)',
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
        fontFamily: 'var(--font-dz-ui)',
        fontSize: '14px', fontWeight: 400, color: 'var(--lqns-body)',
        lineHeight: 1.85, margin: 0,
      }}>
        {body}
      </p>
    </div>
  )
}

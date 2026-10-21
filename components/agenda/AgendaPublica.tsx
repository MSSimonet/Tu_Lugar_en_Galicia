'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

const pasos = [
  {
    n: '01',
    title: 'Cuéntale tu caso a Gina',
    desc: 'Gina te hace unas preguntas sobre tu situación. Tarda menos de 5 minutos y puedes hacerlo ahora mismo.',
  },
  {
    n: '02',
    title: 'El equipo revisa tu caso',
    desc: 'El equipo analiza tu perfil y, si el servicio encaja con lo que necesitas, te envía un código de acceso por email.',
  },
  {
    n: '03',
    title: 'Eliges tu horario',
    desc: 'Con el código en mano, vuelves a esta página y reservas la videollamada gratuita con nuestro equipo.',
  },
]

export function AgendaPublica() {
  function openGina() {
    window.dispatchEvent(new Event('gina:open'))
  }

  return (
    <section
      className="px-[var(--space-6)] py-[var(--dz-section-y)]"
      style={{ backgroundColor: 'var(--dz-papel)' }}
      aria-labelledby="agenda-publica-heading"
    >
      <motion.div
        className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[1fr_1.15fr]"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >

        {/* Imagen editorial */}
        <motion.div
          variants={fadeUp}
          className="relative min-h-[280px] md:min-h-[560px] overflow-hidden"
          style={{ borderRadius: 'var(--dz-radius-card) var(--dz-radius-card) 0 0', backgroundColor: 'var(--dz-borde)' }}
          aria-hidden="true"
        >
          <Image
            src="/images/ciudades/tag_coruna3.jpg"
            alt="Vista de A Coruña, Galicia"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </motion.div>

        {/* Contenido */}
        <motion.div
          variants={fadeUp}
          className="px-[var(--space-6)] py-[var(--space-12)] md:px-[var(--space-12)] md:py-[var(--space-16)] flex flex-col justify-center gap-[var(--space-6)]"
          style={{ backgroundColor: 'var(--dz-luz)', borderRadius: '0 0 var(--dz-radius-card) var(--dz-radius-card)' }}
        >

          <Eyebrow tone="claro" className="self-start">
            Antes de agendar
          </Eyebrow>

          <h1
            id="agenda-publica-heading"
            style={{
              fontFamily: 'var(--font-dz-display)',
              fontWeight: 'var(--dz-weight-h1)',
              color: 'var(--dz-ink)',
              fontSize: 'var(--dz-text-h1-compact)',
              lineHeight: 'var(--dz-leading-h1)',
              letterSpacing: '-0.01em',
              // El contenedor ya aplica gap: var(--space-6) entre hermanos (flex,
              // no colapsa márgenes) — se descuenta acá para que el espacio total
              // arriba/abajo del título sea ~1cm, no 1cm + gap.
              margin: 'calc(1cm - var(--space-6)) 0',
            }}
          >
            Primero, cuéntanos tu historia
          </h1>

          <p
            className="leading-[var(--leading-cuerpo)] max-w-xl"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)', fontSize: 'var(--text-md)' }}
          >
            La videollamada con nuestro equipo es el inicio de todo — y para que valga de verdad, queremos conocerte antes.
          </p>

          <p
            className="leading-[var(--leading-cuerpo)] max-w-xl"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)', fontSize: 'var(--text-sm)' }}
          >
            Cada familia que viene a Galicia llega con una situación propia: ciudad de destino, plazos,
            documentación, expectativas. Antes de reservar un espacio en nuestro calendario,
            Gina recoge esos datos para que esa charla sea aprovechada al máximo.
          </p>

          {/* Pasos — número + texto en línea */}
          <motion.ol
            className="flex flex-col gap-[var(--space-4)] mt-[var(--space-2)]"
            aria-label="Pasos para agendar"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {pasos.map((paso) => (
              <motion.li key={paso.n} variants={fadeUp} className="flex gap-[var(--space-4)] items-baseline">
                <span
                  aria-hidden="true"
                  className="shrink-0"
                  style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--dz-accent-text)', lineHeight: 1, minWidth: '2.25rem' }}
                >
                  {paso.n}
                </span>
                <p
                  className="leading-[var(--leading-cuerpo)]"
                  style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-xs)' }}
                >
                  <span className="font-semibold" style={{ color: 'var(--dz-ink)' }}>{paso.title}</span>
                  {' — '}
                  <span style={{ color: 'var(--dz-muted)' }}>{paso.desc}</span>
                </p>
              </motion.li>
            ))}
          </motion.ol>

          {/* CTA */}
          <button
            onClick={openGina}
            className="mt-[var(--space-2)] inline-flex w-fit items-center gap-[var(--space-2)] px-[var(--space-8)] py-[var(--space-4)] [font-size:var(--text-sm)] font-bold uppercase tracking-[var(--tracking-ui)] transition-brand hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: 'var(--font-dz-ui)',
              borderRadius: '999px',
              backgroundColor: 'var(--dz-accent)',
              color: '#1A1410',
              outlineColor: 'var(--dz-ink)',
              boxShadow: 'var(--dz-shadow-md)',
            }}
          >
            Cuéntale tu caso a Gina
            <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

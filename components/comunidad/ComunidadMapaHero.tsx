'use client'

import { motion } from 'motion/react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

export function ComunidadMapaHero() {
  return (
    <section style={{ backgroundColor: 'var(--dz-hero-bg)', paddingTop: 'var(--dz-section-y)', paddingBottom: 'var(--dz-section-y)', paddingLeft: 'var(--space-16)', paddingRight: 'var(--space-16)' }}>
      <motion.div
        className="mx-auto max-w-3xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-[var(--space-4)]">
          <Eyebrow tone="hero">Formando comunidad</Eyebrow>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontSize: 'var(--dz-text-h1)',
            fontWeight: 'var(--dz-weight-h1)',
            color: 'var(--dz-hero-text)',
            lineHeight: 'var(--dz-leading-h1)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          Encuentra a tu gente en Galicia
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-md)', color: 'var(--dz-hero-muted)' }}
        >
          Café, una caminata o alguien que escuche — mira quién está cerca y con qué te puede acompañar.
        </motion.p>
      </motion.div>
    </section>
  )
}

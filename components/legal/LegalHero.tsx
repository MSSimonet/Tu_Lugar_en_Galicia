'use client'

import { motion } from 'motion/react'
import { fadeUp } from '@/lib/motion/variants'

// Hero mínimo de las 4 páginas legales — sin eyebrow a propósito (rule 3 de la sesión de
// layout/animación: un TOS no necesita una badge de marketing), solo entrada suave del h1.
export function LegalHero({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <section
      className="pb-[var(--space-16)] px-[var(--space-6)]"
      style={{ backgroundColor: 'var(--dz-hero-bg)', paddingTop: 'calc(64px + 60px)' }}
    >
      <div className="mx-auto max-w-3xl">
        <motion.h1
          style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h1)', color: 'var(--dz-hero-text)', fontSize: 'var(--dz-text-h1)', lineHeight: 'var(--dz-leading-h1)' }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {titulo}
        </motion.h1>
        {subtitulo && (
          <motion.p
            className="mt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-sm)', color: 'var(--dz-hero-muted)' }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            {subtitulo}
          </motion.p>
        )}
      </div>
    </section>
  )
}

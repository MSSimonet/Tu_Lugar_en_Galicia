'use client'

import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { fadeUp } from '@/lib/motion/variants'

function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

export function CTAFinal() {
  return (
    <section
      className="px-[var(--space-6)] py-[var(--space-24)]"
      style={{ backgroundColor: 'var(--dz-hero-bg)' }}
      aria-labelledby="cta-final-heading"
    >
      <motion.div
        className="mx-auto max-w-2xl text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {/* text-2xl (40px) fijo — con md:text-3xl (56px) superaba al H1 del hero (54px)
            e invertía la jerarquía de la página (auditoría 2026-07-19, A2.3) */}
        <h2
          id="cta-final-heading"
          className="[font-size:var(--text-2xl)] leading-[var(--leading-titulo)]"
          style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 900, color: 'var(--dz-hero-text)' }}
        >
          ¿Listo para encontrar tu lugar en{" "}
          <span style={{ color: 'var(--dz-accent)' }}>Galicia</span>?
        </h2>

        <p
          className="mx-auto mt-[var(--space-6)] max-w-lg [font-size:var(--text-md)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-hero-muted)' }}
        >
          Cuéntanos tu situación y te decimos si podemos
          ayudarte. Sin compromiso, sin costo de consulta.
        </p>

        <div className="mt-[var(--space-8)] flex justify-center">
          <Button type="button" onClick={abrirGina} size="lg" style={{ boxShadow: 'var(--dz-shadow-md)' }}>
            Cuéntame de ti
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

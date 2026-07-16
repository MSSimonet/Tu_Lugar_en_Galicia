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
      style={{ backgroundColor: 'var(--po-hero-bg)' }}
      aria-labelledby="cta-final-heading"
    >
      <motion.div
        className="mx-auto max-w-2xl text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
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
          <Button type="button" onClick={abrirGina} size="lg" style={{ boxShadow: 'var(--po-shadow-md)' }}>
            Cuéntame de ti
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

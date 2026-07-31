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
      className="px-[var(--space-6)] py-[var(--dz-section-y)]"
      style={{ backgroundColor: 'transparent' /* la capa de fondo de pagina pinta el color; ver FondoAnimado */ }}
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
          style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h2)', color: 'var(--dz-hero-text)', fontSize: 'var(--dz-text-h2)', lineHeight: 'var(--dz-leading-h2)' }}
        >
          ¿Listo para encontrar tu lugar en{" "}
          {/* --dz-accent-text y no --dz-accent: el acento crudo es un color de
              SUPERFICIE, no de texto — sobre el fondo de página daba 2,19:1 y
              fallaba en los tres anchos (medido 2026-07-31). El token de texto
              ya resuelve los dos temas solo: #9C5F19 en claro y el acento crudo
              en oscuro, donde sí es AA (globals.css:770). */}
          <span style={{ color: 'var(--dz-accent-text)' }}>Galicia</span>?
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

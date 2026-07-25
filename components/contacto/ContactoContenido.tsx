'use client'

import { motion } from 'motion/react'
import { FormularioContacto } from '@/components/contacto/FormularioContacto'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

export function ContactoContenido() {
  return (
    <>
      {/* Hero — bookend fijo oscuro (Pedra e Ouro) */}
      <section
        className="px-[var(--space-6)]"
        style={{ backgroundColor: 'var(--dz-hero-bg)', paddingTop: 'calc(64px + 60px)', paddingBottom: 'var(--space-12)' }}
      >
        <motion.div
          className="mx-auto max-w-2xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="mb-[var(--space-2)]">
            <Eyebrow tone="hero">Hablemos</Eyebrow>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h1)', color: 'var(--dz-hero-text)', fontSize: 'var(--dz-text-h1)', lineHeight: 'var(--dz-leading-h1)' }}
          >
            ¿Tienes alguna pregunta?
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-md)', color: 'var(--dz-hero-muted)' }}
          >
            Cuéntanos tu situación. Te respondemos en las próximas 24 horas hábiles.
          </motion.p>
        </motion.div>
      </section>

      {/* Formulario */}
      <section className="py-[var(--dz-section-y)] px-[var(--space-6)]" style={{ backgroundColor: 'var(--dz-luz)' }}>
        <motion.div
          className="mx-auto max-w-2xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <FormularioContacto />
        </motion.div>
      </section>
    </>
  )
}

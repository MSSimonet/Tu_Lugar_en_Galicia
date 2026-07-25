'use client'

import { motion } from 'motion/react'
import { FormularioComunidad } from '@/components/comunidad/FormularioComunidad'
import { GenteDivider } from '@/components/comunidad/GenteDivider'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

export function ComunidadContenido() {
  return (
    <>
      {/* Hero — bookend fijo oscuro (Pedra e Ouro) */}
      <section
        className="px-[var(--space-6)]"
        // 64px compensa el header fijo; el espacio visible queda simétrico
        // (48px arriba y abajo — antes 60/48, auditoría 2026-07-19)
        style={{ backgroundColor: 'var(--dz-hero-bg)', paddingTop: 'calc(64px + var(--space-12))', paddingBottom: 'var(--space-12)' }}
      >
        <motion.div
          className="mx-auto max-w-2xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="mb-[var(--space-2)]">
            <Eyebrow tone="hero">Formando comunidad</Eyebrow>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h1)', color: 'var(--dz-hero-text)', fontSize: 'var(--dz-text-h1)', lineHeight: 'var(--dz-leading-h1)' }}
          >
            Sé un anfitrión en Galicia
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-md)', color: 'var(--dz-hero-muted)' }}
          >
            Regístrate en el mapa de la comunidad y ofrece un café, una caminata o simplemente
            escuchar a quien acaba de llegar. Tu ubicación nunca se muestra con exactitud — solo
            una zona aproximada de tu barrio.
          </motion.p>
        </motion.div>
      </section>

      <div style={{ background: 'linear-gradient(to bottom, var(--dz-hero-bg), var(--dz-luz))' }}>
        <GenteDivider direction="rtl" />
      </div>

      {/* Formulario */}
      <section className="py-[var(--dz-section-y)] px-[var(--space-6)]" style={{ backgroundColor: 'var(--dz-luz)' }}>
        <motion.div
          className="mx-auto max-w-2xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <FormularioComunidad />
        </motion.div>
      </section>
    </>
  )
}

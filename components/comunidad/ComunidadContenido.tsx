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
        // Padding unificado con el resto de los Hero interiores vía --dz-hero-pad-y.
        // Antes sumaba 64px "para compensar el header fijo", pero el header es
        // `sticky` y `main` ya arranca debajo de él: era espacio muerto y hacía
        // que este Hero se viera más alto que los demás (auditoría 2026-07-25).
        style={{ backgroundColor: 'var(--dz-hero-bg)', paddingTop: 'var(--dz-hero-pad-y)', paddingBottom: 'var(--dz-hero-pad-y)', minHeight: 'var(--dz-hero-min-h)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
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
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h1)', color: 'var(--dz-hero-text)', fontSize: 'var(--dz-text-h1-compact)', lineHeight: 'var(--dz-leading-h1)', letterSpacing: '-0.01em', margin: '1cm 0' }}
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

      {/* Color plano, no degradado: la base del Hero corta nítida (pedido
          explícito). El resto de las uniones conserva su degradado. */}
      <div style={{ backgroundColor: 'var(--dz-luz)' }}>
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

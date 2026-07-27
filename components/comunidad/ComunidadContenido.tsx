'use client'

import { motion } from 'motion/react'
import { FormularioComunidad } from '@/components/comunidad/FormularioComunidad'
import { GenteDivider } from '@/components/comunidad/GenteDivider'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageHero } from '@/components/ui/PageHero'
import { fadeUp } from '@/lib/motion/variants'

export function ComunidadContenido() {
  return (
    <>
      {/* Hero — bookend fijo oscuro (Pedra e Ouro) */}
      <PageHero
        eyebrow={<Eyebrow tone="hero">Formando comunidad</Eyebrow>}
        title="Sé un anfitrión en Galicia"
        subtitle="Regístrate en el mapa de la comunidad y ofrece un café, una caminata o simplemente escuchar a quien acaba de llegar. Tu ubicación nunca se muestra con exactitud — solo una zona aproximada de tu barrio."
      />

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

'use client'

import { motion } from 'motion/react'
import { FormularioDiagnostico } from '@/components/conocernos'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

// Sin eyebrow a propósito (rule 3 de la sesión de layout/animación): es un formulario, no
// una superficie de marketing — el h1 directo alcanza, igual que las páginas legales.
export function ConocernosContenido() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--dz-luz)' }}>
      {/* Hero de la página */}
      <div style={{ backgroundColor: 'var(--dz-papel)', borderBottom: '1px solid var(--dz-borde)' }}>
        <motion.div
          className="max-w-2xl mx-auto px-[var(--space-6)] pb-[var(--space-16)]"
          style={{ paddingTop: 'calc(64px + 60px)' }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={fadeUp}
            className="[font-size:var(--text-2xl)] md:[font-size:var(--text-3xl)] leading-[var(--leading-titulo)] mb-[var(--space-6)]"
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-ink)' }}
          >
            Vamos a conocernos
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="[font-size:var(--text-sm)] md:[font-size:var(--text-md)] leading-[var(--leading-cuerpo)] mb-[var(--space-4)]"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
          >
            ¿Prefieres escribir antes de chatear? Este formulario recoge exactamente la misma información que Gina, nuestra asistente virtual. Cuéntanos sobre tu familia y tu situación para que nuestro equipo pueda entender tu caso y ver cómo puede acompañarte.
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="[font-size:var(--text-xs)] opacity-80"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
          >
            Tus datos se usan solo para evaluar tu caso. No los compartimos con nadie.
          </motion.p>
        </motion.div>
      </div>

      {/* Formulario — lógica de Gina, no se toca su estilo interno */}
      <motion.div
        className="max-w-2xl mx-auto px-[var(--space-6)] py-[var(--space-16)]"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <FormularioDiagnostico />
      </motion.div>
    </div>
  )
}

'use client'

import { motion } from 'motion/react'
import { GinaButton } from '@/components/shared/GinaButton'
import { FAQAccordionPedraEOuro } from '@/components/ciudades/FAQAccordionPedraEOuro'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

interface Categoria {
  titulo: string
  faqs: { question: string; answer: string }[]
}

export function FAQContenido({ categorias }: { categorias: Categoria[] }) {
  return (
    <>
      {/* Hero — bookend fijo oscuro (Pedra e Ouro) */}
      {/* Padding unificado con el resto de los Hero interiores (auditoría 2026-07-25).
          La base ya cortaba nítida: debajo va una <section> de color plano. */}
      <section style={{ backgroundColor: 'var(--dz-hero-bg)', paddingTop: 'var(--dz-hero-pad-y)', paddingBottom: 'var(--dz-hero-pad-y)', paddingLeft: 'var(--space-6)', paddingRight: 'var(--space-6)', minHeight: 'var(--dz-hero-min-h)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <motion.div
          className="mx-auto max-w-3xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="mb-[var(--space-5)]">
            <Eyebrow tone="hero">Preguntas frecuentes</Eyebrow>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            style={{
              fontFamily: 'var(--font-dz-display)',
              fontSize: 'var(--dz-text-h1-compact)',
              fontWeight: 'var(--dz-weight-h1)',
              color: 'var(--dz-hero-text)',
              lineHeight: 'var(--dz-leading-h1)',
              letterSpacing: '-0.01em',
              margin: '1cm 0',
            }}
          >
            ¿Tienes dudas?
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-md)', color: 'var(--dz-hero-muted)' }}
          >
            Respondemos las preguntas que más nos hacen
          </motion.p>
        </motion.div>
      </section>

      {/* Bajada */}
      <section className="py-[var(--dz-section-y)] px-[var(--space-6)]" style={{ backgroundColor: 'var(--dz-luz)' }}>
        <div className="mx-auto max-w-3xl">
          <p
            className="text-[var(--text-sm)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
          >
            Reunimos las preguntas que nos hacen todas las familias antes de arrancar. Si la tuya no
            está acá, escríbenos — respondemos hoy.
          </p>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-[var(--dz-section-y)] px-[var(--space-6)]" style={{ backgroundColor: 'var(--dz-papel)' }}>
        <motion.div
          className="mx-auto max-w-3xl space-y-[var(--space-12)]"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {categorias.map((cat) => (
            <motion.div key={cat.titulo} variants={fadeUp}>
              <h2
                className="mb-[var(--space-6)]"
                style={{
                  fontFamily: 'var(--font-dz-display)',
                  fontWeight: 'var(--dz-weight-h2)',
                  fontSize: 'var(--dz-text-h2)',
                  color: 'var(--dz-accent-text)',
                  lineHeight: 'var(--dz-leading-h2)',
                }}
              >
                {cat.titulo}
              </h2>
              <FAQAccordionPedraEOuro faqs={cat.faqs} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA al final — bookend fijo oscuro (Pedra e Ouro) */}
      <section className="py-[var(--dz-section-y)] px-[var(--space-6)]" style={{ backgroundColor: 'var(--dz-hero-bg)' }}>
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h2
            className="mb-[var(--space-4)]"
            style={{
              fontFamily: 'var(--font-dz-display)',
              fontWeight: 'var(--dz-weight-h2)',
              fontSize: 'var(--dz-text-h2)',
              color: 'var(--dz-hero-text)',
              lineHeight: 'var(--dz-leading-h2)',
            }}
          >
            ¿No encontraste tu respuesta?
          </h2>
          <p
            className="mb-[var(--space-8)] text-[var(--text-sm)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-hero-muted)' }}
          >
            Cuéntanos tu caso y te respondemos hoy.
          </p>
          <div className="flex justify-center">
            <GinaButton
              className="inline-flex items-center justify-center px-[var(--space-8)] py-[var(--space-4)] text-[var(--text-sm)] font-bold uppercase tracking-[0.10em] transition-brand focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                fontFamily: 'var(--font-dz-ui)',
                borderRadius: '999px',
                backgroundColor: 'var(--dz-accent)',
                color: '#1A1410',
                outlineColor: 'var(--dz-accent)',
                boxShadow: 'var(--dz-shadow-md)',
              }}
            >
              Cuéntame de ti
            </GinaButton>
          </div>
        </motion.div>
      </section>
    </>
  )
}

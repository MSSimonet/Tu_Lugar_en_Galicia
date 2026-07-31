'use client'

import { motion } from 'motion/react'
import { GinaButton } from '@/components/shared/GinaButton'
import { FAQAccordionPedraEOuro } from '@/components/ciudades/FAQAccordionPedraEOuro'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageHero } from '@/components/ui/PageHero'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

interface Categoria {
  titulo: string
  faqs: { question: string; answer: string }[]
}

export function FAQContenido({ categorias }: { categorias: Categoria[] }) {
  return (
    <>
      {/* Hero — bookend fijo oscuro (Pedra e Ouro). La base corta nítida: debajo
          va una <section> de color plano. */}
      <PageHero
        compact
        eyebrow={<Eyebrow tone="hero">Preguntas frecuentes</Eyebrow>}
        title="¿Tienes dudas?"
        subtitle="Reunimos las preguntas que nos hacen todas las familias antes de arrancar. Si la tuya no está acá, escríbenos"
      />

      {/* Cuerpo — fondo de pagina unico. Sin icono animado por ahora. */}
      <div style={{ backgroundColor: 'var(--dz-fondo-pagina)' }}>
      {/* Categorías */}
      <section className="py-[var(--dz-section-y)] px-[var(--space-6)]">
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
      <section className="py-[var(--dz-section-y)] px-[var(--space-6)]">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {/* --space-8 y no --space-4: este margen lo aportaba el párrafo
              "Cuéntanos tu caso y te respondemos hoy.", que se eliminó. Sin el
              traslado, el botón quedaba a 16px del titular en vez de a 32px. */}
          <h2
            className="mb-[var(--space-8)]"
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
      </div>
    </>
  )
}

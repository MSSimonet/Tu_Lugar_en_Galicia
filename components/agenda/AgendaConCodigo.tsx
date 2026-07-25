'use client'

import { motion } from 'motion/react'
import { CalEmbed } from '@/components/shared/CalEmbed'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

// Código de agenda válido — variante con el widget de Cal.com embebido. Extraído a un
// client component propio porque app/agenda/page.tsx es un server component async
// (valida el código contra Supabase) y motion necesita 'use client'.
export function AgendaConCodigo() {
  return (
    <section
      className="px-[var(--space-6)] pb-[var(--dz-section-y)]"
      style={{ backgroundColor: 'var(--dz-papel)', paddingTop: 'calc(64px + 60px)' }}
      aria-labelledby="agenda-heading"
    >
      <motion.div
        className="mx-auto max-w-[920px] flex flex-col items-center text-center gap-[var(--space-4)]"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow tone="claro">Tu cita te espera</Eyebrow>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          id="agenda-heading"
          style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h1)', color: 'var(--dz-ink)', fontSize: 'var(--dz-text-h1)', lineHeight: 'var(--dz-leading-h1)' }}
        >
          Elige tu horario
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="leading-[var(--leading-cuerpo)] max-w-xl"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)', fontSize: 'var(--text-md)' }}
        >
          Gratuita, sin compromiso. Te vamos a escuchar y decirte si podemos ayudarte.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="leading-[var(--leading-cuerpo)] max-w-xl"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)', fontSize: 'var(--text-sm)' }}
        >
          En esta llamada escuchamos tu situación, respondemos tus dudas sobre el proceso
          en Galicia y evaluamos si el servicio es el indicado para ti. Sin presión,
          sin compromiso. Es simplemente una conversación para conocernos.
        </motion.p>

        {/* Marco alrededor del CalEmbed — el widget en sí no se toca */}
        <motion.div
          variants={fadeUp}
          className="w-full mt-[var(--space-4)] p-[var(--space-3)] md:p-[var(--space-4)]"
          style={{
            borderRadius: 'var(--dz-radius-card)',
            border: '1px solid var(--dz-borde)',
            backgroundColor: 'var(--dz-luz)',
            boxShadow: 'var(--dz-shadow-md)',
          }}
        >
          <CalEmbed className="rounded" />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="[font-size:var(--text-xs)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
        >
          Si el calendario no carga,{' '}
          <a
            href="/contacto"
            className="underline hover:no-underline"
            style={{ color: 'var(--dz-accent-text)' }}
          >
            escríbenos por el formulario de contacto
          </a>
          .
        </motion.p>
      </motion.div>
    </section>
  )
}

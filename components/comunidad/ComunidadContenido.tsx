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
      {/* Hero — misma caja, mismo alto y misma tipografía que el de /ciudades:
          todo sale del mismo PageHero y lo único propio es el video de fondo.
          `compact` es lo que iguala la ALTURA: sin él, /comunidad se quedaba en
          el escalón alto (--dz-hero-min-h 32rem en escritorio) y /ciudades en el
          bajo (24rem), que era la única diferencia de caja entre los dos.
          El eyebrow pasa a tone="oscuro" porque el "hero" está calibrado contra
          el bookend sólido y su fondo tintado de acento se pierde sobre video —
          "oscuro" es justo la variante pensada para foto/video. */}
      <PageHero
        compact
        video={{ src: '/videos/hero_comunidad.mp4' }}
        eyebrow={<Eyebrow>Formando comunidad</Eyebrow>}
        title="Sé un anfitrión en Galicia"
        subtitle="Regístrate en el mapa de la comunidad y ofrece un café, una caminata o simplemente escuchar a quien acaba de llegar. Tu ubicación nunca se muestra con exactitud — solo una zona aproximada de tu barrio."
      />

      {/* Cuerpo — fondo de página único; el divisor vuelve a ser un separador
          lineal entre el Hero y el formulario. */}
      <div style={{ backgroundColor: 'var(--dz-fondo-pagina)' }}>
        <GenteDivider direction="rtl" />
        <section className="py-[var(--dz-section-y)] px-[var(--space-6)]">
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
      </div>
    </>
  )
}

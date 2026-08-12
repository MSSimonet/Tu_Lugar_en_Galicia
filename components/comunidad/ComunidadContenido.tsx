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
      {/* Hero — misma caja y misma tipografía que las otras cuatro páginas: todo
          sale del mismo PageHero y lo único propio es el video de fondo.

          SIN `compact`, a diferencia de /ciudades. Se le puso `compact` para
          igualar la altura de /ciudades (384px) y se saca ahora a pedido: con un
          video detrás, el escalón bajo recortaba la imagen a una franja. Vuelve
          al escalón alto —el que este Hero ya tenía antes del video y el que
          comparte con /sobre-silvana— así que sigue siendo un escalón del
          sistema y no un alto inventado para esta página.

          El eyebrow va con tone="oscuro" porque el "hero" está calibrado contra
          el bookend sólido y su fondo tintado de acento se pierde sobre video —
          "oscuro" es justo la variante pensada para foto/video. */}
      <PageHero
        video={{ src: '/videos/hero_comunidad.mp4' }}
        eyebrow={<Eyebrow>Formando comunidad</Eyebrow>}
        title="Sé un anfitrión en Galicia"
        subtitle="Regístrate en el mapa de la comunidad y ofrece un café, una caminata o simplemente escuchar a quien acaba de llegar. Tu ubicación nunca se muestra con exactitud — solo una zona aproximada de tu barrio."
      />

      {/* Cuerpo — fondo de página único; el divisor vuelve a ser un separador
          lineal entre el Hero y el formulario. */}
      <div style={{ backgroundColor: 'var(--dz-fondo-pagina)' }}>
        <GenteDivider direction="rtl" />
        {/* El padding superior NO es --dz-section-y como el inferior: acá arriba no
            hay una frontera de sección sino un divisor, y el divisor ya aporta su
            propio aire. Con los 104px del token, entre el dibujo y el formulario
            quedaban 144px medidos — el formulario se despegaba de su separador.

            El número sale de restar: el contenedor del divisor se pinta 24px más
            arriba de donde ocupa sitio (apoyoEnFrontera lo sube media caja para
            clavar la estela en la frontera), así que esos 24px ya cuentan como
            espacio visible. 14 + 24 = los ~38px (~1cm) pedidos. */}
        <section className="pt-[14px] pb-[var(--dz-section-y)] px-[var(--space-6)]">
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

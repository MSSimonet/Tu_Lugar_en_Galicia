'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { GinaButton } from '@/components/shared/GinaButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

const confianza = [
  {
    titulo: 'Cuatro años de experiencia real en el mercado de alquiler gallego.',
    texto:
      'No soy una consultora que aprendió de libros. Conozco el mercado desde adentro: los barrios que funcionan para familias, los propietarios que realmente alquilan a latinoamericanos, las condiciones que son negociables y las que no. Ese conocimiento práctico no se improvisa.',
  },
  {
    titulo: 'Entiendo el proceso migratorio desde adentro.',
    texto:
      'No hablo de teoría cuando explico qué documentación piden o cómo es el sistema de garantías en España. Lo viví. Sé lo que se siente tener el pasaporte con raíces gallegas y no saber si eso alcanza. Esa comprensión hace que mi ayuda sea diferente a la de alguien que nunca emigró.',
  },
  {
    titulo: 'Una red de contactos que lleva años construyéndose.',
    texto:
      'Propietarios particulares que confían en mí, agencias con las que tengo relación directa, gestores y abogados que conocen las necesidades específicas de familias inmigrantes. No busco en los mismos portales que abre cualquier persona desde Buenos Aires o Caracas.',
  },
  {
    titulo: 'Resultados concretos y verificables.',
    texto:
      '+200 familias reubicadas. 57 solo en 2025. Testimonios reales de personas que llegaron con las llaves en la mano. No trabajo con promesas — trabajo con resultados.',
  },
]

export function SobreSilvanaContenido() {
  return (
    <>
      {/* Hero — bookend fijo oscuro (Pedra e Ouro) */}
      <section style={{ backgroundColor: 'var(--dz-hero-bg)', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)', paddingLeft: 'var(--space-16)', paddingRight: 'var(--space-16)' }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="flex flex-col gap-[var(--space-8)] md:flex-row-reverse md:items-center md:gap-[var(--space-12)]"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Foto */}
            <motion.div variants={fadeUp} className="flex shrink-0 justify-center md:justify-end">
              <Image
                src="https://placehold.co/400x400/C89B3C/2C2420?text=Silvana"
                alt="Silvana Lorenzo, fundadora de Tu Lugar en Galicia"
                width={200}
                height={200}
                className="rounded-full object-cover"
                priority
              />
            </motion.div>
            {/* Título */}
            <div>
              <motion.div variants={fadeUp} className="mb-[var(--space-4)]">
                <Eyebrow tone="hero">Fundadora</Eyebrow>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: 'var(--font-dz-display)',
                  fontSize: 'clamp(31px, 4.25vw, 54px)',
                  fontWeight: 900,
                  color: 'var(--dz-hero-text)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}
              >
                Hice tu mismo camino,<br />te entiendo muy bien…
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
                style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-sm)', color: 'var(--dz-hero-muted)' }}
              >
                Fundadora de Tu Lugar en Galicia — emigrante argentina con raíces gallegas
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Historia en primera persona */}
      <motion.section
        className="py-[var(--space-16)] px-[var(--space-6)]"
        style={{ backgroundColor: 'var(--dz-luz)' }}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="mx-auto max-w-3xl space-y-[var(--space-6)]">
          <h2
            className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)]"
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-ink)' }}
          >
            Mi historia
          </h2>
          <p className="[font-size:var(--text-sm)] leading-relaxed" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}>
            Nací en Argentina y crecí sabiendo que en algún momento iba a cruzar el Atlántico. Mi
            familia tiene raíces gallegas — como tantas familias latinoamericanas — y Galicia siempre
            fue algo más que un lugar en el mapa. Era una historia que me habían contado desde chica,
            con nombres de pueblos, recetas y un idioma que sonaba familiar aunque yo no lo hablara.
            Cuando decidí venirme, sentí que no estaba yendo a un lugar desconocido: estaba volviendo
            a algo.
          </p>
          <p className="[font-size:var(--text-sm)] leading-relaxed" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}>
            Pero la realidad del proceso migratorio no se parece a esa historia romántica. Encontrar
            vivienda desde el otro lado del Atlántico es una de las partes más duras. Los propietarios
            no confían en alguien que no pueden ver, los portales de alquiler están llenos de opciones
            que no corresponden a lo que describen, y nadie te explica qué documentación necesitas,
            cómo funciona un contrato de arrendamiento en España o qué es eso de la fianza legal. Yo
            lo viví en carne propia. Tardé mucho más de lo que debería haber tardado, y llegué a
            Galicia con más incertidumbre de la necesaria.
          </p>
          <p className="[font-size:var(--text-sm)] leading-relaxed" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}>
            Cuando me instalé y empecé a conocer la realidad del mercado desde adentro, entendí que
            podía hacer algo concreto con eso. Empecé a ayudar a algunas familias del entorno —
            amigos de amigos, conocidos de conocidos — que estaban pasando por lo mismo que yo había
            pasado. Lo hacía porque podía, porque conocía el territorio y porque recordaba exactamente
            cómo se sentía esa incertidumbre. En algún momento dejó de ser un favor ocasional y se
            convirtió en un servicio real.
          </p>
          <p className="[font-size:var(--text-sm)] leading-relaxed" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}>
            Hoy llevo cuatro años haciendo esto de manera profesional. Más de doscientas familias
            encontraron su lugar en Galicia con nuestra ayuda. Conozco propietarios, conozco barrios,
            conozco los trucos del mercado y conozco los trámites. Pero lo más importante es que
            conozco lo que siente una familia cuando está a miles de kilómetros tratando de imaginar
            su vida nueva. Eso no lo enseña ningún curso — lo da haberlo vivido.
          </p>
          <p className="[font-size:var(--text-sm)] leading-relaxed" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}>
            Empecé este servicio porque quería que otras familias llegaran a Galicia mejor de lo que
            llegué yo. Eso sigue siendo lo que me mueve cada día.
          </p>
        </div>
      </motion.section>

      {/* Por qué confiar en mí */}
      <section className="py-[var(--space-16)] px-[var(--space-6)]" style={{ backgroundColor: 'var(--dz-papel)' }}>
        <div className="mx-auto max-w-3xl">
          <motion.h2
            className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-8)]"
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-ink)' }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            Por qué confiar en mí
          </motion.h2>
          <motion.ul
            className="space-y-[var(--space-6)]"
            role="list"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {confianza.map((item) => (
              <motion.li key={item.titulo} variants={fadeUp} className="flex gap-[var(--space-4)]">
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 font-bold [font-size:var(--text-md)]"
                  style={{ color: 'var(--dz-accent-text)' }}
                >
                  ✓
                </span>
                <div>
                  <h3
                    className="font-semibold [font-size:var(--text-sm)]"
                    style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
                  >
                    {item.titulo}
                  </h3>
                  <p
                    className="mt-[var(--space-1)] [font-size:var(--text-sm)] leading-[var(--leading-cuerpo)]"
                    style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
                  >
                    {item.texto}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Cierre + CTA */}
      <motion.section
        className="py-[var(--space-16)] px-[var(--space-6)]"
        style={{ backgroundColor: 'var(--dz-luz)' }}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="[font-size:var(--text-md)] leading-[var(--leading-cuerpo)] mb-[var(--space-8)]"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
          >
            Si llegaste hasta acá, ya sabes quién soy y por qué hago esto. Ahora lo que me gustaría
            es conocerte, escuchar tu historia y ver si puedo ayudarte.
          </p>
          <div className="flex flex-col items-center gap-[var(--space-4)]">
            <GinaButton
              className="inline-flex items-center justify-center px-[var(--space-8)] py-[var(--space-4)] font-bold [font-size:var(--text-sm)] tracking-[0.10em] uppercase transition-brand focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                fontFamily: 'var(--font-dz-ui)',
                borderRadius: '999px',
                backgroundColor: 'var(--dz-accent)',
                color: '#1A1410',
                outlineColor: 'var(--dz-accent)',
                boxShadow: 'var(--dz-shadow-md)',
              }}
            >
              Vamos a conocernos
            </GinaButton>
            <Link
              href="/conocernos"
              className="[font-size:var(--text-sm)] underline underline-offset-2 transition-colors duration-150"
              style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
            >
              ¿Prefieres escribirlo? Completa el formulario
            </Link>
          </div>
        </div>
      </motion.section>
    </>
  )
}

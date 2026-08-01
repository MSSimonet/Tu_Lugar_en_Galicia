'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pause, Play } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { FAQAccordionPedraEOuro } from '@/components/ciudades/FAQAccordionPedraEOuro'
import { ClimaActual } from '@/components/ciudad/ClimaActual'
import { VistaEnVivo } from '@/components/ciudad/VistaEnVivo'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { SparkleIcon } from '@/components/ui/SparkleIcon'
import { faqSchema } from '@/lib/seo/schemas'
import { prefetchCiudadVideo } from '@/lib/ciudades/videoPrefetch'
import { useVideoPauseToggle } from '@/lib/hooks/useVideoPauseToggle'
import { fadeUp, staggerContainer } from '@/lib/motion/variants'
import { useSlideInCards } from '@/lib/gsap/useSlideInCards'

export interface CiudadLayoutProps {
  nombre: string
  slug: string
  descripcionCorta: string
  descripcionLarga: string
  descripcionLarga2: string
  videoSrc: string
  posterSrc: string
  barrios: { nombre: string; descripcion: string }[]
  alquileres: { habitaciones: string; rango: string }[]
  faqs: { pregunta: string; respuesta: string }[]
  codigoAEMET: string
  vistaEnVivo: { lat: number; lon: number; descripcionUbicacion: string }
  objectPosition?: string
}

const TODAS_LAS_CIUDADES = [
  { slug: 'vigo', nombre: 'Vigo', imagen: '/images/ciudades/card_vigo.jpg', descripcion: 'La ciudad más grande de Galicia' },
  { slug: 'a-coruna', nombre: 'A Coruña', imagen: '/images/ciudades/card_coruna.jpg', descripcion: 'Ciudad atlántica y cosmopolita' },
  { slug: 'santiago-de-compostela', nombre: 'Santiago de Compostela', imagen: '/images/ciudades/card_santiago.jpg', descripcion: 'Capital y Patrimonio de la Humanidad' },
  { slug: 'pontevedra', nombre: 'Pontevedra', imagen: '/images/ciudades/card_pontevedra.jpg', descripcion: 'La ciudad más peatonal de España' },
  { slug: 'lugo', nombre: 'Lugo', imagen: '/images/ciudades/card_lugo.jpg', descripcion: 'Muralla romana y ritmo tranquilo' },
]

export function CiudadLayout({
  nombre,
  slug,
  descripcionCorta,
  descripcionLarga,
  descripcionLarga2,
  videoSrc,
  posterSrc,
  barrios,
  alquileres,
  faqs,
  vistaEnVivo,
  objectPosition = 'center',
  // codigoAEMET is informational; API routing uses slug
}: CiudadLayoutProps) {
  const faqsMapped = faqs.map(f => ({ question: f.pregunta, answer: f.respuesta }))
  const schema = faqSchema(faqsMapped)
  const { videoRef, isPlaying, toggle } = useVideoPauseToggle()
  const otrasCiudadesRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useSlideInCards(otrasCiudadesRef, '.otra-ciudad-card', !!prefersReducedMotion)

  function abrirGina() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gina:open'))
    }
  }

  return (
    <>
      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ height: 'clamp(500px, 65vh, 700px)' }}
        aria-label={`Hero de ${nombre}`}
      >
        {/* Fondo: video con fallback a imagen.
            El contenedor NO lleva aria-hidden: axe marcaba aria-hidden-focus
            porque un subárbol oculto de la accesibilidad contenía un elemento
            enfocable (el <video>), y eso era lo único que bajaba estas 5 páginas
            de 100 a 96 en Lighthouse. No hace falta: la <Image> ya es decorativa
            (alt=""), el overlay no tiene contenido, y el <video> trae su propio
            aria-hidden más tabIndex={-1}. */}
        <div className="absolute inset-0">
          <Image
            src={posterSrc}
            alt=""
            fill
            priority
            className="object-cover"
            style={{ objectPosition }}
            sizes="100vw"
          />
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition }}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          {/* Overlay lateral + inferior */}
          <div
            className="absolute inset-0"
            style={{
              background: [
                'linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)',
                'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 50%)',
              ].join(', '),
            }}
          />

          {/* Pausa/reproduce el video de fondo — WCAG 2.2.2 */}
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? 'Pausar video de fondo' : 'Reproducir video de fondo'}
            className="absolute bottom-4 right-4 z-10 flex items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dz-accent)]"
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'var(--dz-hero-text)',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={16} strokeWidth={1.8} /> : <Play size={16} strokeWidth={1.8} />}
          </button>
        </div>

        {/* Contenido hero — entrada escalonada al montar (no whileInView: ya está sobre el fold) */}
        <motion.div
          className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-5xl"
          style={{ paddingTop: '64px' }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow pill */}
          <motion.div variants={fadeUp} className="self-start mb-4">
            <Eyebrow>
              Tu Lugar en Galicia · {nombre}
            </Eyebrow>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            className="text-white mb-3"
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h1)', fontSize: 'var(--dz-text-h1)', lineHeight: 'var(--dz-leading-h1)' }}
          >
            {nombre}
          </motion.h1>

          {/* Descripción corta */}
          <motion.p
            variants={fadeUp}
            className="text-white/80 text-sm md:text-base max-w-lg leading-relaxed mb-6"
            style={{ fontFamily: 'var(--font-dz-ui)' }}
          >
            {descripcionCorta}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
            <Button onClick={abrirGina} className="gap-2" style={{ boxShadow: 'var(--dz-shadow-md)' }}>
              <SparkleIcon size={16} />
              Hablar con Gina
            </Button>
            <Link
              href="/conocernos"
              className="text-xs text-white/55 hover:text-white/80 transition-colors underline-offset-2 hover:underline"
              style={{ fontFamily: 'var(--font-dz-ui)' }}
            >
              O completa el formulario
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CUERPO ── */}
      <div className="px-6 md:px-8 py-7 space-y-5 max-w-7xl mx-auto w-full" style={{ backgroundColor: 'var(--dz-luz)' }}>

        {/* Fila 1: Descripción + Clima */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Descripción larga */}
          <div className="p-6" style={{ backgroundColor: 'var(--dz-papel)', borderRadius: 'var(--dz-radius-card)', border: '1px solid var(--dz-borde)' }}>
            <h2
              className="text-[10px] tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-dz-ui)', fontWeight: 700, color: 'var(--dz-accent-text)' }}
            >
              La ciudad
            </h2>
            <p className="text-sm leading-[1.75] mb-4" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}>
              {descripcionLarga}
            </p>
            <p className="text-sm leading-[1.75]" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}>
              {descripcionLarga2}
            </p>
          </div>

          {/* Clima */}
          <div>
            <ClimaActual slug={slug} />
          </div>
        </motion.div>

        {/* Fila 2: Barrios / Alquileres / Video */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >

          {/* Barrios más buscados */}
          <motion.div
            className="p-5"
            whileHover={{ y: -4, boxShadow: 'var(--dz-shadow-md)' }}
            style={{ backgroundColor: 'var(--dz-papel)', borderRadius: 'var(--dz-radius-card)' }}
          >
            <h2
              className="text-[10px] tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-dz-ui)', fontWeight: 700, color: 'var(--dz-accent-text)' }}
            >
              Los barrios más buscados
            </h2>
            <ul className="space-y-0 divide-y" style={{ borderColor: 'var(--dz-borde)' }}>
              {barrios.map((b, i) => (
                <li key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-semibold text-sm mb-0.5" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}>
                    {b.nombre}
                  </p>
                  <p className="text-xs leading-snug" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}>
                    {b.descripcion}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Alquileres orientativos */}
          <motion.div
            className="p-5"
            whileHover={{ y: -4, boxShadow: 'var(--dz-shadow-md)' }}
            style={{ backgroundColor: 'var(--dz-papel)', borderRadius: 'var(--dz-radius-card)' }}
          >
            <h2
              className="text-[10px] tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-dz-ui)', fontWeight: 700, color: 'var(--dz-accent-text)' }}
            >
              Alquileres orientativos · 2025
            </h2>
            <ul className="space-y-2">
              {alquileres.map((a, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center px-3 py-2"
                  style={{ backgroundColor: 'var(--dz-luz)', borderRadius: '8px' }}
                >
                  <span className="text-xs" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}>
                    {a.habitaciones}
                  </span>
                  <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}>
                    {a.rango}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 leading-snug" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)', fontSize: '10px' }}>
              Orientativos. Varían según barrio y estado del inmueble.
            </p>
          </motion.div>

          {/* Vista en vivo Windy */}
          <VistaEnVivo
            lat={vistaEnVivo.lat}
            lon={vistaEnVivo.lon}
            nombreCiudad={nombre}
            descripcionUbicacion={vistaEnVivo.descripcionUbicacion}
          />
        </motion.div>

        {/* Fila 3: FAQ ancho completo */}
        <motion.div
          className="p-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{ backgroundColor: 'var(--dz-papel)', borderRadius: 'var(--dz-radius-card)', border: '1px solid var(--dz-borde)' }}
        >
          <h2
            className="mb-5"
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h2)', color: 'var(--dz-ink)', fontSize: 'var(--dz-text-h2)', lineHeight: 'var(--dz-leading-h2)' }}
          >
            Preguntas frecuentes sobre {nombre}
          </h2>
          <FAQAccordionPedraEOuro faqs={faqsMapped} />
        </motion.div>

      </div>

      {/* ── OTRAS CIUDADES ── */}
      {(() => {
        const otras = TODAS_LAS_CIUDADES.filter(c => c.slug !== slug)
        return (
          <section className="px-6 md:px-8 py-[var(--dz-section-y)]" style={{ backgroundColor: 'var(--dz-papel)' }}>
            <div className="max-w-7xl mx-auto">
              <h2
                className="text-[10px] tracking-widest uppercase mb-5"
                style={{ fontFamily: 'var(--font-dz-ui)', fontWeight: 700, color: 'var(--dz-accent-text)' }}
              >
                Otras ciudades
              </h2>
              <div ref={otrasCiudadesRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {otras.map(ciudad => (
                  <div key={ciudad.slug} className="otra-ciudad-card">
                  <Link
                    href={`/ciudades/${ciudad.slug}`}
                    onMouseEnter={() => prefetchCiudadVideo(ciudad.slug)}
                    onTouchStart={() => prefetchCiudadVideo(ciudad.slug)}
                    className="group block overflow-hidden relative transition-brand hover:-translate-y-1"
                    style={{ aspectRatio: '4/3', borderRadius: 'var(--dz-radius-card)' }}
                  >
                    <Image
                      src={ciudad.imagen}
                      alt={ciudad.nombre}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {/* Overlay inferior */}
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 55%)' }}
                      aria-hidden="true"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p
                        className="text-white font-normal leading-tight"
                        style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)' }}
                      >
                        {ciudad.nombre}
                      </p>
                    </div>
                  </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })()}
    </>
  )
}

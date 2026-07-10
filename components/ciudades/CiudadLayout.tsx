'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FAQAccordionPedraEOuro } from '@/components/ciudades/FAQAccordionPedraEOuro'
import { ClimaActual } from '@/components/ciudad/ClimaActual'
import { VistaEnVivo } from '@/components/ciudad/VistaEnVivo'
import { faqSchema } from '@/lib/seo/schemas'
import { prefetchCiudadVideo } from '@/lib/ciudades/videoPrefetch'

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
        {/* Fondo: video con fallback a imagen */}
        <div className="absolute inset-0" aria-hidden="true">
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
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition }}
            aria-hidden="true"
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
        </div>

        {/* Contenido hero */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-5xl" style={{ paddingTop: '64px' }}>
          {/* Eyebrow pill */}
          <span
            className="inline-flex self-start items-center px-3 py-1 rounded-full mb-4 tracking-widest uppercase border"
            style={{
              fontFamily: 'var(--font-lato)',
              fontWeight: 700,
              fontSize: '10px',
              color: 'var(--po-ouro)',
              background: 'rgba(0,0,0,0.42)',
              borderColor: 'rgba(255,255,255,0.18)',
            }}
          >
            Tu Lugar en Galicia · {nombre}
          </span>

          {/* H1 */}
          <h1
            className="text-white font-normal leading-tight mb-3"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
          >
            {nombre}
          </h1>

          {/* Descripción corta */}
          <p
            className="text-white/80 text-sm md:text-base max-w-lg leading-relaxed mb-6"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {descripcionCorta}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={abrirGina}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm text-white uppercase tracking-wide transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{ fontFamily: 'var(--font-lato)', background: 'var(--po-ouro)', color: '#1A1410', borderRadius: '4px' }}
            >
              <span aria-hidden="true">✨</span> Hablar con Gina
            </button>
            <Link
              href="/conocernos"
              className="text-xs text-white/55 hover:text-white/80 transition-colors underline-offset-2 hover:underline"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              O completa el formulario
            </Link>
          </div>
        </div>
      </section>

      {/* ── CUERPO ── */}
      <div className="px-6 md:px-8 py-7 space-y-5 max-w-7xl mx-auto w-full" style={{ backgroundColor: 'var(--po-luz)' }}>

        {/* Fila 1: Descripción + Clima */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5">
          {/* Descripción larga */}
          <div className="p-6" style={{ backgroundColor: 'var(--po-areia)', borderRadius: '8px', border: '1px solid var(--po-borde)' }}>
            <h2
              className="text-[10px] tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
            >
              La ciudad
            </h2>
            <p className="text-sm leading-[1.75] mb-4" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}>
              {descripcionLarga}
            </p>
            <p className="text-sm leading-[1.75]" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}>
              {descripcionLarga2}
            </p>
          </div>

          {/* Clima */}
          <div>
            <ClimaActual slug={slug} />
          </div>
        </div>

        {/* Fila 2: Barrios / Alquileres / Video */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Barrios más buscados */}
          <div className="p-5" style={{ backgroundColor: 'var(--po-areia)', borderRadius: '8px' }}>
            <h2
              className="text-[10px] tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
            >
              Los barrios más buscados
            </h2>
            <ul className="space-y-0 divide-y" style={{ borderColor: 'var(--po-borde)' }}>
              {barrios.map((b, i) => (
                <li key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-semibold text-sm mb-0.5" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}>
                    {b.nombre}
                  </p>
                  <p className="text-xs leading-snug" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}>
                    {b.descripcion}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Alquileres orientativos */}
          <div className="p-5" style={{ backgroundColor: 'var(--po-areia)', borderRadius: '8px' }}>
            <h2
              className="text-[10px] tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
            >
              Alquileres orientativos · 2025
            </h2>
            <ul className="space-y-2">
              {alquileres.map((a, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center px-3 py-2"
                  style={{ backgroundColor: 'var(--po-luz)', borderRadius: '6px' }}
                >
                  <span className="text-xs" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}>
                    {a.habitaciones}
                  </span>
                  <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}>
                    {a.rango}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 leading-snug" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)', fontSize: '10px' }}>
              Orientativos. Varían según barrio y estado del inmueble.
            </p>
          </div>

          {/* Vista en vivo Windy */}
          <VistaEnVivo
            lat={vistaEnVivo.lat}
            lon={vistaEnVivo.lon}
            nombreCiudad={nombre}
            descripcionUbicacion={vistaEnVivo.descripcionUbicacion}
          />
        </div>

        {/* Fila 3: FAQ ancho completo */}
        <div className="p-6" style={{ backgroundColor: 'var(--po-areia)', borderRadius: '8px', border: '1px solid var(--po-borde)' }}>
          <h2
            className="text-2xl font-normal mb-5"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-pedra)' }}
          >
            Preguntas frecuentes sobre {nombre}
          </h2>
          <FAQAccordionPedraEOuro faqs={faqsMapped} />
        </div>

        {/* Fila 4: Guía de apps para recién llegados */}
        <div
          className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ backgroundColor: 'var(--po-areia)', borderRadius: '8px', border: '1px solid var(--po-borde)' }}
        >
          <div>
            <h2
              className="text-[10px] tracking-widest uppercase mb-2"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
            >
              Para tu llegada
            </h2>
            <p className="font-semibold text-sm mb-1" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}>
              ¿Ya tienes las apps que vas a necesitar desde el primer día?
            </p>
            <p className="text-xs leading-snug" style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}>
              Transporte, salud, banca y trámites — las apps esenciales para recién llegados en Galicia.
            </p>
          </div>
          <Link
            href="/apps-utiles"
            className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap shrink-0 px-4 py-2 transition-opacity hover:opacity-70"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-ouro-text)', border: '1px solid var(--po-ouro)', borderRadius: '999px' }}
          >
            Ver la guía →
          </Link>
        </div>

      </div>

      {/* ── OTRAS CIUDADES ── */}
      {(() => {
        const otras = TODAS_LAS_CIUDADES.filter(c => c.slug !== slug)
        return (
          <section className="px-6 md:px-8 py-7" style={{ backgroundColor: 'var(--po-areia)' }}>
            <div className="max-w-7xl mx-auto">
              <h2
                className="text-[10px] tracking-widest uppercase mb-5"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
              >
                Otras ciudades
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {otras.map(ciudad => (
                  <Link
                    key={ciudad.slug}
                    href={`/ciudades/${ciudad.slug}`}
                    onMouseEnter={() => prefetchCiudadVideo(ciudad.slug)}
                    onTouchStart={() => prefetchCiudadVideo(ciudad.slug)}
                    className="group block overflow-hidden relative"
                    style={{ aspectRatio: '4/3', borderRadius: '8px' }}
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
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)' }}
                      >
                        {ciudad.nombre}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      })()}
    </>
  )
}

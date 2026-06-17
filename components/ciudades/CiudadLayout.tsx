'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FAQAccordion } from '@/components/ciudades/FAQAccordion'
import { ClimaActual } from '@/components/ciudad/ClimaActual'
import { VistaEnVivo } from '@/components/ciudad/VistaEnVivo'
import { faqSchema } from '@/lib/seo/schemas'

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
        style={{ height: 'clamp(380px, 50vh, 520px)' }}
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
            poster={posterSrc}
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
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-5xl">
          {/* Eyebrow pill */}
          <span
            className="inline-flex self-start items-center px-3 py-1 rounded-full mb-4 font-[family-name:var(--font-mulish)] tracking-widest uppercase text-[var(--color-laton-claro)] border"
            style={{
              fontSize: '10px',
              background: 'rgba(0,0,0,0.42)',
              borderColor: 'rgba(255,255,255,0.18)',
            }}
          >
            Tu Lugar en Galicia · {nombre}
          </span>

          {/* H1 */}
          <h1
            className="font-[family-name:var(--font-cormorant)] text-white font-normal leading-tight mb-3"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
          >
            {nombre}
          </h1>

          {/* Descripción corta */}
          <p className="font-[family-name:var(--font-mulish)] text-white/80 text-sm md:text-base max-w-lg leading-relaxed mb-6">
            {descripcionCorta}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={abrirGina}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-[family-name:var(--font-mulish)] font-semibold text-sm text-white uppercase tracking-wide transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{ background: 'var(--color-laton)' }}
            >
              <span aria-hidden="true">✨</span> Hablar con Gina
            </button>
            <Link
              href="/conocernos"
              className="font-[family-name:var(--font-mulish)] text-xs text-white/55 hover:text-white/80 transition-colors underline-offset-2 hover:underline"
            >
              O completa el formulario
            </Link>
          </div>
        </div>
      </section>

      {/* ── CUERPO ── */}
      <div className="bg-white px-6 md:px-8 py-7 space-y-5 max-w-7xl mx-auto w-full">

        {/* Fila 1: Descripción + Clima */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5">
          {/* Descripción larga */}
          <div className="bg-white rounded-2xl border border-[var(--color-arena)] p-6">
            <p
              className="font-[family-name:var(--font-mulish)] text-[10px] tracking-widest uppercase text-[var(--color-laton)] mb-4"
            >
              La ciudad
            </p>
            <p className="font-[family-name:var(--font-mulish)] text-[var(--color-granito)] text-sm leading-[1.75] mb-4">
              {descripcionLarga}
            </p>
            <p className="font-[family-name:var(--font-mulish)] text-[var(--color-pizarra)] text-sm leading-[1.75]">
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
          <div className="bg-[var(--color-niebla)] rounded-2xl p-5">
            <p className="font-[family-name:var(--font-mulish)] text-[10px] tracking-widest uppercase text-[var(--color-laton)] mb-4">
              Los barrios más buscados
            </p>
            <ul className="space-y-0 divide-y divide-[var(--color-arena)]">
              {barrios.map((b, i) => (
                <li key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-[family-name:var(--font-mulish)] font-semibold text-sm text-[var(--color-granito)] mb-0.5">
                    {b.nombre}
                  </p>
                  <p className="font-[family-name:var(--font-mulish)] text-xs text-[var(--color-pizarra)] leading-snug">
                    {b.descripcion}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Alquileres orientativos */}
          <div className="bg-[var(--color-niebla)] rounded-2xl p-5">
            <p className="font-[family-name:var(--font-mulish)] text-[10px] tracking-widest uppercase text-[var(--color-laton)] mb-4">
              Alquileres orientativos · 2025
            </p>
            <ul className="space-y-2">
              {alquileres.map((a, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-white rounded-xl px-3 py-2"
                >
                  <span className="font-[family-name:var(--font-mulish)] text-xs text-[var(--color-pizarra)]">
                    {a.habitaciones}
                  </span>
                  <span className="font-[family-name:var(--font-mulish)] text-xs font-semibold text-[var(--color-granito)]">
                    {a.rango}
                  </span>
                </li>
              ))}
            </ul>
            <p className="font-[family-name:var(--font-mulish)] text-[var(--color-pizarra)] opacity-50 mt-3 leading-snug" style={{ fontSize: '10px' }}>
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
        <div className="bg-white rounded-2xl border border-[var(--color-arena)] p-6">
          <h2
            className="font-[family-name:var(--font-cormorant)] text-[var(--color-granito)] text-2xl font-normal mb-5"
          >
            Preguntas frecuentes sobre {nombre}
          </h2>
          <FAQAccordion faqs={faqsMapped} />
        </div>

      </div>

      {/* ── OTRAS CIUDADES ── */}
      {(() => {
        const otras = TODAS_LAS_CIUDADES.filter(c => c.slug !== slug)
        return (
          <section className="bg-[var(--color-niebla)] px-6 md:px-8 py-7">
            <div className="max-w-7xl mx-auto">
              <p className="font-[family-name:var(--font-mulish)] text-[10px] tracking-widest uppercase text-[var(--color-laton)] mb-5">
                Otras ciudades
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {otras.map(ciudad => (
                  <Link
                    key={ciudad.slug}
                    href={`/ciudades/${ciudad.slug}`}
                    className="group block rounded-xl overflow-hidden relative"
                    style={{ aspectRatio: '4/3' }}
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
                        className="font-[family-name:var(--font-cormorant)] text-white font-normal leading-tight"
                        style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)' }}
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

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FAQAccordion } from '@/components/ciudades/FAQAccordion'
import { ClimaActual } from '@/components/ciudad/ClimaActual'
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
}

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
            sizes="100vw"
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={posterSrc}
            className="absolute inset-0 w-full h-full object-cover"
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

          {/* Video "en vivo" */}
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ background: '#0D1F1A', minHeight: '200px' }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-75"
              aria-hidden="true"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
            {/* Fallback si no hay video */}
            <Image
              src={posterSrc}
              alt=""
              fill
              className="object-cover opacity-50"
              aria-hidden="true"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Badge EN VIVO */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              <span className="font-[family-name:var(--font-mulish)] text-white text-[10px] tracking-widest uppercase font-semibold">
                En vivo
              </span>
            </div>
            {/* Label ubicación */}
            <div className="absolute bottom-3 left-3 z-10">
              <span className="font-[family-name:var(--font-mulish)] text-white/80 text-[10px] tracking-wide">
                {nombre}, Galicia
              </span>
            </div>
          </div>
        </div>

        {/* Fila 3: FAQ + CTA verde */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-5">
          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-[var(--color-arena)] p-6">
            <h2
              className="font-[family-name:var(--font-cormorant)] text-[var(--color-granito)] text-2xl font-normal mb-5"
            >
              Preguntas frecuentes sobre {nombre}
            </h2>
            <FAQAccordion faqs={faqsMapped} />
          </div>

          {/* CTA verde */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: 'var(--color-atlantico)' }}
          >
            <div>
              <h2
                className="font-[family-name:var(--font-cormorant)] text-white text-2xl font-normal leading-tight mb-3"
              >
                ¿{nombre} es tu destino?
              </h2>
              <p className="font-[family-name:var(--font-mulish)] text-white/70 text-sm leading-relaxed mb-6">
                Cuéntanos tu situación y te ayudamos a encontrar el barrio y el piso que necesitas. Sin costo, sin compromiso.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={abrirGina}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-[family-name:var(--font-mulish)] font-semibold text-sm text-white uppercase tracking-wide transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{ background: 'var(--color-laton)' }}
              >
                <span aria-hidden="true">✨</span> Hablar con Gina
              </button>
              <Link
                href="/conocernos"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full font-[family-name:var(--font-mulish)] text-sm text-white/80 border border-white/20 hover:bg-white/10 transition-colors"
              >
                O completa el formulario
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

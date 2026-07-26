'use client'

import Link from 'next/link'
import { Pause, Play } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useVideoPauseToggle } from '@/lib/hooks/useVideoPauseToggle'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { SparkleIcon } from '@/components/ui/SparkleIcon'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

const POSTER = "/images/home/hero-lanzada-poster.jpg"
const VIDEO  = "/videos/hero-lanzada.mp4"

// Titular kinético: cada palabra entra con fadeUp escalonado (staggerContainer,
// 70ms entre palabras) — reusa las variants de marca, no inventa timing nuevo.
const LINEA_1 = ["Tu", "nueva", "vida", "en", "Galicia"]
const LINEA_2 = ["empieza", "con", "una"]

function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

export function HeroPedraEOuro() {
  const { videoRef, isPlaying, toggle } = useVideoPauseToggle()
  const prefersReducedMotion = useReducedMotion()

  return (
    <>
    <style>{`
      .scroll-cue-line { position: relative; overflow: hidden; }
      .scroll-cue-line::after {
        content: ''; position: absolute; top: -100%; left: 0; width: 100%; height: 100%;
        background: var(--dz-accent); animation: heroScrollCue 1.8s ease-in-out infinite;
      }
      @keyframes heroScrollCue { 0% { top: -100%; } 60% { top: 100%; } 100% { top: 100%; } }
      @media (prefers-reduced-motion: reduce) {
        .scroll-cue-line::after { animation: none; top: 100%; }
      }
    `}</style>
    <section
      className="relative flex flex-col"
      // --dz-hero-bg en vez del #0B1012 hardcodeado que había: aquel era un negro
      // frío/azulado y el de la sección siguiente (ElMarcador) es cálido (#16140F).
      // Al quitar el degradado de la base del hero, ese salto de tono quedó a la
      // vista en la unión (auditoría 2026-07-25, I4).
      style={{ minHeight: '100svh', backgroundColor: 'var(--dz-hero-bg)' }}
      aria-labelledby="hero-po-heading"
    >
      {/* ── Capa de fondo: video + degradado esfumado ── */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER}
          preload="metadata"
          aria-hidden="true"
          // @ts-expect-error — fetchPriority es válido en HTML pero los tipos de React aún no lo tipan para <video>
          fetchPriority="high"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(.84) brightness(.92)",
          }}
        >
          <source src={VIDEO} type="video/mp4" />
        </video>

        {/* Sombreado esfumado lateral (desktop) / desde abajo (móvil) */}
        <div className="absolute inset-0 hero-lateral-gradient" style={{ pointerEvents: "none" }} />

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

      {/* ── Contenido principal — centrado vertical, alineado a la izquierda ── */}
      <div className="relative z-10 flex flex-1 items-center">
        <div
          className="animate-hero-content"
          style={{
            maxWidth: "1100px",
            paddingLeft: "clamp(28px, 7vw, 104px)",
            paddingRight: "clamp(20px, 4vw, 48px)",
            paddingTop: "clamp(48px, 6vw, 80px)",
            paddingBottom: "clamp(32px, 4vw, 56px)",
          }}
        >
          {/* Eyebrow — letter-spacing responsivo heredado de .hero-eyebrow (ver Eyebrow.tsx) */}
          <Eyebrow className="hero-eyebrow mb-5">
            Relocation especializado en Galicia
          </Eyebrow>

          {/* Titular — palabra por palabra, fadeUp escalonado (motion-tu-lugar-en-galicia) */}
          <motion.h1
            id="hero-po-heading"
            variants={staggerContainer}
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            style={{
              fontFamily: "var(--font-dz-display)",
              fontWeight: "var(--dz-weight-h1)",
              fontSize: "var(--dz-text-h1)",
              lineHeight: "var(--dz-leading-h1)",
              color: "#F7F4ED",
              marginBottom: "1.25rem",
              textShadow: "0 2px 12px rgba(0,0,0,0.7)",
            }}
          >
            {LINEA_1.map((palabra, i) => (
              <motion.span key={palabra} variants={fadeUp} style={{ display: "inline-block" }}>
                {palabra}
                {i < LINEA_1.length - 1 ? " " : ""}
              </motion.span>
            ))}
            <br />
            {LINEA_2.map((palabra) => (
              <motion.span key={palabra} variants={fadeUp} style={{ display: "inline-block" }}>
                {palabra}
                {" "}
              </motion.span>
            ))}
            <motion.em
              variants={fadeUp}
              style={{
                display: "inline-block",
                fontFamily: "var(--font-playfair)",
                fontStyle: "italic",
                color: "var(--dz-accent)",
                textShadow: "0 1px 8px rgba(0,0,0,0.5)",
              }}
            >
              puerta abierta...
            </motion.em>
          </motion.h1>

          {/* Línea dorada */}
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              maxWidth: "600px",
              height: "1px",
              backgroundColor: "var(--dz-accent)",
              opacity: 0.55,
              marginBottom: "1.25rem",
            }}
          />

          {/* Subtítulo */}
          <p
            style={{
              fontFamily: "var(--font-dz-ui)",
              fontWeight: 400,
              fontSize: "1.05rem",
              lineHeight: 1.78,
              color: "#e6e9e7",
              maxWidth: "600px",
              marginBottom: "2rem",
              textShadow: "0 2px 12px rgba(0,0,0,0.7)",
            }}
          >
            Gestionamos todo el proceso a distancia, con honestidad y criterio
            profesional, para que tu única tarea al llegar sea abrir tu puerta.
          </p>

          {/* Botón primario — abre el widget de Gina */}
          <Button
            type="button"
            onClick={abrirGina}
            size="lg"
            className="gap-2 mb-4"
            style={{ boxShadow: 'var(--dz-shadow-md)' }}
          >
            <SparkleIcon className="w-5 h-5 shrink-0" />
            Queremos conocerte
          </Button>

          {/* Enlace al formulario */}
          <p
            style={{
              fontFamily: "var(--font-dz-ui)",
              fontSize: "0.82rem",
              color: "#aab2af",
            }}
          >
            ¿Prefieres escribirlo?{" "}
            <Link
              href="/conocernos"
              style={{
                color: "#aab2af",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Completa el formulario
            </Link>
          </p>
        </div>
      </div>

      {/* Scroll-cue decorativo — pura indicación visual, no interactivo */}
      <div
        aria-hidden="true"
        className="absolute z-10 hidden flex-col items-center gap-2 md:flex"
        style={{ bottom: '1.6rem', right: '5vw', color: 'rgba(243,239,228,0.75)' }}
      >
        {/* 12px, no 0.7rem (11,2px): minimo legible (auditoria responsive 2026-07-26) */}
        <span style={{ fontFamily: 'var(--font-dz-ui)', fontSize: '12px', letterSpacing: '0.08em' }}>
          SCROLL
        </span>
        <span className="scroll-cue-line" style={{ width: '1px', height: '34px', background: 'rgba(243,239,228,0.5)' }} />
      </div>
    </section>
    </>
  )
}

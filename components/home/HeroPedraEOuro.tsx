'use client'

import Link from 'next/link'
import { Pause, Play } from 'lucide-react'
import { useVideoPauseToggle } from '@/lib/hooks/useVideoPauseToggle'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { SparkleIcon } from '@/components/ui/SparkleIcon'

const POSTER = "/images/home/hero-lanzada-poster.jpg"
const VIDEO  = "/videos/hero-lanzada.mp4"

function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

export function HeroPedraEOuro() {
  const { videoRef, isPlaying, toggle } = useVideoPauseToggle()

  return (
    <section
      className="relative flex flex-col"
      style={{ minHeight: '100svh', backgroundColor: '#0B1012' }}
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
          className="absolute bottom-4 right-4 z-10 flex items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--po-ouro)]"
          style={{
            width: '40px',
            height: '40px',
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: 'var(--color-sobre-laton)',
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

          {/* Titular */}
          <h1
            id="hero-po-heading"
            style={{
              fontFamily: "var(--font-playfair)",
              fontWeight: 900,
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
              lineHeight: 1.15,
              color: "#F7F4ED",
              marginBottom: "1.25rem",
              textShadow: "0 2px 12px rgba(0,0,0,0.7)",
            }}
          >
            Tu nueva vida en Galicia<br />empieza con una{" "}
            <em style={{ fontStyle: "italic", color: "var(--po-ouro)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
              puerta abierta...
            </em>
          </h1>

          {/* Línea dorada */}
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              maxWidth: "600px",
              height: "1px",
              backgroundColor: "var(--po-ouro)",
              opacity: 0.55,
              marginBottom: "1.25rem",
            }}
          />

          {/* Subtítulo */}
          <p
            style={{
              fontFamily: "var(--font-lato)",
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
            style={{ boxShadow: 'var(--po-shadow-md)' }}
          >
            <SparkleIcon className="w-5 h-5 shrink-0" />
            Cuéntale tu caso a Gina
          </Button>

          {/* Enlace al formulario */}
          <p
            style={{
              fontFamily: "var(--font-lato)",
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
    </section>
  )
}

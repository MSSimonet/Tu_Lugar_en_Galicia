'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const POSTER = "/images/home/hero-lanzada-poster.jpg"
const VIDEO  = "/videos/hero-lanzada.mp4"

const STATS = [
  { value: "+200", label: "familias" },
  { value: "57",   label: "en 2025" },
  { value: "4",    label: "años" },
] as const

function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

export function Hero() {
  const [paused, setPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePause = () => {
    const v = videoRef.current
    if (!v) return
    if (paused) { v.play().catch(() => undefined); setPaused(false) }
    else { v.pause(); setPaused(true) }
  }

  return (
    <section
      className="relative flex flex-col"
      style={{ minHeight: '100svh', backgroundColor: '#0B1012' }}
      aria-labelledby="hero-heading"
    >
      {/* ── Capa de fondo: video + degradado esfumado ── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER}
          preload="metadata"
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
      </div>

      {/* Botón pausa/reproducción del vídeo de fondo */}
      <button
        type="button"
        onClick={togglePause}
        aria-label={paused ? 'Reproducir vídeo de fondo' : 'Pausar vídeo de fondo'}
        className="absolute bottom-[4.5rem] right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton-claro)]"
        style={{
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#e6e9e7',
        }}
      >
        {paused ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        )}
      </button>

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
          {/* Eyebrow — píldora semitransparente; letter-spacing responsivo vía .hero-eyebrow */}
          <p
            className="hero-eyebrow"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-ui)",
              fontWeight: 500,
              fontSize: "12px",
              textTransform: "uppercase",
              color: "var(--color-laton-claro)",
              background: "rgba(0,0,0,0.45)",
              borderRadius: "999px",
              padding: "4px 12px",
              marginBottom: "1.25rem",
              textShadow: "0 1px 4px rgba(0,0,0,0.60)",
            }}
          >
            Relocation especializado en Galicia
          </p>

          {/* Titular */}
          <h1
            id="hero-heading"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 400,
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
              lineHeight: 1.15,
              color: "#F7F4ED",
              marginBottom: "1.25rem",
              textShadow: "0 2px 12px rgba(0,0,0,0.7)",
            }}
          >
            Tu nueva vida en Galicia<br />empieza con una{" "}
            <em style={{ fontStyle: "italic", color: "var(--color-laton-claro)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
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
              backgroundColor: "var(--color-laton-borde)",
              marginBottom: "1.25rem",
            }}
          />

          {/* Subtítulo */}
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 300,
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
          <button
            type="button"
            onClick={abrirGina}
            className="inline-flex items-center gap-2 rounded-full transition-brand cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-laton-claro)]"
            style={{
              background: "linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)",
              color: "var(--color-laton-claro)",
              paddingLeft: "1rem",
              paddingRight: "1.25rem",
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              fontSize: "0.9375rem",
              letterSpacing: "0.04em",
              border: "1px solid rgba(230, 193, 88, 0.4)",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(230,193,88,0.15), 0 0 16px rgba(230,193,88,0.12)",
              marginBottom: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(230,193,88,0.25), 0 0 20px rgba(230,193,88,0.2)"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(230,193,88,0.15), 0 0 16px rgba(230,193,88,0.12)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            Cuéntale tu caso a Gina
          </button>

          {/* Enlace al formulario */}
          <p
            style={{
              fontFamily: "var(--font-ui)",
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

      {/* ── Fila de datos — anclada al pie del hero ── */}
      <div
        className="relative z-10"
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          padding:
            "clamp(14px, 2.2vw, 22px) clamp(28px, 7vw, 104px)",
        }}
      >
        <dl className="flex gap-[clamp(28px,5vw,72px)]">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <dt
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontWeight: 500,
                  fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
                  color: "var(--color-laton-claro)",
                  lineHeight: 1.1,
                }}
              >
                {value}
              </dt>
              <dd
                style={{
                  fontFamily: "var(--font-ui)",
                  fontWeight: 500,
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#a4ada9",
                  marginTop: "0.2rem",
                }}
              >
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

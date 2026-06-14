'use client'

import Link from 'next/link'

const POSTER = "/images/home/hero-lanzada-poster.jpg"
const VIDEO  = "/videos/hero-lanzada.mp4"

const STATS = [
  { value: "+200", label: "familias" },
  { value: "5",    label: "ciudades" },
  { value: "4",    label: "años" },
] as const

function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

export function Hero() {
  return (
    <section
      className="relative flex flex-col"
      style={{ minHeight: '100svh' }}
      aria-labelledby="hero-heading"
    >
      {/* ── Capa de fondo: video + degradado esfumado ── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER}
          preload="none"
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

      {/* ── Contenido principal — centrado vertical, alineado a la izquierda ── */}
      <div className="relative z-10 flex flex-1 items-center">
        <div
          className="animate-hero-content"
          style={{
            maxWidth: "560px",
            paddingLeft: "clamp(28px, 7vw, 104px)",
            paddingRight: "clamp(20px, 4vw, 48px)",
            paddingTop: "clamp(48px, 6vw, 80px)",
            paddingBottom: "clamp(32px, 4vw, 56px)",
          }}
        >
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: "var(--font-mulish)",
              fontWeight: 500,
              fontSize: "12px",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#D4B873",
              marginBottom: "1.25rem",
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
              fontSize: "clamp(2.5rem, 4.6vw, 4.1rem)",
              lineHeight: 1.15,
              color: "#F7F4ED",
              marginBottom: "1.25rem",
            }}
          >
            Tu nueva vida en Galicia empieza con una{" "}
            <em style={{ fontStyle: "italic", color: "#E7D29C" }}>
              puerta abierta...
            </em>
          </h1>

          {/* Línea dorada */}
          <div
            aria-hidden="true"
            style={{
              width: "46px",
              height: "1px",
              backgroundColor: "#C9A961",
              marginBottom: "1.25rem",
            }}
          />

          {/* Subtítulo */}
          <p
            style={{
              fontFamily: "var(--font-mulish)",
              fontWeight: 300,
              lineHeight: 1.78,
              color: "#e6e9e7",
              maxWidth: "40ch",
              marginBottom: "2rem",
            }}
          >
            Gestionamos todo el proceso a distancia, con honestidad y criterio
            profesional, para que tu única tarea al llegar sea abrir tu puerta.
          </p>

          {/* Botón primario — abre el widget de Gina */}
          <button
            type="button"
            onClick={abrirGina}
            className="transition-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E7D29C]"
            style={{
              display: "inline-block",
              backgroundColor: "#C9A961",
              color: "#15130b",
              borderRadius: "2px",
              padding: "0.875rem 2rem",
              fontFamily: "var(--font-mulish)",
              fontWeight: 600,
              fontSize: "0.9375rem",
              letterSpacing: "0.04em",
              cursor: "pointer",
              border: "none",
              marginBottom: "1rem",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E7D29C" }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#C9A961" }}
          >
            Cuéntale tu caso a Gina
          </button>

          {/* Enlace al formulario */}
          <p
            style={{
              fontFamily: "var(--font-mulish)",
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
                  color: "#E7D29C",
                  lineHeight: 1.1,
                }}
              >
                {value}
              </dt>
              <dd
                style={{
                  fontFamily: "var(--font-mulish)",
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

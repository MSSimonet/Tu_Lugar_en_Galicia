'use client'

import { useState, useEffect, useRef } from 'react'

const INTERVAL_MS = 4200

const data = [
  {
    num: '01', dur: '48 hs hábiles',
    title: 'Cuéntanos tu caso',
    desc: 'Nos cuentas tu situación y te devolvemos un Plan Estratégico sin compromiso.',
    src: '/images/ciudades/tag_coruna.jpg',
  },
  {
    num: '02', dur: '45–60 min',
    title: 'Agendamos una videollamada',
    desc: 'Agendamos una videollamada con nuestro equipo que te escuchará y te explicará el proceso completo. Sin letra chica.',
    src: '/images/ciudades/tag_santiago.jpg',
  },
  {
    num: '03', dur: '1–3 semanas',
    title: 'Buscamos activamente',
    desc: 'Recorremos el mercado completo y te presentamos opciones reales y filtradas.',
    src: '/images/ciudades/tag_pontevedra.jpg',
  },
  {
    num: '04', dur: 'A distancia',
    title: 'Negociamos y cerramos',
    desc: 'Negociamos con el propietario y gestionamos la firma desde donde estés.',
    src: '/images/ciudades/tag_lugo.jpg',
  },
  {
    num: '05', dur: 'Día de llegada',
    title: 'Llegas y abres tu puerta',
    desc: 'Nuestro equipo te espera en Galicia y te acompaña en tu primer día.',
    src: '/images/ciudades/tag_coruna2.jpg',
  },
]

export default function ComoFuncionaStepper() {
  const [selected, setSelected] = useState(0)
  const [hovered,  setHovered]  = useState<number | null>(null)
  const active = hovered ?? selected

  const selectedRef = useRef(0)
  const pausedRef   = useRef(false)

  useEffect(() => {
    // Con reduced-motion activo no se auto-avanza: el crossfade de imágenes cada 4,2s
    // es exactamente el tipo de movimiento que esa preferencia pide evitar (A3.3).
    // La navegación manual (click en cada paso) sigue funcionando igual.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (!pausedRef.current) {
        const next = (selectedRef.current + 1) % data.length
        selectedRef.current = next
        setSelected(next)
      }
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  function pick(i: number) {
    selectedRef.current = i
    setSelected(i)
    pausedRef.current = true
    setTimeout(() => { pausedRef.current = false }, 8000)
  }

  return (
    <>
    <style>{`
      @media (max-width: 767px) {
        .stepper-image-col { display: none !important; }
        .stepper-content-col { padding: 48px 24px 40px !important; }
        /* En pantallas angostas, una sola línea a tamaño legible no entra —
           se prefiere que ajuste en 2 líneas a que se corte en silencio. */
        .cf-subtitle { white-space: normal !important; }
        /* Altura natural en mobile: con el alto fijo + overflow hidden, el paso 05
           quedaba cortado e inaccesible en 375×812 (auditoría 2026-07-19, A1.1). */
        .stepper-wrapper { height: auto !important; overflow: visible !important; }
      }
    `}</style>
    <div
      className="stepper-wrapper"
      style={{
        display: 'flex',
        height: 'calc(100vh - 68px)',
        overflow: 'hidden',
      }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false; setHovered(null) }}
    >

      {/* ── Columna izquierda (47%) — imagen ─────────────────────── */}
      <div className="stepper-image-col" style={{
        width: '47%',
        flexShrink: 0,
        position: 'relative',
        background: 'var(--dz-hero-bg)',
        overflow: 'hidden',
        alignSelf: 'stretch',
      }}>

        {/* 5 imágenes apiladas con crossfade */}
        {data.map((d, i) => (
          <div
            key={i}
            aria-hidden={i !== active}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${d.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === active ? 1 : 0,
              transition: 'opacity 0.85s ease',
              transform: 'scale(0.90)',
              transformOrigin: 'center center',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          />
        ))}

      </div>

      {/* ── Columna derecha (53%) — contenido ───────────────────── */}
      <div className="stepper-content-col" style={{
        flex: 1,
        minWidth: 0,
        background: 'var(--dz-luz)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 44px 0',
        paddingBottom: '24px',
      }}>

        {/* Encabezado */}
        <div style={{ flexShrink: 0, marginBottom: '12px' }}>
          <p style={{
            fontFamily: 'var(--font-dz-ui)',
            fontWeight: 700,
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--dz-accent-text)',
            margin: '0 0 6px',
          }}>
            Cómo funciona
          </p>

          <h1 style={{
            fontFamily: 'var(--font-dz-display)',
            fontWeight: 900,
            fontSize: 'clamp(24px, 3vw, 40px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--dz-ink)',
            margin: '0 0 6px',
          }}>
            Tu hogar en Galicia{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--dz-accent-text)' }}>
              ya existe.
            </em>
            <br />
            Vamos a encontrarlo.
          </h1>

          <p className="cf-subtitle" style={{
            fontFamily: 'var(--font-dz-ui)',
            fontSize: 'clamp(10px, 1.4vw, 13px)',
            color: 'var(--dz-muted)',
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: 'nowrap',
          }}>
            Un acompañamiento cercano y a medida, del primer mensaje al día en que abres tu puerta.
          </p>
        </div>

        {/* Divisor */}
        <div style={{ height: '1px', background: 'var(--dz-borde)', flexShrink: 0, marginBottom: '4px' }} />

        {/* 5 filas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {data.map((d, i) => {
            const isAct = i === active
            return (
              // Outline con offset negativo: la fila ocupa todo el ancho y el wrapper
              // desktop tiene overflow hidden — un outline exterior se recortaría.
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                aria-pressed={i === selected}
                className="focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--dz-accent)]"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  width: '100%',
                  border: 'none',
                  borderTop: '1px solid var(--dz-borde)',
                  paddingLeft: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  background: isAct ? 'color-mix(in srgb, var(--dz-accent) 8%, transparent)' : 'transparent',
                  transition: 'background .3s ease',
                  textAlign: 'left',
                  font: 'inherit',
                }}
              >
                {/* Barra izquierda dorada */}
                <div style={{
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  width: '3px',
                  background: isAct ? 'var(--dz-accent)' : 'transparent',
                  transition: 'background .3s ease',
                }} />

                {/* Número italic */}
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--font-dz-display)',
                    fontStyle: 'italic',
                    fontSize: '28px',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: isAct ? 'var(--dz-accent-text)' : 'var(--dz-muted)',
                    minWidth: '48px',
                    flexShrink: 0,
                    transition: 'color .3s ease',
                    userSelect: 'none',
                  }}
                >
                  {d.num}
                </span>

                {/* Nombre + descripción */}
                <div style={{ flex: 1, minWidth: 0, padding: '6px 0' }}>
                  <div style={{
                    fontFamily: 'var(--font-dz-display)',
                    fontSize: '18px',
                    fontWeight: isAct ? 700 : 500,
                    lineHeight: 1.2,
                    color: isAct ? 'var(--dz-ink)' : 'var(--dz-muted)',
                    transition: 'color .3s ease',
                  }}>
                    {d.title}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dz-ui)',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'var(--dz-muted)',
                    marginTop: '3px',
                    transition: 'color .3s ease',
                  }}>
                    {d.desc}
                  </div>
                </div>

              </button>
            )
          })}
          {/* Borde inferior de la última fila */}
          <div style={{ height: '1px', background: 'var(--dz-borde)', flexShrink: 0 }} />
        </div>

      </div>
    </div>
    </>
  )
}

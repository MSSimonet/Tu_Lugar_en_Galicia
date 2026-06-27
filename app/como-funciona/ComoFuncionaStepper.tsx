'use client'

import { useState, useEffect, useRef } from 'react'

const INTERVAL_MS = 4200

const data = [
  {
    num: '01', dur: '48 hs hábiles',
    title: 'Cuéntanos tu caso',
    desc: 'Nos cuentas tu situación y te devolvemos un primer diagnóstico sin compromiso.',
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
      }
    `}</style>
    <div
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
        background: '#1A1B1E',
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
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          />
        ))}

      </div>

      {/* ── Columna derecha (53%) — contenido ───────────────────── */}
      <div className="stepper-content-col" style={{
        flex: 1,
        minWidth: 0,
        background: 'var(--color-niebla)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 44px 0',
        paddingBottom: '24px',
      }}>

        {/* Encabezado */}
        <div style={{ flexShrink: 0, marginBottom: '12px' }}>
          <p style={{
            fontFamily: 'var(--font-mulish), sans-serif',
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-laton)',
            margin: '0 0 6px',
          }}>
            Cómo funciona
          </p>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400,
            fontSize: 'clamp(24px, 3vw, 40px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--color-granito)',
            margin: '0 0 6px',
          }}>
            Tu hogar en Galicia{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 500, color: '#8F722B' }}>
              ya existe.
            </em>
            <br />
            Vamos a encontrarlo.
          </h1>

          <p style={{
            fontFamily: 'var(--font-mulish), sans-serif',
            fontSize: '12px',
            color: 'var(--color-pizarra)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '361px',
          }}>
            Un acompañamiento cercano y a medida, del primer mensaje al día en que abres tu puerta.
          </p>
        </div>

        {/* Divisor */}
        <div style={{ height: '1px', background: 'var(--color-arena)', flexShrink: 0, marginBottom: '4px' }} />

        {/* 5 filas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {data.map((d, i) => {
            const isAct = i === active
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                aria-pressed={i === selected}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  border: 'none',
                  borderTop: '1px solid var(--color-arena)',
                  paddingLeft: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  background: isAct ? 'rgba(143,114,43,0.05)' : 'transparent',
                  transition: 'background .3s ease',
                  textAlign: 'left',
                  font: 'inherit',
                }}
              >
                {/* Barra izquierda brass */}
                <div style={{
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  width: '3px',
                  background: isAct ? '#8F722B' : 'transparent',
                  transition: 'background .3s ease',
                }} />

                {/* Número italic */}
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontSize: '28px',
                    fontWeight: 400,
                    lineHeight: 1,
                    color: isAct ? '#8F722B' : '#8A6F2E',
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
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '18px',
                    fontWeight: isAct ? 600 : 500,
                    lineHeight: 1.2,
                    color: isAct ? 'var(--color-granito)' : 'var(--color-pizarra)',
                    transition: 'color .3s ease',
                  }}>
                    {d.title}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mulish), sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'var(--color-pizarra)',
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
          <div style={{ height: '1px', background: 'var(--color-arena)', flexShrink: 0 }} />
        </div>

      </div>
    </div>
    </>
  )
}

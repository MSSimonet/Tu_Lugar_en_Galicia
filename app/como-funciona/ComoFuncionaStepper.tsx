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
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        height: 'auto',
        overflow: 'hidden',
      }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false; setHovered(null) }}
    >

      {/* ── Columna izquierda (47%) — imagen ─────────────────────── */}
      <div style={{
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
            }}
          />
        ))}

      </div>

      {/* ── Columna derecha (53%) — contenido ───────────────────── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        background: '#EFEADE',
        display: 'flex',
        flexDirection: 'column',
        padding: '80px 56px 0',
        paddingBottom: '48px',
      }}>

        {/* Encabezado */}
        <div style={{ flexShrink: 0, marginBottom: '28px' }}>
          <p style={{
            fontFamily: 'var(--font-mulish), sans-serif',
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#8F722B',
            margin: '0 0 14px',
          }}>
            Cómo funciona
          </p>

          <h1 style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 600,
            fontSize: 'clamp(2rem, 3.5vw, 50px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#1B2A24',
            margin: '0 0 14px',
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
            fontSize: '15px',
            color: 'rgba(42,43,46,0.85)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '380px',
          }}>
            Un acompañamiento cercano y a medida, del primer mensaje al día en que abres tu puerta.
          </p>
        </div>

        {/* Divisor */}
        <div style={{ height: '1px', background: '#D4C9B8', flexShrink: 0, marginBottom: '4px' }} />

        {/* 5 filas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {data.map((d, i) => {
            const isAct = i === active
            return (
              <div
                key={i}
                onClick={() => pick(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                role="button"
                tabIndex={0}
                aria-pressed={i === selected}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pick(i) }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderTop: '1px solid #D4C9B8',
                  paddingLeft: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  outline: 'none',
                  background: isAct ? 'rgba(143,114,43,0.05)' : 'transparent',
                  transition: 'background .3s ease',
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
                    fontSize: '38px',
                    fontWeight: 400,
                    lineHeight: 1,
                    color: isAct ? '#8F722B' : '#C4A45A',
                    minWidth: '56px',
                    flexShrink: 0,
                    transition: 'color .3s ease',
                    userSelect: 'none',
                  }}
                >
                  {d.num}
                </span>

                {/* Nombre + descripción */}
                <div style={{ flex: 1, minWidth: 0, padding: '10px 0' }}>
                  <div style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '19px',
                    fontWeight: isAct ? 600 : 500,
                    lineHeight: 1.2,
                    color: isAct ? '#1B2A24' : '#3A3530',
                    transition: 'color .3s ease',
                  }}>
                    {d.title}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mulish), sans-serif',
                    fontSize: '15px',
                    lineHeight: 1.55,
                    color: isAct ? 'rgba(42,43,46,0.85)' : 'rgba(42,43,46,0.62)',
                    marginTop: '3px',
                    transition: 'color .3s ease',
                  }}>
                    {d.desc}
                  </div>
                </div>

              </div>
            )
          })}
          {/* Borde inferior de la última fila */}
          <div style={{ height: '1px', background: '#D4C9B8', flexShrink: 0 }} />
        </div>

      </div>
    </div>
  )
}

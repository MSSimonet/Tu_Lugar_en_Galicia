'use client'

import { useState } from 'react'

const pasos = [
  {
    numero: '01',
    tiempo: '48 horas hábiles',
    nombre: 'Cuéntanos tu caso',
    texto:
      'Completás el formulario con tu situación real — dónde estás, cuándo pensás viajar, qué documentación tenés. Silvana lo lee personalmente y evalúa si puede ayudarte. No todos los casos son viables de entrada, y preferimos decirte la verdad desde el principio.',
  },
  {
    numero: '02',
    tiempo: '45–60 minutos',
    nombre: 'Nos conocemos en persona',
    texto:
      'Videollamada con Silvana. Te escucha, te hace las preguntas necesarias y te explica exactamente cómo funciona el proceso, qué vas a conseguir y cuánto cuesta el servicio. No hay letra chica. Esta llamada es el cimiento de todo lo que viene.',
  },
  {
    numero: '03',
    tiempo: '1–3 semanas · El corazón del servicio',
    nombre: 'Buscamos activamente',
    texto:
      'Recorremos el mercado completo — agencias, particulares, grupos privados — y te presentamos las opciones reales que encajan con tu perfil. Vos decidís cuál es tu casa. Nosotros nos encargamos de que esa opción exista.',
  },
  {
    numero: '04',
    tiempo: 'A distancia',
    nombre: 'Negociamos y cerramos',
    texto:
      'Cuando encontrás el piso, gestionamos la negociación con el propietario y el proceso de firma. Firmás el contrato desde tu país, antes de volar. Tu casa ya está esperándote cuando llegues.',
  },
  {
    numero: '05',
    tiempo: 'Día de llegada',
    nombre: 'Llegás y abrís tu puerta',
    texto:
      'Silvana te espera en Galicia. Te acompaña el primer día, te muestra el barrio y te deja instalada. Tu única tarea en todo este proceso fue hacer las valijas.',
  },
] as const

const noSomos = [
  {
    titulo: 'No somos una inmobiliaria',
    texto: 'Trabajamos para vos, no para el propietario.',
  },
  {
    titulo: 'No cobramos al propietario',
    texto: 'Sin conflicto de interés, sin carteras propias.',
  },
  {
    titulo: 'No garantizamos el contrato',
    texto: 'Garantizamos la búsqueda y el acompañamiento.',
  },
] as const

function ChevronIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 300ms ease',
        flexShrink: 0,
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function Acordeon() {
  const [pasoAbierto, setPasoAbierto] = useState<number | null>(0)

  function togglePaso(i: number) {
    setPasoAbierto((prev) => (prev === i ? null : i))
  }

  return (
    <section style={{ background: '#2A2B2E', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding: '2.5rem 2rem', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: '#8F722B',
          marginBottom: '0.7rem',
        }}>
          Cómo funciona
        </p>
        <h2 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '2rem',
          fontWeight: 400,
          color: 'white',
          lineHeight: 1.2,
          marginTop: 0,
          marginBottom: '0.65rem',
        }}>
          Cinco pasos para que tu familia llegue a casa.
        </h2>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.84rem',
          color: 'rgba(255,255,255,0.45)',
          maxWidth: '420px',
          lineHeight: 1.6,
          margin: 0,
        }}>
          Todo el proceso lo gestionamos a distancia. Tu única tarea al llegar es abrir la puerta.
        </p>
      </div>

      {/* ── Pasos ── */}
      <div>
        {pasos.map((paso, i) => {
          const isOpen = pasoAbierto === i
          const stepId = `paso-body-${paso.numero}`
          const btnId = `paso-btn-${paso.numero}`

          return (
            <div
              key={paso.numero}
              style={{
                borderBottom: '0.5px solid rgba(255,255,255,0.1)',
                background: isOpen ? 'rgba(143,114,43,0.12)' : 'transparent',
                transition: 'background 300ms ease',
              }}
            >
              {/* Header del paso */}
              <button
                id={btnId}
                type="button"
                onClick={() => togglePaso(i)}
                aria-expanded={isOpen}
                aria-controls={stepId}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem 2rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '1rem',
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) (e.currentTarget.parentElement as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) (e.currentTarget.parentElement as HTMLElement).style.background = 'transparent'
                }}
              >
                {/* Izquierda: número + tiempo + título */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '2.2rem',
                      fontWeight: 400,
                      minWidth: '60px',
                      lineHeight: 1,
                      color: isOpen ? '#D4B96A' : 'rgba(255,255,255,0.15)',
                      transition: 'color 300ms ease',
                      userSelect: 'none',
                    }}
                  >
                    {paso.numero}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'rgba(255,255,255,0.4)',
                      margin: '0 0 0.2rem',
                    }}>
                      {paso.tiempo}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.2rem',
                      fontWeight: 400,
                      color: 'white',
                      margin: 0,
                    }}>
                      {paso.nombre}
                    </p>
                  </div>
                </div>

                {/* Derecha: chevron */}
                <span style={{
                  color: isOpen ? '#D4B96A' : 'rgba(255,255,255,0.3)',
                  transition: 'color 300ms ease',
                  flexShrink: 0,
                }}>
                  <ChevronIcon rotated={isOpen} />
                </span>
              </button>

              {/* Body expandible */}
              <div
                id={stepId}
                role="region"
                aria-labelledby={btnId}
                style={{
                  maxHeight: isOpen ? '300px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 400ms ease',
                }}
              >
                <div style={{
                  padding: isOpen ? '0 2rem 1.75rem' : '0 2rem 0',
                  transition: 'padding 300ms ease',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: 1.8,
                    margin: 0,
                    borderLeft: '2px solid #8F722B',
                    paddingLeft: '1.25rem',
                  }}>
                    {paso.texto}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Lo que no somos ── */}
      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '1.5rem 2rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.25rem]">
          {noSomos.map((item) => (
            <div key={item.titulo} style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.3)',
                  marginTop: '3px',
                  lineHeight: 1.35,
                }}
              >
                ✕
              </span>
              <div>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.7)',
                  margin: '0 0 0.2rem',
                }}>
                  {item.titulo}
                </p>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {item.texto}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

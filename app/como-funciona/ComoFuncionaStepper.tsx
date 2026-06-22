'use client'

import { useState, useEffect, useRef } from 'react'

const INTERVAL_MS = 3900

const INK        = '#1F2D27'
const BONE       = '#F4F0E6'
const BRASS      = '#A8843E'
const BRASS_DARK = '#7A5F22'
const MUTED      = '#5C5A4E'
const TRACK      = 'rgba(31,45,39,0.13)'
const terra      = '#BB5A38'
const teal       = '#1A5247'

const data = [
  {
    num: '01', dur: '48 hs hábiles',
    title: 'Cuéntanos tu caso',
    desc: 'Nos contás tu situación y te devolvemos un primer diagnóstico personalizado.',
    accent: BRASS, tag: '',
    src: '/images/ciudades/tag_coruna.jpg',
  },
  {
    num: '02', dur: '45–60 min',
    title: 'Agendamos una video llamada',
    desc: 'Una reunión para entender a tu familia y trazar juntos el plan a medida.',
    accent: BRASS, tag: '',
    src: '/images/ciudades/tag_santiago.jpg',
  },
  {
    num: '03', dur: '1–3 semanas',
    title: 'Buscamos activamente',
    desc: 'Recorremos el terreno y filtramos opciones reales por vos. Acá sucede todo.',
    accent: terra, tag: 'El corazón del servicio',
    src: '/images/ciudades/tag_lugo.jpg',
  },
  {
    num: '04', dur: 'A distancia',
    title: 'Negociamos y cerramos',
    desc: 'Gestionamos la negociación, los papeles y el contrato sin que tengas que viajar.',
    accent: BRASS, tag: '',
    src: '/images/ciudades/tag_pontevedra.jpg',
  },
  {
    num: '05', dur: 'Día de llegada',
    title: 'Llegás y abrís tu puerta',
    desc: 'Te recibimos en Galicia con las llaves y tu nuevo hogar listo para vivirlo.',
    accent: teal, tag: 'La llegada',
    src: '/images/ciudades/tag_coruna2.jpg',
  },
]

interface ComoFuncionaStepperProps {
  isFirstSection?: boolean
}

export default function ComoFuncionaStepper({ isFirstSection = true }: ComoFuncionaStepperProps) {
  const [active, setActive] = useState(0)
  const [frac,   setFrac]   = useState(0)

  const activeRef     = useRef(0)
  const fracRef       = useRef(0)
  const pausedRef     = useRef(false)
  const cycleStartRef = useRef(0)
  const rafRef        = useRef<number | null>(null)

  useEffect(() => {
    cycleStartRef.current = performance.now()

    function tick(now: number) {
      if (pausedRef.current) {
        cycleStartRef.current = now - fracRef.current * INTERVAL_MS
      } else {
        const f = (now - cycleStartRef.current) / INTERVAL_MS
        if (f >= 1) {
          cycleStartRef.current = now
          const next = (activeRef.current + 1) % data.length
          activeRef.current = next
          fracRef.current   = 0
          setActive(next)
          setFrac(0)
        } else if (Math.abs(f - fracRef.current) > 0.004) {
          fracRef.current = f
          setFrac(f)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [])

  function pick(i: number) {
    cycleStartRef.current = performance.now()
    activeRef.current     = i
    fracRef.current       = 0
    setActive(i)
    setFrac(0)
  }

  const p     = active + frac
  const clamp = (v: number) => Math.max(0, Math.min(1, v))

  const lineBase: React.CSSProperties = {
    width: '2px', flex: '1 1 0%', minHeight: '12px',
    background: TRACK, position: 'relative', overflow: 'hidden', borderRadius: '2px',
  }
  const fillBase: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, width: '100%',
    background: BRASS, transition: 'height .14s linear',
  }

  const ptDesktop = isFirstSection ? 'calc(64px + 60px)' : '60px'

  const css = `
    .clmf-stepper {
      --clmf-pt: ${ptDesktop};
      --clmf-px: 60px;
      --clmf-pb: 64px;
      --clmf-h2-size: 76px;
      --clmf-header-cols: 1fr 1fr;
      --clmf-header-gap: 64px;
      --clmf-content-cols: 1.55fr 1fr;
      --clmf-content-gap: 56px;
      --clmf-stage-h: min(calc((100vw - 176px) * 0.456), 480px);
      --clmf-desc-display: flex;
      --clmf-header-mb: 48px;
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .clmf-stepper {
        --clmf-px: 40px;
        --clmf-header-cols: 1fr;
        --clmf-header-gap: 20px;
        --clmf-content-cols: 1fr;
        --clmf-content-gap: 28px;
        --clmf-stage-h: 380px;
        --clmf-desc-display: none;
        --clmf-header-mb: 32px;
      }
    }
    @media (max-width: 767px) {
      .clmf-stepper {
        --clmf-pt: 48px;
        --clmf-px: 20px;
        --clmf-pb: 48px;
        --clmf-h2-size: 30px;
        --clmf-header-cols: 1fr;
        --clmf-header-gap: 16px;
        --clmf-content-cols: 1fr;
        --clmf-content-gap: 24px;
        --clmf-stage-h: 240px;
        --clmf-desc-display: none;
        --clmf-header-mb: 32px;
      }
      .clmf-stepper .clmf-h2-break { display: none; }
    }
  `

  return (
    <>
      <style>{css}</style>
      <div
        className="clmf-stepper"
        style={{
          background: '#EFEADE',
          paddingTop: 'var(--clmf-pt)',
          paddingRight: 'var(--clmf-px)',
          paddingBottom: 'var(--clmf-pb)',
          paddingLeft: 'var(--clmf-px)',
          fontFamily: 'var(--font-mulish), sans-serif',
          color: INK,
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
      >
        {/* Decorative radial */}
        <div style={{
          position: 'absolute', top: '-220px', right: '-160px',
          width: '620px', height: '620px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,132,62,0.12), transparent 66%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '1500px', margin: '0 auto' }}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'var(--clmf-header-cols)',
            gap: 'var(--clmf-header-gap)',
            alignItems: 'end',
            marginBottom: 'var(--clmf-header-mb)',
            paddingBottom: '44px',
            borderBottom: '1px solid rgba(31,45,39,0.11)',
          }}>
            {/* Izquierda */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '26px' }}>
                <span style={{ width: '40px', height: '1px', background: BRASS, display: 'block' }} />
                <span style={{
                  fontFamily: 'var(--font-space-mono), monospace', fontSize: '11px',
                  fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: BRASS_DARK,
                }}>
                  El proceso
                </span>
                <span style={{
                  fontFamily: 'var(--font-space-mono), monospace', fontSize: '11px',
                  letterSpacing: '0.18em', color: '#6B6456',
                }}>
                  01 — 05
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-cormorant), serif', fontWeight: 600,
                fontSize: 'var(--clmf-h2-size)', lineHeight: '0.95', margin: 0,
                color: '#1B2A24', letterSpacing: '-0.018em',
              }}>
                Cinco pasos<br />
                <em style={{ fontStyle: 'italic', fontWeight: 500 }}>hasta tu hogar</em>{' '}
                <br className="clmf-h2-break" />
                en Galicia
              </h2>
            </div>

            {/* Derecha — oculta en mobile */}
            <div style={{
              display: 'var(--clmf-desc-display)',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: '32px',
              paddingBottom: '4px',
            }}>
              <p style={{
                fontFamily: 'var(--font-mulish), sans-serif', fontSize: '18px',
                lineHeight: '1.68', color: '#4C4A38', margin: 0, fontWeight: 400, maxWidth: '480px',
              }}>
                Un acompañamiento cercano y a medida, del primer mensaje al día en que abrís tu puerta.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <span style={{ height: '1px', flex: 1, background: TRACK, display: 'block' }} />
                <span style={{
                  fontFamily: 'var(--font-space-mono), monospace', fontSize: '10.5px',
                  letterSpacing: '0.18em', color: '#6B6456', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  Galicia, España · 42.8°N 8.5°O
                </span>
              </div>
            </div>
          </div>

          {/* ── Split: stage + stepper ─────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'var(--clmf-content-cols)',
            gap: 'var(--clmf-content-gap)',
            alignItems: 'stretch',
          }}>

            {/* STAGE */}
            <div style={{
              position: 'relative', borderRadius: '18px', overflow: 'hidden',
              minHeight: 'var(--clmf-stage-h)', background: '#E6DFCD',
              boxShadow: '0 34px 80px -42px rgba(20,30,26,0.55)',
              animation: 'tlgStage .9s cubic-bezier(.66,0,.18,1) both',
            }}>
              {data.map((d, i) => {
                const isActive = i === active
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                      borderRadius: '18px', overflow: 'hidden',
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity .9s cubic-bezier(.5,0,.2,1)',
                      zIndex: isActive ? 2 : 1,
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                  >
                    {/* Imagen con zoom */}
                    <div style={{
                      position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                      transformOrigin: 'center',
                      backgroundImage: `url(${d.src})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: `scale(${isActive ? 1 + frac * 0.04 : 1.06})`,
                      transition: 'transform 1s cubic-bezier(.5,0,.2,1)',
                    }} />
                    {/* Gradiente inferior */}
                    <div style={{
                      position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                      background: 'linear-gradient(180deg, rgba(20,28,24,0) 52%, rgba(20,28,24,0.55) 100%)',
                      pointerEvents: 'none',
                    }} />
                    {/* Tag de acento */}
                    {d.tag && (
                      <span style={{
                        position: 'absolute', left: '24px', bottom: '24px', zIndex: 6,
                        fontFamily: 'var(--font-space-mono), monospace', fontSize: '10.5px',
                        fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: BONE, background: d.accent, padding: '7px 14px', borderRadius: '4px',
                        boxShadow: '0 8px 20px -8px rgba(0,0,0,0.4)',
                      }}>
                        {d.tag}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* STEPPER */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.map((d, i) => {
                const isActive = i === active
                const reached  = p >= i
                const topFill  = i >= 1 ? clamp(p - (i - 1)) * 100 : 0
                const botFill  = i <= 3 ? clamp(p - i) * 100 : 0

                let dotStyle: React.CSSProperties
                if (isActive) {
                  dotStyle = {
                    width: '36px', height: '36px', flex: 'none', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-space-mono), monospace', fontSize: '12px', fontWeight: 700,
                    background: d.accent, color: d.accent === teal ? BONE : '#000000',
                    boxShadow: `0 0 0 5px ${d.accent}26`,
                    transform: 'scale(1.06)', transition: 'all .4s ease',
                  }
                } else if (reached) {
                  dotStyle = {
                    width: '36px', height: '36px', flex: 'none', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-space-mono), monospace', fontSize: '12px', fontWeight: 700,
                    background: BRASS, color: '#000000', transition: 'all .4s ease',
                  }
                } else {
                  dotStyle = {
                    width: '36px', height: '36px', flex: 'none', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-space-mono), monospace', fontSize: '12px', fontWeight: 700,
                    background: '#EFEADE', color: MUTED,
                    border: '1.5px solid rgba(31,45,39,0.22)', transition: 'all .4s ease',
                  }
                }

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', gap: '22px', flex: '1 1 0%', minHeight: 0,
                      cursor: 'pointer',
                      animation: 'tlgUp .6s ease both',
                      animationDelay: `${0.15 + i * 0.08}s`,
                    }}
                    onClick={() => pick(i)}
                  >
                    {/* Columna indicador */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '36px', flex: 'none' }}>
                      {/* Línea superior */}
                      <div style={{ ...lineBase, ...(i === 0 ? { visibility: 'hidden' as const } : {}) }}>
                        <div style={{ ...fillBase, height: `${topFill}%` }} />
                      </div>
                      {/* Círculo */}
                      <div style={dotStyle}>{d.num}</div>
                      {/* Línea inferior */}
                      <div style={{ ...lineBase, ...(i === 4 ? { visibility: 'hidden' as const } : {}) }}>
                        <div style={{ ...fillBase, height: `${botFill}%` }} />
                      </div>
                    </div>

                    {/* Columna contenido */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
                        <span style={{
                          fontFamily: 'var(--font-space-mono), monospace', fontSize: '11px',
                          fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                          color: isActive ? BRASS_DARK : MUTED, transition: 'color .4s ease',
                        }}>
                          Paso {d.num}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-space-mono), monospace', fontSize: '11px',
                          fontWeight: 600, letterSpacing: '0.04em', color: MUTED,
                        }}>
                          {d.dur}
                        </span>
                      </div>
                      <h3 style={{
                        fontFamily: 'var(--font-cormorant), serif', fontWeight: 600,
                        fontSize: '29px', lineHeight: '1.08', margin: 0,
                        color: isActive ? '#1B2A24' : '#6B6456', transition: 'color .45s ease',
                      }}>
                        {d.title}
                      </h3>
                      <div style={{
                        maxHeight: isActive ? '120px' : '0px',
                        opacity: isActive ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'max-height .6s cubic-bezier(.66,0,.18,1), opacity .5s ease',
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-mulish), sans-serif', fontSize: '15px',
                          lineHeight: '1.55', color: '#6C6856', margin: '8px 0 0', maxWidth: '380px',
                        }}>
                          {d.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

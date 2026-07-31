'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { fadeUp } from '@/lib/motion/variants'

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
      /* ── Imagen del paso activo ───────────────────────────────────────────
         Escala en variable: es la perilla para achicar la imagen sin tocar la
         animación, que la lee en los dos extremos del keyframe (si el keyframe
         tuviera la escala escrita a mano, cambiarla acá haría saltar la imagen
         al terminar de entrar). */
      .stepper-image-col { --cf-img-escala: 0.9; }
      .cf-slide {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        border-radius: 8px;
        overflow: hidden;
        opacity: 0;
        transform: scale(var(--cf-img-escala)) translateX(0);
        transform-origin: center center;
        /* Salida: se desvanece en el lugar. Sólo la que ENTRA se desplaza; si
           las dos se movieran, el cruce se lee como un barrido doble. */
        transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .cf-slide-activa {
        opacity: 1;
        animation: cfEntraDesdeIzquierda 400ms cubic-bezier(0.4, 0, 0.2, 1) both;
      }
      /* Sólo transform y opacity: nada que dispare reflow. 400ms es el tope de
         la marca para entradas de contenido — el crossfade anterior estaba en
         850ms con easing genérico, fuera de esa regla. */
      @keyframes cfEntraDesdeIzquierda {
        from { opacity: 0; transform: scale(var(--cf-img-escala)) translateX(-6%); }
        to   { opacity: 1; transform: scale(var(--cf-img-escala)) translateX(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .cf-slide { transition: none; }
        .cf-slide-activa { animation: none; }
      }

      @media (max-width: 767px) {
        .stepper-image-col { display: none !important; }
        .stepper-content-col { padding: 24px 24px 20px !important; }
        /* Altura natural en mobile: con el alto fijo + overflow hidden, el paso 05
           quedaba cortado e inaccesible en 375×812 (auditoría 2026-07-19, A1.1). */
        .stepper-wrapper { height: auto !important; overflow: visible !important; }
      }
    `}</style>
    <div
      className="stepper-wrapper"
      style={{
        display: 'flex',
        /* ⚠️ CAMBIO DE LAYOUT — requiere tu visto bueno (ver reporte).
           Antes: `height: calc(100vh - 68px)` + `overflow: hidden`. Con el H1 en
           --dz-text-h1 (82px a 1280px, vs 38px antes) el titular pasa a ocupar 3
           líneas y los pasos 04 y 05 quedaban recortados e inaccesibles dentro del
           alto fijo. Se libera el alto para que la columna crezca con su contenido:
           es el mismo criterio que el media query de mobile ya aplicaba (`height:
           auto !important`) justamente para corregir este mismo recorte.
           Si prefieres conservar el split-screen anclado al viewport, hay que bajar
           el H1 de esta página por debajo del token — son mutuamente excluyentes. */
        minHeight: 'calc(100vh - 68px)',
      }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false; setHovered(null) }}
    >

      {/* ── Columna izquierda (47%) — imagen ─────────────────────── */}
      <div className="stepper-image-col" style={{
        // Baja de 47% a 42%. Achicar la imagen por `scale` no habría servido para
        // que entren los 5 pasos: es `position: absolute` dentro de esta columna,
        // así que su escala no cambia ni un píxel del alto del layout. Lo que sí
        // lo cambia es ESTE ancho: cada punto que cede la imagen se lo lleva la
        // columna de texto, las descripciones envuelven en menos líneas y las 5
        // filas se acortan.
        width: '42%',
        flexShrink: 0,
        position: 'relative',
        background: 'var(--dz-hero-bg)',
        overflow: 'hidden',
        alignSelf: 'stretch',
      }}>

        {/* 5 imágenes apiladas. La que entra se desliza de izquierda a derecha; la
            que sale sólo se desvanece, en el lugar. Ver .cf-slide en el <style>. */}
        {data.map((d, i) => (
          <div
            key={i}
            className={i === active ? 'cf-slide cf-slide-activa' : 'cf-slide'}
            aria-hidden={i !== active}
            style={{ backgroundImage: `url(${d.src})` }}
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
        /* NO usa --dz-section-y (104px) a propósito: este bloque vive dentro de un
           contenedor con `height: calc(100vh - 68px)` + `overflow:hidden` (abajo), y
           104px arriba + 104px abajo recortaban los pasos 04 y 05 dejándolos
           inaccesibles — el mismo defecto que ya se había corregido en mobile.
           PENDIENTE DE DECISIÓN: para poder aplicar el token hay que soltar antes el
           lock de altura de viewport de esta página (cambio de layout, no de escala). */
        paddingTop: '24px',
        paddingBottom: '20px',
        paddingLeft: '44px',
        paddingRight: '44px',
      }}>

        {/* Encabezado */}
        <div style={{ flexShrink: 0, marginBottom: '8px' }}>
          {/* Eyebrow compartido (antes: <p> inline a 10px/0.15em sin píldora) — esta
              era la única página de contenido que no usaba el componente. */}
          <div style={{ marginBottom: '6px' }}>
            <Eyebrow tone="claro">Cómo funciona</Eyebrow>
          </div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              fontFamily: 'var(--font-dz-display)',
              fontWeight: 'var(--dz-weight-h1)',
              fontSize: 'var(--dz-text-h1-compact)',
              lineHeight: 'var(--dz-leading-h1)',
              letterSpacing: '-0.01em',
              color: 'var(--dz-ink)',
              // Era '1cm 0' = 37,8px arriba y abajo, 75,6px de aire por un titular
              // de dos líneas. 1cm es una unidad FÍSICA: mide igual en 375 que en
              // 1024 y no escala con nada — el mismo defecto que ya se corrigió en
              // los Hero interiores. Acá además era el mayor gasto de alto del
              // encabezado, y ese alto es el que dejaba el paso 05 fuera de cuadro.
              margin: 'var(--space-3) 0',
            }}
          >
            Tu hogar en Galicia{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--dz-accent-text)' }}>
              ya existe.
            </em>
          </motion.h1>
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
                {/* 2px y no 6px de padding vertical: son 8px por fila, 40px en las
                    cinco, y ese recorte no toca el texto — sólo el aire propio de
                    la fila, que ya tiene el `gap` del borde superior. */}
                <div style={{ flex: 1, minWidth: 0, padding: '2px 0' }}>
                  {/* <h3> real, no <div>: los 5 pasos son contenido de la página y antes
                      no existían en el árbol de headings (auditoría, §5). El peso sigue
                      alternando activo/inactivo — es señal de estado, no de jerarquía. */}
                  <h3 style={{
                    fontFamily: 'var(--font-dz-display)',
                    fontSize: 'var(--dz-text-h3)',
                    fontWeight: isAct ? 'var(--dz-weight-h3)' : 500,
                    lineHeight: 1.2,
                    color: isAct ? 'var(--dz-ink)' : 'var(--dz-muted)',
                    transition: 'color .3s ease',
                    margin: 0,
                  }}>
                    {d.title}
                  </h3>
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

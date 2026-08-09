'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { fadeUp } from '@/lib/motion/variants'
import { PASOS_COMO_FUNCIONA } from '@/lib/como-funciona/pasos'

const INTERVAL_MS = 4200

// Los 5 pasos NO se declaran acá: vienen de lib/como-funciona/pasos.ts, que es la
// fuente única. Este archivo tenía su propia copia y las dos ya habían divergido en
// el paso 01 (auditoría pre-merge 2026-07-31).
const data = PASOS_COMO_FUNCIONA

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
      /* Escalonamiento imagen/texto. En la referencia el texto arranca solo y la
         imagen entra ~0,65s después, sobre transiciones de 1,0-1,3s. Acá el tope
         de marca para entradas de contenido son 400ms, así que se replica la
         PROPORCIÓN (la imagen entra pasada la mitad del movimiento del texto), no
         el número: 180ms sobre 400ms. */
      .stepper-image-col { --cf-img-escala: 0.9; --cf-retraso-img: 180ms; }
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
           las dos se movieran, el cruce se lee como un barrido doble.
           El retraso va también acá, no sólo en la que entra: si sólo se
           demorara la entrada, durante esos 180ms la que sale ya estaría a
           media opacidad y la de abajo no habría empezado, así que asomaría el
           fondo de la columna. Demorando las dos, la saliente aguanta entera
           mientras se mueve el texto y recién después cruzan. */
        transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) var(--cf-retraso-img);
      }
      .cf-slide-activa {
        opacity: 1;
        animation: cfEntraDesdeIzquierda 400ms cubic-bezier(0.4, 0, 0.2, 1) var(--cf-retraso-img) both;
      }
      /* Sólo transform y opacity: nada que dispare reflow. 400ms es el tope de
         la marca para entradas de contenido — el crossfade anterior estaba en
         850ms con easing genérico, fuera de esa regla. */
      @keyframes cfEntraDesdeIzquierda {
        from { opacity: 0; transform: scale(var(--cf-img-escala)) translateX(-6%); }
        to   { opacity: 1; transform: scale(var(--cf-img-escala)) translateX(0); }
      }
      /* El título de la fila activa sube al puesto en vez de sólo cambiar de
         color. Arranca en 0.25 y no en 0 a propósito: la fila NO aparece, ya
         estaba en pantalla en su estado apagado — un fade desde cero la haría
         parpadear. Es transform + opacity, nada que dispare reflow. */
      .cf-titulo-activo {
        animation: cfTituloSube 400ms cubic-bezier(0.4, 0, 0.2, 1) both;
      }
      @keyframes cfTituloSube {
        from { opacity: 0.25; transform: translateY(7px); }
        to   { opacity: 1;    transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .cf-slide { transition: none; }
        .cf-slide-activa { animation: none; }
        .cf-titulo-activo { animation: none; }
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
            style={{ backgroundImage: `url(${d.imagen})` }}
          />
        ))}

        {/* Contador de fracción vertical (paso actual sobre total), tomado de la
            referencia. Va sobre una placa --dz-luz con texto --dz-ink, no en
            blanco crudo sobre la foto: es el mismo par superficie/texto que usa
            la columna de contenido, así el contraste queda garantizado en claro
            y en oscuro y no depende de qué foto toque. Ese fue exactamente el
            defecto U02 de la auditoría (texto blanco cayendo sobre la zona clara
            de una foto), y acá cada paso trae una foto distinta.

            aria-hidden: no aporta nada al lector de pantalla — el paso activo ya
            lo comunica el aria-pressed de cada fila. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '24px',
            // Arriba y no abajo: la columna mide `calc(100vh - 68px)` y con el
            // header sticky su borde inferior cae justo en el pliegue, así que
            // anclado abajo el contador quedaba al ras del borde de la ventana
            // (medido: y=836+64=900 en un viewport de 900) y se cortaba en
            // cuanto la ventana era un poco más baja o la columna crecía.
            top: '24px',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'var(--dz-luz)',
            boxShadow: '0 2px 10px rgb(0 0 0 / 0.18)',
            fontFamily: 'var(--font-dz-display)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 700, fontStyle: 'italic', color: 'var(--dz-ink)' }}>
            {data[active].num}
          </span>
          <span style={{ width: '18px', height: '1px', background: 'var(--dz-borde)' }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dz-muted)' }}>
            {String(data.length).padStart(2, '0')}
          </span>
        </div>

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
                  {/* `duracion` ya existía en lib/como-funciona/pasos.ts y no se
                      renderizaba en ningún lado. Ocupa el lugar del "STEP N" de la
                      referencia —etiqueta chica en versalitas sobre el título— pero
                      dice algo que el número de la izquierda no dice: cuánto tarda
                      ese paso. Va arriba y no al final de la fila para no competir
                      por el ancho con la descripción cuando el texto envuelve. */}
                  <span style={{
                    display: 'block',
                    fontFamily: 'var(--font-dz-ui)',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                    color: isAct ? 'var(--dz-accent-text)' : 'var(--dz-muted)',
                    transition: 'color .3s ease',
                    marginBottom: '3px',
                  }}>
                    {d.duracion}
                  </span>
                  {/* <h3> real, no <div>: los 5 pasos son contenido de la página y antes
                      no existían en el árbol de headings (auditoría, §5). El peso sigue
                      alternando activo/inactivo — es señal de estado, no de jerarquía. */}
                  <h3 className={isAct ? 'cf-titulo-activo' : undefined} style={{
                    fontFamily: 'var(--font-dz-display)',
                    fontSize: 'var(--dz-text-h3)',
                    fontWeight: isAct ? 'var(--dz-weight-h3)' : 500,
                    lineHeight: 1.2,
                    color: isAct ? 'var(--dz-ink)' : 'var(--dz-muted)',
                    transition: 'color .3s ease',
                    margin: 0,
                  }}>
                    {d.titulo}
                  </h3>
                  <div style={{
                    fontFamily: 'var(--font-dz-ui)',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'var(--dz-muted)',
                    marginTop: '3px',
                    transition: 'color .3s ease',
                  }}>
                    {d.descripcion}
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

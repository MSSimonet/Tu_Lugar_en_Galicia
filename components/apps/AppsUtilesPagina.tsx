'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CIUDADES, LOCAL_APPS, NATIONAL_CATEGORIES, type CiudadKey } from '@/lib/config/appsUtiles'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'
import { PageHero } from '@/components/ui/PageHero'
import { AppsDivider } from './AppsDivider'
import { CityPicker } from './CityPicker'
import { SeccionEmergencias } from './SeccionEmergencias'
import { SeccionAcordeon } from './SeccionAcordeon'
import { EstadoVacio } from './EstadoVacio'

export function AppsUtilesPagina() {
  const [ciudad, setCiudad] = useState<CiudadKey | null>(null)
  const ciudadLabel = CIUDADES.find((c) => c.key === ciudad)?.label
  const resultadosRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Al elegir ciudad, los números de emergencia quedan a la vista sin scrollear.
  //
  // Hacía falta hacer algo: medido en un viewport de 720px, el bloque arrancaba en y=922 —o
  // sea, fuera de pantalla— porque encima tiene el Hero, el divisor y el selector de ciudad.
  // Y es el dato más urgente de la página: el 112 no se busca con tiempo.
  //
  // Se resuelve moviendo el scroll y no achicando lo de arriba: el Hero es el `PageHero`
  // compartido por las cinco páginas interiores y su alto es una decisión de marca (ver
  // components/ui/PageHero.tsx), así que recortarlo acá rompería esa igualdad para arreglar
  // un problema de esta página sola.
  useEffect(() => {
    if (!ciudad || !resultadosRef.current) return
    resultadosRef.current.scrollIntoView({
      // El salto seco es lo correcto con reduced-motion: el desplazamiento suave es
      // justamente el tipo de movimiento amplio que esa preferencia pide evitar.
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [ciudad, prefersReducedMotion])

  return (
    <div style={{ backgroundColor: 'var(--dz-fondo-pagina)', minHeight: '100vh' }}>
      {/* Franja superior — separador visual, coherente con el header del diseño de referencia */}
      <div className="h-1" style={{ backgroundColor: 'var(--au-header-bg)' }} aria-hidden="true" />

      {/* Hero — a diferencia de las otras 4 páginas, acá NO es un bloque con
          fondo propio: vive sobre el mismo --au-bg que el resto de la página,
          así que no hay borde inferior que cortar. Por eso va con tone="apps",
          que conserva su sistema --au-* (decisión de marca, sesión 2026-07-26)
          y sólo toma de PageHero la caja y el ritmo vertical. */}
      <PageHero
        compact
        tone="apps"
        maxWidth={900}
        eyebrow={
          <span className="flex items-center gap-2">
            <span className="block h-px w-4" style={{ backgroundColor: 'var(--au-accent)' }} aria-hidden="true" />
            <span
              // 12px: mínimo legible de interfaz fijado en el commit 324b55b.
              // Este eyebrow había quedado en 11px, por debajo de esa regla.
              className="text-[12px] font-semibold tracking-[0.14em]"
              style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-accent-text)' }}
            >
              GUÍA DE LLEGADA
            </span>
          </span>
        }
        title="Elige tu ciudad y descubre tu kit de apps"
        subtitle="Las herramientas locales de tu ciudad, más las apps nacionales que vas a necesitar en cualquier parte de España."
      />

      {/* Separador animado entre el Hero y el selector, misma posición y misma
          dirección que en las otras cuatro páginas de la familia. */}
      <AppsDivider direction="rtl" />

      {/* pt-[var(--dz-section-y)]: aire entre el divisor y el selector. Esta
          página era la única de las cuatro con la sección siguiente sin padding
          superior —solo `pb-2`— y por eso se veía pegada; Comunidad y Quiénes
          Somos ya usaban este mismo token en su sección post-divisor. */}
      <div
        className="pt-[var(--dz-section-y)]"
        style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-text)' }}
      >
        <div className="mx-auto max-w-[1160px] px-6 pb-2">
          <CityPicker seleccionada={ciudad} onSelect={setCiudad} />
        </div>

        <div className="mx-auto max-w-[840px] px-6 pb-20">
          {ciudad ? (
            <motion.div
              key={ciudad}
              ref={resultadosRef}
              // scroll-mt: deja el aire del header sticky por encima al hacer scrollIntoView,
              // que si no clava el borde del bloque justo debajo del header y lo tapa.
              className="mt-6 flex scroll-mt-24 flex-col gap-2.5"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeUp}>
                <SeccionEmergencias />
              </motion.div>
              <motion.div variants={fadeUp}>
                <SeccionAcordeon
                  label={`Apps de ${ciudadLabel}`}
                  apps={LOCAL_APPS[ciudad]}
                />
              </motion.div>
              {NATIONAL_CATEGORIES.map((cat) => (
                <motion.div key={cat.key} variants={fadeUp}>
                  <SeccionAcordeon label={cat.label} apps={cat.apps} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EstadoVacio />
          )}
        </div>
      </div>
    </div>
  )
}

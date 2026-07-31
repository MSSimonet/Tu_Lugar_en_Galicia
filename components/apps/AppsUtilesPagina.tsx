'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { CIUDADES, LOCAL_APPS, NATIONAL_CATEGORIES, type CiudadKey } from '@/lib/config/appsUtiles'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'
import { PageHero } from '@/components/ui/PageHero'
import { CityPicker } from './CityPicker'
import { SeccionEmergencias } from './SeccionEmergencias'
import { SeccionAcordeon } from './SeccionAcordeon'
import { EstadoVacio } from './EstadoVacio'

export function AppsUtilesPagina() {
  const [ciudad, setCiudad] = useState<CiudadKey | null>(null)
  const ciudadLabel = CIUDADES.find((c) => c.key === ciudad)?.label

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

      <div style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-text)' }}>
        <div className="mx-auto max-w-[1160px] px-6 pb-2">
          <CityPicker seleccionada={ciudad} onSelect={setCiudad} />
        </div>

        <div className="mx-auto max-w-[840px] px-6 pb-20">
          {ciudad ? (
            <motion.div
              key={ciudad}
              className="mt-6 flex flex-col gap-2.5"
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
                  abiertaPorDefecto
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

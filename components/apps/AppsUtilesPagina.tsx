'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { CIUDADES, LOCAL_APPS, NATIONAL_CATEGORIES, type CiudadKey } from '@/lib/config/appsUtiles'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'
import { CityPicker } from './CityPicker'
import { SeccionEmergencias } from './SeccionEmergencias'
import { SeccionAcordeon } from './SeccionAcordeon'
import { EstadoVacio } from './EstadoVacio'

export function AppsUtilesPagina() {
  const [ciudad, setCiudad] = useState<CiudadKey | null>(null)
  const ciudadLabel = CIUDADES.find((c) => c.key === ciudad)?.label

  return (
    <div style={{ backgroundColor: 'var(--au-bg)', minHeight: '100vh' }}>
      {/* Franja superior — separador visual, coherente con el header del diseño de referencia */}
      <div className="h-1" style={{ backgroundColor: 'var(--au-header-bg)' }} aria-hidden="true" />

      {/* Hero — padding vertical unificado con el resto de los Hero interiores
          vía --dz-hero-pad-y (auditoría 2026-07-25). A diferencia de las otras 4
          páginas, acá el Hero NO es un bloque con fondo propio: vive sobre el
          mismo --au-bg que el resto de la página, así que no hay borde inferior
          que cortar — no aplica el punto del degradado. */}
      <motion.div
        className="mx-auto flex max-w-[900px] flex-col justify-center px-[var(--space-6)] py-[var(--dz-hero-pad-y)]"
        style={{ minHeight: 'var(--dz-hero-min-h)' }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-4 flex items-center gap-2">
          <span className="block h-px w-4" style={{ backgroundColor: 'var(--au-accent)' }} aria-hidden="true" />
          <span
            className="text-[11px] font-semibold tracking-[0.14em]"
            style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-accent-text)' }}
          >
            GUÍA DE LLEGADA
          </span>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-dz-display)', color: 'var(--au-hero-heading)', fontSize: 'var(--dz-text-h1-compact)', fontWeight: 'var(--dz-weight-h1)', lineHeight: 'var(--dz-leading-h1)', letterSpacing: '-0.01em', margin: '1cm 0' }}
        >
          Elige tu ciudad y descubre tu kit de apps
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-3.5 max-w-[560px] text-[14.5px] leading-[1.6]"
          style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-hero-body)' }}
        >
          Las herramientas locales de tu ciudad, más las apps nacionales que vas a necesitar en
          cualquier parte de España.
        </motion.p>
      </motion.div>

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

'use client'

import { useState } from 'react'
import { CIUDADES, LOCAL_APPS, NATIONAL_CATEGORIES, type CiudadKey } from '@/lib/config/appsUtiles'
import { CityPicker } from './CityPicker'
import { SeccionEmergencias } from './SeccionEmergencias'
import { SeccionAcordeon } from './SeccionAcordeon'
import { EstadoVacio } from './EstadoVacio'
import { ToggleTema } from './ToggleTema'

export function AppsUtilesPagina() {
  const [ciudad, setCiudad] = useState<CiudadKey | null>(null)
  const [esOscuro, setEsOscuro] = useState(true)
  const ciudadLabel = CIUDADES.find((c) => c.key === ciudad)?.label

  return (
    <div className={esOscuro ? undefined : 'au-theme-light'} style={{ backgroundColor: 'var(--au-bg)', minHeight: '100vh' }}>
      {/* Franja superior — separador visual, coherente con el header del diseño de referencia */}
      <div className="h-1" style={{ backgroundColor: 'var(--au-header-bg)' }} aria-hidden="true" />

      {/* Hero */}
      <div className="mx-auto max-w-[900px] px-6 pb-8 pt-12 md:pt-14">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="block h-px w-4" style={{ backgroundColor: 'var(--au-accent)' }} aria-hidden="true" />
            <span
              className="text-[11px] font-semibold tracking-[0.14em]"
              style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-accent-text)' }}
            >
              GUÍA DE LLEGADA
            </span>
          </span>
          <ToggleTema esOscuro={esOscuro} onToggle={() => setEsOscuro((v) => !v)} />
        </div>
        <h1
          className="text-[32px] font-bold leading-[1.18] md:text-[38px]"
          style={{ fontFamily: 'var(--font-au-display)', color: 'var(--au-hero-heading)' }}
        >
          Elige tu ciudad y descubre tu kit de apps
        </h1>
        <p
          className="mt-3.5 max-w-[560px] text-[14.5px] leading-[1.6]"
          style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-hero-body)' }}
        >
          Las herramientas locales de tu ciudad, más las apps nacionales que vas a necesitar en
          cualquier parte de España.
        </p>
      </div>

      <div style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-text)' }}>
        <div className="mx-auto max-w-[1160px] px-6 pb-2">
          <CityPicker seleccionada={ciudad} onSelect={setCiudad} />
        </div>

        <div className="mx-auto max-w-[840px] px-6 pb-20">
          {ciudad ? (
            <div key={ciudad} className="au-fade-in mt-6 flex flex-col gap-2.5">
              <SeccionEmergencias />
              <SeccionAcordeon
                label={`Apps de ${ciudadLabel}`}
                apps={LOCAL_APPS[ciudad]}
                abiertaPorDefecto
              />
              {NATIONAL_CATEGORIES.map((cat) => (
                <SeccionAcordeon key={cat.key} label={cat.label} apps={cat.apps} />
              ))}
            </div>
          ) : (
            <EstadoVacio />
          )}
        </div>
      </div>
    </div>
  )
}

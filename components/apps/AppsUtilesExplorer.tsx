'use client'

import { useState } from 'react'
import { CIUDADES, LOCAL_APPS, NATIONAL_CATEGORIES, type CiudadKey } from '@/lib/config/appsUtiles'
import { CityPicker } from './CityPicker'
import { SeccionAcordeon } from './SeccionAcordeon'
import { EstadoVacio } from './EstadoVacio'

export function AppsUtilesExplorer() {
  const [ciudad, setCiudad] = useState<CiudadKey | null>(null)
  const ciudadLabel = CIUDADES.find((c) => c.key === ciudad)?.label

  return (
    <>
      <div className="mx-auto max-w-[1160px] px-6 pb-2">
        <CityPicker seleccionada={ciudad} onSelect={setCiudad} />
      </div>

      <div className="mx-auto max-w-[840px] px-6 pb-20">
        {ciudad ? (
          <div key={ciudad} className="au-fade-in mt-6 flex flex-col gap-2.5">
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
    </>
  )
}

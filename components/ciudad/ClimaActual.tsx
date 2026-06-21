'use client'

import { useEffect, useState } from 'react'

interface ClimaData {
  temperatura: number | null
  tempMin: number | null
  tempMax: number | null
  descripcion: string | null
  precipitacion: number | null
  viento: number | null
  humedad: number | null
}

type Estado = 'cargando' | 'ok' | 'error'

function emojiClima(descripcion: string | null): string {
  if (!descripcion) return '🌡️'
  const d = descripcion.toLowerCase()
  if (d.includes('despejado') || d.includes('soleado')) return '☀️'
  if (d.includes('nube') || d.includes('nublado')) return '⛅'
  if (d.includes('cubierto')) return '☁️'
  if (d.includes('lluvia') || d.includes('lluvioso') || d.includes('chubasco')) return '🌧️'
  if (d.includes('tormenta')) return '⛈️'
  if (d.includes('niebla') || d.includes('bruma')) return '🌫️'
  if (d.includes('nieve')) return '❄️'
  return '🌡️'
}

export function ClimaActual({ slug }: { slug: string }) {
  const [data, setData] = useState<ClimaData | null>(null)
  const [estado, setEstado] = useState<Estado>('cargando')

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/clima/${slug}`, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<ClimaData>
      })
      .then(d => {
        setData(d)
        setEstado('ok')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setEstado('error')
      })

    return () => controller.abort()
  }, [slug])

  if (estado === 'cargando') {
    return (
      <div className="rounded-2xl bg-[var(--color-niebla)] p-5 space-y-3 animate-pulse" aria-hidden="true">
        <div className="h-10 w-24 rounded-lg bg-[var(--color-arena)]" />
        <div className="h-4 w-32 rounded bg-[var(--color-arena)]" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-[var(--color-arena)]" />
          <div className="h-6 w-16 rounded-full bg-[var(--color-arena)]" />
        </div>
        <div className="h-px bg-[var(--color-arena)]" />
        <div className="h-4 w-40 rounded bg-[var(--color-arena)]" />
      </div>
    )
  }

  if (estado === 'error' || data?.temperatura == null) {
    return (
      <div
        className="rounded-2xl bg-[var(--color-niebla)] p-5 flex items-center justify-center min-h-[120px]"
        role="status"
      >
        <p className="font-[family-name:var(--font-mulish)] text-[var(--text-xs)] text-[var(--color-pizarra)] opacity-60">
          Clima no disponible
        </p>
      </div>
    )
  }

  const { temperatura, tempMin, tempMax, descripcion, precipitacion, viento, humedad } = data
  const emoji = emojiClima(descripcion)

  return (
    <div
      className="rounded-2xl bg-[var(--color-niebla)] p-5 space-y-4"
      aria-label={`Clima actual: ${temperatura}°C, ${descripcion ?? ''}. Mínima ${tempMin ?? '—'}°, máxima ${tempMax ?? '—'}°`}
    >
      {/* Temperatura principal + emoji */}
      <div className="flex items-start justify-between">
        <div>
          <span
            className="font-[family-name:var(--font-cormorant)] text-[3rem] leading-none font-semibold text-[var(--color-granito)]"
            aria-hidden="true"
          >
            {temperatura}°
          </span>
          {descripcion && (
            <p className="font-[family-name:var(--font-mulish)] text-[var(--text-xs)] text-[var(--color-pizarra)] mt-1 leading-snug">
              {descripcion}
            </p>
          )}
        </div>
        <span className="text-4xl leading-none mt-1" aria-hidden="true">{emoji}</span>
      </div>

      {/* Pills mín / máx */}
      {(tempMin != null || tempMax != null) && (
        <div className="flex gap-2">
          {tempMin != null && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[var(--color-arena)] bg-[var(--color-blanco)] font-[family-name:var(--font-mulish)] text-[var(--text-xs)] text-[var(--color-pizarra)]">
              mín · {tempMin}°
            </span>
          )}
          {tempMax != null && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[var(--color-arena)] bg-[var(--color-blanco)] font-[family-name:var(--font-mulish)] text-[var(--text-xs)] text-[var(--color-pizarra)]">
              máx · {tempMax}°
            </span>
          )}
        </div>
      )}

      {/* Datos secundarios */}
      {(precipitacion != null || viento != null || humedad != null) && (
        <>
          <div className="h-px bg-[var(--color-arena)]" />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {precipitacion != null && (
              <span className="font-[family-name:var(--font-mulish)] text-[var(--text-xs)] text-[var(--color-pizarra)] flex items-center gap-1">
                <span aria-hidden="true">💧</span> {precipitacion} mm
              </span>
            )}
            {viento != null && (
              <span className="font-[family-name:var(--font-mulish)] text-[var(--text-xs)] text-[var(--color-pizarra)] flex items-center gap-1">
                <span aria-hidden="true">💨</span> {viento} km/h
              </span>
            )}
            {humedad != null && (
              <span className="font-[family-name:var(--font-mulish)] text-[var(--text-xs)] text-[var(--color-pizarra)] flex items-center gap-1">
                <span aria-hidden="true">💦</span> {humedad}%
              </span>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <p className="font-[family-name:var(--font-mulish)] text-[#616669] leading-none" style={{ fontSize: '10px' }}>
        AEMET · actualizado cada 6h
      </p>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

interface ClimaData {
  temperatura: number | null
  cielo: string | null
  precipitacion: number | null
}

type Estado = 'cargando' | 'ok' | 'error'

export function ClimaActual({ slug }: { slug: string }) {
  const [data, setData] = useState<ClimaData | null>(null)
  const [estado, setEstado] = useState<Estado>('cargando')

  useEffect(() => {
    fetch(`/api/clima/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<ClimaData>
      })
      .then(d => {
        setData(d)
        setEstado('ok')
      })
      .catch(() => setEstado('error'))
  }, [slug])

  if (estado === 'cargando') {
    return (
      <div
        className="mt-[var(--space-3)] h-7 w-48 rounded-full bg-white/10 animate-pulse"
        aria-hidden="true"
      />
    )
  }

  if (estado === 'error' || data?.temperatura == null) {
    return (
      <p
        className="mt-[var(--space-3)] font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-niebla)] opacity-50"
        aria-label="Clima no disponible en este momento"
      >
        Clima no disponible
      </p>
    )
  }

  const { temperatura, cielo, precipitacion } = data

  return (
    <div
      className="
        mt-[var(--space-4)]
        inline-flex items-center gap-[var(--space-3)]
        rounded-full
        px-[var(--space-4)] py-[var(--space-2)]
        font-[family-name:var(--font-ui)]
        text-[var(--text-xs)]
        tracking-[var(--tracking-ui)]
        bg-black/25 backdrop-blur-sm
        text-[var(--color-niebla)]
      "
      aria-label={`Clima actual: ${temperatura}°C, ${cielo ?? ''}${precipitacion && precipitacion > 0 ? `, ${precipitacion} mm de precipitación` : ''}`}
    >
      <span
        className="font-semibold text-[var(--color-laton-claro)]"
        aria-hidden="true"
      >
        {temperatura}°C
      </span>
      {cielo && (
        <span aria-hidden="true">{cielo}</span>
      )}
      {precipitacion != null && precipitacion > 0 && (
        <span className="opacity-70" aria-hidden="true">
          · {precipitacion} mm
        </span>
      )}
    </div>
  )
}

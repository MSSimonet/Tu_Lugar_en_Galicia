'use client'

import { useEffect } from 'react'
import { CALCOM_URL } from '@/lib/config/site'

const CALCOM_PLACEHOLDER = 'https://cal.com/tu-usuario'

interface CalEmbedProps {
  calLink?: string
  className?: string
}

export function CalEmbed({ calLink = CALCOM_URL, className = '' }: CalEmbedProps) {
  const isConfigured = calLink !== CALCOM_PLACEHOLDER

  useEffect(() => {
    if (!isConfigured) return

    // Cal.com embed bootstrap — carga el script una sola vez
    if (typeof window === 'undefined') return
    if (document.getElementById('cal-embed-script')) return

    const script = document.createElement('script')
    script.id = 'cal-embed-script'
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    script.onload = () => {
      // @ts-expect-error — Cal global inyectado por el script de embed
      if (window.Cal) {
        // @ts-expect-error — Cal global sin tipos: método init no tipado
        window.Cal('init', { origin: 'https://cal.com' })
        // @ts-expect-error — Cal global sin tipos: método inline no tipado
        window.Cal('inline', {
          elementOrSelector: '#cal-inline-embed',
          calLink,
        })
      }
    }
    document.body.appendChild(script)
  }, [calLink, isConfigured])

  if (!isConfigured) {
    return (
      <div
        className={[
          'flex items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-arena)] bg-[var(--color-niebla)] p-[var(--space-12)] text-center',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role="status"
        aria-label="Calendario no disponible"
      >
        <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)]">
          Calendario no configurado aún.
          <br />
          Actualizá{' '}
          <code className="font-mono text-[#7A5F22]">CALCOM_URL</code> en{' '}
          <code className="font-mono text-[#7A5F22]">lib/config/site.ts</code>.
        </p>
      </div>
    )
  }

  return (
    <div
      id="cal-inline-embed"
      className={['min-h-[600px] w-full', className].filter(Boolean).join(' ')}
      aria-label="Calendario para agendar videollamada"
    />
  )
}

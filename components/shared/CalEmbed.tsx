'use client'

import { useEffect } from 'react'
import { CALCOM_URL } from '@/lib/config/site'

const CALCOM_PLACEHOLDER = 'https://cal.com/tu-usuario'

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & { q?: unknown[] }
  }
}

interface CalEmbedProps {
  calLink?: string
  className?: string
}

export function CalEmbed({ calLink = CALCOM_URL, className = '' }: CalEmbedProps) {
  const isConfigured = calLink !== CALCOM_PLACEHOLDER

  useEffect(() => {
    if (!isConfigured) return
    if (typeof window === 'undefined') return

    const initInline = () => {
      window.Cal!('init', { origin: 'https://cal.com' })
      window.Cal!('inline', {
        elementOrSelector: '#cal-inline-embed',
        calLink,
      })
    }

    // Si el SDK ya está cargado (navegación client-side), inicializar directamente
    if (window.Cal) {
      initInline()
      return
    }

    // Primera carga: inyectar el script y esperar onload
    const script = document.createElement('script')
    script.id = 'cal-embed-script'
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    script.onload = () => {
      if (window.Cal) {
        initInline()
      }
    }
    document.body.appendChild(script)

    return () => {
      script.onload = null
    }
  }, [calLink, isConfigured])

  if (!isConfigured) {
    return (
      <div
        className={[
          'flex flex-col items-center justify-center gap-6 rounded-[var(--radius-card)] border border-[var(--color-arena)] bg-[var(--color-niebla)] px-8 py-16 text-center',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role="status"
        aria-label="Agenda tu videollamada"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: 'var(--color-laton)' }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <div>
          <p
            className="font-[family-name:var(--font-titular)] mb-3"
            style={{ fontSize: 'var(--text-lg)', color: 'var(--color-granito)' }}
          >
            Agenda tu videollamada gratuita
          </p>
          <p
            className="font-[family-name:var(--font-ui)] max-w-sm"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-pizarra)', lineHeight: 1.6 }}
          >
            Escríbenos por WhatsApp y coordinamos un horario que te sea cómodo.
            La llamada es gratuita y sin compromiso.
          </p>
        </div>
        <a
          href={`https://wa.me/34605421661?text=${encodeURIComponent('Hola, quiero agendar una videollamada para conocer el servicio de relocation en Galicia.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] font-[family-name:var(--font-ui)] font-medium uppercase tracking-[var(--tracking-ui)] transition-colors duration-150"
          style={{
            background: 'var(--color-laton)',
            color: '#FFFFFF',
            padding: '0.75rem 2rem',
            fontSize: 'var(--text-sm)',
          }}
        >
          Escribirnos por WhatsApp
          <span className="sr-only">(abre en nueva pestaña)</span>
        </a>
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

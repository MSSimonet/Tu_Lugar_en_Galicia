'use client'

import { useEffect } from 'react'
import { CALCOM_URL } from '@/lib/config/site'

const CALCOM_PLACEHOLDER = 'https://cal.com/tu-usuario'
const CAL_NS = 'tlg'

type CalFn = ((...args: unknown[]) => void) & {
  q?: unknown[]
  loaded?: boolean
  ns?: Record<string, ((...args: unknown[]) => void) & { q?: unknown[] }>
}

declare global {
  interface Window {
    Cal?: CalFn
  }
}

function calPathFrom(link: string): string {
  try {
    return link.startsWith('https://') ? new URL(link).pathname.slice(1) : link
  } catch {
    return link
  }
}

interface CalEmbedProps {
  calLink?: string
  className?: string
}

export function CalEmbed({ calLink = CALCOM_URL, className = '' }: CalEmbedProps) {
  const isConfigured = calLink !== CALCOM_PLACEHOLDER

  useEffect(() => {
    if (!isConfigured || typeof window === 'undefined') return

    const calPath = calPathFrom(calLink)

    const queueCalls = () => {
      const Cal = window.Cal!
      Cal('init', CAL_NS, { origin: 'https://app.cal.com' })
      Cal.ns![CAL_NS]('inline', {
        elementOrSelector: '#cal-inline-embed',
        calLink: calPath,
        layout: 'month_view',
      })
      Cal.ns![CAL_NS]('ui', { hideEventTypeDetails: true })
    }

    if (window.Cal?.loaded) {
      // Ya cargado por navegación client-side — re-inicializar directamente
      queueCalls()
      return
    }

    // Stub oficial de Cal.com — crea la queue y carga embed.js
    ;(function (C: Window, A: string, L: string) {
      const p = (a: CalFn, ar: unknown[]) => { a.q!.push(ar) }
      const d = C.document
      C.Cal = C.Cal || (function (...args: unknown[]) {
        const cal = C.Cal!
        if (!cal.loaded) {
          cal.ns = {}
          cal.q = cal.q || []
          const s = d.createElement('script')
          s.src = A
          d.head.appendChild(s)
          cal.loaded = true
        }
        if (args[0] === L) {
          const api: CalFn = (...a: unknown[]) => { p(api, a) }
          const ns = args[1] as string
          api.q = api.q || []
          if (typeof ns === 'string') {
            cal.ns![ns] = cal.ns![ns] || api
            p(cal.ns![ns], args as unknown[])
            p(cal, [L, api])
          } else {
            p(cal, args as unknown[])
          }
          return
        }
        p(cal, args as unknown[])
      } as CalFn)
    })(window, 'https://app.cal.com/embed/embed.js', 'init')

    // Encolar inmediatamente — embed.js procesará la queue al cargar
    queueCalls()
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
            Escríbenos a través de nuestro formulario y coordinamos un horario que te sea cómodo.
            La llamada es gratuita y sin compromiso.
          </p>
        </div>
        <a
          href="/contacto"
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] font-[family-name:var(--font-ui)] font-medium uppercase tracking-[var(--tracking-ui)] transition-colors duration-150"
          style={{
            background: 'var(--color-laton)',
            color: '#FFFFFF',
            padding: '0.75rem 2rem',
            fontSize: 'var(--text-sm)',
          }}
        >
          Contáctanos
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

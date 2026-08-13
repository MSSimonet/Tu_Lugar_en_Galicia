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
          'flex flex-col items-center justify-center gap-4 px-8 py-16 text-center',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role="status"
        aria-label="Agenda tu videollamada"
      >
        <span
          aria-hidden="true"
          className="flex items-center justify-center rounded-full border"
          style={{ width: '52px', height: '52px', borderColor: 'var(--color-laton-text)', color: 'var(--color-laton-text)', fontSize: '22px' }}
        >
          !
        </span>
        <p
          className="font-[family-name:var(--font-dz-display)]"
          style={{ fontSize: 'var(--text-lg)', color: 'var(--dz-ink)' }}
        >
          El calendario no cargó
        </p>
        <p
          className="font-[family-name:var(--font-dz-ui)] max-w-sm"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--dz-muted)', lineHeight: 1.5 }}
        >
          A veces pasa. Escríbenos por el formulario de contacto y coordinamos tu llamada a mano.
        </p>
        <a
          href="/contacto"
          className="mt-[var(--space-2)] inline-flex items-center gap-2 rounded-[var(--radius-pill)] font-[family-name:var(--font-dz-ui)] font-bold uppercase tracking-[var(--tracking-ui)] transition-colors duration-150"
          style={{
            background: 'var(--color-laton)',
            // Tinta oscura y no --color-blanco: claro sobre ámbar daba 3.37:1 y fallaba
            // AA — el mismo fallo para el que ya existía --dz-accent-ink. Ahora 5.34:1.
            color: 'var(--dz-accent-ink)',
            padding: '0.75rem 1.75rem',
            fontSize: 'var(--text-sm)',
          }}
        >
          Escribirnos por contacto
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

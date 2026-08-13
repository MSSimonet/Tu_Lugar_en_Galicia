'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CALCOM_URL } from '@/lib/config/site'

const CALCOM_PLACEHOLDER = 'https://cal.com/tu-usuario'
const CAL_NS = 'tlg'
const EMBED_SRC = 'https://app.cal.com/embed/embed.js'

// Cuánto esperamos a que Cal.com pinte el calendario antes de rendirnos.
// 12s queda por encima de una 3G lenta real y por debajo de lo que alguien
// aguanta mirando un hueco vacío sin saber si se rompió.
const TIMEOUT_MS = 12000

type Estado = 'cargando' | 'listo' | 'error'

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
  const [estado, setEstado] = useState<Estado>(isConfigured ? 'cargando' : 'error')
  // Cambiar `intento` reejecuta el efecto: es la palanca del botón "Reintentar".
  const [intento, setIntento] = useState(0)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isConfigured || typeof window === 'undefined') return
    const contenedor = contenedorRef.current
    if (!contenedor) return

    let vivo = true
    setEstado('cargando')

    // El ÚNICO indicio fiable de éxito es que Cal haya inyectado su iframe en el
    // contenedor. No alcanza con que el script cargue: puede cargar y el embed
    // fallar igual (calLink inexistente, error del lado de Cal.com), y ahí el
    // usuario se quedaba mirando 600px en blanco sin que nada lo detectara.
    const observer = new MutationObserver(() => {
      if (contenedor.childElementCount > 0) {
        observer.disconnect()
        if (vivo) setEstado('listo')
      }
    })
    observer.observe(contenedor, { childList: true })

    const temporizador = window.setTimeout(() => {
      if (vivo) setEstado((previo) => (previo === 'cargando' ? 'error' : previo))
    }, TIMEOUT_MS)

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
    } else {
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
      })(window, EMBED_SRC, 'init')

      // Encolar inmediatamente — embed.js procesará la queue al cargar
      queueCalls()
    }

    // El stub inyecta el <script> por su cuenta y no expone su error. Lo buscamos
    // después para engancharle un handler: un bloqueador de anuncios o una caída de
    // Cal.com fallan acá, y así mostramos el respaldo enseguida en vez de hacer
    // esperar los 12s completos del timeout.
    const script = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SRC}"]`)
    const alFallarScript = () => { if (vivo) setEstado('error') }
    script?.addEventListener('error', alFallarScript)

    return () => {
      vivo = false
      observer.disconnect()
      window.clearTimeout(temporizador)
      script?.removeEventListener('error', alFallarScript)
    }
  }, [calLink, isConfigured, intento])

  const reintentar = useCallback(() => {
    // El stub marca `cal.loaded = true` ANTES de que el script haya cargado de
    // verdad. Si la carga falla, esa bandera queda encendida para siempre y ninguna
    // reejecución vuelve a inyectar el script: sin esta limpieza, "Reintentar" no
    // reintentaría nada. Mismo motivo por el que antes bastaba con volver a la
    // página desde otra ruta para quedar en blanco hasta recargar a mano.
    delete window.Cal
    document.querySelectorAll(`script[src="${EMBED_SRC}"]`).forEach((s) => s.remove())
    setIntento((n) => n + 1)
  }, [])

  const mostrarRespaldo = estado === 'error'

  return (
    <div className={className || undefined}>
      {estado === 'cargando' && (
        <p
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-3 px-8 py-16 text-center font-[family-name:var(--font-dz-ui)]"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--dz-muted)' }}
        >
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
          />
          Cargando el calendario…
        </p>
      )}

      {mostrarRespaldo && (
        <div
          className="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center"
          role="alert"
        >
          <span
            aria-hidden="true"
            className="flex items-center justify-center rounded-full border"
            style={{
              width: '52px',
              height: '52px',
              borderColor: 'var(--color-laton-text)',
              color: 'var(--color-laton-text)',
              fontSize: '22px',
            }}
          >
            !
          </span>
          <p
            className="font-[family-name:var(--font-dz-display)]"
            style={{ fontSize: 'var(--text-lg)', color: 'var(--dz-ink)' }}
          >
            Estamos teniendo un problema técnico
          </p>
          <p
            className="font-[family-name:var(--font-dz-ui)] max-w-sm"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--dz-muted)', lineHeight: 1.5 }}
          >
            El calendario no está cargando. Ábrelo en otra pestaña, o escríbenos por el
            formulario de contacto y coordinamos tu videollamada a mano.
          </p>
          <div className="mt-[var(--space-2)] flex flex-wrap items-center justify-center gap-3">
            {/* Paso intermedio antes de rendirse al formulario: los bloqueadores de
                anuncios suelen filtrar el SCRIPT del embed, no el dominio de Cal.com.
                Para esa persona —que es la mayoría de los fallos— abrir el calendario
                en otra pestaña resuelve el problema sin cambiar de canal ni esperar
                respuesta. Por eso va primero y con el peso visual de acción principal. */}
            {isConfigured && (
              <a
                href={calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] font-[family-name:var(--font-dz-ui)] font-bold uppercase tracking-[var(--tracking-ui)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: 'var(--color-laton)',
                  // Tinta oscura y no --color-blanco: claro sobre ámbar daba 3.37:1 y fallaba
                  // AA — el mismo fallo para el que ya existía --dz-accent-ink. Ahora 5.34:1.
                  color: 'var(--dz-accent-ink)',
                  outlineColor: 'var(--dz-ink)',
                  padding: '0.75rem 1.75rem',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Abrir el calendario en otra pestaña
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            )}
            <a
              href="/contacto#formulario"
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border font-[family-name:var(--font-dz-ui)] font-bold uppercase tracking-[var(--tracking-ui)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: 'var(--dz-borde-input)',
                color: 'var(--dz-ink)',
                outlineColor: 'var(--dz-ink)',
                padding: '0.75rem 1.75rem',
                fontSize: 'var(--text-sm)',
              }}
            >
              Ir al formulario de contacto
            </a>
            {isConfigured && (
              <button
                type="button"
                onClick={reintentar}
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border font-[family-name:var(--font-dz-ui)] font-bold uppercase tracking-[var(--tracking-ui)] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: 'var(--dz-borde-input)',
                  color: 'var(--dz-ink)',
                  outlineColor: 'var(--dz-ink)',
                  padding: '0.75rem 1.75rem',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}

      {/* El contenedor se monta SIEMPRE que haya configuración: Cal.com necesita el
          nodo presente para inyectar su iframe, así que no puede vivir dentro de un
          ternario contra el estado. Solo se le da alto cuando ya hay algo pintado. */}
      {isConfigured && (
        <div
          ref={contenedorRef}
          id="cal-inline-embed"
          aria-label="Calendario para agendar videollamada"
          className={[
            'w-full',
            estado === 'listo' ? 'min-h-[600px]' : 'min-h-0',
            mostrarRespaldo ? 'hidden' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      )}
    </div>
  )
}

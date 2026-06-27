'use client'

/**
 * GinaWidget.tsx — Shell del widget flotante del asistente Gina.
 *
 * Gestiona apertura/cierre, estado de sesión, persistencia en localStorage
 * y el markup del panel (cabecera + diálogo). El flujo de conversación y la
 * lógica de edición viven en GinaConversation y useGinaEditor respectivamente.
 */

import { useState, useEffect, useRef, useId } from 'react'
import { GinaConversation } from './GinaConversation'
import { type Mensaje } from './GinaMessages'
import { crearSesion, type GinaSession } from '@/lib/gina/session'
import { obtenerPaso, personalizarTexto, type Paso } from '@/lib/gina/flowEngine'
import { guardarSesionLocal, cargarSesionLocal, limpiarSesionLocal } from '@/lib/gina/sessionStorage'

// ── Helpers ────────────────────────────────────────────────────────────────

function generarId(): string {
  return Math.random().toString(36).slice(2, 9)
}

/** Busca el primer paso del flujo (siempre "bienvenida") */
function obtenerPrimerPaso(): Paso {
  return obtenerPaso('bienvenida')
}

// ── Componente ─────────────────────────────────────────────────────────────

export function GinaWidget() {
  const dialogId = useId()
  const [abierto, setAbierto] = useState(false)
  const [sesion, setSesion] = useState<GinaSession>(crearSesion)
  const [pasoActual, setPasoActual] = useState<Paso>(obtenerPrimerPaso)
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => {
    // Inicializar con el primer mensaje de Gina (lazy initializer — evita useEffect innecesario)
    const primerPaso = obtenerPrimerPaso()
    return [
      {
        id: generarId(),
        de: 'gina' as const,
        texto: personalizarTexto(primerPaso.texto, ''),
        pasoId: primerPaso.id,
      },
    ]
  })

  const botonCerrarRef = useRef<HTMLButtonElement>(null)

  // ── Apertura mediante evento global (permite abrirlo desde cualquier componente) ──

  useEffect(() => {
    function handleOpen() { setAbierto(true) }
    window.addEventListener('gina:open', handleOpen)
    return () => window.removeEventListener('gina:open', handleOpen)
  }, [])

  // ── Gestión de foco al abrir/cerrar ──

  useEffect(() => {
    if (abierto) {
      setTimeout(() => botonCerrarRef.current?.focus(), 100)
    }
  }, [abierto])

  // ── Persistencia en localStorage ──────────────────────────────────────────

  // Restaura la sesión al montar si hay una guardada de menos de 24 h.
  // Corre solo en el cliente (useEffect no ejecuta en SSR), lo que evita
  // discrepancias de hidratación con el HTML renderizado en servidor.
  useEffect(() => {
    const guardada = cargarSesionLocal()
    if (!guardada) return
    try {
      const paso = obtenerPaso(guardada.pasoActualId)
      setSesion(guardada.sesion)
      setPasoActual(paso)
      setMensajes([
        ...guardada.mensajes,
        { id: generarId(), de: 'gina' as const, texto: 'Retomamos donde lo dejaste.' },
      ])
    } catch {
      // El paso guardado ya no existe en flow.json (actualización del flujo) → empezar limpio
      limpiarSesionLocal()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Guarda el estado tras cada paso respondido.
  // Se omite si sesion.respuestas está vacío (estado inicial antes de responder).
  // guardarSesionLocal elimina automáticamente la entrada cuando sesion.completado === true.
  useEffect(() => {
    if (Object.keys(sesion.respuestas).length === 0) return
    guardarSesionLocal(sesion, mensajes, pasoActual.id)
  }, [sesion, mensajes, pasoActual])

  // ── Trap de foco dentro del diálogo ──

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  // ── Render ──

  return (
    <>
      {/* Panel del chat */}
      <div
        id={dialogId}
        role="dialog"
        aria-label="Asistente Gina — Tu Lugar en Galicia"
        aria-modal="true"
        onKeyDown={onKeyDown}
        className={`
          fixed bottom-6 right-6 z-50
          flex flex-col
          bg-white rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-300 ease-in-out
          ${abierto
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
        style={{
          width: 'min(400px, 92vw)',
          height: 'min(640px, 88vh)',
        }}
      >
        {/* Cabecera */}
        <div
          className="shrink-0 flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: 'var(--color-granito)' }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar cuadrado-redondeado con sparkles — transmite IA, no persona */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-laton-oscuro)' }}
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{ color: 'var(--color-laton-claro)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>
            </div>
            <div>
              <p
                className="text-sm font-bold leading-none tracking-wide"
                style={{ color: 'var(--color-laton-claro)' }}
              >
                Gina
              </p>
              <p
                className="text-xs leading-tight mt-0.5"
                style={{ color: 'var(--color-arena)', opacity: 0.8 }}
              >
                Asistente virtual · Tu Lugar en Galicia
              </p>
            </div>
          </div>

          <button
            ref={botonCerrarRef}
            type="button"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar asistente Gina"
            className="transition-brand cursor-pointer p-1 rounded"
            style={{ color: 'var(--color-arena)', opacity: 0.7 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conversación — historial, flujo y lógica de edición */}
        <GinaConversation
          sesion={sesion}
          setSesion={setSesion}
          pasoActual={pasoActual}
          setPasoActual={setPasoActual}
          mensajes={mensajes}
          setMensajes={setMensajes}
          onCerrar={() => setAbierto(false)}
        />
      </div>
    </>
  )
}

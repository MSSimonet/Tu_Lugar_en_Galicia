'use client'

/**
 * AvoaMessages.tsx — Historial de mensajes del chat de Avoa.
 *
 * Muestra burbujas alternadas: Avoa (izquierda, blanco) y usuario (derecha, grafito).
 * Auto-scroll al último mensaje cada vez que cambia el historial.
 *
 * Cuando el paso actual es de tipo "botones", las opciones se renderizan
 * directamente aquí (inline, alineadas con el texto del mensaje de Avoa),
 * no en la barra inferior.
 */

import React, { useEffect, useRef } from 'react'
import { AvoaButtons } from './AvoaButtons'
import type { Opcion } from '@/lib/avoa/flowEngine'

export type Mensaje = {
  id: string
  de: 'avoa' | 'usuario'
  texto: string
  /** ID del paso al que pertenece este mensaje — permite truncar el historial al editar */
  pasoId?: string
  /** Solo en mensajes de usuario: clave de sesion.respuestas que seteó este paso */
  campo?: string
}

type Props = {
  mensajes: Mensaje[]
  cargando: boolean
  /** Opciones del paso actual — presentes solo cuando el paso es tipo "botones" */
  opciones?: Opcion[]
  multiselect?: boolean
  deshabilitadoBotones?: boolean
  onSeleccion?: (valor: string | string[]) => void
  /** Callback para editar una respuesta anterior. Si no se provee, no aparece el botón. */
  onEditarRespuesta?: (pasoId: string) => void
  /** Cuando true, oculta todos los botones de editar (durante carga o sesión completada) */
  editarDeshabilitado?: boolean
}

/** Sparkles inline — mismo path en header y avatar de burbuja */
function SparklesIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  )
}

export function AvoaMessages({
  mensajes,
  cargando,
  opciones,
  multiselect,
  deshabilitadoBotones,
  onSeleccion,
  onEditarRespuesta,
  editarDeshabilitado,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al agregar mensajes o cuando aparecen los botones (cargando → false)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  const mostrarBotones =
    !cargando && !!opciones && opciones.length > 0 && !!onSeleccion

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3"
      role="log"
      aria-live="polite"
      aria-label="Conversación con Avoa"
      style={{ backgroundColor: 'var(--color-niebla)' }}
    >
      {mensajes.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-end gap-2 ${msg.de === 'usuario' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar de Avoa — cuadrado redondeado con sparkles */}
          {msg.de === 'avoa' && (
            <div
              aria-hidden="true"
              className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-laton-oscuro)' }}
            >
              <SparklesIcon className="w-4 h-4" style={{ color: 'var(--color-laton-claro)' }} />
            </div>
          )}

          {/* Burbuja */}
          <div
            className={`max-w-[75%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.de === 'avoa'
                ? 'rounded-2xl rounded-tl-none'   // ángulo superior-izq apunta al avatar
                : 'rounded-2xl rounded-br-none'   // ángulo inferior-der apunta al usuario
            }`}
            style={
              msg.de === 'avoa'
                ? {
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-granito)',
                    boxShadow: '0 1px 2px rgba(42,43,46,0.08)',
                  }
                : {
                    backgroundColor: 'var(--color-granito)',
                    color: 'var(--color-arena)',
                  }
            }
          >
            {msg.texto}
          </div>

          {/* Botón de editar — solo en burbujas de usuario, cuando la función está habilitada */}
          {msg.de === 'usuario' &&
            !editarDeshabilitado &&
            onEditarRespuesta &&
            msg.pasoId && (
              <button
                type="button"
                onClick={() => onEditarRespuesta(msg.pasoId!)}
                aria-label="Editar esta respuesta"
                title="Editar respuesta"
                className="
                  shrink-0 self-center p-1.5 rounded-lg
                  opacity-30 hover:opacity-90
                  transition-opacity cursor-pointer
                "
                style={{ color: 'var(--color-granito)' }}
              >
                {/* Ícono lápiz */}
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
            )}
        </div>
      ))}

      {/* Indicador de carga (typing indicator) */}
      {cargando && (
        <div className="flex items-end gap-2">
          <div
            aria-hidden="true"
            className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-laton-oscuro)' }}
          >
            <SparklesIcon className="w-4 h-4" style={{ color: 'var(--color-laton-claro)' }} />
          </div>
          <div
            className="px-4 py-3 rounded-2xl rounded-tl-none"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(42,43,46,0.08)',
            }}
            aria-label="Avoa está escribiendo"
          >
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: 'var(--color-laton)',
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              ))}
            </span>
          </div>
        </div>
      )}

      {/* Botones de opciones — inline, alineados con el texto del mensaje de Avoa */}
      {mostrarBotones && (
        <div
          className="pl-9 mt-1"
          role="group"
          aria-label="Opciones de respuesta"
        >
          <AvoaButtons
            inline
            opciones={opciones!}
            multiselect={multiselect}
            deshabilitado={deshabilitadoBotones}
            onSeleccion={onSeleccion!}
          />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

'use client'

/**
 * GinaMessages.tsx — Historial de mensajes del chat de Gina.
 *
 * Muestra burbujas alternadas: Gina (izquierda, blanco) y usuario (derecha, grafito).
 * Auto-scroll al último mensaje cada vez que cambia el historial.
 *
 * Cuando el paso actual es de tipo "botones", las opciones se renderizan
 * directamente aquí (inline, alineadas con el texto del mensaje de Gina),
 * no en la barra inferior.
 */

import React, { useEffect, useRef, useMemo } from 'react'
import { motion } from 'motion/react'
import { GinaButtons } from './GinaButtons'
import { fadeUp } from '@/lib/motion/variants'
import type { Opcion } from '@/lib/gina/flowEngine'

export type Mensaje = {
  id: string
  de: 'gina' | 'usuario'
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
  exclusivaValue?: string
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

export function GinaMessages({
  mensajes,
  cargando,
  opciones,
  multiselect,
  exclusivaValue,
  deshabilitadoBotones,
  onSeleccion,
  onEditarRespuesta,
  editarDeshabilitado,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastGinaMsgRef = useRef<HTMLDivElement>(null)

  const lastGinaIdx = useMemo(
    () => mensajes.reduce<number>((acc, m, i) => (m.de === 'gina' ? i : acc), -1),
    [mensajes],
  )

  // Auto-scroll:
  // - cargando: scroll al fondo para mostrar el indicador de escritura
  // - nuevo mensaje Gina: scroll al INICIO del último mensaje para evitar que
  //   textos largos queden cortados por arriba (era el bug con la 2ª pregunta)
  useEffect(() => {
    if (cargando) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      lastGinaMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [mensajes, cargando])

  const mostrarBotones =
    !cargando && !!opciones && opciones.length > 0 && !!onSeleccion

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3"
      role="log"
      aria-live="polite"
      aria-label="Conversación con Gina"
      style={{ backgroundColor: 'var(--dz-papel)' }}
    >
      {mensajes.map((msg, i) => (
        <motion.div
          key={msg.id}
          ref={i === lastGinaIdx ? lastGinaMsgRef : undefined}
          className={`flex items-end gap-2 min-w-0 ${msg.de === 'usuario' ? 'flex-row-reverse' : 'flex-row'}`}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {/* Avatar de Gina — cuadrado redondeado con sparkles */}
          {msg.de === 'gina' && (
            <div
              aria-hidden="true"
              className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-laton-oscuro)' }}
            >
              <SparklesIcon className="w-4 h-4" style={{ color: 'var(--color-laton-claro)' }} />
            </div>
          )}

          {/* Burbuja (+ pill Editar para mensajes de usuario) */}
          {msg.de === 'usuario' ? (
            <div className="flex flex-col items-end gap-1 min-w-0">
              <div
                className="max-w-[75%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl rounded-br-none"
                style={{ backgroundColor: 'var(--dz-ink)', color: 'var(--dz-borde)' }}
              >
                {msg.texto}
              </div>
              {!editarDeshabilitado && onEditarRespuesta && msg.pasoId && (
                <button
                  type="button"
                  onClick={() => onEditarRespuesta(msg.pasoId!)}
                  aria-label={msg.texto ? `Editar tu respuesta: "${msg.texto}"` : 'Editar esta respuesta'}
                  className="text-xs underline underline-offset-2 cursor-pointer hover:no-underline transition-colors"
                  style={{ color: 'var(--color-mar)' }}
                >
                  Editar
                </button>
              )}
            </div>
          ) : (
            <div
              className="max-w-[75%] min-w-0 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl rounded-tl-none"
              style={{
                backgroundColor: 'var(--color-blanco)',
                color: 'var(--dz-ink)',
                boxShadow: 'var(--dz-shadow-sm)',
              }}
            >
              {msg.texto}
            </div>
          )}
        </motion.div>
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
              backgroundColor: 'var(--color-blanco)',
              boxShadow: 'var(--dz-shadow-sm)',
            }}
            aria-label="Gina está escribiendo"
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

      {/* Botones de opciones — inline, alineados con el texto del mensaje de Gina */}
      {mostrarBotones && (
        <div
          className="pl-9 mt-1"
          role="group"
          aria-label="Opciones de respuesta"
        >
          <GinaButtons
            inline
            opciones={opciones!}
            multiselect={multiselect}
            exclusivaValue={exclusivaValue}
            deshabilitado={deshabilitadoBotones}
            onSeleccion={onSeleccion!}
          />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

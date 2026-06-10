'use client'

/**
 * AvoaButtons.tsx — Selector de opciones de botón para el chat de Avoa.
 *
 * Soporta:
 *   - Selección única: un clic envía directamente
 *   - Multiselect: permite marcar varias opciones y confirmar con un botón
 *
 * Paleta: latón/bronce (laton, laton-oscuro, laton-claro) sobre niebla/arena.
 * Sin verde ni referencia a atlantico.
 */

import { useState } from 'react'
import type { Opcion } from '@/lib/avoa/flowEngine'

type Props = {
  opciones: Opcion[]
  multiselect?: boolean
  /** Value de la opción que actúa como excluyente ("ninguna"). Si está seleccionada,
   *  deshabilita las demás; si hay otra seleccionada, deshabilita esta. */
  exclusivaValue?: string
  deshabilitado?: boolean
  /** Cuando true, elimina el padding px-4 pb-4 del contenedor (para uso inline en el chat) */
  inline?: boolean
  onSeleccion: (valor: string | string[]) => void
}

export function AvoaButtons({ opciones, multiselect, exclusivaValue, deshabilitado, inline, onSeleccion }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  function toggleOpcion(value: string) {
    if (!multiselect) return
    if (exclusivaValue && value === exclusivaValue) {
      // Clic en la opción excluyente: seleccionarla sola (o deseleccionarla si ya estaba)
      setSeleccionados((prev) => (prev.includes(value) ? [] : [value]))
    } else {
      // Clic en opción normal: alternar y quitar la excluyente si estaba activa
      setSeleccionados((prev) => {
        const sinExclusiva = exclusivaValue ? prev.filter((v) => v !== exclusivaValue) : prev
        return sinExclusiva.includes(value)
          ? sinExclusiva.filter((v) => v !== value)
          : [...sinExclusiva, value]
      })
    }
  }

  function confirmarMultiselect() {
    if (seleccionados.length === 0) return
    onSeleccion(seleccionados)
    setSeleccionados([])
  }

  if (multiselect) {
    const exclusivaActiva = !!exclusivaValue && seleccionados.includes(exclusivaValue)
    const hayNoExclusiva = !!exclusivaValue && seleccionados.some((v) => v !== exclusivaValue)

    return (
      <div className={inline ? 'space-y-2' : 'px-4 pb-4 space-y-2'}>
        <p
          className="text-xs mb-1"
          style={{ color: 'var(--color-granito)', opacity: 0.6 }}
        >
          Puedes elegir varias opciones
        </p>
        <div className="flex flex-col gap-2">
          {opciones.map((op) => {
            const activo = seleccionados.includes(op.value)
            const bloqueado =
              deshabilitado ||
              (exclusivaActiva && op.value !== exclusivaValue) ||
              (hayNoExclusiva && op.value === exclusivaValue)
            return (
              <button
                key={op.value}
                type="button"
                disabled={bloqueado}
                onClick={() => toggleOpcion(op.value)}
                aria-pressed={activo}
                className="
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left
                  border transition-brand cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
                style={
                  activo
                    ? {
                        borderColor: 'var(--color-laton-oscuro)',
                        backgroundColor: 'var(--color-laton-oscuro)',
                        color: '#FFFFFF',
                      }
                    : {
                        borderColor: 'var(--color-laton)',
                        backgroundColor: '#FFFFFF',
                        color: 'var(--color-granito)',
                      }
                }
                onMouseEnter={(e) => {
                  if (!activo && !bloqueado) {
                    e.currentTarget.style.backgroundColor = 'var(--color-arena)'
                    e.currentTarget.style.color = 'var(--color-laton-oscuro)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!activo && !bloqueado) {
                    e.currentTarget.style.backgroundColor = '#FFFFFF'
                    e.currentTarget.style.color = 'var(--color-granito)'
                  }
                }}
              >
                {/* Checkbox visual */}
                <span
                  className="shrink-0 w-4 h-4 rounded flex items-center justify-center"
                  style={{
                    border: activo
                      ? '2px solid var(--color-laton-claro)'
                      : '2px solid var(--color-laton)',
                    backgroundColor: activo ? 'var(--color-laton-claro)' : 'transparent',
                  }}
                  aria-hidden="true"
                >
                  {activo && (
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      viewBox="0 0 10 8"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      style={{ color: 'var(--color-granito)' }}
                    >
                      <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {op.label}
              </button>
            )
          })}
        </div>

        {/* Botón de confirmación — "Continuar" */}
        <button
          type="button"
          disabled={deshabilitado || seleccionados.length === 0}
          onClick={confirmarMultiselect}
          className="
            mt-2 w-full py-2 px-4 rounded-xl text-sm font-semibold
            transition-brand cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          style={{
            backgroundColor: 'var(--color-laton)',
            color: '#FFFFFF',
            letterSpacing: '0.04em',
          }}
        >
          Continuar
        </button>
      </div>
    )
  }

  // Selección única
  return (
    <div className={inline ? 'flex flex-col gap-2' : 'px-4 pb-4 flex flex-col gap-2'}>
      {opciones.map((op) => (
        <button
          key={op.value}
          type="button"
          disabled={deshabilitado}
          onClick={() => onSeleccion(op.value)}
          className="
            px-4 py-2 rounded-xl text-sm font-medium text-left
            border transition-brand cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          style={{
            borderColor: 'var(--color-laton)',
            backgroundColor: '#FFFFFF',
            color: 'var(--color-granito)',
          }}
          onMouseEnter={(e) => {
            if (!deshabilitado) {
              e.currentTarget.style.backgroundColor = 'var(--color-arena)'
              e.currentTarget.style.color = 'var(--color-laton-oscuro)'
              e.currentTarget.style.borderColor = 'var(--color-laton-oscuro)'
            }
          }}
          onMouseLeave={(e) => {
            if (!deshabilitado) {
              e.currentTarget.style.backgroundColor = '#FFFFFF'
              e.currentTarget.style.color = 'var(--color-granito)'
              e.currentTarget.style.borderColor = 'var(--color-laton)'
            }
          }}
        >
          {op.label}
        </button>
      ))}
    </div>
  )
}

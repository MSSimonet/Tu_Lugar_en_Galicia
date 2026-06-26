'use client'

/**
 * GinaInput.tsx — Campo de texto libre para el chat de Gina.
 *
 * Soporta validación inline de email y teléfono.
 * Enter (sin Shift) envía el mensaje.
 */

import { useState, useRef, useEffect } from 'react'

type TipoValidacion = 'email' | 'telefono' | 'texto'

type Props = {
  validacion?: TipoValidacion
  placeholder?: string
  deshabilitado?: boolean
  onEnvio: (valor: string) => void
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_TELEFONO = /^\+?[1-9][\d\s\-()+]{5,17}$/

const esValidoTelefono = (v: string) => {
  if (!REGEX_TELEFONO.test(v)) return false
  const soloDigitos = v.replace(/\D/g, '')
  return soloDigitos.length >= 7 && soloDigitos.length <= 15
}

function validar(valor: string, tipo?: TipoValidacion): string | null {
  if (!valor.trim()) return 'Por favor, escribe tu respuesta.'
  if (tipo === 'email' && !REGEX_EMAIL.test(valor.trim())) {
    return 'El formato del email no es válido (ej: nombre@correo.com).'
  }
  if (tipo === 'telefono' && !esValidoTelefono(valor.trim())) {
    return 'El teléfono debe incluir el prefijo de país (ej: +54 11 1234-5678).'
  }
  return null
}

export function GinaInput({ validacion, placeholder, deshabilitado, onEnvio }: Props) {
  const [valor, setValor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Enfocar automáticamente el input cuando aparece
  useEffect(() => {
    if (!deshabilitado) {
      inputRef.current?.focus()
    }
  }, [deshabilitado])

  function intentarEnviar() {
    const errorMsg = validar(valor, validacion)
    if (errorMsg) {
      setError(errorMsg)
      return
    }
    setError(null)
    onEnvio(valor.trim())
    setValor('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      intentarEnviar()
    }
  }

  const placeholderTexto =
    placeholder ??
    (validacion === 'email'
      ? 'nombre@correo.com'
      : validacion === 'telefono'
        ? '+34 600 000 000'
        : 'Escribe aquí…')

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            ref={inputRef}
            type={validacion === 'email' ? 'email' : validacion === 'telefono' ? 'tel' : 'text'}
            value={valor}
            onChange={(e) => {
              setValor(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={onKeyDown}
            disabled={deshabilitado}
            placeholder={placeholderTexto}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'gina-input-error' : undefined}
            className="
              w-full px-4 py-2 rounded-xl text-sm
              border border-[color:var(--color-laton)]
              text-[color:var(--color-granito)]
              placeholder:text-[color:var(--color-pizarra)]
              focus:outline-none focus:ring-2 focus:ring-[color:var(--color-laton-claro)]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{ backgroundColor: deshabilitado ? 'var(--color-niebla)' : '#FFFFFF' }}
          />
        </div>

        {/* Botón enviar */}
        <button
          type="button"
          disabled={deshabilitado || !valor.trim()}
          onClick={intentarEnviar}
          aria-label="Enviar respuesta"
          className="
            shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
            text-white transition-brand cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          style={{ backgroundColor: 'var(--color-laton)' }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Error inline */}
      {error && (
        <p
          id="gina-input-error"
          role="alert"
          className="mt-1 ml-1 text-xs"
          style={{ color: 'var(--color-coral)' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

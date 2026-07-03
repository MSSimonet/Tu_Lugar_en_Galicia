'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'loading' | 'success' | 'error'

const inputBase =
  'w-full rounded-[var(--radius-card)] border border-[var(--color-arena)] bg-white px-4 py-3 font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-granito)] placeholder:text-[var(--color-arena)] focus:outline-none focus:border-[var(--color-laton)] focus:ring-1 focus:ring-[var(--color-laton)] transition-colors'

export function FormularioContacto() {
  const [nombre,   setNombre]   = useState('')
  const [email,    setEmail]    = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje,  setMensaje]  = useState('')
  const [rgpd,     setRgpd]     = useState(false)
  const [status,   setStatus]   = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!rgpd) {
      setErrorMsg('Debes aceptar la política de privacidad para continuar.')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono: telefono || undefined, mensaje }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? 'Error al enviar. Intenta de nuevo.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-[var(--radius-card)] bg-[var(--color-niebla)] border border-[var(--color-arena)] p-12 text-center flex flex-col items-center gap-6"
        role="status"
      >
        <div className="text-4xl" aria-hidden="true">✉️</div>
        <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)]">
          Mensaje recibido
        </h2>
        <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] max-w-sm leading-[var(--leading-cuerpo)]">
          Te respondemos en las próximas 24 horas hábiles.
        </p>
        <Link
          href="/"
          className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-mar)] underline-offset-4 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {status === 'error' && errorMsg && (
        <div
          className="rounded-[var(--radius-card)] border border-[var(--color-coral)] bg-[#FDF3F1] p-4 text-[var(--text-sm)] text-[#922B21]"
          role="alert"
        >
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="nombre"
            className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium text-[var(--color-granito)]"
          >
            Nombre y apellido <span aria-hidden="true" className="text-[var(--color-coral)]">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            required
            autoComplete="name"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className={inputBase}
            placeholder="María García"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium text-[var(--color-granito)]"
          >
            Email <span aria-hidden="true" className="text-[var(--color-coral)]">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputBase}
            placeholder="maria@ejemplo.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="telefono"
          className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium text-[var(--color-granito)]"
        >
          Teléfono{' '}
          <span className="font-normal text-[var(--color-pizarra)] opacity-60">(opcional)</span>
        </label>
        <input
          id="telefono"
          type="tel"
          autoComplete="tel"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          className={inputBase}
          placeholder="+54 11 1234 5678"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="mensaje"
          className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium text-[var(--color-granito)]"
        >
          Mensaje <span aria-hidden="true" className="text-[var(--color-coral)]">*</span>
        </label>
        <textarea
          id="mensaje"
          required
          rows={5}
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          className={`${inputBase} resize-y`}
          placeholder="Cuéntanos tu situación, ciudad de destino, cuándo planeas llegar…"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="rgpd"
          type="checkbox"
          required
          checked={rgpd}
          onChange={e => setRgpd(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-laton)] cursor-pointer"
        />
        <label
          htmlFor="rgpd"
          className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)] cursor-pointer"
        >
          He leído y acepto la{' '}
          <Link
            href="/politica-de-privacidad"
            className="underline underline-offset-2 hover:text-[var(--color-laton)] transition-colors"
            target="_blank"
          >
            política de privacidad
          </Link>
          . Mis datos serán tratados únicamente para responder a esta consulta.
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="self-start inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-laton)] px-8 py-4 font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-white tracking-[var(--tracking-ui)] uppercase hover:bg-[var(--color-laton-oscuro)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
      >
        {status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  )
}

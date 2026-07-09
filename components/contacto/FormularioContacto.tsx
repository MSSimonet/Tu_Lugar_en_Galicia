'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'loading' | 'success' | 'error'

const inputBase =
  'w-full rounded border px-4 py-3 [font-size:var(--text-sm)] placeholder:opacity-50 focus:outline-none focus:ring-1 transition-colors'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-lato)',
  borderRadius: '4px',
  borderColor: 'var(--po-borde)',
  backgroundColor: 'var(--po-luz)',
  color: 'var(--po-pedra)',
}

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
        className="p-12 text-center flex flex-col items-center gap-6"
        style={{ borderRadius: '4px', backgroundColor: 'var(--po-areia)', border: '1px solid var(--po-borde)' }}
        role="status"
      >
        <div className="text-4xl" aria-hidden="true">✉️</div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--po-pedra)' }}>
          Mensaje recibido
        </h2>
        <p
          className="max-w-sm leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-sm)', color: 'var(--po-muted)' }}
        >
          Te respondemos en las próximas 24 horas hábiles.
        </p>
        <Link
          href="/"
          className="underline-offset-4 hover:underline"
          style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-sm)', color: 'var(--po-ouro-text)' }}
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
          className="p-4 [font-size:var(--text-sm)]"
          style={{ borderRadius: '4px', border: '1px solid var(--color-coral)', backgroundColor: 'var(--po-luz)', color: 'var(--color-coral)' }}
          role="alert"
        >
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="nombre"
            className="[font-size:var(--text-sm)] font-medium"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}
          >
            Nombre y apellido <span aria-hidden="true" style={{ color: 'var(--color-coral)' }}>*</span>
          </label>
          <input
            id="nombre"
            type="text"
            required
            autoComplete="name"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className={inputBase}
            style={inputStyle}
            placeholder="María García"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="[font-size:var(--text-sm)] font-medium"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}
          >
            Email <span aria-hidden="true" style={{ color: 'var(--color-coral)' }}>*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputBase}
            style={inputStyle}
            placeholder="maria@ejemplo.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="telefono"
          className="[font-size:var(--text-sm)] font-medium"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}
        >
          Teléfono{' '}
          <span className="font-normal opacity-60">(opcional)</span>
        </label>
        <input
          id="telefono"
          type="tel"
          autoComplete="tel"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          className={inputBase}
          style={inputStyle}
          placeholder="+54 11 1234 5678"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="mensaje"
          className="[font-size:var(--text-sm)] font-medium"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}
        >
          Mensaje <span aria-hidden="true" style={{ color: 'var(--color-coral)' }}>*</span>
        </label>
        <textarea
          id="mensaje"
          required
          rows={5}
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          className={`${inputBase} resize-y`}
          style={inputStyle}
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
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
          style={{ accentColor: 'var(--po-ouro)' }}
        />
        <label
          htmlFor="rgpd"
          className="[font-size:var(--text-xs)] leading-[var(--leading-cuerpo)] cursor-pointer"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
        >
          He leído y acepto la{' '}
          <Link
            href="/politica-de-privacidad"
            className="underline underline-offset-2 transition-colors"
            style={{ color: 'var(--po-ouro-text)' }}
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
        className="self-start inline-flex items-center justify-center px-8 py-4 font-bold [font-size:var(--text-sm)] tracking-[0.10em] uppercase disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          fontFamily: 'var(--font-lato)',
          borderRadius: '4px',
          backgroundColor: 'var(--po-ouro)',
          color: '#1A1410',
          outlineColor: 'var(--po-ouro)',
        }}
      >
        {status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  )
}

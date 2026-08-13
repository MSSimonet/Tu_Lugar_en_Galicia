'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useValidacionHibrida } from '@/lib/forms/useValidacionHibrida'

type Status = 'idle' | 'loading' | 'success' | 'error'
type ErroresContacto = Partial<Record<'nombre' | 'email' | 'mensaje' | 'rgpd', string>>

const inputBase =
  'w-full rounded border px-4 py-3 [font-size:var(--text-sm)] '
  // El placeholder NO se deja al alfa por defecto: Tailwind v4 aplica
  // color-mix(currentcolor 50%) en su preflight, y ese 50% sobre --dz-ink mide 3,88:1,
  // por debajo del 4,5:1 que WCAG 1.4.3 exige para texto. Antes era peor: `placeholder:opacity-50`
  // multiplicaba OTRO 0,5 y lo dejaba en 1,82:1 — y en estos formularios el placeholder es lo
  // unico que explica que escribir. Con --dz-muted mide 5,31:1 en claro y 5,84:1 en oscuro.
  + 'placeholder:[color:var(--dz-muted)] '
  + 'focus:outline-none focus:ring-1 transition-colors'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  borderRadius: 'var(--dz-radius-input)',
  borderColor: 'var(--dz-borde-input)',
  backgroundColor: 'var(--dz-luz)',
  color: 'var(--dz-ink)',
}

// Mismos tres que ya usa el formulario de Comunidad, para que un error se vea igual en
// las dos páginas: borde coral en el campo y el mensaje justo debajo, no arriba del todo.
const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: 'var(--color-coral)' }
const errorClass = 'mt-1 [font-size:var(--text-xs)]'
const errorStyle: React.CSSProperties = { fontFamily: 'var(--font-dz-ui)', color: 'var(--color-coral)' }

export function FormularioContacto() {
  const [nombre,   setNombre]   = useState('')
  const [email,    setEmail]    = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje,  setMensaje]  = useState('')
  const [rgpd,     setRgpd]     = useState(false)
  const [status,   setStatus]   = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  /**
   * Este formulario NO tenía validación por campo: sólo comprobaba el RGPD y confiaba en los
   * `required` del HTML — que con `noValidate` en el <form> el navegador ni siquiera aplica.
   * Resultado: un envío con el nombre o el mensaje vacíos salía igual y lo rechazaba el
   * servidor, devolviendo un error genérico arriba del todo sin decir qué campo faltaba.
   */
  function validar(): ErroresContacto {
    const e: ErroresContacto = {}
    if (!nombre.trim()) e.nombre = 'Necesitamos tu nombre para poder responderte.'
    if (!email.trim()) e.email = 'Necesitamos tu email para poder responderte.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Ese email no parece tener el formato correcto (ej: nombre@correo.com).'
    if (!mensaje.trim()) e.mensaje = 'Cuéntanos brevemente en qué podemos ayudarte.'
    if (!rgpd) e.rgpd = 'Debes aceptar la política de privacidad para continuar.'
    return e
  }

  // Validación híbrida: callada hasta el primer envío, reactiva onBlur después.
  // Ver lib/forms/useValidacionHibrida.ts.
  const { errores, validarParaEnviar, validarCampo, limpiarError } =
    useValidacionHibrida<ErroresContacto>(validar)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const encontrados = validarParaEnviar()
    if (Object.keys(encontrados).length > 0) {
      const primero = (['nombre', 'email', 'mensaje', 'rgpd'] as const).find((c) => encontrados[c])
      const destino = primero ? document.getElementById(primero) : null
      destino?.focus()
      destino?.scrollIntoView({ block: 'center', behavior: 'smooth' })
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
        style={{ borderRadius: 'var(--dz-radius-card)', backgroundColor: 'var(--dz-papel)', border: '1px solid var(--dz-borde)', boxShadow: 'var(--dz-shadow-sm)' }}
        role="status"
      >
        <div className="text-4xl" aria-hidden="true">✉️</div>
        <h2 style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--dz-ink)' }}>
          Mensaje recibido
        </h2>
        <p
          className="max-w-sm leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-sm)', color: 'var(--dz-muted)' }}
        >
          Te respondemos en las próximas 24 horas hábiles.
        </p>
        <Link
          href="/"
          className="underline-offset-4 hover:underline"
          style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-sm)', color: 'var(--dz-accent-text)' }}
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
          style={{ borderRadius: '8px', border: '1px solid var(--color-coral)', backgroundColor: 'var(--dz-luz)', color: 'var(--color-coral)' }}
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
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
          >
            Nombre y apellido <span aria-hidden="true" style={{ color: 'var(--color-coral)' }}>*</span>
          </label>
          <input
            id="nombre"
            type="text"
            required
            autoComplete="name"
            value={nombre}
            onChange={e => { setNombre(e.target.value); limpiarError('nombre') }}
            onBlur={() => validarCampo('nombre')}
            className={inputBase}
            style={errores.nombre ? inputErrorStyle : inputStyle}
            placeholder="María García"
            aria-describedby={errores.nombre ? 'nombre-error' : undefined}
          />
          {errores.nombre && (
            <p id="nombre-error" className={errorClass} style={errorStyle} role="alert">{errores.nombre}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="[font-size:var(--text-sm)] font-medium"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
          >
            Email <span aria-hidden="true" style={{ color: 'var(--color-coral)' }}>*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); limpiarError('email') }}
            onBlur={() => validarCampo('email')}
            className={inputBase}
            style={errores.email ? inputErrorStyle : inputStyle}
            placeholder="maria@ejemplo.com"
            aria-describedby={errores.email ? 'email-error' : undefined}
          />
          {errores.email && (
            <p id="email-error" className={errorClass} style={errorStyle} role="alert">{errores.email}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="telefono"
          className="[font-size:var(--text-sm)] font-medium"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
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
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
        >
          Mensaje <span aria-hidden="true" style={{ color: 'var(--color-coral)' }}>*</span>
        </label>
        <textarea
          id="mensaje"
          required
          rows={5}
          value={mensaje}
          onChange={e => { setMensaje(e.target.value); limpiarError('mensaje') }}
          onBlur={() => validarCampo('mensaje')}
          className={`${inputBase} resize-y`}
          style={errores.mensaje ? inputErrorStyle : inputStyle}
          placeholder="Cuéntanos tu situación, ciudad de destino, cuándo planeas llegar…"
          aria-describedby={errores.mensaje ? 'mensaje-error' : undefined}
        />
        {errores.mensaje && (
          <p id="mensaje-error" className={errorClass} style={errorStyle} role="alert">{errores.mensaje}</p>
        )}
      </div>

      <div className="flex items-start gap-3">
        <input
          id="rgpd"
          type="checkbox"
          required
          checked={rgpd}
          onChange={e => { setRgpd(e.target.checked); limpiarError('rgpd') }}
          onBlur={() => validarCampo('rgpd')}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
          style={{ accentColor: 'var(--dz-accent)' }}
          aria-describedby={errores.rgpd ? 'rgpd-error' : undefined}
        />
        <label
          htmlFor="rgpd"
          className="[font-size:var(--text-xs)] leading-[var(--leading-cuerpo)] cursor-pointer"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
        >
          He leído y acepto la{' '}
          <Link
            href="/politica-de-privacidad"
            className="underline underline-offset-2 transition-colors"
            style={{ color: 'var(--dz-accent-text)' }}
            target="_blank"
          >
            política de privacidad
          </Link>
          . Mis datos serán tratados únicamente para responder a esta consulta.
        </label>
      </div>
      {errores.rgpd && (
        <p id="rgpd-error" className={errorClass} style={errorStyle} role="alert">{errores.rgpd}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="self-start inline-flex items-center justify-center px-8 py-4 font-bold [font-size:var(--text-sm)] tracking-[0.10em] uppercase disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          fontFamily: 'var(--font-dz-ui)',
          borderRadius: '999px',
          backgroundColor: 'var(--dz-accent)',
          color: '#1A1410',
          outlineColor: 'var(--dz-ink)',
          boxShadow: 'var(--dz-shadow-md)',
        }}
      >
        {status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  )
}

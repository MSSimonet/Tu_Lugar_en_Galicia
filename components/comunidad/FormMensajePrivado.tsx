'use client'

import { useState, type FormEvent } from 'react'

interface FormMensajePrivadoProps {
  /** uuid del perfil destinatario — nunca su email, ver docs/comunidad-de-acogida.md §4. */
  destinatarioId: string
}

type Estado = 'idle' | 'enviando' | 'enviado' | 'error'

const inputBase =
  'w-full rounded border px-3 py-2 [font-size:var(--text-xs)] placeholder:opacity-50 focus:outline-none focus:ring-1 transition-colors'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  borderRadius: '8px',
  borderColor: 'var(--dz-borde)',
  backgroundColor: 'var(--dz-luz)',
  color: 'var(--dz-ink)',
}

function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function FormMensajePrivado({ destinatarioId }: FormMensajePrivadoProps) {
  const [remitenteNombre, setRemitenteNombre] = useState('')
  const [remitenteEmail, setRemitenteEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (remitenteNombre.trim().length < 2) {
      setErrorMsg('Escribe tu nombre.')
      setEstado('error')
      return
    }
    if (!esEmailValido(remitenteEmail.trim())) {
      setErrorMsg('Escribe un email válido.')
      setEstado('error')
      return
    }
    if (mensaje.trim().length < 5) {
      setErrorMsg('Escribe un mensaje un poco más largo.')
      setEstado('error')
      return
    }

    setEstado('enviando')
    setErrorMsg('')

    try {
      const res = await fetch('/api/comunidad/mensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinatarioId,
          remitenteEmail: remitenteEmail.trim(),
          remitenteNombre: remitenteNombre.trim(),
          mensaje: mensaje.trim(),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? 'No se pudo enviar el mensaje. Intenta de nuevo.')
        setEstado('error')
        return
      }
      setEstado('enviado')
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setEstado('error')
    }
  }

  if (estado === 'enviado') {
    // Decía "Mensaje enviado", y desde §5.12 eso es falso: el mensaje NO sale hasta que el
    // remitente abre el enlace que le mandamos. Prometer un envío que todavía no ocurrió
    // dejaría a la persona esperando una respuesta que nadie va a poder darle.
    return (
      <div
        role="status"
        className="flex flex-col gap-1 [font-size:var(--text-xs)]"
        style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
      >
        <p>Revisa tu correo: te enviamos un enlace para confirmar el mensaje.</p>
        <p style={{ color: 'var(--dz-muted)' }}>
          Hasta que lo abras, no se envía. Así quien lo reciba sabe que tu dirección es real.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="mp-nombre"
          className="[font-size:var(--text-xs)] font-medium"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
        >
          Tu nombre
        </label>
        <input
          id="mp-nombre"
          type="text"
          required
          autoComplete="name"
          value={remitenteNombre}
          onChange={(e) => setRemitenteNombre(e.target.value)}
          className={inputBase}
          style={inputStyle}
          placeholder="Tu nombre"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="mp-email"
          className="[font-size:var(--text-xs)] font-medium"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
        >
          Tu email
        </label>
        <input
          id="mp-email"
          type="email"
          required
          autoComplete="email"
          value={remitenteEmail}
          onChange={(e) => setRemitenteEmail(e.target.value)}
          className={inputBase}
          style={inputStyle}
          placeholder="tu@email.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="mp-mensaje"
          className="[font-size:var(--text-xs)] font-medium"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
        >
          Mensaje
        </label>
        <textarea
          id="mp-mensaje"
          required
          rows={3}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className={`${inputBase} resize-y`}
          style={inputStyle}
          placeholder="Cuéntale por qué te gustaría conectar…"
        />
      </div>

      {estado === 'error' && errorMsg && (
        <p role="alert" className="[font-size:var(--text-xs)]" style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--color-coral)' }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="self-start inline-flex items-center justify-center px-3 py-2 font-bold [font-size:var(--text-xs)] uppercase tracking-[0.08em] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          fontFamily: 'var(--font-dz-ui)',
          borderRadius: '8px',
          backgroundColor: 'var(--dz-accent)',
          color: '#1A1410',
          outlineColor: 'var(--dz-accent)',
        }}
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  )
}

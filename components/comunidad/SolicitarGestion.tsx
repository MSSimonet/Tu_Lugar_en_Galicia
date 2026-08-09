'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

type Status = 'idle' | 'loading' | 'success' | 'error'

const inputBase =
  'w-full rounded border px-4 py-3 [font-size:var(--text-sm)] placeholder:opacity-50 focus:outline-none focus:ring-1 transition-colors'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  borderRadius: 'var(--dz-radius-input)',
  borderColor: 'var(--dz-borde)',
  backgroundColor: 'var(--dz-luz)',
  color: 'var(--dz-ink)',
}

const helperStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-xs)',
  color: 'var(--dz-muted)',
}

export function SolicitarGestion() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setErrorMsg('')
    setStatus('loading')

    try {
      const res = await fetch('/api/comunidad/gestionar/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (res.ok) {
        setStatus('success')
        return
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setErrorMsg(data.error ?? 'No se pudo enviar el enlace. Intenta de nuevo.')
      setStatus('error')
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setStatus('error')
    }
  }

  // Éxito deliberadamente ambiguo: dice "si hay un perfil", no "te lo mandamos". El endpoint
  // responde igual exista o no el perfil (anti-enumeración) y este texto tiene que sostener
  // esa misma ambigüedad — si dijera "te enviamos un enlace", delataría que el email existe.
  if (status === 'success') {
    return (
      <div
        className="flex flex-col gap-3 p-6"
        style={{
          borderRadius: 'var(--dz-radius-card)',
          backgroundColor: 'var(--dz-papel)',
          border: '1px solid var(--dz-borde)',
          boxShadow: 'var(--dz-shadow-sm)',
        }}
        role="status"
      >
        <h2
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontWeight: 700,
            fontSize: 'var(--text-lg)',
            color: 'var(--dz-ink)',
          }}
        >
          Revisa tu correo
        </h2>
        <p className="leading-[var(--leading-cuerpo)]" style={{ ...helperStyle, fontSize: 'var(--text-sm)' }}>
          Si hay un perfil registrado con <strong style={{ color: 'var(--dz-ink)' }}>{email.trim()}</strong>,
          te acabamos de enviar el enlace para gestionarlo.
        </p>
        <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
          El enlace vale una hora. Si no lo ves, mira en la carpeta de spam.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {status === 'error' && errorMsg && (
        <p
          className="p-4 [font-size:var(--text-sm)]"
          style={{
            borderRadius: '8px',
            border: '1px solid var(--color-coral)',
            backgroundColor: 'var(--dz-luz)',
            color: 'var(--color-coral)',
            fontFamily: 'var(--font-dz-ui)',
          }}
          role="alert"
        >
          {errorMsg}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email-gestion"
          className="[font-size:var(--text-sm)] font-medium"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
        >
          Tu email
        </label>
        <input
          id="email-gestion"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputBase}
          style={inputStyle}
          placeholder="maria@ejemplo.com"
        />
        <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
          Te mandamos un enlace a esa dirección. Es la forma de comprobar que el perfil es tuyo.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={status === 'loading'} className="self-start">
        {status === 'loading' ? 'Enviando…' : 'Enviarme el enlace'}
      </Button>
    </form>
  )
}

'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useValidacionHibrida } from '@/lib/forms/useValidacionHibrida'
import { EMAIL_REGEX } from '@/lib/validation'

type Status = 'idle' | 'loading' | 'success' | 'error'
type ErroresGestion = Partial<Record<'email', string>>

const inputBase =
  'w-full rounded border px-4 py-3 [font-size:var(--text-sm)] '
  // El placeholder NO se deja al alfa por defecto: Tailwind v4 aplica
  // color-mix(currentcolor 50%) en su preflight, y ese 50% sobre --dz-ink mide 3,88:1,
  // por debajo del 4,5:1 que WCAG 1.4.3 exige para texto. Antes era peor: `placeholder:opacity-50`
  // multiplicaba OTRO 0,5 y lo dejaba en 1,82:1 — y en estos formularios el placeholder es lo
  // unico que explica que escribir. Con --dz-muted mide 5,31:1 en claro y 5,84:1 en oscuro.
  + 'placeholder:[color:var(--dz-muted)] '
  // Sin `transition-colors` a propósito: si no, el borde coral de error no se pinta nunca.
  // El porqué, con las medidas, está en components/contacto/FormularioContacto.tsx.
  + 'focus:outline-none focus:ring-1'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  borderRadius: 'var(--dz-radius-input)',
  borderColor: 'var(--dz-borde-input)',
  backgroundColor: 'var(--dz-luz)',
  color: 'var(--dz-ink)',
}

const helperStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-xs)',
  color: 'var(--dz-muted)',
}

// Los mismos tres que usan Contacto y Comunidad, para que un error se vea igual en las tres.
const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: 'var(--color-coral)' }
const errorClass = 'mt-1 [font-size:var(--text-xs)]'
const errorStyle: React.CSSProperties = { fontFamily: 'var(--font-dz-ui)', color: 'var(--color-coral)' }

export function SolicitarGestion() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function validar(): ErroresGestion {
    const e: ErroresGestion = {}
    if (!email.trim()) e.email = 'Necesitamos tu email para poder enviarte el enlace.'
    else if (!EMAIL_REGEX.test(email.trim()))
      e.email = 'Ese email no parece tener el formato correcto (ej: nombre@correo.com).'
    return e
  }

  // Validación híbrida, igual que Contacto y Comunidad (lib/forms/useValidacionHibrida.ts).
  const { errores, validarParaEnviar, validarCampo, limpiarError } =
    useValidacionHibrida<ErroresGestion>(validar)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // Antes esto era `if (!email.trim()) return`: un callejón sin salida silencioso. El
    // <form> lleva noValidate, así que el navegador tampoco aplicaba el `required` del
    // input — con el campo vacío o mal escrito, pulsar el botón no producía absolutamente
    // nada: ni mensaje, ni foco, ni petición. Ahora dice qué falta y lleva el foco allí.
    const encontrados = validarParaEnviar()
    if (encontrados.email) {
      document.getElementById('email-gestion')?.focus()
      return
    }

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
          onChange={e => { setEmail(e.target.value); limpiarError('email') }}
          onBlur={() => validarCampo('email')}
          className={inputBase}
          style={errores.email ? inputErrorStyle : inputStyle}
          placeholder="maria@ejemplo.com"
          aria-invalid={errores.email ? true : undefined}
          aria-describedby={errores.email ? 'email-gestion-error' : undefined}
        />
        {errores.email && (
          <p id="email-gestion-error" className={errorClass} style={errorStyle} role="alert">{errores.email}</p>
        )}
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

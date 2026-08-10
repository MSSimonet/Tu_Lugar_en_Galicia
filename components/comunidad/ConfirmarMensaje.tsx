'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface ConfirmarMensajeProps {
  /** Vienen de la page (server): así no hace falta useSearchParams ni un límite de Suspense. */
  id?: string
  token?: string
}

const textoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-md)',
  color: 'var(--dz-ink)',
}

const mutedStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-sm)',
  color: 'var(--dz-muted)',
}

export function ConfirmarMensaje({ id, token }: ConfirmarMensajeProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [destinatario, setDestinatario] = useState('')

  if (!id || !token) {
    return (
      <div className="flex flex-col gap-[var(--space-4)]">
        <p style={textoStyle} role="alert">
          Este enlace no es válido. Puede que se haya cortado al copiarlo.
        </p>
        <p style={mutedStyle}>
          Abre el enlace completo desde el correo que te enviamos, o{' '}
          <Link
            href="/comunidad/mapa"
            className="underline underline-offset-2"
            style={{ color: 'var(--dz-accent-text)' }}
          >
            vuelve al mapa
          </Link>{' '}
          y escríbelo de nuevo.
        </p>
      </div>
    )
  }

  async function handleConfirmar() {
    setErrorMsg('')
    setStatus('loading')
    try {
      const res = await fetch('/api/comunidad/mensaje/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        destinatarioNombre?: string
      }
      if (res.ok) {
        setDestinatario(data.destinatarioNombre ?? '')
        setStatus('success')
        return
      }
      setErrorMsg(data.error ?? 'No se pudo enviar el mensaje. Intenta de nuevo.')
      setStatus('error')
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-[var(--space-3)]" role="status">
        <p style={textoStyle}>
          {destinatario ? `Enviado. ${destinatario} ya tiene tu mensaje.` : 'Enviado.'}
        </p>
        <p style={mutedStyle}>
          Si te responde, lo hará directo a tu correo.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <p style={textoStyle}>
        Un clic y tu mensaje sale. Así sabemos que este correo es tuyo, y quien lo reciba puede
        responderte con confianza.
      </p>

      {status === 'error' && (
        <div className="flex flex-col gap-[var(--space-3)]">
          <p
            className="p-4"
            style={{
              borderRadius: '8px',
              border: '1px solid var(--color-coral)',
              backgroundColor: 'var(--dz-luz)',
              color: 'var(--color-coral)',
              fontFamily: 'var(--font-dz-ui)',
              fontSize: 'var(--text-sm)',
            }}
            role="alert"
          >
            {errorMsg}
          </p>
          <p style={mutedStyle}>
            <Link
              href="/comunidad/mapa"
              className="underline underline-offset-2"
              style={{ color: 'var(--dz-accent-text)' }}
            >
              Volver al mapa
            </Link>
          </p>
        </div>
      )}

      <Button
        type="button"
        size="lg"
        onClick={handleConfirmar}
        disabled={status === 'loading'}
        className="self-start"
      >
        {status === 'loading' ? 'Enviando…' : 'Confirmar y enviar'}
      </Button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface ConfirmarRegistroProps {
  /** Vienen de la page (server), no de useSearchParams: así no hace falta Suspense. */
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

export function ConfirmarRegistro({ id, token }: ConfirmarRegistroProps) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const faltanDatos = !id || !token

  async function handleConfirmar() {
    setErrorMsg('')
    setStatus('loading')

    try {
      const res = await fetch('/api/comunidad/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token }),
      })

      if (res.ok) {
        setStatus('success')
        router.push('/comunidad/mapa')
        return
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setErrorMsg(data.error ?? 'No pudimos confirmar tu registro. Intenta de nuevo.')
      setStatus('error')
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setStatus('error')
    }
  }

  // Link abierto a mano, recortado por el cliente de correo, o sin parámetros. No se llama
  // al endpoint: no hay nada que confirmar.
  if (faltanDatos) {
    return (
      <div className="flex flex-col gap-[var(--space-4)]">
        <p style={textoStyle} role="alert">
          Este enlace no es válido. Puede que se haya cortado al copiarlo.
        </p>
        <p style={mutedStyle}>
          Abre el enlace completo desde el correo que te enviamos, o{' '}
          <Link
            href="/comunidad"
            className="underline underline-offset-2"
            style={{ color: 'var(--dz-accent-text)' }}
          >
            vuelve a registrarte
          </Link>{' '}
          y te mandamos uno nuevo.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <p style={textoStyle}>
        Un clic y tu perfil aparece en el mapa. Así sabemos que este correo es tuyo.
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
              href="/comunidad"
              className="underline underline-offset-2"
              style={{ color: 'var(--dz-accent-text)' }}
            >
              Volver a registrarme
            </Link>
          </p>
        </div>
      )}

      <Button
        type="button"
        size="lg"
        onClick={handleConfirmar}
        disabled={status === 'loading' || status === 'success'}
        className="self-start"
      >
        {status === 'loading'
          ? 'Confirmando…'
          : status === 'success'
            ? 'Listo, ya estás en el mapa'
            : 'Confirmar mi registro'}
      </Button>
    </div>
  )
}

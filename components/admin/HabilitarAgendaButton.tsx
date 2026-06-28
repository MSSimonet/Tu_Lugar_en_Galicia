'use client'

import { useState } from 'react'

interface Props {
  recordId: string
  token: string
  codigoExistente?: string
}

export function HabilitarAgendaButton({ recordId, token, codigoExistente }: Props) {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'done' | 'warning' | 'error'>('idle')
  const [msg, setMsg]       = useState('')

  if (codigoExistente) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#e8f5e9', color: '#2e7d32',
            padding: '10px 18px', borderRadius: '6px',
            fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500,
          }}
        >
          ✓ Agenda habilitada — código: <strong style={{ letterSpacing: '0.1em' }}>{codigoExistente}</strong>
        </span>
      </div>
    )
  }

  async function handleClick() {
    setEstado('loading')
    setMsg('')
    try {
      const res = await fetch(`/api/admin/habilitar-agenda/${recordId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = (await res.json()) as { ok?: boolean; warning?: string; error?: string }
      if (!res.ok) {
        setMsg(data.error ?? 'Error desconocido')
        setEstado('error')
      } else if (data.warning) {
        setMsg(data.warning)
        setEstado('warning')
      } else {
        setMsg('Mail enviado al cliente.')
        setEstado('done')
      }
    } catch {
      setMsg('Error de conexión. Intentá de nuevo.')
      setEstado('error')
    }
  }

  const disabled = estado === 'loading' || estado === 'done' || estado === 'warning'

  const btnStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 28px',
    borderRadius: '6px',
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-ui)',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    transition: 'opacity 0.15s',
    opacity: disabled ? 0.7 : 1,
    background:
      estado === 'done'    ? '#2e7d32' :
      estado === 'warning' ? '#8F722B' :
      estado === 'error'   ? '#c62828' :
                             '#1E1C19',
    color: '#ffffff',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
      <button onClick={handleClick} disabled={disabled} style={btnStyle}>
        {estado === 'loading' ? 'Habilitando...' :
         estado === 'done'    ? '✓ Habilitado' :
         estado === 'warning' ? '✓ Código enviado' :
         estado === 'error'   ? 'Reintentar' :
                                'Habilitar agenda →'}
      </button>
      {msg && (
        <p style={{
          margin: 0, fontSize: '13px', fontFamily: 'var(--font-ui)',
          color: estado === 'error' ? '#c62828' : estado === 'warning' ? '#7A5F22' : '#2e7d32',
        }}>
          {msg}
        </p>
      )}
    </div>
  )
}

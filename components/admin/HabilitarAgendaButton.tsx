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
            background: 'var(--color-estado-ok-bg)', color: 'var(--color-estado-ok)',
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
      estado === 'done'    ? 'var(--color-estado-ok)' :
      estado === 'warning' ? 'var(--color-laton)' :
      estado === 'error'   ? 'var(--color-estado-error)' :
                             'var(--color-granito)',
    // Un color por estado, porque los cuatro fondos son distintos y ninguno solo
    // pasaba AA contra todos. Antes era --color-texto-sobre-estado fijo para los cuatro:
    // fallaba sobre --color-laton (3.44:1) y, peor, el estado de reposo quedaba en
    // 1.19:1 en tema oscuro — --color-granito invierte con el tema y el texto no,
    // así que era blanco sobre un fondo claro.
    color:
      estado === 'done'    ? 'var(--color-texto-sobre-estado)' : // 4.70:1 sobre estado-ok
      estado === 'warning' ? 'var(--dz-accent-ink)' :            // 5.34:1 sobre laton (blanco daba 3.44:1)
      estado === 'error'   ? 'var(--color-texto-sobre-estado)' : // 6.03:1 sobre estado-error
                             'var(--color-blanco)',       // invierte con granito: 14.92:1 claro / 15.74:1 oscuro
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
          color: estado === 'error' ? 'var(--color-estado-error)' : estado === 'warning' ? 'var(--color-laton-text)' : 'var(--color-estado-ok)',
        }}>
          {msg}
        </p>
      )}
    </div>
  )
}

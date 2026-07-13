'use client'

import { useState, type FormEvent } from 'react'
import { useAdminAction } from '@/components/admin/ficha/useAdminAction'

interface Props {
  leadId: string
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid var(--color-arena)',
  borderRadius: '4px', fontSize: '14px', fontFamily: 'var(--font-ui)',
  background: 'var(--color-blanco)', color: 'var(--color-granito)',
}

export function NuevaNotaForm({ leadId }: Props) {
  const { run, loading, error } = useAdminAction()
  const [tipo, setTipo] = useState<'nota' | 'tarea'>('nota')
  const [contenido, setContenido] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!contenido.trim()) return

    const ok = await run(
      () => fetch(`/api/admin/leads/${leadId}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          contenido: contenido.trim(),
          ...(tipo === 'tarea' && fechaVencimiento ? { fechaVencimiento } : {}),
        }),
      }),
      'No se pudo guardar. Reintentá.',
    )
    if (ok) {
      setContenido('')
      setFechaVencimiento('')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'var(--font-ui)', color: 'var(--color-granito)' }}>
          <input type="radio" name="tipo" checked={tipo === 'nota'} onChange={() => setTipo('nota')} />
          Nota
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'var(--font-ui)', color: 'var(--color-granito)' }}>
          <input type="radio" name="tipo" checked={tipo === 'tarea'} onChange={() => setTipo('tarea')} />
          Tarea
        </label>
      </div>

      <textarea
        value={contenido}
        onChange={e => setContenido(e.target.value)}
        placeholder={tipo === 'tarea' ? 'Describí la tarea…' : 'Escribí una nota…'}
        rows={3}
        required
        style={{ ...inputStyle, resize: 'vertical' as const }}
      />

      {tipo === 'tarea' && (
        <input
          type="date"
          value={fechaVencimiento}
          onChange={e => setFechaVencimiento(e.target.value)}
          style={inputStyle}
        />
      )}

      {error && (
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-estado-error)', fontFamily: 'var(--font-ui)' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !contenido.trim()}
        style={{
          alignSelf: 'flex-start', padding: '8px 20px', borderRadius: '4px', border: 'none',
          background: 'var(--color-granito)', color: 'var(--color-blanco)',
          fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 500,
          cursor: loading ? 'default' : 'pointer', opacity: loading || !contenido.trim() ? 0.6 : 1,
        }}
      >
        {loading ? 'Guardando…' : 'Agregar'}
      </button>
    </form>
  )
}

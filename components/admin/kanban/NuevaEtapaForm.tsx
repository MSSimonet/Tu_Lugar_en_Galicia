'use client'

import { useState, type FormEvent } from 'react'
import { useAdminAction } from '@/components/admin/ficha/useAdminAction'

/** Columna final del Kanban: botón "+ Nueva etapa" que abre un input simple. */
export function NuevaEtapaForm() {
  const { run, loading, error } = useAdminAction()
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) return

    const ok = await run(
      () => fetch('/api/admin/pipeline/etapas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreLimpio }),
      }),
      'No se pudo crear la etapa. Reintentá.',
    )
    if (ok) {
      setNombre('')
      setAbierto(false)
    }
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        style={{
          minWidth: '260px', height: '48px', borderRadius: '8px',
          border: '1px dashed var(--color-arena)', background: 'transparent',
          color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        + Nueva etapa
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        minWidth: '260px', flexShrink: 0, background: 'var(--color-blanco)',
        border: '1px solid var(--color-arena)', borderRadius: '8px', padding: '12px',
        display: 'flex', flexDirection: 'column', gap: '8px', height: 'fit-content',
      }}
    >
      <input
        autoFocus
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre de la etapa"
        disabled={loading}
        style={{
          padding: '8px 10px', border: '1px solid var(--color-arena)', borderRadius: '4px',
          fontSize: '13px', fontFamily: 'var(--font-ui)', color: 'var(--color-granito)',
        }}
      />
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--color-estado-error)', fontFamily: 'var(--font-ui)' }}>
          {error}
        </span>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="submit"
          disabled={loading || !nombre.trim()}
          style={{
            padding: '6px 14px', borderRadius: '4px', border: 'none',
            background: 'var(--color-granito)', color: 'var(--color-blanco)',
            fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500,
            cursor: loading ? 'default' : 'pointer', opacity: loading || !nombre.trim() ? 0.6 : 1,
          }}
        >
          {loading ? 'Creando…' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => { setAbierto(false); setNombre('') }}
          style={{
            padding: '6px 14px', borderRadius: '4px', border: '1px solid var(--color-arena)',
            background: 'var(--color-blanco)', color: 'var(--color-pizarra)',
            fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

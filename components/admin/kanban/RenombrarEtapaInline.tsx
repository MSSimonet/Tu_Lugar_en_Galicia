'use client'

import { useState } from 'react'
import { useAdminAction } from '@/components/admin/ficha/useAdminAction'

interface Props {
  etapaId: string
  nombre: string
}

/**
 * Nombre de columna con botón discreto de "renombrar" — click abre un input inline,
 * Enter/blur confirma con un PATCH a /api/admin/pipeline/etapas/[id]. Esc cancela sin guardar.
 */
export function RenombrarEtapaInline({ etapaId, nombre }: Props) {
  const { run, loading, error } = useAdminAction()
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState(nombre)

  async function confirmar() {
    const nombreNuevo = valor.trim()
    if (!nombreNuevo || nombreNuevo === nombre) {
      setEditando(false)
      setValor(nombre)
      return
    }
    const ok = await run(
      () => fetch(`/api/admin/pipeline/etapas/${etapaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreNuevo }),
      }),
      'No se pudo renombrar. Reintentá.',
    )
    if (ok) setEditando(false)
  }

  if (editando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <input
          autoFocus
          value={valor}
          disabled={loading}
          onChange={e => setValor(e.target.value)}
          onBlur={confirmar}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); void confirmar() }
            if (e.key === 'Escape') { setEditando(false); setValor(nombre) }
          }}
          style={{
            fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-ui)',
            padding: '4px 6px', border: '1px solid var(--color-laton-text)', borderRadius: '4px',
            color: 'var(--color-granito)', background: 'var(--color-blanco)', width: '100%',
          }}
        />
        {error && (
          <span style={{ fontSize: '11px', color: 'var(--color-estado-error)', fontFamily: 'var(--font-ui)' }}>
            {error}
          </span>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditando(true)}
      title="Renombrar etapa"
      style={{
        display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
        padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%',
      }}
    >
      <span style={{
        fontSize: '13px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: 'var(--color-laton-text)', fontFamily: 'var(--font-ui)',
      }}>
        {nombre}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--color-pizarra)' }} aria-hidden>✎</span>
    </button>
  )
}

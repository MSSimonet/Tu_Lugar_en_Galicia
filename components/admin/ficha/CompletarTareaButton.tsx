'use client'

import { useAdminAction } from '@/components/admin/ficha/useAdminAction'

interface Props {
  leadId: string
  notaId: string
}

export function CompletarTareaButton({ leadId, notaId }: Props) {
  const { run, loading, error } = useAdminAction()

  function handleClick() {
    // El endpoint (app/api/admin/leads/[id]/notas/[notaId]/route.ts) no lee el
    // body — es una acción de un solo propósito ("completar"), no un PATCH
    // genérico de estado — así que no se envía body.
    void run(
      () => fetch(`/api/admin/leads/${leadId}/notas/${notaId}`, { method: 'PATCH' }),
      'No se pudo actualizar. Reintentá.',
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--color-arena)',
          background: 'var(--color-blanco)', color: 'var(--color-laton-text)',
          fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500,
          cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Guardando…' : 'Marcar completada'}
      </button>
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--color-estado-error)', fontFamily: 'var(--font-ui)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

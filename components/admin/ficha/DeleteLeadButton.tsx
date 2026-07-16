'use client'

import { useRouter } from 'next/navigation'
import { useAdminAction } from '@/components/admin/ficha/useAdminAction'

interface Props {
  leadId: string
}

export function DeleteLeadButton({ leadId }: Props) {
  const router = useRouter()
  const { run, loading, error } = useAdminAction()

  async function handleClick() {
    if (!window.confirm('¿Borrar este lead? Esta acción no se puede deshacer.')) return

    const ok = await run(
      () => fetch(`/api/admin/leads/${leadId}`, { method: 'DELETE' }),
      'No se pudo borrar. Reintentá.',
    )
    // El registro ya no existe — navegar en vez de router.refresh() (que dejaría esta página en 404).
    if (ok) router.push('/admin/kanban')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={loading}
        style={{
          padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--color-estado-error)',
          background: 'transparent', color: 'var(--color-estado-error)',
          fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500,
          cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Borrando…' : 'Borrar lead (RGPD)'}
      </button>
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--color-estado-error)', fontFamily: 'var(--font-ui)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

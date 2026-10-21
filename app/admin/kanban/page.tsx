import type { Metadata } from 'next'
import { listarEtapas, listarLeadsParaKanban } from '@/lib/admin/pipelineRepo'
import { AdminHeader } from '@/components/admin/ui/AdminPrimitives'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'
import { requireAdminSession } from '@/lib/admin/requireAdminSession'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function KanbanPage() {
  await requireAdminSession()

  const [etapas, leads] = await Promise.all([
    listarEtapas(),
    listarLeadsParaKanban(),
  ])

  return (
    <main style={{ background: 'var(--color-niebla)', minHeight: '100vh', paddingBottom: '60px' }}>
      <AdminHeader title="Pipeline" subtitle={`${leads.length} lead${leads.length !== 1 ? 's' : ''} en ${etapas.length} etapas`} activo="kanban" />

      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '24px' }}>
        <KanbanBoard etapasIniciales={etapas} leadsIniciales={leads} />
      </div>
    </main>
  )
}

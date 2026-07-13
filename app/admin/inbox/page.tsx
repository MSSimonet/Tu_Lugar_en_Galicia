import type { Metadata } from 'next'
import { listarLeadsInbox } from '@/lib/admin/inboxRepo'
import { AdminHeader } from '@/components/admin/ui/AdminPrimitives'
import { LeadCard } from '@/components/admin/inbox/LeadCard'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function InboxPage() {
  const leads = await listarLeadsInbox()

  return (
    <main style={{ background: 'var(--color-niebla)', minHeight: '100vh', paddingBottom: '60px' }}>
      <AdminHeader title="Inbox" subtitle={`${leads.length} lead${leads.length !== 1 ? 's' : ''}`} />

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '24px' }}>
        {leads.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)', textAlign: 'center' }}>
            No hay leads todavía.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {leads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

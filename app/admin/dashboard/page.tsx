import type { Metadata } from 'next'
import {
  getKpisDelMes,
  getEvolucionMensual,
  getSegmentacionOrigen,
  getCiudadesMasSolicitadas,
} from '@/lib/admin/dashboardRepo'
import { AdminHeader, Card, KpiCard } from '@/components/admin/ui/AdminPrimitives'
import { EvolucionMensualChart } from '@/components/admin/dashboard/EvolucionMensualChart'
import { SegmentacionOrigenChart } from '@/components/admin/dashboard/SegmentacionOrigenChart'
import { CiudadesChart } from '@/components/admin/dashboard/CiudadesChart'
import { requireAdminSession } from '@/lib/admin/requireAdminSession'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function DashboardPage() {
  await requireAdminSession()

  const [kpis, evolucion, segmentacion, ciudades] = await Promise.all([
    getKpisDelMes(),
    getEvolucionMensual(),
    getSegmentacionOrigen(),
    getCiudadesMasSolicitadas(),
  ])

  return (
    <main style={{ background: 'var(--color-niebla)', minHeight: '100vh', paddingBottom: '60px' }}>
      <AdminHeader title="Dashboard" subtitle="Resumen del mes y tendencias de leads" activo="dashboard" />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px', marginBottom: '24px',
        }}>
          <KpiCard label="Leads este mes" value={String(kpis.leadsDelMes)} />
          <KpiCard label="% Alto potencial" value={`${kpis.porcentajeAltoPotencial}%`} />
          <KpiCard label="Citas confirmadas" value={String(kpis.citasConfirmadas)} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Card title="Evolución mensual de leads">
            <EvolucionMensualChart data={evolucion} />
          </Card>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px',
        }}>
          <Card title="Segmentación por origen">
            <SegmentacionOrigenChart data={segmentacion} />
          </Card>
          <Card title="Ciudades más solicitadas">
            <CiudadesChart data={ciudades} />
          </Card>
        </div>
      </div>
    </main>
  )
}

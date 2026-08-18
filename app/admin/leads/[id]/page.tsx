import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFicha360 } from '@/lib/admin/inboxRepo'
import { listarDefinicionesCamposCustom } from '@/lib/admin/camposCustomRepo'
import { isValidUuid } from '@/lib/utils/validation'
import { requireAdminSession } from '@/lib/admin/requireAdminSession'
import {
  Badge, Card, FieldRow, ErrorPage,
  getCalificacionStyle, formatValue, formatFecha,
} from '@/components/admin/ui/AdminPrimitives'
import { getSeccionesVisibles, LABELS } from '@/components/admin/ficha/camposFicha'
import { TranscripcionChat } from '@/components/admin/ficha/TranscripcionChat'
import { Timeline } from '@/components/admin/ficha/Timeline'
import { NuevaNotaForm } from '@/components/admin/ficha/NuevaNotaForm'
import { CamposCustomSection } from '@/components/admin/ficha/CamposCustomSection'
import { DeleteLeadButton } from '@/components/admin/ficha/DeleteLeadButton'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FichaLeadPage({ params }: PageProps) {
  await requireAdminSession()

  const { id } = await params

  if (!isValidUuid(id)) {
    return <ErrorPage mensaje="El enlace no es válido." />
  }

  const ficha = await getFicha360(id)
  if (!ficha) {
    notFound()
  }

  const { lead, esNacional, notasTareas, actividad, transcripcion } = ficha
  const calStyle = getCalificacionStyle(lead.calificacion)
  const secciones = getSeccionesVisibles(esNacional)

  const definicionesCamposCustom = await listarDefinicionesCamposCustom(true)
  const camposCustomValores = lead.camposCustom ?? {}

  return (
    <main style={{ background: 'var(--color-niebla)', minHeight: '100vh', paddingBottom: '60px' }}>
      <header style={{ background: 'var(--color-granito)', padding: '0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 28px' }}>
          <p style={{
            fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-laton-claro)', fontFamily: 'var(--font-ui)', marginBottom: '20px',
          }}>
            Tu Lugar en Galicia — Admin
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{
                fontSize: '28px', color: 'var(--color-blanco)', fontFamily: 'var(--font-titular)',
                fontWeight: 400, marginBottom: '6px', lineHeight: 1.2,
              }}>
                {lead.nombreCompleto}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-laton-claro)', fontFamily: 'var(--font-ui)', margin: 0 }}>
                {lead.email}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <Badge text={calStyle.label} bg={calStyle.bg} color={calStyle.color} />
              {lead.etiqueta && (
                <Badge text={lead.etiqueta} bg="var(--color-acordeon-bg)" color="var(--color-laton-claro)" />
              )}
              <DeleteLeadButton leadId={lead.id} />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-header-subtle)', fontFamily: 'var(--font-ui)', marginTop: '16px' }}>
            Cuestionario completado el {formatFecha(lead.createdAt)}
            {esNacional ? ' · lead nacional (sin trámites migratorios)' : ''}
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {secciones.map(section => {
          const rows = section.fields
            .map(key => ({ key, label: LABELS[key] ?? key, value: formatValue((lead as Record<string, unknown>)[key]) }))
            .filter(r => r.value !== '—')
          if (!rows.length) return null
          return (
            <Card key={section.title} title={section.title}>
              {rows.map(r => (
                <FieldRow key={r.key} label={r.label} value={r.value} />
              ))}
            </Card>
          )
        })}

        <Card title="Conversación con Gina">
          <TranscripcionChat transcripcion={transcripcion} />
        </Card>

        <Card title="Notas y tareas">
          <div style={{ marginBottom: '16px' }}>
            <NuevaNotaForm leadId={lead.id} />
          </div>
          <Timeline leadId={lead.id} notasTareas={notasTareas} actividad={actividad} />
        </Card>

        <Card title="Campos personalizados">
          <CamposCustomSection
            leadId={lead.id}
            definiciones={definicionesCamposCustom}
            valores={camposCustomValores}
          />
        </Card>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)', marginTop: '8px' }}>
          ID: {lead.id}
        </p>
      </div>
    </main>
  )
}

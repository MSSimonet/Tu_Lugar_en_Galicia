import Link from 'next/link'
import {
  Badge, getCalificacionStyle, getCalificacionBarra, formatFecha,
} from '@/components/admin/ui/AdminPrimitives'

interface LeadInboxItem {
  id: string
  nombreCompleto: string
  email: string
  etiqueta: string | null
  calificacion: string | null
  ciudadDestino: string | null
  createdAt: string
  resumenHumano: string
}

interface Props {
  lead: LeadInboxItem
}

export function LeadCard({ lead }: Props) {
  const calStyle = getCalificacionStyle(lead.calificacion)
  const barra = getCalificacionBarra(lead.calificacion)

  return (
    <Link
      href={`/admin/leads/${lead.id}`}
      style={{
        display: 'block', textDecoration: 'none',
        background: 'var(--color-blanco)', border: '1px solid var(--color-arena)',
        borderLeft: `4px solid ${barra}`, borderRadius: '8px',
        padding: '18px 20px', transition: 'box-shadow 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p style={{
            margin: '0 0 2px', fontSize: '16px', fontWeight: 500,
            color: 'var(--color-granito)', fontFamily: 'var(--font-ui)',
          }}>
            {lead.nombreCompleto}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)' }}>
            {lead.email}
          </p>
        </div>
        <Badge text={calStyle.label} bg={calStyle.bg} color={calStyle.color} />
      </div>

      <p style={{
        margin: '12px 0', fontSize: '14px', color: 'var(--color-granito)',
        fontFamily: 'var(--font-ui)', lineHeight: 1.5,
      }}>
        {lead.resumenHumano}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-laton-text)', fontFamily: 'var(--font-ui)', fontWeight: 500 }}>
          {lead.ciudadDestino ?? 'Sin destino definido'}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)' }}>
          {formatFecha(lead.createdAt)}
        </span>
      </div>
    </Link>
  )
}

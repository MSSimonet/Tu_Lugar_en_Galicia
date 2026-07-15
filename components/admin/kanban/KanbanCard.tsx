'use client'

import { useRouter } from 'next/navigation'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Badge, getCalificacionStyle, getCalificacionBarra } from '@/components/admin/ui/AdminPrimitives'
import type { LeadKanbanCard } from '@/components/admin/kanban/types'

interface Props {
  lead: LeadKanbanCard
}

/**
 * Tarjeta arrastrable del Kanban. Mismo criterio visual que components/admin/inbox/LeadCard.tsx
 * (franja lateral por calificación + resumen humano), pero como div con useDraggable en vez de
 * Link — el click-sin-arrastrar navega a la ficha vía useRouter().push() en el propio onClick.
 * dnd-kit no dispara "click" en un pointerdown+pointerup sin desplazamiento, así que ambos
 * gestos conviven sin lógica extra de distancia acá (la restricción vive en el sensor del board).
 */
export function KanbanCard({ lead }: Props) {
  const router = useRouter()
  const calStyle = getCalificacionStyle(lead.calificacion)
  const barra = getCalificacionBarra(lead.calificacion)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { etapaId: lead.etapaId },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => router.push(`/admin/leads/${lead.id}`)}
      style={{
        background: 'var(--color-blanco)', border: '1px solid var(--color-arena)',
        borderLeft: `4px solid ${barra}`, borderRadius: '8px',
        padding: '14px 16px', cursor: 'grab', touchAction: 'none',
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.12)' : 'none',
        zIndex: isDragging ? 1 : 'auto',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <p style={{
          margin: 0, fontSize: '14px', fontWeight: 500,
          color: 'var(--color-granito)', fontFamily: 'var(--font-ui)',
        }}>
          {lead.nombreCompleto}
        </p>
        <Badge text={calStyle.label} bg={calStyle.bg} color={calStyle.color} />
      </div>
      <p style={{
        margin: 0, fontSize: '12px', color: 'var(--color-pizarra)',
        fontFamily: 'var(--font-ui)', lineHeight: 1.4,
      }}>
        {lead.resumenHumano}
      </p>
    </div>
  )
}

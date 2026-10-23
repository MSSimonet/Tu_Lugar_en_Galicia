'use client'

import Link from 'next/link'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Badge, getCalificacionStyle, getCalificacionBarra } from '@/components/admin/ui/AdminPrimitives'
import type { LeadKanbanCard } from '@/components/admin/kanban/types'

interface Props {
  lead: LeadKanbanCard
}

/**
 * Tarjeta arrastrable del Kanban. El div exterior maneja el drag (useDraggable).
 * El Link interior provee un <a href> real: Ctrl+Click, teclado y accesibilidad
 * funcionan correctamente. dnd-kit solo cancela el click si hay desplazamiento,
 * así que click sin arrastrar navega por el href del Link.
 */
export function KanbanCard({ lead }: Props) {
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
      style={{
        background: 'var(--color-blanco)', border: '1px solid var(--color-arena)',
        borderLeft: `4px solid ${barra}`, borderRadius: '8px',
        cursor: 'grab', touchAction: 'none',
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.12)' : 'none',
        zIndex: isDragging ? 1 : 'auto',
        position: 'relative',
      }}
    >
      <Link
        href={`/admin/leads/${lead.id}`}
        style={{ display: 'block', padding: '14px 16px', textDecoration: 'none' }}
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
      </Link>
    </div>
  )
}

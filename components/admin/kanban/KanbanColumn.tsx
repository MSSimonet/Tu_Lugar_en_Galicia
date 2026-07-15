'use client'

import { useDroppable } from '@dnd-kit/core'
import { RenombrarEtapaInline } from '@/components/admin/kanban/RenombrarEtapaInline'
import { KanbanCard } from '@/components/admin/kanban/KanbanCard'
import type { PipelineEtapa, LeadKanbanCard } from '@/components/admin/kanban/types'

interface Props {
  etapa: PipelineEtapa
  leads: LeadKanbanCard[]
}

/**
 * Columna droppable del Kanban. El área droppable es todo el contenedor de tarjetas
 * (no cada tarjeta por separado) — no hay reordenamiento dentro de la columna en este
 * alcance, solo movimiento entre columnas, así que basta con una única zona de drop
 * por columna para que dnd-kit resuelva el "over" contra el id de la etapa.
 */
export function KanbanColumn({ etapa, leads }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa.id })

  return (
    <div style={{ minWidth: '280px', width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 4px', borderBottom: `2px solid ${etapa.color ?? 'var(--color-arena)'}`,
        marginBottom: '10px',
      }}>
        <RenombrarEtapaInline etapaId={etapa.id} nombre={etapa.nombre} />
        <span style={{
          fontSize: '12px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)',
          background: 'var(--color-niebla)', borderRadius: '10px', padding: '2px 8px',
        }}>
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        style={{
          display: 'flex', flexDirection: 'column', gap: '10px', flex: 1,
          minHeight: '120px', padding: '4px',
          background: isOver ? 'var(--color-acordeon-bg)' : 'transparent',
          borderRadius: '8px', transition: 'background 0.1s',
        }}
      >
        {leads.length === 0 && (
          <p style={{ fontSize: '12px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)', textAlign: 'center', padding: '16px 0' }}>
            Sin leads
          </p>
        )}
        {leads.map(lead => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  )
}

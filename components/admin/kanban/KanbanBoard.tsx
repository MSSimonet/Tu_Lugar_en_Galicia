'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import { KanbanColumn } from '@/components/admin/kanban/KanbanColumn'
import { NuevaEtapaForm } from '@/components/admin/kanban/NuevaEtapaForm'
import type { PipelineEtapa, LeadKanbanCard } from '@/components/admin/kanban/types'

interface Props {
  etapasIniciales: PipelineEtapa[]
  leadsIniciales: LeadKanbanCard[]
}

/**
 * Tablero Kanban con drag-and-drop entre columnas (@dnd-kit/core). Estado optimista:
 * al soltar una tarjeta se actualiza `leads` en el cliente antes de que responda el
 * servidor; si el PATCH falla, se revierte al estado previo y se muestra un aviso.
 * router.refresh() en éxito reconcilia contra el servidor (misma convención que
 * useAdminAction, pero acá el fetch es directo porque el estado optimista vive en
 * este componente, no en el hook).
 */
export function KanbanBoard({ etapasIniciales, leadsIniciales }: Props) {
  const router = useRouter()
  const [etapas, setEtapas] = useState(etapasIniciales)
  const [leads, setLeads] = useState(leadsIniciales)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  // KanbanPage es un Server Component: router.refresh() (tras crear/renombrar una etapa,
  // o para reconciliar el movimiento de un lead) le pide datos nuevos al servidor y estas
  // props cambian de referencia. useState solo lee su valor inicial al montar, así que hace
  // falta re-sincronizar cuando cambian — pero un setState dentro de un efecto dispara un
  // render extra innecesario, así que se ajusta en el cuerpo del render (patrón oficial de
  // React para "derivar estado de props que cambian", ver https://react.dev/learn/you-might-not-need-an-effect).
  const [etapasPrevias, setEtapasPrevias] = useState(etapasIniciales)
  if (etapasIniciales !== etapasPrevias) {
    setEtapasPrevias(etapasIniciales)
    setEtapas(etapasIniciales)
  }
  const [leadsPrevios, setLeadsPrevios] = useState(leadsIniciales)
  if (leadsIniciales !== leadsPrevios) {
    setLeadsPrevios(leadsIniciales)
    setLeads(leadsIniciales)
  }

  const etapasOrdenadas = useMemo(
    () => [...etapas].sort((a, b) => a.orden - b.orden),
    [etapas],
  )

  const leadsPorEtapa = useMemo(() => {
    const mapa = new Map<string, LeadKanbanCard[]>()
    for (const etapa of etapasOrdenadas) mapa.set(etapa.id, [])
    for (const lead of leads) {
      const columna = mapa.get(lead.etapaId)
      if (columna) columna.push(lead)
    }
    return mapa
  }, [etapasOrdenadas, leads])

  // activationConstraint evita que un simple click dispare un drag: solo arranca
  // el gesto de arrastre si el puntero se mueve más de 8px antes de soltar, dejando
  // el click limpio para la navegación en KanbanCard.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const leadId = String(active.id)
    const etapaDestinoId = String(over.id)
    const leadActual = leads.find(l => l.id === leadId)
    if (!leadActual || leadActual.etapaId === etapaDestinoId) return

    const leadsAntesDelDrop = leads
    setErrorMensaje(null)
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, etapaId: etapaDestinoId } : l)))

    try {
      const res = await fetch(`/api/admin/leads/${leadId}/etapa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapaId: etapaDestinoId }),
      })
      if (!res.ok) {
        setLeads(leadsAntesDelDrop)
        setErrorMensaje('No se pudo mover el lead. Reintentá.')
        return
      }
      router.refresh()
    } catch {
      setLeads(leadsAntesDelDrop)
      setErrorMensaje('Error de conexión. Reintentá.')
    }
  }

  return (
    <div>
      {errorMensaje && (
        <p style={{
          margin: '0 0 12px', fontSize: '13px', color: 'var(--color-estado-error)',
          fontFamily: 'var(--font-ui)',
        }}>
          {errorMensaje}
        </p>
      )}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', alignItems: 'flex-start' }}>
          {etapasOrdenadas.map(etapa => (
            <KanbanColumn key={etapa.id} etapa={etapa} leads={leadsPorEtapa.get(etapa.id) ?? []} />
          ))}
          <NuevaEtapaForm />
        </div>
      </DndContext>
    </div>
  )
}

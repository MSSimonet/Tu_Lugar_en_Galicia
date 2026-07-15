/**
 * components/admin/kanban/types.ts — Tipos compartidos por los componentes cliente del
 * Kanban. Reflejan el contrato de lib/admin/pipelineRepo.ts (Backend Architect, Fase 3).
 * Copia local en vez de importar los tipos del repo server-only: mantiene los componentes
 * cliente desacoplados del módulo de acceso a datos.
 */

export type PipelineEtapa = {
  id: string
  nombre: string
  orden: number
  color: string | null
  etiquetaOrigen: string | null
  esDefault: boolean
}

export type LeadKanbanCard = {
  id: string
  nombreCompleto: string
  email: string
  etapaId: string
  calificacion: string | null
  resumenHumano: string
}

/**
 * components/admin/ficha/camposCustomTypes.ts — Tipos compartidos por los componentes
 * cliente de "Campos personalizados" en la Ficha 360°. Reflejan el contrato de
 * lib/admin/camposCustomRepo.ts (Backend Architect, Fase 3).
 */

export type TipoCampoCustom = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect'

export type CampoCustomDefinicion = {
  id: string
  clave: string
  etiqueta: string
  tipo: TipoCampoCustom
  opciones: string[] | null
  orden: number
  activo: boolean
}

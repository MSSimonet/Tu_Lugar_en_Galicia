/**
 * lib/avoa/session.ts — Tipo y factory de la sesión de Avoa.
 *
 * La sesión viaja en cada request al API de Avoa.
 * No se persiste en base de datos en Etapa 1: vive en el estado React del widget.
 */

export type AvoaEtiqueta =
  | 'lead-en-preparacion'
  | 'seguimiento-futuro'
  | 'califica'

export type AvoaSession = {
  /** ID del paso que se está mostrando actualmente */
  pasoActual: string
  /** Mapa campo → valor capturado (un campo por paso) */
  respuestas: Record<string, unknown>
  /** Primer nombre extraído de p1_nombre, para personalizar {{nombre}} */
  nombre: string
  /** Origen de residencia capturado en p3_origen: determina la rama p17→p18 */
  origenResidencia: 'en_espana' | 'fuera' | null
  /** Etiqueta CRM asignada por el motor según lógica de negocio */
  etiqueta?: AvoaEtiqueta
  /** true cuando se llega a un paso con accion:"fin" */
  completado: boolean
  /** Record ID de Airtable creado en guardar_nivel1 — usado para PATCH en guardados posteriores */
  airtableRecordId?: string
}

/** Crea una sesión inicial antes de mostrar el primer paso */
export function crearSesion(): AvoaSession {
  return {
    pasoActual: 'bienvenida',
    respuestas: {},
    nombre: '',
    origenResidencia: null,
    etiqueta: undefined,
    completado: false,
  }
}

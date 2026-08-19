/**
 * lib/gina/session.ts — Tipo y factory de la sesión de Gina.
 *
 * La sesión viaja en cada request al API de Gina.
 * No se persiste en base de datos en Etapa 1: vive en el estado React del widget.
 */

import type { TranscripcionEntry } from './transcripcion'

type GinaEtiqueta =
  | 'lead-en-preparacion'
  | 'seguimiento-futuro'
  | 'califica'

export type GinaSession = {
  /** ID del paso que se está mostrando actualmente */
  pasoActual: string
  /** Mapa campo → valor capturado (un campo por paso) */
  respuestas: Record<string, unknown>
  /** Primer nombre extraído de p1_nombre, para personalizar {{nombre}} */
  nombre: string
  /** Origen de residencia capturado en p3_origen: determina la rama p17→p18 */
  origenResidencia: 'en_espana' | 'fuera' | null
  /** Etiqueta CRM asignada por el motor según lógica de negocio */
  etiqueta?: GinaEtiqueta
  /** true cuando se llega a un paso con accion:"fin" */
  completado: boolean
  /** id (uuid) del lead en Supabase creado en guardar_nivel1 — usado para update en guardados posteriores */
  leadId?: string
  /** Firma HMAC de leadId (generateScopedToken, ámbito 'gina-sesion') — evita que el cliente inyecte un leadId ajeno */
  leadIdSig?: string
  /**
   * Buffer de mensajes del transcript aún no persistidos (Fase 2, ficha 360°).
   * Solo se usa ANTES de que exista leadId (bienvenida→rgpd→p1_nombre→p2_email);
   * una vez creado el lead en guardar_nivel1, cada turno se persiste directo y este
   * buffer queda vacío. Guardado 100% aditivo — no afecta a `respuestas` ni al
   * resto de la sesión.
   */
  transcripcionPendiente?: TranscripcionEntry[]
}

/** Crea una sesión inicial antes de mostrar el primer paso */
export function crearSesion(): GinaSession {
  return {
    pasoActual: 'bienvenida',
    respuestas: {},
    nombre: '',
    origenResidencia: null,
    etiqueta: undefined,
    completado: false,
  }
}

/**
 * lib/gina/sessionStorage.ts — Persistencia local de la sesión de Gina (cliente únicamente).
 *
 * Guarda { sesion, mensajes, pasoActualId } en localStorage tras cada paso.
 * TTL: 24 h. Auto-limpieza al completar la conversación o al expirar.
 * Todas las operaciones están en try/catch: modo incógnito, cuota llena,
 * o localStorage deshabilitado se degradan elegantemente sin romper el chat.
 *
 * RGPD: los datos personales solo permanecen el tiempo mínimo necesario
 * (máx. 24 h, o hasta que el lead se guarda en Supabase).
 */

import type { GinaSession } from './session'

const STORAGE_KEY = 'gina_session_v1'
const TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

/** Forma mínima de un mensaje del chat — espejo de Mensaje en GinaMessages (lib no importa components) */
type MensajeGuardado = {
  id: string
  de: 'gina' | 'usuario'
  texto: string
  pasoId?: string
  campo?: string
}

type SesionGuardada = {
  sesion: GinaSession
  mensajes: MensajeGuardado[]
  pasoActualId: string
  timestamp: number
}

/**
 * Persiste el estado actual en localStorage.
 * Si `sesion.completado === true`, elimina la entrada (lead ya enviado a Supabase).
 * Solo guarda mensajes con `pasoId` para excluir avisos transitorios
 * (errores, "Retomamos donde lo dejaste", etc.).
 */
export function guardarSesionLocal(
  sesion: GinaSession,
  mensajes: MensajeGuardado[],
  pasoActualId: string,
): void {
  try {
    if (typeof window === 'undefined') return
    if (sesion.completado) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }
    const data: SesionGuardada = {
      sesion,
      mensajes: mensajes.filter((m) => !!m.pasoId),
      pasoActualId,
      timestamp: Date.now(),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Degradación elegante
  }
}

/**
 * Carga y valida la sesión guardada.
 * Retorna null si: no existe, expiró (>24 h), está corrupta, o localStorage no está disponible.
 */
export function cargarSesionLocal(): SesionGuardada | null {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const data = JSON.parse(raw) as Partial<SesionGuardada>
    if (!data.timestamp || !data.sesion || !Array.isArray(data.mensajes) || !data.pasoActualId) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    if (Date.now() - data.timestamp > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    if (data.sesion.completado) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return data as SesionGuardada
  } catch {
    return null
  }
}

/** Elimina la sesión guardada (usado si el paso restaurado ya no existe en flow.json). */
export function limpiarSesionLocal(): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Degradación elegante
  }
}

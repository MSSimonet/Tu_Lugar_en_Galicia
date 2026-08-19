'use client'

import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Mensaje } from './GinaMessages'
import type { GinaSession } from '@/lib/gina/session'
import { obtenerPaso, INGRESOS_RIESGO } from '@/lib/gina/flowEngine'
import type { Paso } from '@/lib/gina/flowEngine'

// ── Tipos ──────────────────────────────────────────────────────────────────

type ConfirmEdicion = {
  pasoId: string
  /** Número de respuestas posteriores que se perderían al editar */
  posterioresCount: number
}

type UseGinaEditorOptions = {
  mensajes: Mensaje[]
  setMensajes: Dispatch<SetStateAction<Mensaje[]>>
  sesion: GinaSession
  setSesion: Dispatch<SetStateAction<GinaSession>>
  setPasoActual: Dispatch<SetStateAction<Paso>>
  setCargando: Dispatch<SetStateAction<boolean>>
  setInputDeshabilitado: Dispatch<SetStateAction<boolean>>
}

// ── Helper ─────────────────────────────────────────────────────────────────

/**
 * Trunca el historial de mensajes y la sesión al punto de edición.
 *
 * Elimina el mensaje de usuario para `pasoId` y todos los posteriores.
 * Re-deriva todos los campos computados de la sesión (nombre, origenResidencia,
 * etiqueta, completado) a partir de las respuestas que sobreviven al truncado.
 *
 * Campos computados cubiertos (todos los de GinaSession en Fase 1):
 *   • nombre           ← respuestas['nombreCompleto'] (p1_nombre)
 *   • origenResidencia ← respuestas['paisResidencia'] (p3_origen)
 *   • etiqueta         ← respuestas['garantias'] + respuestas['ingresosMensuales'] (p11_garantias)
 *   • completado       ← siempre false al editar
 */
function truncarHastaEdicion(
  mensajes: Mensaje[],
  pasoId: string,
  sesion: GinaSession,
): { nuevosMensajes: Mensaje[]; nuevaSesion: GinaSession } {
  const idxRespuesta = mensajes.findIndex((m) => m.de === 'usuario' && m.pasoId === pasoId)
  if (idxRespuesta === -1) return { nuevosMensajes: mensajes, nuevaSesion: sesion }

  const mensajesRestantes = mensajes.slice(0, idxRespuesta)
  const mensajesEliminados = mensajes.slice(idxRespuesta)

  // Limpiar campos de sesion.respuestas correspondientes a los mensajes eliminados
  const nuevasRespuestas = { ...sesion.respuestas }
  for (const m of mensajesEliminados) {
    if (m.de === 'usuario' && m.campo) {
      delete nuevasRespuestas[m.campo]
    }
  }

  // ── Re-derivar campos computados ─────────────────────────────────────────

  // 1. nombre — primer token del nombre completo
  const nombreCompleto =
    typeof nuevasRespuestas['nombreCompleto'] === 'string'
      ? nuevasRespuestas['nombreCompleto']
      : ''
  const nombre = nombreCompleto.trim().split(/\s+/)[0] ?? ''

  // 2. origenResidencia — value de p3_origen almacenado como paisResidencia
  const paisResidencia = nuevasRespuestas['paisResidencia']
  let origenResidencia: GinaSession['origenResidencia'] = null
  if (typeof paisResidencia === 'string' && paisResidencia !== '') {
    origenResidencia = paisResidencia === 'en_espana' ? 'en_espana' : 'fuera'
  }

  // 3. etiqueta — único valor posible en Fase 1: 'lead-en-preparacion'
  //    Solo se re-aplica si AMBOS campos fuente siguen presentes tras el truncado.
  let etiqueta: GinaSession['etiqueta'] = undefined
  const garantias = nuevasRespuestas['garantias']
  const ingresos = nuevasRespuestas['ingresosMensuales']
  if (Array.isArray(garantias) && typeof ingresos === 'string') {
    const sinGarantias = (garantias as string[]).includes('ninguna')
    if (sinGarantias && INGRESOS_RIESGO.has(ingresos)) {
      etiqueta = 'lead-en-preparacion'
    }
  }

  // 4. completado — siempre false al retomar la edición
  const nuevaSesion: GinaSession = {
    ...sesion,
    respuestas: nuevasRespuestas,
    pasoActual: pasoId,
    nombre,
    origenResidencia,
    etiqueta,
    completado: false,
  }

  return { nuevosMensajes: mensajesRestantes, nuevaSesion }
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useGinaEditor({
  mensajes,
  setMensajes,
  sesion,
  setSesion,
  setPasoActual,
  setCargando,
  setInputDeshabilitado,
}: UseGinaEditorOptions) {
  const [confirmEdicion, setConfirmEdicion] = useState<ConfirmEdicion | null>(null)

  /**
   * Ejecuta la edición: trunca el historial, reconstruye la sesión y re-muestra
   * el mensaje de Gina para que el usuario vuelva a responder ese paso.
   */
  function ejecutarEdicion(pasoId: string) {
    const { nuevosMensajes, nuevaSesion } = truncarHastaEdicion(mensajes, pasoId, sesion)
    setMensajes(nuevosMensajes)
    setSesion(nuevaSesion)
    setPasoActual(obtenerPaso(pasoId))
    setInputDeshabilitado(false)
    setCargando(false)
    setConfirmEdicion(null)
  }

  /**
   * Inicia el proceso de edición:
   * - Si no hay respuestas posteriores: edita directamente (sin aviso).
   * - Si las hay: muestra confirmación antes de truncar.
   */
  function iniciarEdicion(pasoId: string) {
    const idxRespuesta = mensajes.findIndex((m) => m.de === 'usuario' && m.pasoId === pasoId)
    if (idxRespuesta === -1) return

    const posterioresCount = mensajes
      .slice(idxRespuesta + 1)
      .filter((m) => m.de === 'usuario')
      .length

    if (posterioresCount === 0) {
      ejecutarEdicion(pasoId)
    } else {
      setConfirmEdicion({ pasoId, posterioresCount })
    }
  }

  const confirmBanner = confirmEdicion !== null ? (
    <div
      role="alertdialog"
      aria-labelledby="gina-confirm-titulo"
      className="shrink-0 px-4 py-3 border-t"
      style={{
        borderColor: 'var(--color-laton)',
        backgroundColor: 'var(--dz-papel)',
      }}
    >
      <p
        id="gina-confirm-titulo"
        className="text-xs leading-snug mb-3"
        style={{ color: 'var(--dz-ink)' }}
      >
        Si cambias esto, tendrás que responder de nuevo{' '}
        {confirmEdicion.posterioresCount === 1
          ? 'la pregunta siguiente'
          : `las ${confirmEdicion.posterioresCount} preguntas siguientes`
        }.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirmEdicion(null)}
          className="flex-1 py-2 rounded-xl text-xs font-medium border transition-brand cursor-pointer"
          style={{
            borderColor: 'var(--color-laton)',
            color: 'var(--dz-ink)',
            // --color-blanco y no --color-texto-sobre-estado: este fondo tiene encima --dz-ink,
            // que invierte con el tema, así que el fondo también tiene que invertir.
            // --color-texto-sobre-estado es fijo (#F5F5F5) y en oscuro dejaba el texto en
            // 1.15:1 — el botón "Cancelar" era ilegible. Ahora 16.15:1 en claro y
            // 16.27:1 en oscuro; el borde --color-laton da 3.02:1 y 5.43:1.
            backgroundColor: 'var(--color-blanco)',
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => ejecutarEdicion(confirmEdicion.pasoId)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-brand cursor-pointer"
          style={{
            backgroundColor: 'var(--color-laton-claro)',
            color: 'var(--laton-ink)',
          }}
        >
          Sí, editar →
        </button>
      </div>
    </div>
  ) : null

  return { confirmEdicion, iniciarEdicion, confirmBanner }
}

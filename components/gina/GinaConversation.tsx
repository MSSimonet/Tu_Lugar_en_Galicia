'use client'

import { useState, useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { GinaMessages, type Mensaje } from './GinaMessages'
import { GinaInput } from './GinaInput'
import type { GinaSession } from '@/lib/gina/session'
import { personalizarTexto, type Paso, type Opcion } from '@/lib/gina/flowEngine'
import { useGinaEditor } from './useGinaEditor'

// ── Helpers ────────────────────────────────────────────────────────────────

function generarId(): string {
  return Math.random().toString(36).slice(2, 9)
}

/**
 * Convierte una respuesta de value interno al texto legible que ve el usuario.
 * - Pasos de botones: busca el label en las opciones del paso (ej. "a-coruna" → "A Coruña").
 * - Multiselect: lista los labels separados por comas.
 * - Texto libre (input/llm): devuelve el texto tal cual lo escribió el usuario.
 */
function resolverTextoUsuario(respuesta: string | string[], opciones?: Opcion[]): string {
  if (!opciones || opciones.length === 0) {
    return Array.isArray(respuesta) ? respuesta.join(', ') : respuesta
  }
  const labelPorValue: Record<string, string> = {}
  for (const o of opciones) labelPorValue[o.value] = o.label
  if (Array.isArray(respuesta)) {
    return respuesta.map((v) => labelPorValue[v] ?? v).join(', ')
  }
  return labelPorValue[respuesta] ?? respuesta
}

const TYPING_DELAY_MIN_MS = 500
const TYPING_DELAY_MAX_MS = 1200
const TYPING_CHARS_PER_MS = 8

/**
 * Retardo de escritura natural antes de mostrar cada mensaje de Gina.
 * Proporcional al largo del texto: 8 ms por carácter, mínimo 500 ms, máximo 1 200 ms.
 * Durante este tiempo `cargando` sigue en true, manteniendo el indicador de puntitos.
 */
function typingDelay(texto: string): Promise<void> {
  const ms = Math.min(TYPING_DELAY_MAX_MS, Math.max(TYPING_DELAY_MIN_MS, texto.length * TYPING_CHARS_PER_MS))
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Componente ─────────────────────────────────────────────────────────────

type Props = {
  sesion: GinaSession
  setSesion: Dispatch<SetStateAction<GinaSession>>
  pasoActual: Paso
  setPasoActual: Dispatch<SetStateAction<Paso>>
  mensajes: Mensaje[]
  setMensajes: Dispatch<SetStateAction<Mensaje[]>>
  onCerrar: () => void
}

export function GinaConversation({
  sesion,
  setSesion,
  pasoActual,
  setPasoActual,
  mensajes,
  setMensajes,
  onCerrar,
}: Props) {
  const [cargando, setCargando] = useState(false)
  const [inputDeshabilitado, setInputDeshabilitado] = useState(false)

  const { confirmEdicion, iniciarEdicion, confirmBanner } = useGinaEditor({
    mensajes,
    setMensajes,
    sesion,
    setSesion,
    setPasoActual,
    setCargando,
    setInputDeshabilitado,
  })

  // ── Avanzar paso virtual ──

  /**
   * Avanza automáticamente un paso virtual (sin texto y sin opciones).
   * Se llama cuando el motor devuelve un paso vacío como p11_check o p18_check_origen.
   */
  const avanzarPasoVirtual = useCallback(
    async (sesionVirtual: GinaSession) => {
      setCargando(true)
      try {
        const res = await fetch('/api/gina', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Respuesta vacía — el motor resuelve el paso virtual por lógica interna
          body: JSON.stringify({ sesion: sesionVirtual, respuesta: '' }),
        })

        if (!res.ok) throw new Error(`Error ${res.status}`)

        const data = (await res.json()) as {
          sesionActualizada: GinaSession
          siguientePaso: Paso
        }

        setSesion(data.sesionActualizada)
        setPasoActual(data.siguientePaso)

        const textoGina = personalizarTexto(
          data.siguientePaso.texto,
          data.sesionActualizada.nombre,
        )
        if (textoGina.trim()) {
          await typingDelay(textoGina)
          setMensajes((prev) => [
            ...prev,
            { id: generarId(), de: 'gina', texto: textoGina, pasoId: data.siguientePaso.id },
          ])
        }

        if (!data.sesionActualizada.completado) {
          setInputDeshabilitado(false)
        }
      } catch (err) {
        console.error('[GinaWidget] Error en paso virtual:', err)
      } finally {
        setCargando(false)
      }
    },
    [], // sin dependencias: solo usa setters estables de useState
  )

  // ── Procesar respuesta del usuario ──

  const procesarRespuesta = useCallback(
    async (respuesta: string | string[]) => {
      if (cargando || inputDeshabilitado) return

      // Texto legible para la burbuja: label humano en botones, texto crudo en campos libres
      const textoUsuario = resolverTextoUsuario(respuesta, pasoActual.opciones)

      // Añadir burbuja del usuario — taggeada con pasoId y campo para poder truncar al editar
      setMensajes((prev) => [
        ...prev,
        {
          id: generarId(),
          de: 'usuario',
          texto: textoUsuario,
          pasoId: pasoActual.id,
          campo: pasoActual.campo,
        },
      ])
      setCargando(true)
      setInputDeshabilitado(true)

      try {
        const res = await fetch('/api/gina', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sesion, respuesta }),
        })

        if (!res.ok) {
          throw new Error(`Error ${res.status}`)
        }

        const data = (await res.json()) as {
          sesionActualizada: GinaSession
          siguientePaso: Paso
          guardado?: boolean
        }

        const { sesionActualizada, siguientePaso } = data

        // Si el guardado falló tras 3 reintentos, mostrar error y no avanzar a despedida
        if (data.guardado === false) {
          await typingDelay('Hubo un problema guardando tu información.')
          setMensajes((prev) => [
            ...prev,
            {
              id: generarId(),
              de: 'gina',
              texto:
                'Hubo un problema guardando tu información. Por favor, escríbenos directamente a hola@tulugarengalicia.com para que podamos ayudarte.',
            },
          ])
          setInputDeshabilitado(true)
          return
        }

        setSesion(sesionActualizada)
        setPasoActual(siguientePaso)

        // Si el paso es un paso virtual sin texto (p11_check, p18_check_origen),
        // no agregar burbuja y procesar automáticamente con respuesta vacía
        if (!siguientePaso.texto || siguientePaso.texto.trim() === '') {
          setCargando(false)
          setInputDeshabilitado(false)
          // El motor ya resolvió el siguiente; necesitamos ir un paso más
          await avanzarPasoVirtual(sesionActualizada)
          return
        }

        // Mostrar texto de Gina personalizado con retardo de escritura natural
        const textoGina = personalizarTexto(
          siguientePaso.texto,
          sesionActualizada.nombre,
        )
        await typingDelay(textoGina)
        setMensajes((prev) => [
          ...prev,
          { id: generarId(), de: 'gina', texto: textoGina, pasoId: siguientePaso.id },
        ])

        // Si la sesión terminó, deshabilitar permanentemente
        if (sesionActualizada.completado) {
          setInputDeshabilitado(true)
        } else {
          setInputDeshabilitado(false)
        }
      } catch (err) {
        console.error('[GinaWidget] Error al procesar respuesta:', err)
        setMensajes((prev) => [
          ...prev,
          {
            id: generarId(),
            de: 'gina',
            texto: 'Ups, algo no salió bien. ¿Puedes intentarlo de nuevo?',
          },
        ])
        setInputDeshabilitado(false)
      } finally {
        setCargando(false)
      }
    },
    [sesion, pasoActual, cargando, inputDeshabilitado, avanzarPasoVirtual],
  )

  // ── Manejar botón "Cerrar" en paso final ──

  function onOpcionSeleccionada(valor: string | string[]) {
    const valorSimple = Array.isArray(valor) ? valor[0] : valor
    if (valorSimple === 'cerrar') {
      onCerrar()
      return
    }
    procesarRespuesta(valor)
  }

  // ── Render ──

  // Los botones se renderizan inline en GinaMessages, no en la barra inferior.
  // El campo de texto siempre es visible: deshabilitado en pasos de botones,
  // habilitado en pasos de texto libre (input / llm).
  const esPasoBotones = pasoActual.tipo === 'botones'

  const inputEsDeshabilitado =
    cargando || inputDeshabilitado || esPasoBotones || sesion.completado

  const inputPlaceholder = sesion.completado
    ? 'Conversación finalizada'
    : esPasoBotones
      ? 'Elige una opción de arriba 👆'
      : undefined  // GinaInput usará el placeholder según pasoActual.validacion

  return (
    <>
      {/* Mensajes + botones inline (cuando el paso es tipo "botones") */}
      <GinaMessages
        mensajes={mensajes}
        cargando={cargando}
        opciones={esPasoBotones ? pasoActual.opciones : undefined}
        multiselect={pasoActual.multiselect}
        exclusivaValue={pasoActual.exclusivaValue}
        deshabilitadoBotones={cargando}
        onSeleccion={onOpcionSeleccionada}
        onEditarRespuesta={iniciarEdicion}
        editarDeshabilitado={cargando || sesion.completado || confirmEdicion !== null}
      />

      {/* Botón secundario "Descargar tu Plan" — solo en despedida y si hay recordId */}
      {pasoActual.id === 'despedida' && sesion.airtableRecordId && (
        <div
          className="shrink-0 px-4 py-3 border-t"
          style={{ borderColor: 'var(--color-arena)', backgroundColor: '#FFFFFF' }}
        >
          <a
            href={`/api/plan/${sesion.airtableRecordId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border transition-brand"
            style={{
              borderColor: 'var(--color-laton)',
              color: 'var(--color-laton-oscuro)',
              backgroundColor: 'transparent',
            }}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar tu Plan
          </a>
        </div>
      )}

      {/* Aviso de confirmación de edición — renderizado por useGinaEditor */}
      {confirmBanner}

      {/* Campo de texto — siempre visible; deshabilitado en pasos de botones */}
      <div
        className="shrink-0 border-t px-0 pb-0"
        style={{
          borderColor: 'var(--color-arena)',
          backgroundColor: 'var(--color-arena)',
        }}
      >
        <GinaInput
          validacion={!esPasoBotones ? pasoActual.validacion : undefined}
          placeholder={inputPlaceholder}
          deshabilitado={inputEsDeshabilitado}
          onEnvio={(val) => procesarRespuesta(val)}
        />
      </div>
    </>
  )
}

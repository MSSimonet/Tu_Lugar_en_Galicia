'use client'

/**
 * AvoaWidget.tsx — Widget flotante del asistente Avoa.
 *
 * - Botón flotante en esquina inferior derecha
 * - Panel de chat responsive: 90vw/80vh en mobile, 380×560px en desktop
 * - Gestiona el estado completo de la sesión y el historial de mensajes
 * - Llama a /api/avoa para procesar cada respuesta
 */

import { useState, useEffect, useRef, useCallback, useId } from 'react'
import Link from 'next/link'
import { AvoaMessages, type Mensaje } from './AvoaMessages'
import { AvoaInput } from './AvoaInput'
import { crearSesion, type AvoaSession } from '@/lib/avoa/session'
import { obtenerPaso, personalizarTexto, INGRESOS_RIESGO, type Paso, type Opcion } from '@/lib/avoa/flowEngine'

// ── Helpers ────────────────────────────────────────────────────────────────

function generarId(): string {
  return Math.random().toString(36).slice(2, 9)
}

/** Busca el primer paso del flujo (siempre "bienvenida") */
function obtenerPrimerPaso(): Paso {
  return obtenerPaso('bienvenida')
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

/**
 * Retardo de escritura natural antes de mostrar cada mensaje de Avoa.
 * Proporcional al largo del texto: 8 ms por carácter, mínimo 500 ms, máximo 1 200 ms.
 * Durante este tiempo `cargando` sigue en true, manteniendo el indicador de puntitos.
 */
function typingDelay(texto: string): Promise<void> {
  const ms = Math.min(1200, Math.max(500, texto.length * 8))
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Edición de respuestas ──────────────────────────────────────────────────

type ConfirmEdicion = {
  pasoId: string
  /** Número de respuestas posteriores que se perderían al editar */
  posterioresCount: number
}

/**
 * Trunca el historial de mensajes y la sesión al punto de edición.
 *
 * Elimina el mensaje de usuario para `pasoId` y todos los posteriores.
 * Re-deriva todos los campos computados de la sesión (nombre, origenResidencia,
 * etiqueta, completado) a partir de las respuestas que sobreviven al truncado.
 *
 * Campos computados cubiertos (todos los de AvoaSession en Fase 1):
 *   • nombre           ← respuestas['nombreCompleto'] (p1_nombre)
 *   • origenResidencia ← respuestas['paisResidencia'] (p3_origen)
 *   • etiqueta         ← respuestas['garantias'] + respuestas['ingresosMensuales'] (p11_garantias)
 *   • completado       ← siempre false al editar
 */
function truncarHastaEdicion(
  mensajes: Mensaje[],
  pasoId: string,
  sesion: AvoaSession,
): { nuevosMensajes: Mensaje[]; nuevaSesion: AvoaSession } {
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
  let origenResidencia: AvoaSession['origenResidencia'] = null
  if (typeof paisResidencia === 'string' && paisResidencia !== '') {
    origenResidencia = paisResidencia === 'en_espana' ? 'en_espana' : 'fuera'
  }

  // 3. etiqueta — único valor posible en Fase 1: 'lead-en-preparacion'
  //    Solo se re-aplica si AMBOS campos fuente siguen presentes tras el truncado.
  let etiqueta: AvoaSession['etiqueta'] = undefined
  const garantias = nuevasRespuestas['garantias']
  const ingresos = nuevasRespuestas['ingresosMensuales']
  if (Array.isArray(garantias) && typeof ingresos === 'string') {
    const sinGarantias = (garantias as string[]).includes('ninguna')
    if (sinGarantias && INGRESOS_RIESGO.has(ingresos)) {
      etiqueta = 'lead-en-preparacion'
    }
  }

  // 4. completado — siempre false al retomar la edición
  const nuevaSesion: AvoaSession = {
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

// ── Componente ─────────────────────────────────────────────────────────────

export function AvoaWidget() {
  const dialogId = useId()
  const [abierto, setAbierto] = useState(false)
  const [sesion, setSesion] = useState<AvoaSession>(crearSesion)
  const [pasoActual, setPasoActual] = useState<Paso>(obtenerPrimerPaso)
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => {
    // Inicializar con el primer mensaje de Avoa (lazy initializer — evita useEffect innecesario)
    const primerPaso = obtenerPrimerPaso()
    return [
      {
        id: generarId(),
        de: 'avoa' as const,
        texto: personalizarTexto(primerPaso.texto, ''),
        pasoId: primerPaso.id,
      },
    ]
  })
  const [cargando, setCargando] = useState(false)
  const [inputDeshabilitado, setInputDeshabilitado] = useState(false)
  const [confirmEdicion, setConfirmEdicion] = useState<ConfirmEdicion | null>(null)

  const botonAbrirRef = useRef<HTMLButtonElement>(null)
  const botonCerrarRef = useRef<HTMLButtonElement>(null)

  // ── Gestión de foco al abrir/cerrar ──

  useEffect(() => {
    if (abierto) {
      setTimeout(() => botonCerrarRef.current?.focus(), 100)
    } else {
      botonAbrirRef.current?.focus()
    }
  }, [abierto])

  // ── Trap de foco dentro del diálogo ──

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  // ── Avanzar paso virtual (declarado antes de procesarRespuesta para evitar hoisting) ──

  /**
   * Avanza automáticamente un paso virtual (sin texto y sin opciones).
   * Se llama cuando el motor devuelve un paso vacío como p11_check o p18_check_origen.
   */
  const avanzarPasoVirtual = useCallback(
    async (sesionVirtual: AvoaSession) => {
      setCargando(true)
      try {
        const res = await fetch('/api/avoa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Respuesta vacía — el motor resuelve el paso virtual por lógica interna
          body: JSON.stringify({ sesion: sesionVirtual, respuesta: '' }),
        })

        if (!res.ok) throw new Error(`Error ${res.status}`)

        const data = (await res.json()) as {
          sesionActualizada: AvoaSession
          siguientePaso: Paso
        }

        setSesion(data.sesionActualizada)
        setPasoActual(data.siguientePaso)

        const textoAvoa = personalizarTexto(
          data.siguientePaso.texto,
          data.sesionActualizada.nombre,
        )
        if (textoAvoa.trim()) {
          await typingDelay(textoAvoa)
          setMensajes((prev) => [
            ...prev,
            { id: generarId(), de: 'avoa', texto: textoAvoa, pasoId: data.siguientePaso.id },
          ])
        }

        if (!data.sesionActualizada.completado) {
          setInputDeshabilitado(false)
        }
      } catch (err) {
        console.error('[AvoaWidget] Error en paso virtual:', err)
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
        const res = await fetch('/api/avoa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sesion, respuesta }),
        })

        if (!res.ok) {
          throw new Error(`Error ${res.status}`)
        }

        const data = (await res.json()) as {
          sesionActualizada: AvoaSession
          siguientePaso: Paso
        }

        const { sesionActualizada, siguientePaso } = data

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

        // Mostrar texto de Avoa personalizado con retardo de escritura natural
        const textoAvoa = personalizarTexto(
          siguientePaso.texto,
          sesionActualizada.nombre,
        )
        await typingDelay(textoAvoa)
        setMensajes((prev) => [
          ...prev,
          { id: generarId(), de: 'avoa', texto: textoAvoa, pasoId: siguientePaso.id },
        ])

        // Si la sesión terminó, deshabilitar permanentemente
        if (sesionActualizada.completado) {
          setInputDeshabilitado(true)
        } else {
          setInputDeshabilitado(false)
        }
      } catch (err) {
        console.error('[AvoaWidget] Error al procesar respuesta:', err)
        setMensajes((prev) => [
          ...prev,
          {
            id: generarId(),
            de: 'avoa',
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

  // ── Edición de respuestas anteriores ──

  /**
   * Ejecuta la edición: trunca el historial, reconstruye la sesión y re-muestra
   * el mensaje de Avoa para que el usuario vuelva a responder ese paso.
   */
  function ejecutarEdicion(pasoId: string) {
    const { nuevosMensajes, nuevaSesion } = truncarHastaEdicion(mensajes, pasoId, sesion)
    // nuevosMensajes ya contiene el mensaje de Avoa que hizo la pregunta (es el elemento
    // inmediatamente anterior a la respuesta del usuario). No se agrega de nuevo: hacerlo
    // causaría que la misma pregunta apareciera duplicada en el historial.
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

  // ── Manejar botón "Cerrar" en paso final ──

  function onOpcionSeleccionada(valor: string | string[]) {
    const valorSimple = Array.isArray(valor) ? valor[0] : valor
    if (valorSimple === 'cerrar') {
      setAbierto(false)
      return
    }
    procesarRespuesta(valor)
  }

  // ── Render ──

  // Los botones se renderizan inline en AvoaMessages, no en la barra inferior.
  // El campo de texto siempre es visible: deshabilitado en pasos de botones,
  // habilitado en pasos de texto libre (input / llm).
  const esPasoBotones = pasoActual.tipo === 'botones'

  const inputEsDeshabilitado =
    cargando || inputDeshabilitado || esPasoBotones || sesion.completado

  const inputPlaceholder = sesion.completado
    ? 'Conversación finalizada'
    : esPasoBotones
      ? 'Elige una opción de arriba 👆'
      : undefined  // AvoaInput usará el placeholder según pasoActual.validacion

  return (
    <>
      {/* Botón flotante de apertura + enlace al formulario */}
      <div
        className={`
          fixed bottom-6 right-6 z-50
          flex flex-col items-end gap-1.5
          transition-all duration-300
          ${abierto ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
      >
        <button
          ref={botonAbrirRef}
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir asistente Avoa"
          aria-expanded={abierto}
          aria-controls={dialogId}
          className="flex items-center gap-2 pl-4 pr-5 py-3 rounded-full shadow-lg text-sm font-semibold transition-brand cursor-pointer"
          style={{
            backgroundColor: 'var(--color-granito)',
            color: 'var(--color-laton-claro)',
            letterSpacing: '0.04em',
          }}
        >
          {/* Ícono sparkles — indica asistente IA, no chat humano */}
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>
          Habla con Avoa
        </button>

        <Link
          href="/conocernos"
          className="text-xs underline-offset-2 hover:underline transition-brand"
          style={{ color: 'var(--color-pizarra)', opacity: 0.65 }}
        >
          ¿Prefieres un formulario?
        </Link>
      </div>

      {/* Panel del chat */}
      <div
        id={dialogId}
        role="dialog"
        aria-label="Asistente Avoa — Tu Lugar en Galicia"
        aria-modal="true"
        onKeyDown={onKeyDown}
        className={`
          fixed bottom-6 right-6 z-50
          flex flex-col
          bg-white rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-300 ease-in-out
          ${abierto
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
        style={{
          width: 'min(400px, 92vw)',
          height: 'min(640px, 88vh)',
        }}
      >
        {/* Cabecera */}
        <div
          className="shrink-0 flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: 'var(--color-granito)' }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar cuadrado-redondeado con sparkles — transmite IA, no persona */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-laton-oscuro)' }}
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{ color: 'var(--color-laton-claro)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>
            </div>
            <div>
              <p
                className="text-sm font-bold leading-none tracking-wide"
                style={{ color: 'var(--color-laton-claro)' }}
              >
                Avoa
              </p>
              <p
                className="text-xs leading-tight mt-0.5"
                style={{ color: 'var(--color-arena)', opacity: 0.8 }}
              >
                Asistente virtual · Tu Lugar en Galicia
              </p>
            </div>
          </div>

          <button
            ref={botonCerrarRef}
            type="button"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar asistente Avoa"
            className="transition-brand cursor-pointer p-1 rounded"
            style={{ color: 'var(--color-arena)', opacity: 0.7 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mensajes + botones inline (cuando el paso es tipo "botones") */}
        <AvoaMessages
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

        {/* Aviso de confirmación de edición — aparece entre mensajes e input */}
        {confirmEdicion !== null && (
          <div
            role="alertdialog"
            aria-labelledby="avoa-confirm-titulo"
            className="shrink-0 px-4 py-3 border-t"
            style={{
              borderColor: 'var(--color-laton)',
              backgroundColor: 'var(--color-niebla)',
            }}
          >
            <p
              id="avoa-confirm-titulo"
              className="text-xs leading-snug mb-3"
              style={{ color: 'var(--color-granito)' }}
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
                  color: 'var(--color-granito)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => ejecutarEdicion(confirmEdicion.pasoId)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-brand cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-laton)',
                  color: '#FFFFFF',
                }}
              >
                Sí, editar →
              </button>
            </div>
          </div>
        )}

        {/* Campo de texto — siempre visible; deshabilitado en pasos de botones */}
        <div
          className="shrink-0 border-t px-0 pb-0"
          style={{
            borderColor: 'var(--color-arena)',
            backgroundColor: 'var(--color-arena)',
          }}
        >
          <AvoaInput
            validacion={!esPasoBotones ? pasoActual.validacion : undefined}
            placeholder={inputPlaceholder}
            deshabilitado={inputEsDeshabilitado}
            onEnvio={(val) => procesarRespuesta(val)}
          />
        </div>
      </div>
    </>
  )
}

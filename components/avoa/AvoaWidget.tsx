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
import { AvoaMessages, type Mensaje } from './AvoaMessages'
import { AvoaInput } from './AvoaInput'
import { crearSesion, type AvoaSession } from '@/lib/avoa/session'
import { obtenerPaso, personalizarTexto, type Paso } from '@/lib/avoa/flowEngine'

// ── Helpers ────────────────────────────────────────────────────────────────

function generarId(): string {
  return Math.random().toString(36).slice(2, 9)
}

/** Busca el primer paso del flujo (siempre "bienvenida") */
function obtenerPrimerPaso(): Paso {
  return obtenerPaso('bienvenida')
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
      },
    ]
  })
  const [cargando, setCargando] = useState(false)
  const [inputDeshabilitado, setInputDeshabilitado] = useState(false)

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
            { id: generarId(), de: 'avoa', texto: textoAvoa },
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

      // Texto legible para la burbuja del usuario
      const textoUsuario = Array.isArray(respuesta)
        ? respuesta.join(', ')
        : respuesta

      // Añadir burbuja del usuario
      setMensajes((prev) => [
        ...prev,
        { id: generarId(), de: 'usuario', texto: textoUsuario },
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
          { id: generarId(), de: 'avoa', texto: textoAvoa },
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
    [sesion, cargando, inputDeshabilitado, avanzarPasoVirtual],
  )

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
      {/* Botón flotante de apertura */}
      <button
        ref={botonAbrirRef}
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir asistente Avoa"
        aria-expanded={abierto}
        aria-controls={dialogId}
        className={`
          fixed bottom-6 right-6 z-50
          flex items-center gap-2 pl-4 pr-5 py-3
          rounded-full shadow-lg text-sm font-semibold
          transition-brand cursor-pointer
          ${abierto ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
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
          deshabilitadoBotones={cargando}
          onSeleccion={onOpcionSeleccionada}
        />

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

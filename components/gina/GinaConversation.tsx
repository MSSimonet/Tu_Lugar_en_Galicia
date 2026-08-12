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
  return crypto.randomUUID()
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
 * Qué se dice cuando el servidor responde 429.
 *
 * No es "algo salió mal": no se rompió nada, solo se agotó el presupuesto de peticiones por IP
 * de los últimos 10 minutos (ver el bloque del rate limit en app/api/gina/route.ts). La
 * diferencia importa porque el mensaje genérico terminaba en "¿Puedes intentarlo de nuevo?", y
 * cada reintento gasta otra petición del mismo presupuesto agotado: el consejo empeoraba la
 * situación que decía resolver.
 *
 * Lo de "tus respuestas están guardadas" es verdad comprobada, no un consuelo: GinaWidget
 * persiste sesión y mensajes en localStorage con TTL de 24 h y al reabrir restaura la
 * conversación con "Retomamos donde lo dejaste" (lib/gina/sessionStorage.ts).
 */
const TEXTO_DEMASIADO_RAPIDO =
  'Hemos ido demasiado rápido y necesito unos minutos para ponerme al día. Tus respuestas están guardadas: vuelve a abrir el chat en un rato y seguimos donde lo dejamos.'

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

        // Mismo trato que en procesarRespuesta. Acá importa más todavía: este catch solo
        // logueaba, así que un fallo en un paso virtual no mostraba NADA — la conversación
        // quedaba muda, sin la pregunta siguiente y sin explicación.
        if (res.status === 429) {
          setMensajes((prev) => [...prev, { id: generarId(), de: 'gina', texto: TEXTO_DEMASIADO_RAPIDO }])
          setInputDeshabilitado(true)
          return
        }
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
          typeof data.sesionActualizada.respuestas['email'] === 'string'
            ? data.sesionActualizada.respuestas['email']
            : '',
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
    [setMensajes, setPasoActual, setSesion],
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
          // 429 aparte del resto: no es una rotura, es "vuelve en un rato", y la conversación
          // en pantalla sigue siendo válida. Tratarlo como error genérico llevaba a decirle a
          // la persona "inténtalo de nuevo", que es el peor consejo posible acá — cada
          // reintento consume otra petición del mismo presupuesto agotado y alarga la espera.
          // Se corta el input a propósito, en vez de invitar a insistir.
          if (res.status === 429) {
            setMensajes((prev) => [...prev, { id: generarId(), de: 'gina', texto: TEXTO_DEMASIADO_RAPIDO }])
            setInputDeshabilitado(true)
            return
          }
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
          typeof sesionActualizada.respuestas['email'] === 'string'
            ? sesionActualizada.respuestas['email']
            : '',
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
    [sesion, pasoActual, cargando, inputDeshabilitado, avanzarPasoVirtual, setMensajes, setPasoActual, setSesion],
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

      {/* Aviso de confirmación de edición — renderizado por useGinaEditor */}
      {confirmBanner}

      {/* Campo de texto — siempre visible; deshabilitado en pasos de botones */}
      <div
        className="shrink-0 border-t px-0 pb-0"
        style={{
          borderColor: 'var(--dz-borde)',
          backgroundColor: 'var(--dz-borde)',
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

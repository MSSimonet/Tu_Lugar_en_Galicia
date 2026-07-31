/**
 * lib/gina/flowEngine.ts — Motor de estados del cuestionario de Gina.
 *
 * Motor puro: sin side effects de IA ni de red.
 * Los pasos de tipo "llm" en Etapa 1 se procesan como inputs de texto normales.
 */

import flow from './flow.json'
import type { GinaSession } from './session'

// ── Tipos del flujo ────────────────────────────────────────────────────────

export type Opcion = {
  label: string
  value: string
}

type TipoPaso = 'botones' | 'input' | 'llm'

export type Paso = {
  id: string
  tipo: TipoPaso
  campo?: string
  texto: string
  opciones?: Opcion[]
  multiselect?: boolean
  exclusivaValue?: string
  validacion?: 'email' | 'telefono' | 'texto'
  siguiente?: string
  ramas?: Record<string, string>
  etiqueta?: string
  accion?: string
}

// Índice de pasos por id para búsqueda O(1)
const indicePasos: Record<string, Paso> = {}
for (const paso of flow as Paso[]) {
  indicePasos[paso.id] = paso
}

/** Obtiene un paso del flujo por su id. Lanza error si no existe. */
export function obtenerPaso(id: string): Paso {
  const paso = indicePasos[id]
  if (!paso) throw new Error(`Paso no encontrado en flow.json: "${id}"`)
  return paso
}

// ── Constantes de lógica de negocio ───────────────────────────────────────

/**
 * Ingresos que activan el camino "lead en preparación" cuando no hay garantías.
 * Exportado para que el widget pueda re-derivar `etiqueta` al truncar la sesión en edición.
 */
export const INGRESOS_RIESGO = new Set(['menos-1500', 'sin-ingresos'])

// ── Motor principal ────────────────────────────────────────────────────────

export type ResultadoProcesamiento = {
  sesionActualizada: GinaSession
  siguientePasoId: string
}

/**
 * Procesa la respuesta del usuario en el paso actual y devuelve la sesión
 * actualizada junto con el id del siguiente paso a mostrar.
 *
 * @param session  Estado actual de la sesión
 * @param paso     Definición del paso que se acaba de responder
 * @param respuesta Valor de la opción elegida (string) o array de valores (multiselect)
 */
export function procesarRespuesta(
  session: GinaSession,
  paso: Paso,
  respuesta: string | string[],
): ResultadoProcesamiento {
  // Clonar para inmutabilidad
  const sesion: GinaSession = {
    ...session,
    respuestas: { ...session.respuestas },
  }

  // 1. Guardar valor en respuestas si el paso tiene campo
  if (paso.campo) {
    sesion.respuestas[paso.campo] = respuesta
  }

  // 2. Efectos especiales por paso

  // P1 — extraer primer nombre
  if (paso.id === 'p1_nombre' && typeof respuesta === 'string') {
    sesion.nombre = respuesta.trim().split(/\s+/)[0] ?? respuesta.trim()
  }

  // P3_origen — guardar origen de residencia para la rama p18
  if (paso.id === 'p3_origen' && typeof respuesta === 'string') {
    sesion.origenResidencia =
      respuesta === 'en_espana' ? 'en_espana' : 'fuera'
  }

  // P11_garantias — evaluar etiqueta "lead-en-preparacion"
  if (paso.id === 'p11_garantias') {
    const garantias = Array.isArray(respuesta) ? respuesta : [respuesta]
    const sinGarantias = garantias.includes('ninguna')
    const ingresosRiesgo = INGRESOS_RIESGO.has(
      String(sesion.respuestas['ingresosMensuales'] ?? ''),
    )
    if (sinGarantias && ingresosRiesgo) {
      sesion.etiqueta = 'lead-en-preparacion'
    }
  }

  // Marcar como completado si el paso lleva a "fin"
  if (paso.accion === 'fin') {
    sesion.completado = true
  }

  // 3. Resolver siguiente paso
  const siguientePasoId = resolverSiguiente(sesion, paso, respuesta)

  sesion.pasoActual = siguientePasoId

  return { sesionActualizada: sesion, siguientePasoId }
}

/** Devuelve el array de tipos de mascota capturado en p7b_tipo. */
function getMascotaTipos(sesion: GinaSession): string[] {
  const val = sesion.respuestas['mascotaTipo']
  if (Array.isArray(val)) return val as string[]
  if (typeof val === 'string') return [val]
  return []
}

/**
 * Resuelve el id del siguiente paso según la respuesta y la lógica de ramas.
 * Maneja los pasos virtuales p11_check y p18_check_origen.
 */
function resolverSiguiente(
  sesion: GinaSession,
  paso: Paso,
  respuesta: string | string[],
): string {
  const valorSimple = Array.isArray(respuesta) ? respuesta[0] : respuesta

  // p7b_tipo → cantidad por tipo, luego peso si hay perro
  if (paso.id === 'p7b_tipo') {
    const tipos = Array.isArray(respuesta) ? respuesta : [respuesta]
    if (tipos.includes('perro')) return 'p7c_cant_perros'
    if (tipos.includes('gato')) return 'p7c_cant_gatos'
    return 'p8_documentacion'
  }

  // p7c_cant_perros → si también hay gato, contar gatos; si no, peso del perro
  if (paso.id === 'p7c_cant_perros') {
    return getMascotaTipos(sesion).includes('gato') ? 'p7c_cant_gatos' : 'p7b_peso'
  }

  // p7c_cant_gatos → si hay perro, peso del perro; si no, documentación
  if (paso.id === 'p7c_cant_gatos') {
    return getMascotaTipos(sesion).includes('perro') ? 'p7b_peso' : 'p8_documentacion'
  }

  // Paso virtual: p11_check — lógica post-garantías
  if (paso.id === 'p11_garantias') {
    const nextId = sesion.etiqueta === 'lead-en-preparacion'
      ? 'p11_lead_preparacion'
      : 'p12_presupuesto'
    return nextId
  }

  // Paso virtual: p18_check_origen — rama según origen de residencia.
  // Si el siguiente calculado sería p18_check_origen (paso vacío sin texto),
  // lo resolvemos directamente aquí según origenResidencia capturado en p3_origen.
  if (paso.id === 'p18_check_origen' || paso.id === 'p17_licencia' || paso.id === 'p17b_canje') {
    const rawNext = resolverRama(paso, valorSimple)
    if (rawNext === 'p18_check_origen') {
      return sesion.origenResidencia === 'en_espana' ? 'p18a_ciudad' : 'p21_tipo_inmueble'
    }
    return rawNext
  }

  return resolverRama(paso, valorSimple)
}

/** Resuelve la siguiente ruta via ramas[valor] || paso.siguiente */
function resolverRama(paso: Paso, valor: string): string {
  if (paso.ramas && valor in paso.ramas) {
    return paso.ramas[valor]
  }
  if (paso.siguiente) {
    return paso.siguiente
  }
  // Fallback: si no hay siguiente definido, quedarse en el mismo paso
  return paso.id
}

/**
 * Sustituye {{nombre}} y {{email}} en el texto de un paso por los valores reales
 * de la sesión. Llamar antes de mostrar el texto al usuario.
 *
 * {{email}} se sumó al activar el texto de despedida que confirma el envío del
 * Plan Estratégico: sin esto el usuario habría leído "{{email}}" literal, porque
 * la sustitución solo contemplaba el nombre.
 */
export function personalizarTexto(texto: string, nombre: string, email = ''): string {
  return texto
    .replace(/\{\{nombre\}\}/g, nombre || 'amigo/a')
    // El fallback va redactado para leerse bien entre paréntesis después de "a tu
    // correo (…)", que es como lo usa el paso de despedida. En la práctica no se
    // alcanza: el email es un paso obligatorio mucho antes de esa despedida.
    .replace(/\{\{email\}\}/g, email || 'el que nos diste')
}

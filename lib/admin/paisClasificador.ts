/**
 * lib/admin/paisClasificador.ts — Clasifica el origen de un lead en un segmento de
 * negocio (Nacional / Comunitario / Extracomunitario) usado por el dashboard analítico
 * de /admin (gráfico de segmentación de origen) y por las tareas automáticas de
 * lib/admin/notasTareasRepo.ts (ej. "revisar tasa consular" para extracomunitarios).
 */

export type SegmentoOrigen = 'Nacional' | 'Comunitario' | 'Extracomunitario' | 'Sin clasificar'

/**
 * Países de la Unión Europea, en español, normalizados a minúsculas y sin acentos
 * (ver normalizar() más abajo). España se incluye a propósito: aunque en la práctica
 * un residente en España usa modalidad='ya-en-espana' (→ 'Nacional' antes de llegar acá),
 * mantenerla en esta lista es inofensivo y evita un caso raro sin cubrir si algún día
 * paisResidencia='España' llega con modalidad='antes-de-viajar' (ej. un español que
 * responde el formulario desde el extranjero).
 */
const PAISES_UE_NORMALIZADOS = new Set([
  'alemania',
  'austria',
  'belgica',
  'bulgaria',
  'chipre',
  'croacia',
  'dinamarca',
  'eslovaquia',
  'eslovenia',
  'espana',
  'estonia',
  'finlandia',
  'francia',
  'grecia',
  'hungria',
  'irlanda',
  'italia',
  'letonia',
  'lituania',
  'luxemburgo',
  'malta',
  'paises bajos',
  'holanda',
  'polonia',
  'portugal',
  'republica checa',
  'chequia',
  'rumania',
  'suecia',
])

/** Quita acentos/diacríticos y pasa a minúsculas, para comparar texto libre sin falsos negativos. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Clasifica el origen de un lead para segmentación de negocio.
 *
 * LIMITACIÓN CONOCIDA (documentada a propósito, no es un bug): `paisResidencia` es un
 * campo de texto libre — Gina lo pregunta como "¿Desde qué país nos escribes?" sin un
 * select controlado, así que puede llegar con variaciones de escritura, typos o nombres
 * coloquiales que esta lista no cubre ("USA" vs "Estados Unidos", "méxico" vs "Mexico
 * D.F.", etc.). Esto es un match best-effort por texto normalizado, NO una validación
 * exhaustiva ni infalible: un país de la UE mal escrito de una forma no prevista caerá
 * en 'Extracomunitario' por defecto. Si esto se vuelve un problema real de datos, la
 * solución correcta es migrar paisResidencia a un select controlado en el flujo de
 * Gina/formulario — no seguir parchando esta lista.
 */
export function clasificarOrigen(
  modalidad: string | null | undefined,
  paisResidencia: string | null | undefined,
): SegmentoOrigen {
  if (!modalidad) return 'Sin clasificar'
  if (modalidad === 'ya-en-espana') return 'Nacional'
  if (modalidad !== 'antes-de-viajar') return 'Sin clasificar'

  if (!paisResidencia || !paisResidencia.trim()) return 'Extracomunitario'

  const normalizado = normalizar(paisResidencia)
  return PAISES_UE_NORMALIZADOS.has(normalizado) ? 'Comunitario' : 'Extracomunitario'
}

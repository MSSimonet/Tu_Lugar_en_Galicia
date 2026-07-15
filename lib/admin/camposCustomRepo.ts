/**
 * lib/admin/camposCustomRepo.ts — Metadata de campos custom del panel admin (tabla
 * `campos_custom_definiciones`). Define qué claves son válidas dentro de `leads.campos_custom`
 * (jsonb) — el valor en sí se escribe con patchRecord() de lib/admin/leadsRepo.ts, no acá.
 * RLS deny-all: todo el acceso pasa por getSupabaseServerClient() (service_role).
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import { ValidationError } from '@/lib/admin/errors'
import { COLUMN_MAP } from '@/lib/admin/leadsRepo'

export type TipoCampoCustom = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect'

export type CampoCustomDefinicion = {
  id: string
  clave: string
  etiqueta: string
  tipo: TipoCampoCustom
  opciones: string[] | null
  orden: number
  activo: boolean
}

const TIPOS_VALIDOS: readonly TipoCampoCustom[] = ['text', 'number', 'boolean', 'date', 'select', 'multiselect']
const TIPOS_CON_OPCIONES: readonly TipoCampoCustom[] = ['select', 'multiselect']

const ORDEN_INICIAL = 10
const ORDEN_INCREMENTO = 10

// Clave = key de un objeto JSON (leads.campos_custom): solo minúsculas/números/guion bajo.
const CLAVE_REGEX = /^[a-z0-9_]+$/
const CLAVE_MAX_LENGTH = 60
const ETIQUETA_MAX_LENGTH = 100

// Código de Postgres para unique_violation (23505) — clave UNIQUE ya existente.
const PG_UNIQUE_VIOLATION = '23505'

function rowToCampoCustomDefinicion(row: Record<string, unknown>): CampoCustomDefinicion {
  return {
    id: row.id as string,
    clave: row.clave as string,
    etiqueta: row.etiqueta as string,
    tipo: row.tipo as TipoCampoCustom,
    opciones: (row.opciones as string[] | null) ?? null,
    orden: Number(row.orden),
    activo: row.activo === true,
  }
}

/** Lista las definiciones de campos custom, ordenadas por `orden` ascendente. */
export async function listarDefinicionesCamposCustom(soloActivos = true): Promise<CampoCustomDefinicion[]> {
  const supabase = getSupabaseServerClient()
  let query = supabase.from('campos_custom_definiciones').select('*').order('orden', { ascending: true })
  if (soloActivos) query = query.eq('activo', true)

  const { data, error } = await query
  if (error) throw new Error(`Supabase listarDefinicionesCamposCustom: ${error.message}`)
  return (data ?? []).map(rowToCampoCustomDefinicion)
}

export type CrearDefinicionCampoCustomInput = {
  clave: string
  etiqueta: string
  tipo: TipoCampoCustom
  opciones?: string[]
}

/**
 * Crea una nueva definición de campo custom. Valida formato de `clave` (va a ser una key
 * de objeto JS/JSON), `etiqueta` no vacía, y `tipo` uno de los 6 válidos. `opciones` solo
 * se guarda si `tipo` es 'select'/'multiselect' — para cualquier otro tipo se ignora en vez
 * de guardarse (no tiene sentido en ese caso).
 */
export async function crearDefinicionCampoCustom(
  input: CrearDefinicionCampoCustomInput,
): Promise<CampoCustomDefinicion> {
  const clave = input.clave?.trim()
  if (!clave || !CLAVE_REGEX.test(clave)) {
    throw new ValidationError('clave inválida: solo minúsculas, números y guion bajo, sin espacios')
  }
  if (clave.length > CLAVE_MAX_LENGTH) {
    throw new ValidationError(`clave supera el máximo de ${CLAVE_MAX_LENGTH} caracteres`)
  }
  // Si `clave` coincidiera con una columna real de `leads` (ej. "telefono", "email"),
  // patchRecord() la trataría como columna real en vez de guardarla en campos_custom —
  // pisaría el dato verdadero del lead en silencio. Se rechaza antes de que exista esa
  // definición, no en el momento de guardar un valor.
  if (clave in COLUMN_MAP) {
    throw new ValidationError(`"${clave}" ya es un campo fijo del lead — elegí otra clave`)
  }

  const etiqueta = input.etiqueta?.trim()
  if (!etiqueta) {
    throw new ValidationError('etiqueta no puede estar vacía')
  }
  if (etiqueta.length > ETIQUETA_MAX_LENGTH) {
    throw new ValidationError(`etiqueta supera el máximo de ${ETIQUETA_MAX_LENGTH} caracteres`)
  }

  if (!TIPOS_VALIDOS.includes(input.tipo)) {
    throw new ValidationError(`tipo inválido: debe ser uno de ${TIPOS_VALIDOS.join(', ')}`)
  }

  const aplicaOpciones = TIPOS_CON_OPCIONES.includes(input.tipo)
  const opciones = aplicaOpciones && input.opciones && input.opciones.length > 0 ? input.opciones : null

  const supabase = getSupabaseServerClient()

  // Mismo criterio que crearEtapa() de pipelineRepo.ts: sin esto, `orden` cae en su default
  // de columna (0) para toda definición nueva, y como listarDefinicionesCamposCustom() solo
  // ordena por `orden` (sin desempate), el orden de renderizado en la Ficha 360° queda
  // indeterminado en cuanto haya más de un campo custom.
  const { data: existentes, error: readError } = await supabase
    .from('campos_custom_definiciones')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
  if (readError) throw new Error(`Supabase crearDefinicionCampoCustom (lectura orden): ${readError.message}`)

  const ordenMaxima = existentes?.[0]?.orden as number | undefined
  const ordenNueva = ordenMaxima !== undefined ? Number(ordenMaxima) + ORDEN_INCREMENTO : ORDEN_INICIAL

  const { data, error } = await supabase
    .from('campos_custom_definiciones')
    .insert({ clave, etiqueta, tipo: input.tipo, opciones, orden: ordenNueva })
    .select('*')
    .single()

  if (error) {
    if (error.code === PG_UNIQUE_VIOLATION) {
      throw new ValidationError(`Ya existe un campo custom con la clave "${clave}"`)
    }
    throw new Error(`Supabase crearDefinicionCampoCustom: ${error.message}`)
  }

  return rowToCampoCustomDefinicion(data as Record<string, unknown>)
}

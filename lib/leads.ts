/**
 * lib/leads.ts — Integración con Supabase (tabla `leads`) para guardar leads del
 * formulario de diagnóstico (/conocernos), el cuestionario de Gina y /api/contacto.
 *
 * Antes usaba la REST API de Airtable — migrado a Supabase/Postgres según
 * docs/crm-supabase-fase0.md. El tipo LeadData (camelCase) no cambia; el mapeo a
 * las columnas reales de la tabla `leads` (snake_case) vive en toRow()/fromRow(),
 * los únicos dos puntos de este archivo que conocen los nombres de columna.
 *
 *   nombreCompleto      → nombre_completo
 *   paisResidencia      → pais_residencia
 *   detalleMascotas     → detalle_mascotas
 *   mascotaTipo         → mascota_tipo (text[])
 *   cantidadPerros      → cantidad_perros
 *   cantidadGatos       → cantidad_gatos
 *   mascotaPeso         → mascota_peso
 *   situacionLaboral    → situacion_laboral
 *   ingresosMensuales   → ingresos_mensuales
 *   garantias           → garantias (text[])
 *   ciudadDestino       → ciudad_destino
 *   tipoInmueble        → tipo_inmueble
 *   presupuestoMensual  → presupuesto_mensual
 *   habitacionesMinimas → habitaciones_minimas
 *   comodidades         → comodidades (text[])
 *   necesidadesEspeciales → necesidades_especiales
 *   imprescindibles     → imprescindibles (text[])
 *   fechaLlegada        → fecha_llegada (bucket categórico, no fecha real)
 *   comoNosConociste    → como_nos_conociste
 *   notasContacto       → notas_contacto
 *   cuentaBancaria      → cuenta_bancaria
 *   comprendeHonorarios → comprende_honorarios
 *   tipoLicencia        → tipo_licencia
 *   ciudadActual        → ciudad_actual
 *   tiempoEnEspana      → tiempo_en_espana
 *   objetivoBusqueda    → objetivo_busqueda
 *   nivelEstudios       → nivel_estudios
 *   comprendeServicio   → comprende_servicio (boolean)
 *   consentimientoRGPD  → consentimiento_rgpd (boolean)
 *   fuenteLead          → fuente_lead ('web' | 'gina' | 'contacto')
 *   consentimientoRGPDAt         → consentimiento_rgpd_at (última confirmación, se re-escribe en cada guardado)
 *   consentimientoRGPDPrimeraVez → consentimiento_rgpd_primera_vez (inmutable, la fija un trigger — solo lectura)
 *
 * `inicioContrato` se mantiene en el tipo por compatibilidad pero no tiene columna
 * en Supabase (confirmado código muerto, sin ninguna vía de escritura real — ver
 * docs/crm-supabase-fase0.md §6.3): toRow()/fromRow() lo ignoran.
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'

export type LeadData = {
  // Datos personales
  nombreCompleto: string
  email: string
  telefono: string
  paisResidencia: string

  // Composición del grupo familiar
  personas?: string
  adultos?: '1' | '2' | '3' | '4+'
  ninos?: '0' | '1' | '2' | '3+'
  adolescentes?: '0' | '1' | '2' | '3+'
  mascotas: 'si' | 'no'
  detalleMascotas?: string
  mascotaTipo?: ('perro' | 'gato' | 'otro')[]
  cantidadPerros?: '1' | '2' | '3+'
  cantidadGatos?: '1' | '2' | '3+'
  mascotaPeso?: '0-5 kg' | '5-10 kg' | '+10 kg'

  // Situación legal y laboral
  documentacion:
    | 'espanol'
    | 'ue-otro'
    | 'residencia-aprobada'
    | 'en-tramite'
    | 'nacionalidad-en-tramite'
    | 'turista'
  situacionLaboral:
    | 'cuenta-ajena'
    | 'autonomo'
    | 'teletrabajo-extranjero'
    | 'rentista'
    | 'jubilado'
    | 'estudiante'
    | 'busca-empleo'
  ingresosMensuales: string

  // Capacidad de garantías (selección múltiple)
  garantias: ('garantia-adicional' | 'aval-bancario' | 'avalista' | 'seguro-impago' | 'ninguna')[]

  // Preferencias de vivienda
  ciudadDestino: 'vigo' | 'a-coruna' | 'santiago' | 'pontevedra' | 'lugo' | 'indiferente'
  tipoInmueble?: 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living'
  presupuestoMensual: 'menos-700' | '700-1000' | '1000-1400' | 'mas-1400'
  habitacionesMinimas?: '1' | '2' | '3' | '4+'
  amueblado: 'si' | 'no' | 'indiferente'
  estacionamiento?: 'indispensable' | 'deseable' | 'no'   // opcional: Gina no pregunta por esto
  comodidades?: ('transporte' | 'zona-tranquila' | 'cerca-colegios' | 'internet' | 'ninguna')[]

  // Perfil adicional (Nivel 2 de Gina)
  necesidadesEspeciales?: 'si' | 'no'
  profesion?: string

  // Características físicas del inmueble (selección múltiple — Gina p24)
  imprescindibles?: ('ascensor' | 'garaje' | 'calefaccion' | 'terraza' | 'no')[]

  // Plazos
  fechaLlegada: string
  inicioContrato?: string   // código muerto — sin columna en Supabase, ver comentario de arriba

  // Atribución
  comoNosConociste?: 'instagram' | 'facebook' | 'tiktok' | 'google' | 'recomendacion' | 'otro'

  // Calificación automática del lead
  calificacion?: 'potencial' | 'potencial-alto' | 'en-desarrollo' | 'bajo'

  // Etiqueta de segmento
  etiqueta?: 'lead-en-preparacion' | 'seguimiento-futuro' | 'califica' | 'incompleto' | 'contacto-directo'

  // Mensaje libre del formulario de contacto
  notasContacto?: string

  // Modalidad de búsqueda según origen
  modalidad?: 'antes-de-viajar' | 'ya-en-espana'

  // Campos de perfil ampliado (Nivel 2 Gina — no todos aparecen en el formulario web)
  cuentaBancaria?: 'si' | 'no'
  comprendeHonorarios?: 'entiende' | 'pide-explicacion'
  tipoLicencia?: 'espanola' | 'europea' | 'origen' | 'no-tiene'
  ciudadActual?: string
  tiempoEnEspana?: 'menos-1-ano' | '1-5-anos' | 'mas-5-anos'
  objetivoBusqueda?: 'busca-vivienda' | 'integrarse'
  nivelEstudios?: 'sin-estudios' | 'bachillerato' | 'tecnico' | 'universitario' | 'posgrado'

  // Consentimientos
  comprendeServicio: boolean
  consentimientoRGPD: boolean

  // Origen del lead — cada punto de guardado lo setea explícitamente.
  // Sin valor, la columna aplica su default('web') solo como red de seguridad del NOT NULL.
  fuenteLead?: 'web' | 'gina' | 'contacto'

  // Timestamps de consentimiento RGPD — ninguno lo escribe la aplicación a mano en un
  // objeto LeadData de entrada: consentimientoRGPDAt lo estampa toRow() en cada guardado;
  // consentimientoRGPDPrimeraVez es inmutable y lo gestiona un trigger de Postgres (ver
  // supabase/migrations/0004_leads_schema.sql). Ambos son de solo lectura desde afuera de
  // este archivo — se exponen acá para que getLead() los devuelva.
  consentimientoRGPDAt?: string
  consentimientoRGPDPrimeraVez?: string

  // Campos ad-hoc definidos desde el panel (Fase 3, campos_custom_definiciones +
  // leads.campos_custom jsonb). De solo lectura acá: se escriben vía patchRecord()
  // en lib/admin/leadsRepo.ts (que mergea, no pisa), nunca a través de saveLead().
  camposCustom?: Record<string, unknown>
}

/**
 * Traduce un LeadData (camelCase) a una fila de la tabla `leads` (snake_case).
 *
 * REGLA: un campo con valor `undefined` en `data` no debe pisar la columna existente
 * en un `update`. supabase-js serializa el body igual que `JSON.stringify` (omite
 * claves `undefined`), así que basta con nunca convertir un `undefined` en `null`
 * explícito acá — un `null` real SÍ pisaría la columna en PostgREST.
 */
function toRow(data: LeadData): Record<string, unknown> {
  return {
    nombre_completo: data.nombreCompleto,
    email: data.email,
    telefono: data.telefono,
    pais_residencia: data.paisResidencia,

    personas: data.personas,
    adultos: data.adultos,
    ninos: data.ninos,
    adolescentes: data.adolescentes,
    mascotas: data.mascotas,
    detalle_mascotas: data.detalleMascotas,
    mascota_tipo: data.mascotaTipo,
    cantidad_perros: data.cantidadPerros,
    cantidad_gatos: data.cantidadGatos,
    mascota_peso: data.mascotaPeso,

    documentacion: data.documentacion,
    situacion_laboral: data.situacionLaboral,
    ingresos_mensuales: data.ingresosMensuales,

    garantias: data.garantias,

    ciudad_destino: data.ciudadDestino,
    tipo_inmueble: data.tipoInmueble,
    presupuesto_mensual: data.presupuestoMensual,
    habitaciones_minimas: data.habitacionesMinimas,
    amueblado: data.amueblado,
    estacionamiento: data.estacionamiento,
    comodidades: data.comodidades,

    necesidades_especiales: data.necesidadesEspeciales,
    profesion: data.profesion,
    imprescindibles: data.imprescindibles,

    fecha_llegada: data.fechaLlegada,
    como_nos_conociste: data.comoNosConociste,

    calificacion: data.calificacion,
    etiqueta: data.etiqueta,
    notas_contacto: data.notasContacto,

    modalidad: data.modalidad,
    cuenta_bancaria: data.cuentaBancaria,
    comprende_honorarios: data.comprendeHonorarios,
    tipo_licencia: data.tipoLicencia,
    ciudad_actual: data.ciudadActual,
    tiempo_en_espana: data.tiempoEnEspana,
    objetivo_busqueda: data.objetivoBusqueda,
    nivel_estudios: data.nivelEstudios,

    comprende_servicio: data.comprendeServicio,
    consentimiento_rgpd: data.consentimientoRGPD,
    // Última confirmación: se re-escribe en CADA guardado, a diferencia de
    // consentimiento_rgpd_primera_vez (inmutable, gestionada por trigger — nunca se
    // incluye acá a propósito, ver comentario en el tipo LeadData).
    consentimiento_rgpd_at: new Date().toISOString(),

    fuente_lead: data.fuenteLead,
  }
}

/**
 * Traduce una fila de `leads` (snake_case) de vuelta a LeadData (camelCase).
 * Exportada (además de usarse en getLead() más abajo) para que lib/admin/inboxRepo.ts
 * pueda mapear filas crudas de Supabase a LeadData sin duplicar este mapeo — es el único
 * punto del proyecto que conoce la traducción snake_case → camelCase de `leads`.
 */
export function fromRow(row: Record<string, unknown>): LeadData {
  const str = (key: string, fallback = ''): string =>
    typeof row[key] === 'string' ? (row[key] as string) : fallback
  const bool = (key: string): boolean => row[key] === true
  const arr = (key: string): string[] => (Array.isArray(row[key]) ? (row[key] as string[]) : [])
  const opt = (key: string): string | undefined => str(key) || undefined
  const optArr = (key: string): string[] | undefined =>
    Array.isArray(row[key]) && (row[key] as string[]).length > 0 ? (row[key] as string[]) : undefined

  return {
    // Campos obligatorios (NOT NULL en Supabase, o con default de aplicación)
    nombreCompleto: str('nombre_completo'),
    email: str('email'),
    telefono: str('telefono'),
    paisResidencia: str('pais_residencia'),
    documentacion: str('documentacion') as LeadData['documentacion'],
    situacionLaboral: str('situacion_laboral') as LeadData['situacionLaboral'],
    mascotas: (str('mascotas') || 'no') as 'si' | 'no',
    ingresosMensuales: str('ingresos_mensuales'),
    garantias: arr('garantias') as LeadData['garantias'],
    ciudadDestino: str('ciudad_destino') as LeadData['ciudadDestino'],
    presupuestoMensual: str('presupuesto_mensual') as LeadData['presupuestoMensual'],
    amueblado: (str('amueblado') || 'indiferente') as LeadData['amueblado'],
    fechaLlegada: str('fecha_llegada'),
    comprendeServicio: bool('comprende_servicio'),
    consentimientoRGPD: bool('consentimiento_rgpd'),

    // Campos opcionales
    personas: opt('personas'),
    adultos: opt('adultos') as LeadData['adultos'],
    ninos: opt('ninos') as LeadData['ninos'],
    adolescentes: opt('adolescentes') as LeadData['adolescentes'],
    detalleMascotas: opt('detalle_mascotas'),
    mascotaTipo: optArr('mascota_tipo') as LeadData['mascotaTipo'],
    cantidadPerros: opt('cantidad_perros') as LeadData['cantidadPerros'],
    cantidadGatos: opt('cantidad_gatos') as LeadData['cantidadGatos'],
    mascotaPeso: opt('mascota_peso') as LeadData['mascotaPeso'],
    tipoInmueble: opt('tipo_inmueble') as LeadData['tipoInmueble'],
    habitacionesMinimas: opt('habitaciones_minimas') as LeadData['habitacionesMinimas'],
    estacionamiento: opt('estacionamiento') as LeadData['estacionamiento'],
    comodidades: optArr('comodidades') as LeadData['comodidades'],
    necesidadesEspeciales: opt('necesidades_especiales') as LeadData['necesidadesEspeciales'],
    profesion: opt('profesion'),
    imprescindibles: optArr('imprescindibles') as LeadData['imprescindibles'],
    comoNosConociste: opt('como_nos_conociste') as LeadData['comoNosConociste'],
    calificacion: opt('calificacion') as LeadData['calificacion'],
    etiqueta: opt('etiqueta') as LeadData['etiqueta'],
    notasContacto: opt('notas_contacto'),
    modalidad: opt('modalidad') as LeadData['modalidad'],
    cuentaBancaria: opt('cuenta_bancaria') as LeadData['cuentaBancaria'],
    comprendeHonorarios: opt('comprende_honorarios') as LeadData['comprendeHonorarios'],
    tipoLicencia: opt('tipo_licencia') as LeadData['tipoLicencia'],
    ciudadActual: opt('ciudad_actual'),
    tiempoEnEspana: opt('tiempo_en_espana') as LeadData['tiempoEnEspana'],
    objetivoBusqueda: opt('objetivo_busqueda') as LeadData['objetivoBusqueda'],
    nivelEstudios: opt('nivel_estudios') as LeadData['nivelEstudios'],
    fuenteLead: opt('fuente_lead') as LeadData['fuenteLead'],
    consentimientoRGPDAt: opt('consentimiento_rgpd_at'),
    consentimientoRGPDPrimeraVez: opt('consentimiento_rgpd_primera_vez'),
    camposCustom: (row['campos_custom'] as Record<string, unknown> | null) ?? {},
  }
}

/**
 * Guarda o actualiza un lead en Supabase (tabla `leads`).
 *
 * - Sin leadId → insert (crea fila nueva), devuelve el id (uuid) asignado.
 * - Con leadId → update (actualiza la fila existente), devuelve el mismo id.
 *
 * Lanza Error si Supabase no está configurado o si la operación falla.
 * No loguea datos personales del usuario.
 */
export async function saveLead(data: LeadData, leadId?: string): Promise<string> {
  const supabase = getSupabaseServerClient()
  const row = toRow(data)

  if (leadId) {
    const { data: updated, error } = await supabase
      .from('leads')
      .update(row)
      .eq('id', leadId)
      .select('id')
      .single()
    if (error) throw new Error(`Supabase update leads: ${error.message}`)
    return (updated as { id: string }).id
  }

  const { data: inserted, error } = await supabase
    .from('leads')
    .insert(row)
    .select('id')
    .single()
  if (error) throw new Error(`Supabase insert leads: ${error.message}`)
  return (inserted as { id: string }).id
}

/**
 * Lee un lead existente de Supabase por id.
 * Lanza Error('Lead no encontrado') si el id no existe (mensaje estable para que los
 * callers puedan distinguir 404 de un error real de Supabase — ver app/api/plan/[recordId]/pdf/route.ts).
 * Lanza cualquier otro Error si Supabase no está configurado o si la lectura falla.
 */
export async function getLead(leadId: string): Promise<LeadData> {
  const supabase = getSupabaseServerClient()
  const { data: row, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .maybeSingle()

  if (error) throw new Error(`Supabase select leads: ${error.message}`)
  if (!row) throw new Error('Lead no encontrado')
  return fromRow(row as Record<string, unknown>)
}

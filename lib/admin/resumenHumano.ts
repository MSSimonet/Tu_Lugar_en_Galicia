/**
 * lib/admin/resumenHumano.ts — Genera el resumen de una línea que se muestra en el inbox
 * de leads (/admin) para que Silvana no tenga que abrir la ficha 360° para saber de qué
 * trata cada lead. 100% basado en reglas deterministas sobre columnas ya guardadas — NO
 * usa un LLM (decisión de negocio ya cerrada): nunca hay que confiar en que un modelo no
 * invente un dato que el lead no respondió.
 *
 * Principio general: un campo sin responder simplemente omite su cláusula del resumen —
 * nunca se rellena con un placeholder ("no especifica") ni se infiere lo que no está.
 *
 * Decisiones de diseño tomadas sin especificación exacta (documentadas para el review):
 *
 * 1. Origen (`ciudadActual` vs `paisResidencia`): `paisResidencia` es NOT NULL en la
 *    tabla `leads` y siempre tiene algún valor cuando el lead ya pasó por el paso de
 *    origen (incluso 'España' para modalidad='ya-en-espana', seteado por
 *    app/api/lead/route.ts). Si se priorizara `paisResidencia` primero, `ciudadActual`
 *    (más específico — ej. "Vigo") nunca se usaría en la práctica. Por eso este archivo
 *    prioriza `ciudadActual` cuando existe y usa `paisResidencia` como fallback.
 *
 * 2. Caso "Persona" (adultos='1' sin niños/adolescentes): la especificación pide
 *    literalmente la palabra "Persona" sin origen, a diferencia de "Familia de {origen}".
 *    Se implementa tal cual está escrito, aunque eso significa que un viajero solo no
 *    muestra su país en el resumen corto (si hiciera falta, la ficha 360° sí lo muestra).
 *
 * 3. Presupuesto: `presupuestoMensual` es un rango categórico ('700-1000', etc.), no un
 *    número exacto — no existe un valor como "1.200€" en el schema real. Se traduce cada
 *    bucket a una etiqueta legible en vez de inventar un número puntual.
 *
 * 4. Hint de visa/situación legal: se implementa como UNA sola cláusula (la primera regla
 *    que matchea, en el orden de prioridad de la especificación), no una lista acumulativa
 *    — coincide con el ejemplo de la especificación, que muestra un solo hint por resumen.
 *
 * 5. Conteo de mascotas: `mascotas`/`mascotaTipo` no traen un total combinado — se estima
 *    sumando `cantidadPerros`/`cantidadGatos` (mismo parseo que lib/gina/scoring.ts) más
 *    1 si hay 'otro' tipo sin contador propio. Si `mascotas === 'si'` pero no hay ningún
 *    detalle de cantidad, se asume 1 (nunca 0, para no perder la cláusula "y mascota").
 */

import type { LeadData } from '@/lib/leads'

type Lead = LeadData & { id: string }

const PRESUPUESTO_LABELS: Partial<Record<NonNullable<LeadData['presupuestoMensual']>, string>> = {
  'menos-700': 'menos de 700',
  '700-1000': '700-1000',
  '1000-1400': '1000-1400',
  'mas-1400': 'más de 1400',
}

/** Mismo parseo que lib/gina/scoring.ts (parseCantidad) — '3+'/'4+' cuentan como 3. */
function parseCount(value: string | undefined): number {
  if (!value) return 0
  if (value === '3+' || value === '4+') return 3
  const n = Number(value)
  return Number.isNaN(n) ? 0 : n
}

function esCero(value: string | undefined): boolean {
  return value === undefined || value === '0'
}

function clauseOrigen(lead: Lead): string | null {
  const origen = lead.ciudadActual?.trim() || lead.paisResidencia?.trim()
  if (!origen) return null

  const personaSola = lead.adultos === '1' && esCero(lead.ninos) && esCero(lead.adolescentes)
  return personaSola ? 'Persona' : `Familia de ${origen}`
}

function clausePresupuesto(lead: Lead): string | null {
  const label = lead.presupuestoMensual ? PRESUPUESTO_LABELS[lead.presupuestoMensual] : undefined
  return label ? `presupuesto ${label}€/mes` : null
}

/**
 * Un único hint determinista sobre visado/situación legal, evaluado en orden de
 * prioridad. Ninguna rama "adivina": si nada matchea, se omite la cláusula.
 */
function clauseVisaHint(lead: Lead): string | null {
  const antesDeViajar = lead.modalidad === 'antes-de-viajar'

  if (lead.situacionLaboral === 'teletrabajo-extranjero' && antesDeViajar) {
    return 'aplica a Visa de Teletrabajo/Nómada Digital'
  }
  if (lead.situacionLaboral === 'autonomo' && antesDeViajar) {
    return 'aplica a Visa de Emprendedor/Autónomo'
  }
  if (lead.situacionLaboral === 'jubilado' || lead.situacionLaboral === 'rentista') {
    return 'aplica a Visa de No Lucrativa'
  }
  if (lead.situacionLaboral === 'estudiante') {
    return 'aplica a Visa de Estudiante'
  }
  if (lead.documentacion === 'en-tramite') {
    return 'en trámite de residencia'
  }
  return null
}

function contarMascotas(lead: Lead): number {
  const tipos = lead.mascotaTipo ?? []
  let total = 0
  if (tipos.includes('perro')) total += parseCount(lead.cantidadPerros) || 1
  if (tipos.includes('gato')) total += parseCount(lead.cantidadGatos) || 1
  if (tipos.includes('otro')) total += 1
  return total || 1 // mascotas === 'si' garantiza al menos 1, aunque no haya detalle de tipo/cantidad
}

function clauseComposicion(lead: Lead): string | null {
  const partes: string[] = []

  const ninos = parseCount(lead.ninos)
  if (ninos > 0) partes.push(ninos === 1 ? '1 niño' : `${ninos} niños`)

  const adolescentes = parseCount(lead.adolescentes)
  if (adolescentes > 0) partes.push(adolescentes === 1 ? '1 adolescente' : `${adolescentes} adolescentes`)

  if (lead.mascotas === 'si') {
    const cantidad = contarMascotas(lead)
    partes.push(cantidad <= 1 ? 'mascota' : `${cantidad} mascotas`)
  }

  return partes.length > 0 ? `viaja con ${partes.join(' y ')}` : null
}

/** Genera el resumen de una línea para la ficha/inbox de un lead. Nunca inventa datos no respondidos. */
export function generarResumenHumano(lead: Lead): string {
  const clausulas = [
    clauseOrigen(lead),
    clausePresupuesto(lead),
    clauseVisaHint(lead),
    clauseComposicion(lead),
  ].filter((c): c is string => c !== null)

  if (clausulas.length === 0) {
    return 'Contacto inicial — nombre y teléfono capturados, cuestionario sin completar.'
  }

  return clausulas.join(', ')
}

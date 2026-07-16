export type Calificacion = 'potencial' | 'en-desarrollo' | 'bajo'

export type ScoringInput = {
  documentacion?: string
  garantias?: string[]
  ingresosMensuales?: string
  fechaLlegada?: string
  ciudadDestino?: string
  adultos?: string
  ninos?: string
  adolescentes?: string
  mascotas?: string
  cantidadPerros?: string
  cantidadGatos?: string
  situacionLaboral?: string
  presupuestoMensual?: string
  nivelEstudios?: string
}

type Dim = { pts: number; max: 2 }

function parseCantidad(val: string | undefined): number {
  if (!val) return 0
  if (val === '3+') return 3
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

export function calcularCalificacion(input: ScoringInput): Calificacion {
  const garantias = input.garantias ?? []

  // PASO 1: Descalificación directa
  const docBajo = ['en-tramite', 'turista', 'nacionalidad-en-tramite']
  if (input.documentacion && docBajo.includes(input.documentacion)) return 'bajo'

  const tieneNinguna = garantias.includes('ninguna')
  const tieneOtraGarantia = garantias.some((g) => g !== 'ninguna')
  const ingresosBajos =
    input.ingresosMensuales === 'sin-ingresos' || input.ingresosMensuales === 'menos-1500'
  if (tieneNinguna && !tieneOtraGarantia && ingresosBajos) return 'bajo'

  // PASO 2: Cap máximo en-desarrollo para estudiantes — mismo campo/valor que ya usa
  // lib/plan/armador.ts para disparar el trámite [48] (Visado/Estancia por Estudios).
  // 'estancia-estudios' nunca existió como valor de documentacion (confirmado con
  // git log -S sobre todo el historial); situacionLaboral === 'estudiante' es el valor
  // real que identifica este caso en el resto del código.
  const capEnDesarrollo = input.situacionLaboral === 'estudiante'

  // PASO 3: Puntuación porcentual (solo cuentan dimensiones respondidas)
  const dims: (Dim | null)[] = []

  // 1. plazo (fechaLlegada)
  if (input.fechaLlegada) {
    const pts =
      input.fechaLlegada === '1-3-meses' ? 2
      : input.fechaLlegada === 'menos-1-mes' || input.fechaLlegada === '3-6-meses' ? 1
      : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // 2. ciudad (ciudadDestino)
  if (input.ciudadDestino) {
    const pts =
      ['vigo', 'a-coruna'].includes(input.ciudadDestino) ? 2
      : ['santiago', 'pontevedra', 'lugo', 'indiferente'].includes(input.ciudadDestino) ? 1
      : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // 3. composicionFamiliar (reemplaza las dimensiones separadas de adultos y menores)
  // ninos/adolescentes undefined = rama "no menores" → parseCantidad devuelve 0
  if (input.adultos) {
    const numAdultos = parseCantidad(input.adultos)
    const totalMenores = parseCantidad(input.ninos) + parseCantidad(input.adolescentes)
    let pts: number
    if (totalMenores === 0 && [1, 2, 3].includes(numAdultos)) {
      pts = 2
    } else if (totalMenores === 1 && [1, 2].includes(numAdultos)) {
      pts = 2
    } else {
      pts = 1
    }
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // 4. mascotas
  if (input.mascotas !== undefined) {
    if (input.mascotas === 'no') {
      dims.push({ pts: 2, max: 2 })
    } else {
      const carga =
        parseCantidad(input.cantidadPerros) * 1 + parseCantidad(input.cantidadGatos) * 1.5
      const pts = carga <= 1 ? 2 : carga <= 2.5 ? 1 : 0
      dims.push({ pts, max: 2 })
    }
  } else {
    dims.push(null)
  }

  // 5. situacionLaboral
  if (input.situacionLaboral) {
    const pts =
      ['cuenta-ajena', 'autonomo', 'teletrabajo-extranjero', 'rentista'].includes(
        input.situacionLaboral,
      ) ? 2
      : ['jubilado', 'estudiante'].includes(input.situacionLaboral) ? 1
      : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // 6. ingresosMensuales
  if (input.ingresosMensuales) {
    const pts =
      input.ingresosMensuales === 'mas-4000' ? 2
      : ['1500-2500', '2500-4000'].includes(input.ingresosMensuales) ? 1
      : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // 7. garantias
  if (garantias.length > 0) {
    const tieneAlto =
      garantias.includes('aval-bancario') || garantias.includes('garantia-adicional')
    const tieneMedio = garantias.includes('seguro-impago') || garantias.includes('avalista')
    const pts = tieneAlto ? 2 : tieneMedio ? 1 : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // 8. presupuesto (presupuestoMensual)
  if (input.presupuestoMensual) {
    const pts = ['700-1000', '1000-1400', 'mas-1400'].includes(input.presupuestoMensual) ? 2 : 1
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // 9. estudios (nivelEstudios)
  if (input.nivelEstudios) {
    const pts = input.nivelEstudios === 'sin-estudios' ? 1 : 2
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  const answered = dims.filter((d): d is Dim => d !== null)
  if (answered.length === 0) return 'en-desarrollo'

  const pct =
    (answered.reduce((s, d) => s + d.pts, 0) / answered.reduce((s, d) => s + d.max, 0)) * 100

  let cal: Calificacion = pct >= 70 ? 'potencial' : pct >= 40 ? 'en-desarrollo' : 'bajo'
  if (capEnDesarrollo && cal === 'potencial') cal = 'en-desarrollo'

  return cal
}

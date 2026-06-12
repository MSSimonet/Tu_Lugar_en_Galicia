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
  cuentaBancaria?: string
  comprendeHonorarios?: string
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

  // PASO 2: Cap máximo en-desarrollo para estancia-estudios
  // (valor no activo en el flujo actual, preparado para futura opción)
  const capEnDesarrollo = input.documentacion === 'estancia-estudios'

  // PASO 3: Puntuación porcentual (solo cuentan dimensiones respondidas)
  const dims: (Dim | null)[] = []

  // plazo (fechaLlegada)
  if (input.fechaLlegada) {
    const pts =
      input.fechaLlegada === '1-3-meses' ? 2
      : input.fechaLlegada === 'menos-1-mes' || input.fechaLlegada === '3-6-meses' ? 1
      : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // ciudad
  if (input.ciudadDestino) {
    const pts =
      ['vigo', 'a-coruna', 'indiferente'].includes(input.ciudadDestino) ? 2
      : ['santiago', 'pontevedra'].includes(input.ciudadDestino) ? 1
      : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // adultos
  if (input.adultos) {
    const pts = ['1', '2', '3'].includes(input.adultos) ? 2 : 1
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // menores: solo se cuenta si el flujo ya pasó la pregunta de mascotas (que viene después)
  // hayMenores=true si ninos o adolescentes existen en sesión (la rama "sí" los guarda)
  if (input.mascotas !== undefined) {
    const hayMenores = input.ninos !== undefined || input.adolescentes !== undefined
    dims.push({ pts: hayMenores ? 1 : 2, max: 2 })
  } else {
    dims.push(null)
  }

  // mascotas
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

  // situacionLaboral
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

  // ingresosMensuales
  if (input.ingresosMensuales) {
    const pts =
      input.ingresosMensuales === 'mas-4000' ? 2
      : ['1500-2500', '2500-4000'].includes(input.ingresosMensuales) ? 1
      : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // garantias
  if (garantias.length > 0) {
    const tieneAlto =
      garantias.includes('aval-bancario') || garantias.includes('garantia-adicional')
    const tieneMedio = garantias.includes('seguro-impago') || garantias.includes('avalista')
    const pts = tieneAlto ? 2 : tieneMedio ? 1 : 0
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // presupuestoMensual
  if (input.presupuestoMensual) {
    const pts = ['700-1000', '1000-1400', 'mas-1400'].includes(input.presupuestoMensual) ? 2 : 1
    dims.push({ pts, max: 2 })
  } else {
    dims.push(null)
  }

  // banco (cuentaBancaria)
  if (input.cuentaBancaria !== undefined) {
    dims.push({ pts: input.cuentaBancaria === 'si' ? 2 : 0, max: 2 })
  } else {
    dims.push(null)
  }

  // honorarios (comprendeHonorarios)
  if (input.comprendeHonorarios !== undefined) {
    dims.push({ pts: input.comprendeHonorarios === 'entiende' ? 2 : 1, max: 2 })
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

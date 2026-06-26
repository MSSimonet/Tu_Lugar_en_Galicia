import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 21600 // 6 horas

const AEMET_CODIGOS: Record<string, string> = {
  'a-coruna':                 '15030',
  'vigo':                     '36057',
  'santiago-de-compostela':   '15078',
  'pontevedra':               '36038',
  'lugo':                     '27028',
}

const AEMET_BASE = 'https://opendata.aemet.es/opendata/api'

interface PeriodoValor {
  value: number | string
  periodo: string
}

interface EstadoCielo extends PeriodoValor {
  descripcion: string
}

interface DiaPred {
  fecha?: string
  temperatura?: PeriodoValor[]
  estadoCielo?: EstadoCielo[]
  precipitacion?: PeriodoValor[]
  humedadRelativa?: PeriodoValor[]
  vientoAndRachaMax?: unknown[]
}

function entradaMasCercana<T extends PeriodoValor>(arr: T[] | undefined, hora: number): T | null {
  if (!Array.isArray(arr) || arr.length === 0) return null
  return arr.reduce((prev, curr) => {
    const prevDiff = Math.abs(parseInt(prev.periodo) - hora)
    const currDiff = Math.abs(parseInt(curr.periodo) - hora)
    return currDiff < prevDiff ? curr : prev
  })
}

function extraerViento(vientoArr: unknown[] | undefined): number | null {
  if (!Array.isArray(vientoArr) || vientoArr.length === 0) return null
  const entry = vientoArr[0] as Record<string, unknown>
  if (entry == null) return null

  // Resolve raw velocity from multiple possible AEMET structures
  let rawVal: unknown = undefined

  if (Array.isArray(entry.velocidad) && entry.velocidad.length > 0) {
    // AEMET actual: velocidad: ["2"] — array of strings
    // Fallback legacy: velocidad: [{value: "2"}] — array of objects
    const first = entry.velocidad[0]
    rawVal = typeof first === 'object' && first !== null
      ? (first as Record<string, unknown>).value
      : first
  } else if (entry.velocidad !== undefined) {
    // Direct value: {velocidad: "Calma"} or {velocidad: 10}
    rawVal = entry.velocidad
  } else if (entry.value !== undefined) {
    // Flat structure: {value: 10, periodo: "HH"}
    rawVal = entry.value
  }

  if (rawVal === undefined) return null
  if (rawVal === 'Calma') return 0
  const n = Number(rawVal)
  return isNaN(n) ? null : n
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ciudad: string }> },
) {
  const { ciudad } = await params
  const codigo = AEMET_CODIGOS[ciudad]

  if (!codigo) {
    return NextResponse.json({ error: 'Ciudad no soportada' }, { status: 404 })
  }

  const apiKey = process.env.AEMET_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Clave de API no configurada' }, { status: 500 })
  }

  try {
    // Paso 1: obtener la URL de datos de la AEMET
    const metaRes = await fetch(
      `${AEMET_BASE}/prediccion/especifica/municipio/horaria/${codigo}`,
      { headers: { 'api_key': apiKey } },
    )

    if (!metaRes.ok) {
      throw new Error(`AEMET meta HTTP ${metaRes.status}`)
    }

    const meta = await metaRes.json() as { estado: number; datos?: string }

    if (meta.estado !== 200 || !meta.datos) {
      throw new Error(`AEMET estado inesperado: ${meta.estado}`)
    }

    // Paso 2: obtener los datos reales desde la URL devuelta
    const datosRes = await fetch(meta.datos)

    if (!datosRes.ok) {
      throw new Error(`AEMET datos HTTP ${datosRes.status}`)
    }

    const rawData = await datosRes.json() as Array<{ prediccion?: { dia?: DiaPred[] } }>

    const prediccion = rawData[0]?.prediccion
    if (!prediccion?.dia?.length) {
      throw new Error('Estructura inesperada en la respuesta de AEMET')
    }

    const ahora = new Date()
    const horaActual = ahora.getHours()
    const fechaHoy = ahora.toISOString().slice(0, 10)

    const diaHoy: DiaPred =
      prediccion.dia.find(d => d.fecha?.startsWith(fechaHoy)) ?? prediccion.dia[0]

    const tempEntry    = entradaMasCercana(diaHoy.temperatura,    horaActual)
    const cieloEntry   = entradaMasCercana(diaHoy.estadoCielo,    horaActual)
    const precipEntry  = entradaMasCercana(diaHoy.precipitacion,  horaActual)
    const humedadEntry = entradaMasCercana(diaHoy.humedadRelativa, horaActual)

    // tempMin/tempMax: mínimo y máximo de todas las temperaturas horarias del día
    const todasTemps = (diaHoy.temperatura ?? [])
      .map(t => Number(t.value))
      .filter(n => !isNaN(n))
    const tempMin = todasTemps.length > 0 ? Math.min(...todasTemps) : null
    const tempMax = todasTemps.length > 0 ? Math.max(...todasTemps) : null

    return NextResponse.json(
      {
        ciudad,
        temperatura:   tempEntry   ? Number(tempEntry.value)                      : null,
        tempMin,
        tempMax,
        descripcion:   cieloEntry  ? (cieloEntry as EstadoCielo).descripcion      : null,
        precipitacion: precipEntry ? Number(precipEntry.value)                    : null,
        viento:        extraerViento(diaHoy.vientoAndRachaMax),
        humedad:       humedadEntry ? Number(humedadEntry.value)                  : null,
        actualizadoEn: ahora.toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
        },
      },
    )
  } catch {
    return NextResponse.json(
      {
        ciudad,
        temperatura: null,
        tempMin: null,
        tempMax: null,
        descripcion: null,
        precipitacion: null,
        viento: null,
        humedad: null,
        actualizadoEn: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    )
  }
}

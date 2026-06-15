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
}

function entradaMasCercana<T extends PeriodoValor>(arr: T[] | undefined, hora: number): T | null {
  if (!Array.isArray(arr) || arr.length === 0) return null
  return arr.reduce((prev, curr) => {
    const prevDiff = Math.abs(parseInt(prev.periodo) - hora)
    const currDiff = Math.abs(parseInt(curr.periodo) - hora)
    return currDiff < prevDiff ? curr : prev
  })
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

    const tempEntry  = entradaMasCercana(diaHoy.temperatura,   horaActual)
    const cieloEntry = entradaMasCercana(diaHoy.estadoCielo,   horaActual)
    const precipEntry = entradaMasCercana(diaHoy.precipitacion, horaActual)

    return NextResponse.json(
      {
        ciudad,
        temperatura:    tempEntry  ? Number(tempEntry.value)  : null,
        cielo:          cieloEntry ? (cieloEntry as EstadoCielo).descripcion : null,
        precipitacion:  precipEntry ? Number(precipEntry.value) : null,
        actualizadoEn:  ahora.toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
        },
      },
    )
  } catch (err) {
    console.error('[api/clima]', ciudad, err)
    return NextResponse.json(
      { error: 'No se pudo obtener el clima' },
      { status: 502 },
    )
  }
}

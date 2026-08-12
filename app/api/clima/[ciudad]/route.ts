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

interface ClimaPayload {
  ciudad: string
  temperatura: number | null
  tempMin: number | null
  tempMax: number | null
  descripcion: string | null
  precipitacion: number | null
  viento: number | null
  humedad: number | null
  actualizadoEn: string
}

/**
 * Último dato bueno por ciudad, para servir cuando AEMET falla.
 *
 * POR QUÉ: AEMET limita por cuota en su plan gratuito y responde 429. Cuando eso pasaba, la
 * tarjeta mostraba "Clima no disponible" — o sea, el visitante pagaba el rate limit de un
 * tercero con un hueco en la página. Y no es un caso raro: son 5 ciudades y basta con un pico
 * de visitas para cruzarlo.
 *
 * Un dato de hace unas horas es MUCHO mejor que ningún dato, y no engaña a nadie: la propia
 * tarjeta ya declara "actualizado cada 6h". El tope de 24 h es el límite de lo que sigue
 * siendo información: más viejo que eso ya no describe el tiempo de hoy y se prefiere el
 * hueco honesto.
 *
 * Es memoria del proceso, no Redis: no vale la pena atar un endpoint público y sin secretos a
 * una dependencia de infraestructura que hoy no tiene. En Vercel esto vive mientras la
 * instancia esté caliente, así que cubre el caso que importa —una racha de 429 seguidos— y
 * degrada solo, sin nada que mantener, cuando la instancia se recicla.
 */
const ULTIMO_BUENO = new Map<string, ClimaPayload>()
const VIDA_RESPALDO_MS = 24 * 60 * 60 * 1000

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
  }, arr[0])
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
    //
    // `next: { revalidate }` NO es un detalle de rendimiento — es lo que hace que el clima se
    // vea. Desde Next 15 `fetch` no cachea por defecto, así que sin esto cada visita a una
    // página de ciudad disparaba DOS llamadas a AEMET (meta + datos), y en desarrollo cuatro,
    // porque React monta el efecto dos veces. AEMET limita por cuota en su plan gratuito:
    // pasado el límite responde con un estado distinto de 200, el `catch` de abajo devolvía
    // nulls y la tarjeta mostraba "Clima no disponible" con la API aparentemente sana.
    //
    // Así se comportaba de forma intermitente y sin dejar rastro: una prueba suelta con curl
    // pasaba, y la página fallaba. Se detectó midiendo el DOM real, no el endpoint (QA
    // 2026-08-11); una verificación anterior había dado "5/5 en 200" justamente por probar el
    // endpoint de a uno.
    //
    // Con la caché, N visitas en 6 horas se colapsan en una sola llamada a AEMET — que es
    // exactamente la frecuencia que declara la propia tarjeta ("actualizado cada 6h").
    const metaRes = await fetch(
      `${AEMET_BASE}/prediccion/especifica/municipio/horaria/${codigo}`,
      { headers: { 'api_key': apiKey }, next: { revalidate } },
    )

    if (!metaRes.ok) {
      throw new Error(`AEMET meta HTTP ${metaRes.status}`)
    }

    const meta = await metaRes.json() as { estado: number; datos?: string }

    if (meta.estado !== 200 || !meta.datos) {
      throw new Error(`AEMET estado inesperado: ${meta.estado}`)
    }

    // Paso 2: obtener los datos reales desde la URL devuelta. Se cachea igual que el paso 1:
    // mientras la meta esté en caché, `meta.datos` es la misma URL, así que las dos entradas
    // caducan juntas y no puede quedar una fresca apuntando a la otra vencida.
    const datosRes = await fetch(meta.datos, { next: { revalidate } })

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

    const payload: ClimaPayload = {
      ciudad,
      temperatura:   tempEntry   ? Number(tempEntry.value)                      : null,
      tempMin,
      tempMax,
      descripcion:   cieloEntry  ? (cieloEntry as EstadoCielo).descripcion      : null,
      precipitacion: precipEntry ? Number(precipEntry.value)                    : null,
      viento:        extraerViento(diaHoy.vientoAndRachaMax),
      humedad:       humedadEntry ? Number(humedadEntry.value)                  : null,
      actualizadoEn: ahora.toISOString(),
    }

    // Solo se guarda como respaldo si trae la temperatura: es el único campo del que depende
    // que la tarjeta se dibuje (ver ClimaActual.tsx). Guardar una respuesta hueca convertiría
    // el respaldo en una forma más lenta de no tener datos.
    if (payload.temperatura != null) ULTIMO_BUENO.set(ciudad, payload)

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
      },
    })
  } catch (err) {
    // El fallo era COMPLETAMENTE mudo: se devolvían nulls con un 200 y no quedaba registro de
    // por qué. Desde afuera, "Clima no disponible" y "AEMET nos cortó por cuota" se veían
    // idénticos. Se registra solo el motivo técnico y la ciudad, que es un slug público —
    // ningún dato personal, según la regla A02 de CLAUDE.md.
    console.error(
      `[clima/${ciudad}] AEMET no devolvió datos — motivo: ${
        err instanceof Error ? err.message : 'desconocido'
      }, ts: ${new Date().toISOString()}`,
    )

    const respaldo = ULTIMO_BUENO.get(ciudad)
    if (respaldo && Date.now() - new Date(respaldo.actualizadoEn).getTime() < VIDA_RESPALDO_MS) {
      return NextResponse.json(respaldo, {
        status: 200,
        headers: {
          // `max-age=0` explícito además del s-maxage corto. Sin él, el navegador se queda con
          // la respuesta degradada: `public` sin `max-age` habilita el cacheo heurístico del
          // navegador, y ahí un solo 429 de AEMET fija el dato viejo en ESE visitante aunque
          // el CDN ya se haya recuperado. El s-maxage sigue protegiendo a AEMET del tráfico.
          'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
          // Deja el hecho a la vista de quien depure esto en producción sin tener que
          // reconstruirlo desde los logs.
          'X-Clima-Origen': 'respaldo',
        },
      })
    }

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
          // `no-store`: una ausencia de datos NO se cachea en ninguna capa.
          //
          // Antes esta rama mandaba `public, s-maxage=300`, y ese `public` sin `max-age` deja
          // que el navegador aplique cacheo heurístico. Consecuencia medida (QA 2026-08-11):
          // tras un 429 de AEMET, /ciudades/santiago-de-compostela seguía mostrando "Clima no
          // disponible" en el navegador mientras el mismo endpoint ya devolvía 25° por curl.
          // O sea: el visitante quedaba atrapado en un fallo que ya no existía.
          //
          // Guardar un hueco no ahorra nada —la próxima petición es igual de barata— y
          // convierte un fallo instantáneo de un tercero en uno persistente para una persona.
          'Cache-Control': 'no-store',
        },
      },
    )
  }
}

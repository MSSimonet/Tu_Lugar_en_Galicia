/**
 * lib/marcador.ts — Lectura de "El Marcador" desde Google Sheets.
 *
 * La Google Sheet de El Marcador debe tener la siguiente estructura:
 *
 *   Columna A (nombre del campo)  | Columna B (valor numérico)
 *   ------------------------------|---------------------------
 *   anunciosContactados           | 127
 *   propietariosDijeronNo         | 94
 *   familiasUbicadas              | 8
 *   tiempoMedioSemanas            | 3
 *
 * El orden de las filas importa: A1=anunciosContactados, A2=propietariosDijeronNo,
 * A3=familiasUbicadas, A4=tiempoMedioSemanas.
 *
 * La hoja debe ser de lectura pública (o accesible con la API key configurada).
 */

export type MarcadorData = {
  anunciosContactados: number
  propietariosDijeronNo: number
  familiasUbicadas: number
  tiempoMedioSemanas: number
}

export const MARCADOR_FALLBACK: MarcadorData = {
  anunciosContactados: 0,
  propietariosDijeronNo: 0,
  familiasUbicadas: 0,
  tiempoMedioSemanas: 0,
}

type SheetValuesResponse = {
  values?: string[][]
}

/**
 * Lee los 4 valores del Marcador desde Google Sheets API v4.
 *
 * Requiere las variables de entorno:
 *   SHEET_MARCADOR_ID       — ID de la Google Sheet (de la URL: .../d/[ID]/...)
 *   GOOGLE_SHEETS_API_KEY   — API Key de Google Cloud (solo lectura, hoja pública)
 *
 * Devuelve MARCADOR_FALLBACK si las variables no están configuradas, si el fetch
 * falla, o si los datos no tienen el formato esperado.
 * Nunca lanza — los errores se manejan internamente y se devuelve el fallback.
 */
export async function getMarcadorData(): Promise<{
  data: MarcadorData
  fromFallback: boolean
}> {
  const sheetId = process.env.SHEET_MARCADOR_ID
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY

  if (!sheetId || !apiKey) {
    return { data: MARCADOR_FALLBACK, fromFallback: true }
  }

  try {
    const range = 'A1:B4'
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`

    const response = await fetch(url, {
      // next.js fetch cache: revalidar cada hora
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.error(`Error al leer El Marcador desde Sheets: HTTP ${response.status}`)
      return { data: MARCADOR_FALLBACK, fromFallback: true }
    }

    const json = (await response.json()) as SheetValuesResponse
    const rows = json.values

    if (!Array.isArray(rows) || rows.length < 4) {
      console.error('El Marcador: la Sheet no tiene el formato esperado (mínimo 4 filas)')
      return { data: MARCADOR_FALLBACK, fromFallback: true }
    }

    const parseRow = (row: string[] | undefined): number => {
      const raw = row?.[1]
      const parsed = Number(raw)
      return Number.isFinite(parsed) ? parsed : 0
    }

    const data: MarcadorData = {
      anunciosContactados: parseRow(rows[0]),
      propietariosDijeronNo: parseRow(rows[1]),
      familiasUbicadas: parseRow(rows[2]),
      tiempoMedioSemanas: parseRow(rows[3]),
    }

    return { data, fromFallback: false }
  } catch (err) {
    console.error('Error inesperado al leer El Marcador:', err)
    return { data: MARCADOR_FALLBACK, fromFallback: true }
  }
}

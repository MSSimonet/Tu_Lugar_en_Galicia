/**
 * Geocodificación de intersecciones vía Nominatim (OpenStreetMap) — decisión ya cerrada
 * en docs/comunidad-de-acogida.md §7. Se llama desde el servidor (API route), nunca desde
 * el cliente: Nominatim exige un User-Agent identificable y máximo 1 req/seg, más fácil de
 * respetar desde un único origen server-side que desde navegadores concurrentes.
 *
 * NOTA DE IMPLEMENTACIÓN (encontrado al probar en vivo, no estaba en la spec original):
 * Nominatim no interpreta consultas de texto libre tipo "calle1 esquina calle2, ciudad"
 * como una intersección real — devuelve resultados vacíos incluso con calles que existen
 * (probado con "Rúa do Príncipe" y "Rúa Urzáiz" en Vigo, ambas reales). Nominatim SÍ
 * geocodifica cada calle por separado de forma confiable. La solución: geocodificar las
 * dos calles por separado y promediar sus centros — una aproximación razonable de "cerca
 * de ambas calles" sin necesitar la geometría real de las dos vías para calcular el cruce
 * exacto. Como el punto igual se usa como centro de un círculo de privacidad de 200m
 * (§5 del doc), esta aproximación adicional no compromete el diseño de privacidad — si
 * algo, lo refuerza.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'TuLugarEnGalicia/1.0 (+https://tulugarengalicia.com; hola@tulugarengalicia.com)'

interface NominatimResult {
  lat: string
  lon: string
}

export interface Coordenadas {
  lat: number
  lng: number
}

async function geocodificarCalle(calle: string, ciudad: string): Promise<Coordenadas | null> {
  const params = new URLSearchParams({
    q: `${calle}, ${ciudad}, Galicia, España`,
    format: 'json',
    limit: '1',
    countrycodes: 'es',
  })

  const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return null

  const results = (await res.json()) as NominatimResult[]
  if (!Array.isArray(results) || results.length === 0) return null

  const lat = Number(results[0].lat)
  const lng = Number(results[0].lon)
  if (isNaN(lat) || isNaN(lng)) return null

  return { lat, lng }
}

/**
 * Geocodifica una intersección de dos calles dentro de una ciudad gallega, promediando el
 * centro de cada calle por separado (ver nota arriba). Devuelve null solo si NINGUNA de
 * las dos calles pudo ubicarse — si se ubica una sola, se usa esa como aproximación en vez
 * de fallar, ya que sigue siendo mejor señal que rechazar el registro.
 *
 * Respeta el límite de 1 req/seg de Nominatim: las dos consultas van en serie, no en
 * paralelo.
 */
export async function geocodificarInterseccion(
  calle1: string,
  calle2: string,
  ciudad: string,
): Promise<Coordenadas | null> {
  const punto1 = await geocodificarCalle(calle1, ciudad)
  // Espera >1s antes de la segunda consulta — política de uso de Nominatim: máx 1 req/seg.
  await new Promise(resolve => setTimeout(resolve, 1100))
  const punto2 = await geocodificarCalle(calle2, ciudad)

  if (punto1 && punto2) {
    return { lat: (punto1.lat + punto2.lat) / 2, lng: (punto1.lng + punto2.lng) / 2 }
  }
  return punto1 ?? punto2 ?? null
}

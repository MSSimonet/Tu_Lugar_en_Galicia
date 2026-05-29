/**
 * app/api/marcador/route.ts
 *
 * GET /api/marcador
 *
 * Devuelve los 4 contadores de "El Marcador" leídos desde una Google Sheet.
 * Si la Sheet no está configurada o falla, devuelve valores en cero (fallback)
 * para no romper la home. Nunca devuelve HTTP 500.
 *
 * Caché: revalidación cada 1 hora, stale-while-revalidate hasta 24 horas.
 * Silvana puede actualizar la Sheet y los cambios aparecen en la web en ≤ 1 h.
 */

import { getMarcadorData } from '@/lib/marcador'

export async function GET(): Promise<Response> {
  const { data, fromFallback } = await getMarcadorData()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  }

  if (fromFallback) {
    headers['X-Data-Source'] = 'fallback'
  }

  return new Response(JSON.stringify(data), { status: 200, headers })
}

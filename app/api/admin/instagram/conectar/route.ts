/**
 * POST /api/admin/instagram/conectar — primera conexión de la cuenta de Instagram.
 *
 * Recibe el short-lived token que se genera a mano en developers.facebook.com (dura 1 hora,
 * de un solo uso para el canje), lo canjea por un long-lived token (~60 días) y lo guarda en
 * `instagram_tokens`. A partir de acá, app/api/admin/instagram/refrescar-token se encarga de
 * mantenerlo vivo — este endpoint no se vuelve a llamar salvo que se reconecte la cuenta desde cero.
 *
 * Protegido igual que el resto de /api/admin/*: Authorization: Bearer INTERNAL_API_SECRET.
 * No queda listo para ejecutarse solo — falta el short-lived token real (Silvana/el usuario
 * lo genera manualmente y lo pasa una vez).
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/admin/auth'
import { exchangeLongLivedToken, fetchInstagramUserId } from '@/lib/instagram/graph'
import { saveInstagramToken } from '@/lib/instagram/tokenRepo'

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  const { shortLivedToken } = body as Record<string, unknown>
  if (!shortLivedToken || typeof shortLivedToken !== 'string' || shortLivedToken.trim().length < 10) {
    return NextResponse.json({ error: 'shortLivedToken es obligatorio.' }, { status: 400 })
  }

  try {
    const { accessToken, expiresAt } = await exchangeLongLivedToken(shortLivedToken.trim())
    const igUserId = await fetchInstagramUserId(accessToken)
    await saveInstagramToken({ igUserId, accessToken, expiresAt })
    return NextResponse.json({ ok: true, igUserId, expiresAt })
  } catch (err) {
    console.error('[instagram/conectar] error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'No se pudo conectar la cuenta de Instagram.' }, { status: 500 })
  }
}

/**
 * POST /api/admin/instagram/conectar — conexión manual, alternativa al flujo de un clic
 * (/api/admin/instagram/autorizar → callback). Útil para generar el user token a mano desde
 * el Graph API Explorer de Meta (con los permisos pages_show_list, pages_read_engagement,
 * instagram_basic) en vez de que Silvana pase por la pantalla de autorización.
 *
 * Acepta un user access token de Facebook (corto o largo — exchangeLongLivedUserToken extiende
 * cualquiera de los dos sin problema) y hace el mismo resto de la cadena que el callback:
 * long-lived user token → Página con Instagram vinculado → Page Access Token.
 *
 * Protegido igual que el resto de /api/admin/*: Authorization: Bearer INTERNAL_API_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/admin/auth'
import { exchangeLongLivedUserToken, fetchPaginaConInstagram } from '@/lib/instagram/graph'
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

  const { userAccessToken } = body as Record<string, unknown>
  if (!userAccessToken || typeof userAccessToken !== 'string' || userAccessToken.trim().length < 10) {
    return NextResponse.json({ error: 'userAccessToken es obligatorio.' }, { status: 400 })
  }

  try {
    const { accessToken: longLivedUserToken, expiresAt } = await exchangeLongLivedUserToken(userAccessToken.trim())
    const { pageId, pageAccessToken, igUserId } = await fetchPaginaConInstagram(longLivedUserToken)
    await saveInstagramToken({ igUserId, pageId, accessToken: pageAccessToken, userAccessToken: longLivedUserToken, expiresAt })
    return NextResponse.json({ ok: true, igUserId, pageId, expiresAt })
  } catch (err) {
    console.error('[instagram/conectar] error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'No se pudo conectar la cuenta de Instagram.' }, { status: 500 })
  }
}

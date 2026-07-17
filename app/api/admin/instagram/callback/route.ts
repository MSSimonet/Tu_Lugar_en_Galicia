/**
 * GET /api/admin/instagram/callback — destino del link de autorización que abre Silvana
 * (/api/admin/instagram/autorizar).
 *
 * Facebook redirige el navegador de Silvana acá con ?code=...&state=... después de que ella
 * inicia sesión y aprueba el permiso en la propia pantalla de Facebook — este endpoint nunca
 * ve ni maneja su contraseña. Cadena completa: code → short-lived user token → long-lived user
 * token → Página de Facebook con Instagram vinculado → Page Access Token (lo que de verdad
 * lee /media, ver lib/instagram/graph.ts).
 *
 * Sin Authorization: Bearer (no puede llevarlo una navegación de navegador real). La seguridad
 * acá es: (1) `state` firmado con TTL de 10 min (lib/instagram/oauthState.ts, CSRF), y (2) el
 * `code` es de un solo uso y Meta solo lo emite para el `redirect_uri` exacto registrado en la
 * app — no hay superficie para que un tercero cuele un code ajeno sin conocer también el secret.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyOAuthState } from '@/lib/instagram/oauthState'
import { exchangeCodeForShortLivedToken, exchangeLongLivedUserToken, fetchPaginaConInstagram } from '@/lib/instagram/graph'
import { saveInstagramToken } from '@/lib/instagram/tokenRepo'

function paginaResultado(titulo: string, mensaje: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><title>${titulo}</title></head>
<body style="font-family:Arial,sans-serif;background:#f5f0e8;padding:48px;text-align:center;">
  <h1 style="color:#1E1C19;">${titulo}</h1>
  <p style="color:#696560;">${mensaje}</p>
</body>
</html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

function redirectUri(req: NextRequest): string {
  return new URL('/api/admin/instagram/callback', req.nextUrl.origin).toString()
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const errorParam = req.nextUrl.searchParams.get('error')

  if (errorParam) {
    return paginaResultado('Conexión cancelada', 'No se aprobó el permiso en Facebook. Pedile a Silvana que vuelva a abrir el link cuando quiera intentarlo de nuevo.')
  }

  if (!code || !state || !verifyOAuthState(state)) {
    return paginaResultado('Link inválido o vencido', 'Este link de conexión ya expiró (dura 10 minutos) o no es válido. Generá uno nuevo.')
  }

  try {
    const { accessToken: shortLivedToken } = await exchangeCodeForShortLivedToken(code, redirectUri(req))
    const { accessToken: longLivedUserToken, expiresAt } = await exchangeLongLivedUserToken(shortLivedToken)
    const { pageId, pageAccessToken, igUserId } = await fetchPaginaConInstagram(longLivedUserToken)
    await saveInstagramToken({ igUserId, pageId, accessToken: pageAccessToken, userAccessToken: longLivedUserToken, expiresAt })
  } catch (err) {
    console.error('[instagram/callback] error:', err instanceof Error ? err.message : 'unknown')
    return paginaResultado('No se pudo conectar', 'Hubo un error conectando la cuenta de Instagram. Avisale al equipo técnico.')
  }

  return paginaResultado('Cuenta de Instagram conectada ✓', 'Ya podés cerrar esta pestaña — el feed del sitio va a mostrar los posts reales en unos minutos.')
}

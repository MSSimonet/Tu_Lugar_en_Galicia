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
 * acá es: (1) sesión de NextAuth, (2) `state` firmado con TTL de 10 min
 * (lib/instagram/oauthState.ts, CSRF), y (3) el `code` es de un solo uso y Meta solo lo emite
 * para el `redirect_uri` exacto registrado en la app.
 *
 * La sesión se agregó en la auditoría 2026-08-08 (IG-01) junto con el gate de /autorizar: el
 * `state` por sí solo no distinguía a Silvana de un tercero que recorriera el flujo con su
 * propia cuenta de Facebook. Funciona con una navegación que viene de facebook.com porque la
 * cookie de sesión de Auth.js es SameSite=Lax, y Lax sí se envía en navegaciones GET de nivel
 * superior. La verificación final de qué cuenta quedó conectada vive en `saveInstagramToken`
 * (INSTAGRAM_EXPECTED_IG_USER_ID, ver lib/instagram/tokenRepo.ts).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { verifyOAuthState } from '@/lib/instagram/oauthState'
import { exchangeCodeForShortLivedToken, exchangeLongLivedUserToken, fetchPaginaConInstagram } from '@/lib/instagram/graph'
import { ERROR_CUENTA_NO_AUTORIZADA, saveInstagramToken } from '@/lib/instagram/tokenRepo'

function paginaResultado(titulo: string, mensaje: string, status = 200): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><title>${titulo}</title></head>
<body style="font-family:Arial,sans-serif;background:#f5f0e8;padding:48px;text-align:center;">
  <h1 style="color:#1E1C19;">${titulo}</h1>
  <p style="color:#696560;">${mensaje}</p>
</body>
</html>`
  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

function redirectUri(req: NextRequest): string {
  return new URL('/api/admin/instagram/callback', req.nextUrl.origin).toString()
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    return paginaResultado(
      'Sesión no iniciada',
      'Para conectar la cuenta tenés que estar con la sesión abierta en el panel. Iniciá sesión y volvé a empezar la conexión desde ahí.',
      401,
    )
  }

  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const errorParam = req.nextUrl.searchParams.get('error')

  if (errorParam) {
    return paginaResultado('Conexión cancelada', 'No se aprobó el permiso en Facebook. Pedile a Silvana que vuelva a abrir el link cuando quiera intentarlo de nuevo.')
  }

  if (!code || !state || !verifyOAuthState(state)) {
    return paginaResultado('Link inválido o vencido', 'Este link de conexión ya expiró (dura 10 minutos) o no es válido. Generá uno nuevo.', 400)
  }

  try {
    const { accessToken: shortLivedToken } = await exchangeCodeForShortLivedToken(code, redirectUri(req))
    const { accessToken: longLivedUserToken, expiresAt } = await exchangeLongLivedUserToken(shortLivedToken)
    const { pageId, pageAccessToken, igUserId } = await fetchPaginaConInstagram(longLivedUserToken)
    await saveInstagramToken({ igUserId, pageId, accessToken: pageAccessToken, userAccessToken: longLivedUserToken, expiresAt })
  } catch (err) {
    console.error('[instagram/callback] error:', err instanceof Error ? err.message : 'unknown')
    if (err instanceof Error && err.message === ERROR_CUENTA_NO_AUTORIZADA) {
      return paginaResultado(
        'Esa no es la cuenta configurada',
        'La cuenta que aprobaste no es la que este sitio tiene fijada como oficial. No se guardó nada. Si de verdad querés cambiar de cuenta, hay que actualizar INSTAGRAM_EXPECTED_IG_USER_ID en Vercel.',
        403,
      )
    }
    return paginaResultado('No se pudo conectar', 'Hubo un error conectando la cuenta de Instagram. Avisale al equipo técnico.', 502)
  }

  return paginaResultado('Cuenta de Instagram conectada ✓', 'Ya podés cerrar esta pestaña — el feed del sitio va a mostrar los posts reales en unos minutos.')
}

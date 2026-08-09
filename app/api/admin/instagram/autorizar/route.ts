/**
 * GET /api/admin/instagram/autorizar — punto de entrada del link que abre Silvana para
 * conectar la cuenta. Genera el `state` (CSRF) y redirige a la pantalla de autorización de
 * Instagram (lib/instagram/graph.ts buildAuthorizeUrl).
 *
 * Exige sesión de NextAuth (auditoría 2026-08-08, IG-01). Antes era público, con el argumento
 * de que "solo arma un redirect y el paso sensible es el callback". El razonamiento fallaba:
 * el `state` es la protección CSRF del flujo, y emitirlo para cualquiera la anula justo para
 * el ataque que importa. No era "colar un code ajeno" —contra eso el state sí protege— sino
 * que un tercero recorriera el flujo entero con SU PROPIA cuenta y quedara conectada, con lo
 * que el carrusel del Home pasaba a servir los posts de esa cuenta.
 *
 * `middleware.ts` cubre /admin/* (páginas) pero NO /api/admin/*, así que el gate va acá.
 * Se redirige al login en vez de devolver 401: esto lo abre Silvana como link en el navegador.
 *
 * Corre en el propio servidor de producción para firmar el state con el INTERNAL_API_SECRET
 * real de ese entorno — evita cualquier desajuste con un secret copiado a mano en otro lado.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateOAuthState } from '@/lib/instagram/oauthState'
import { buildAuthorizeUrl } from '@/lib/instagram/graph'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    const loginUrl = new URL('/admin/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', '/api/admin/instagram/autorizar')
    return NextResponse.redirect(loginUrl)
  }

  const redirectUri = new URL('/api/admin/instagram/callback', req.nextUrl.origin).toString()
  const state = generateOAuthState()
  return NextResponse.redirect(buildAuthorizeUrl(redirectUri, state))
}

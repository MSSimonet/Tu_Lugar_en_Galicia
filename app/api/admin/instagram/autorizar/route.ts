/**
 * GET /api/admin/instagram/autorizar — punto de entrada del link que abre Silvana para
 * conectar la cuenta. Genera el `state` (CSRF) y redirige a la pantalla de autorización de
 * Instagram (lib/instagram/graph.ts buildAuthorizeUrl).
 *
 * Sin auth: es exactamente lo que hace cualquier botón "Conectar Instagram" de cualquier SaaS
 * — no expone nada sensible, solo arma un redirect a una URL fija de instagram.com con un
 * token de un solo uso. El paso sensible (canje del code) vive en el callback, no acá.
 *
 * Corre en el propio servidor de producción para firmar el state con el INTERNAL_API_SECRET
 * real de ese entorno — evita cualquier desajuste con un secret copiado a mano en otro lado.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateOAuthState } from '@/lib/instagram/oauthState'
import { buildAuthorizeUrl } from '@/lib/instagram/graph'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const redirectUri = new URL('/api/admin/instagram/callback', req.nextUrl.origin).toString()
  const state = generateOAuthState()
  return NextResponse.redirect(buildAuthorizeUrl(redirectUri, state))
}

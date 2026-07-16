/**
 * GET /api/admin/instagram/refrescar-token — mantiene vivo el long-lived token (expira a los
 * ~60 días; Meta exige refrescarlo con el token ya emitido, no desde cero). Disparado cada
 * hora por .github/workflows/instagram-refrescar-token.yml — hora de más no rompe nada
 * (el token solo se toca cuando faltan REFRESH_ANTES_DE_DIAS o menos para que expire), y así
 * el margen queda cubierto incluso si alguna corrida horaria falla.
 *
 * No-op silencioso si todavía no hay ninguna cuenta conectada (getInstagramToken() → null) —
 * es el estado esperado hasta que se corra /api/admin/instagram/conectar una vez con el
 * short-lived token real.
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/admin/auth'
import { refreshLongLivedToken } from '@/lib/instagram/graph'
import { getInstagramToken, saveInstagramToken } from '@/lib/instagram/tokenRepo'

const REFRESH_ANTES_DE_DIAS = 10

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const token = await getInstagramToken()
  if (!token) {
    return NextResponse.json({ ok: true, accion: 'sin-cuenta-conectada' })
  }

  const diasParaExpirar = (new Date(token.expiresAt).getTime() - Date.now()) / 86_400_000
  if (diasParaExpirar > REFRESH_ANTES_DE_DIAS) {
    return NextResponse.json({ ok: true, accion: 'todavia-no-hace-falta', diasParaExpirar: Math.floor(diasParaExpirar) })
  }

  try {
    const { accessToken, expiresAt } = await refreshLongLivedToken(token.accessToken)
    await saveInstagramToken({ igUserId: token.igUserId, accessToken, expiresAt })
    return NextResponse.json({ ok: true, accion: 'refrescado', expiresAt })
  } catch (err) {
    console.error('[instagram/refrescar-token] error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'No se pudo refrescar el token de Instagram.' }, { status: 500 })
  }
}

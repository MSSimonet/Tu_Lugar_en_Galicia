/**
 * lib/instagram/oauthState.ts — CSRF state del flujo OAuth de conexión (Instagram Login),
 * usado por app/api/admin/instagram/callback. Mismo patrón HMAC que lib/admin/tokens.ts,
 * pero con TTL corto (10 min: alcanza de sobra entre generar el link y que Silvana lo abra
 * y apruebe) y su propio contexto de firma para no mezclarse con los tokens de admin.
 */

import { createHmac, timingSafeEqual, randomBytes } from 'crypto'

const TTL_MS = 10 * 60 * 1000

function secret(): string {
  const s = process.env.INTERNAL_API_SECRET
  if (!s) throw new Error('INTERNAL_API_SECRET no configurado')
  return s
}

function sign(nonce: string, ts: string): string {
  return createHmac('sha256', secret()).update(`instagram-oauth:${nonce}:${ts}`).digest('hex')
}

export function generateOAuthState(): string {
  const nonce = randomBytes(8).toString('hex')
  const ts = Date.now().toString()
  return Buffer.from(`${ts}:${nonce}:${sign(nonce, ts)}`).toString('base64url')
}

export function verifyOAuthState(state: string): boolean {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8')
    if (Buffer.from(decoded).toString('base64url') !== state) return false

    const [ts, nonce, hmacIn] = decoded.split(':')
    if (!ts || !nonce || !hmacIn || isNaN(Number(ts))) return false
    if (Date.now() - Number(ts) > TTL_MS) return false

    const expected = sign(nonce, ts)
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(hmacIn, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

import { createHmac, timingSafeEqual } from 'crypto'

const TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

function secret(): string {
  const s = process.env.INTERNAL_API_SECRET
  if (!s) throw new Error('INTERNAL_API_SECRET no configurado')
  return s
}

/**
 * Genera un token opaco firmado para links de admin.
 * Formato interno: base64url(timestamp + ':' + hmac-sha256)
 */
export function generateAdminToken(recordId: string): string {
  const ts = Date.now().toString()
  const hmac = createHmac('sha256', secret())
    .update(`${recordId}:${ts}`)
    .digest('hex')
  return Buffer.from(`${ts}:${hmac}`).toString('base64url')
}

/**
 * Verifica el token. Lanza Error con mensaje legible si es inválido, malformado o expirado.
 * Usa comparación de tiempo constante para resistir timing attacks.
 */
export function verifyAdminToken(recordId: string, token: string): void {
  let ts: string
  let hmacIn: string
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    // Reject base64url-malleable tokens: re-encode must match the original
    if (Buffer.from(decoded).toString('base64url') !== token) {
      throw new Error('canonical mismatch')
    }
    const idx = decoded.indexOf(':')
    ts = decoded.slice(0, idx)
    hmacIn = decoded.slice(idx + 1)
  } catch {
    throw new Error('Token malformado')
  }

  if (!ts || !hmacIn || isNaN(Number(ts))) throw new Error('Token malformado')
  if (Date.now() - Number(ts) > TTL_MS) throw new Error('El enlace expiró (24 h)')

  const expected = createHmac('sha256', secret())
    .update(`${recordId}:${ts}`)
    .digest('hex')

  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(hmacIn, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Firma inválida')
  }
}

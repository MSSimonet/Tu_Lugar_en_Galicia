import { createHmac, timingSafeEqual } from 'crypto'

const TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

/**
 * Ámbito del token: qué clase de acción autoriza. Va DENTRO de la firma, de modo que un token
 * emitido para un ámbito no valida en otro (hallazgo F1). Antes todos los flujos de admin
 * firmaban el uuid pelado, así que el `leadIdSig` que /api/gina le entrega a un visitante
 * anónimo servía para habilitar agenda, descargar el PDF o abrir la ficha — un deputado
 * confundido. Con el ámbito adentro, el token público ('gina-sesion') no autoriza nada de admin.
 *
 * - 'admin'       — acciones de operadora: ficha, PDF y habilitar-agenda. Lo acuñan solo los
 *                   emails que recibe Silvana (resumen-diario, recordatorio-silvana, webhook de
 *                   Cal.com). Un mismo token de email abre los tres consumidores a propósito.
 * - 'gina-sesion' — integridad de la sesión del cuestionario público: prueba que el cliente no
 *                   inyectó un leadId ajeno. Solo lo verifica /api/gina; no autoriza nada más.
 */
export type TokenScope = 'admin' | 'gina-sesion'

function secret(): string {
  const s = process.env.INTERNAL_API_SECRET
  if (!s) throw new Error('INTERNAL_API_SECRET no configurado')
  return s
}

/** Firma opaca sobre un sujeto arbitrario. Formato: base64url(timestamp + ':' + hmac-sha256). */
function firmar(subject: string): string {
  const ts = Date.now().toString()
  const hmac = createHmac('sha256', secret())
    .update(`${subject}:${ts}`)
    .digest('hex')
  return Buffer.from(`${ts}:${hmac}`).toString('base64url')
}

/**
 * Verifica firma, formato y vigencia sobre un sujeto. Lanza Error con mensaje legible si es
 * inválido, malformado o expirado. Comparación de tiempo constante contra timing attacks.
 */
function verificar(subject: string, token: string): void {
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
    .update(`${subject}:${ts}`)
    .digest('hex')

  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(hmacIn, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Firma inválida')
  }
}

/**
 * Token firmado CON ámbito — la función para TODO call site nuevo. El scope va dentro del
 * sujeto firmado (`${scope}:${recordId}:${ts}`), así que un token de un ámbito no vale en otro.
 * El scope es obligatorio a propósito: separar esto de la variante legacy evita que un flujo
 * futuro omita el ámbito por accidente y reabra F1.
 */
export function generateScopedToken(scope: TokenScope, recordId: string): string {
  return firmar(`${scope}:${recordId}`)
}

export function verifyScopedToken(scope: TokenScope, recordId: string, token: string): void {
  verificar(`${scope}:${recordId}`, token)
}

/**
 * Token firmado SIN ámbito (formato histórico `${subject}:${ts}`). Uso EXCLUSIVO de
 * `lib/comunidad/sobreFirmado.ts`, que ya namespacea por su cuenta metiendo el dominio dentro
 * del propio `subject` (`comunidad-<dominio>:<uuid>`) — su prefijo cumple el mismo rol que el
 * ámbito. Se mantiene aparte, y sin scope, por dos motivos: en producción hay sobres vivos
 * cuyas firmas no se deben invalidar (byte a byte iguales a las que emitía la función anterior),
 * y no queremos que un flujo nuevo acuñe tokens sin ámbito. Ningún código nuevo debe usar esto:
 * usar generateScopedToken.
 */
export function generateLegacyToken(subject: string): string {
  return firmar(subject)
}

export function verifyLegacyToken(subject: string, token: string): void {
  verificar(subject, token)
}

import type { NextRequest } from 'next/server'

/**
 * Extrae el IP real del cliente de forma segura.
 *
 * Prioridad:
 * 1. CF-Connecting-IP (Cloudflare — no puede ser falsificado por el cliente)
 * 2. Primer valor de X-Forwarded-For (el más a la izquierda es el cliente original)
 * 3. 'anonymous' como fallback
 *
 * Usando el header crudo sin parsear, un atacante puede añadir IPs arbitrarias
 * al inicio del X-Forwarded-For y evadir el rate limiting.
 */
export function getRealIp(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }

  return 'anonymous'
}

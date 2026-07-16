import type { NextRequest } from 'next/server'

/**
 * Extrae el IP real del cliente de forma segura.
 *
 * Prioridad:
 * 1. CF-Connecting-IP (Cloudflare — no puede ser falsificado por el cliente)
 * 2. En desarrollo (sin Cloudflare delante): primer valor de X-Forwarded-For
 * 3. 'anonymous' como fallback
 *
 * En producción, Cloudflare siempre está delante de Vercel — si falta
 * cf-connecting-ip, no es un proxy legítimo sin ese header, es alguien pegándole
 * directo al dominio *.vercel.app saltándose Cloudflare. Confiar en X-Forwarded-For
 * ahí permitiría evadir el rate limiting (un atacante controla ese header libremente
 * pegándole directo a Vercel). El fallback a XFF solo tiene sentido en dev local, donde
 * no hay Cloudflare delante.
 */
export function getRealIp(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()

  if (process.env.NODE_ENV !== 'production') {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
      const first = forwarded.split(',')[0].trim()
      if (first) return first
    }
  }

  return 'anonymous'
}
